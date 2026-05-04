import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { assignmentsApi } from '../../api/assignments.api';
import { Loader } from '../../components/common/Loader';
import { toast } from 'react-toastify';
import './AssignmentDetail.css';

export interface MCQQuestion {
  _id?: string;
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface EssayQuestion {
  _id?: string;
  id?: string;
  question: string;
  maxWords?: number;
  points: number;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    title: string;
  };
  dueDate: string;
  maxScore: number;
  type: 'mcq' | 'essay' | 'mixed';
  questions?: {
    mcq?: MCQQuestion[];
    essay?: EssayQuestion[];
  };
  autoCorrect?: boolean;
  status: 'draft' | 'published' | 'closed';
  availableFrom?: string;
  createdAt: string;
  updatedAt: string;
}

export const AssignmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state for essay answers
  const [essayAnswers, setEssayAnswers] = useState<{ [key: string]: string }>({});
  const [mcqAnswers, setMcqAnswers] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) {
        toast.error('Assignment ID is required');
        return;
      }

      try {
        setLoading(true);
        const response = await assignmentsApi.getById(id);
        console.log('Assignment details:', response);
        console.log('Assignment questions structure:', response.questions);
        if (response.questions?.mcq) {
          console.log('MCQ questions:', response.questions.mcq);
          response.questions.mcq.forEach((q, index) => {
            console.log(`MCQ Question ${index}:`, q);
            console.log(`MCQ Question ${index} ID:`, q._id, q.id);
          });
        }
        if (response.questions?.essay) {
          console.log('Essay questions:', response.questions.essay);
          response.questions.essay.forEach((q, index) => {
            console.log(`Essay Question ${index}:`, q);
            console.log(`Essay Question ${index} ID:`, q._id, q.id);
          });
        }
        setAssignment(response);
      } catch (error: any) {
        console.error('Failed to fetch assignment:', error);
        const errorMessage = error.response?.data?.message || 'Failed to load assignment';
        toast.error(errorMessage);
        navigate('/student/assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id, navigate]);

  const handleEssayAnswerChange = (questionId: string, answer: string) => {
    setEssayAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleMCQAnswerChange = (questionId: string, answerIndex: number) => {
    setMcqAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignment) return;

    // Validate answers
    if (assignment.type === 'essay' && assignment.questions?.essay) {
      const hasEmptyAnswers = assignment.questions.essay.some(q => !essayAnswers[q._id || q.id]?.trim());
      if (hasEmptyAnswers) {
        toast.error('Please answer all essay questions');
        return;
      }
    }

    if (assignment.type === 'mcq' && assignment.questions?.mcq) {
      const hasUnanswered = assignment.questions.mcq.some(q => mcqAnswers[q._id || q.id] === undefined);
      if (hasUnanswered) {
        toast.error('Please answer all MCQ questions');
        return;
      }
    }

    if (assignment.type === 'mixed') {
      const hasEmptyEssay = assignment.questions?.essay?.some(q => !essayAnswers[q._id || q.id]?.trim());
      const hasUnansweredMCQ = assignment.questions?.mcq?.some(q => mcqAnswers[q._id || q.id] === undefined);
      
      if (hasEmptyEssay || hasUnansweredMCQ) {
        toast.error('Please answer all questions');
        return;
      }
    }

    try {
      setSubmitting(true);
      
      // Prepare submission data
      const submissionData: any = {};

      if (assignment.questions?.mcq) {
        submissionData.mcqAnswers = assignment.questions.mcq.map(q => ({
          questionId: q._id || q.id,
          selectedAnswer: mcqAnswers[q._id || q.id],
          isCorrect: mcqAnswers[q._id || q.id] === q.correctAnswer
        }));
      }

      if (assignment.questions?.essay) {
        submissionData.essayAnswers = assignment.questions.essay.map(q => ({
          questionId: q._id || q.id,
          answer: essayAnswers[q._id || q.id],
          wordCount: essayAnswers[q._id || q.id]?.split(/\s+/).filter(word => word.length > 0).length || 0
        }));
      }

      // Create content for backward compatibility
      let content = '';
      if (submissionData.essayAnswers) {
        content = submissionData.essayAnswers.map((a: any) => a.answer).join('\n\n');
      }

      console.log('Submitting assignment:', {
        assignmentId: assignment._id,
        submissionData
      });

      // Submit assignment
      await assignmentsApi.submitAssignment(assignment._id, content, undefined, submissionData);
      
      toast.success('Assignment submitted successfully!');
      
      // Redirect to results page
      navigate(`/student/assignments/${assignment._id}/results`);
    } catch (error: any) {
      console.error('Failed to submit assignment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit assignment';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading assignment..." />;
  }

  if (!assignment) {
    return (
      <div className="assignment-detail">
        <div className="error-container">
          <h2>Assignment not found</h2>
          <button 
            onClick={() => navigate('/student/assignments')}
            className="btn btn-primary"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date();
  const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="assignment-detail">
      <div className="page-header">
        <button 
          onClick={() => navigate('/student/assignments')}
          className="btn btn-ghost"
        >
          ← Back to Assignments
        </button>
        <div>
          <h1 className="page-title">{assignment.title}</h1>
          <p className="page-subtitle">
            {assignment.course?.title} • Due: {dueDate.toLocaleDateString()}
            {isOverdue && <span className="overdue-badge">Overdue</span>}
            {!isOverdue && daysLeft <= 3 && <span className="urgent-badge">{daysLeft} days left</span>}
          </p>
        </div>
      </div>

      <div className="assignment-content">
        <div className="assignment-description card">
          <h3>Assignment Description</h3>
          <p>{assignment.description}</p>
          <div className="assignment-meta">
            <span className="meta-item">
              <strong>Type:</strong> {assignment.type?.toUpperCase()}
            </span>
            <span className="meta-item">
              <strong>Max Score:</strong> {assignment.maxScore} points
            </span>
            <span className="meta-item">
              <strong>Due Date:</strong> {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="assignment-form">
          {/* MCQ Questions */}
          {assignment.questions?.mcq && assignment.questions.mcq.length > 0 && (
            <div className="questions-section">
              <h3>Multiple Choice Questions</h3>
              {assignment.questions.mcq.map((question, qIndex) => (
                <div key={question._id || question.id} className="question-card card">
                  <div className="question-header">
                    <h4>Question {qIndex + 1}</h4>
                    <span className="question-points">{question.points} points</span>
                  </div>
                  <p className="question-text">{question.question}</p>
                  <div className="options-list">
                    {question.options.map((option, oIndex) => (
                      <label key={oIndex} className="option-label">
                        <input
                          type="radio"
                          name={`mcq-${question._id || question.id}`}
                          value={oIndex}
                          checked={mcqAnswers[question._id || question.id] === oIndex}
                          onChange={() => handleMCQAnswerChange(question._id || question.id, oIndex)}
                          required
                        />
                        <span className="option-text">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Essay Questions */}
          {assignment.questions?.essay && assignment.questions.essay.length > 0 && (
            <div className="questions-section">
              <h3>Essay Questions</h3>
              {assignment.questions.essay.map((question, qIndex) => (
                <div key={question._id || question.id} className="question-card card">
                  <div className="question-header">
                    <h4>Question {qIndex + 1}</h4>
                    <span className="question-points">{question.points} points</span>
                    {question.maxWords && (
                      <span className="word-limit">Max {question.maxWords} words</span>
                    )}
                  </div>
                  <p className="question-text">{question.question}</p>
                  <textarea
                    value={essayAnswers[question._id || question.id] || ''}
                    onChange={(e) => handleEssayAnswerChange(question._id || question.id, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={6}
                    maxLength={question.maxWords ? question.maxWords * 10 : undefined}
                    required
                    className="essay-textarea"
                  />
                  {question.maxWords && (
                    <div className="word-count">
                      Word count: {essayAnswers[question._id || question.id]?.split(/\s+/).filter(word => word.length > 0).length || 0} / {question.maxWords}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting || isOverdue}
            >
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
