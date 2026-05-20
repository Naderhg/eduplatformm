import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assignmentsApi } from '../../api/assignments.api';
import { Loader } from '../../components/common/Loader';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import './CreateAssignment.css';

type AssignmentType = 'mcq' | 'essay' | 'mixed';

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface EssayQuestion {
  id: string;
  question: string;
  maxWords?: number;
  points: number;
}

export const CreateAssignment: React.FC = () => {
  const params = useParams<{ id?: string }>();
  console.log('URL params:', params);
  const courseId = params.id;
  console.log('Extracted courseId:', courseId);
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('essay');
  
  // Basic assignment info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [certificateEnabled, setCertificateEnabled] = useState(false);
  const [certificatePassingScore, setCertificatePassingScore] = useState(50);
  
  // Questions
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [essayQuestions, setEssayQuestions] = useState<EssayQuestion[]>([]);

  const addMCQQuestion = () => {
    const newQuestion: MCQQuestion = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 10
    };
    setMcqQuestions([...mcqQuestions, newQuestion]);
  };

  const updateMCQQuestion = (id: string, field: keyof MCQQuestion, value: any) => {
    setMcqQuestions(questions =>
      questions.map(q => q.id === id ? { ...q, [field]: value } : q)
    );
  };

  const deleteMCQQuestion = (id: string) => {
    setMcqQuestions(questions => questions.filter(q => q.id !== id));
  };

  const addEssayQuestion = () => {
    const newQuestion: EssayQuestion = {
      id: Date.now().toString(),
      question: '',
      maxWords: 500,
      points: 20
    };
    setEssayQuestions([...essayQuestions, newQuestion]);
  };

  const updateEssayQuestion = (id: string, field: keyof EssayQuestion, value: any) => {
    setEssayQuestions(questions =>
      questions.map(q => q.id === id ? { ...q, [field]: value } : q)
    );
  };

  const deleteEssayQuestion = (id: string) => {
    setEssayQuestions(questions => questions.filter(q => q.id !== id));
  };

  const calculateTotalPoints = () => {
    const mcqPoints = mcqQuestions.reduce((sum, q) => sum + q.points, 0);
    const essayPoints = essayQuestions.reduce((sum, q) => sum + q.points, 0);
    return mcqPoints + essayPoints;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('=== handleSubmit called! ===');
    e.preventDefault();
    
    if (!title.trim()) {
      console.log('❌ Validation failed: No title');
      toast.error('Please enter assignment title');
      return;
    }

    if (!description.trim()) {
      console.log('❌ Validation failed: No description');
      toast.error('Please enter assignment description');
      return;
    }

    if (!dueDate) {
      console.log('❌ Validation failed: No dueDate');
      toast.error('Please select due date');
      return;
    }

    if (availableFrom && new Date(availableFrom) >= new Date(dueDate)) {
      console.log('❌ Validation failed: Available date after due date');
      toast.error('Available date must be before due date');
      return;
    }

    const hasQuestions = assignmentType === 'mcq' ? mcqQuestions.length > 0 :
                        assignmentType === 'essay' ? essayQuestions.length > 0 :
                        mcqQuestions.length > 0 || essayQuestions.length > 0;

    console.log('📊 Question validation:', {
      assignmentType,
      mcqQuestions: mcqQuestions.length,
      essayQuestions: essayQuestions.length,
      hasQuestions
    });

    if (!hasQuestions) {
      console.log('❌ Validation failed: No questions');
      toast.error('Please add at least one question');
      return;
    }

    // Validate MCQ questions
    for (const question of mcqQuestions) {
      if (!question.question.trim()) {
        console.log('❌ Validation failed: Empty MCQ question');
        toast.error('Please fill in all MCQ questions');
        return;
      }
      if (question.options.some(opt => !opt.trim())) {
        console.log('❌ Validation failed: Empty MCQ option');
        toast.error('Please fill in all MCQ options');
        return;
      }
    }

    // Validate Essay questions
    for (const question of essayQuestions) {
      if (!question.question.trim()) {
        console.log('❌ Validation failed: Empty essay question');
        toast.error('Please fill in all essay questions');
        return;
      }
    }

    console.log('✅ All validation passed!');

    console.log('=== Validation Passed ===');
    
    setIsLoading(true);
    
    try {
      const totalPoints = calculateTotalPoints();
      
      console.log('=== Calculating Total Points ===', totalPoints);
      
      const assignmentData: any = {
        title,
        description,
        availableFrom: availableFrom || undefined,
        dueDate: new Date(dueDate).toISOString(),
        maxScore: totalPoints,
        type: assignmentType,
        questions: {
          mcq: mcqQuestions.map(({ id, ...q }) => q), // Remove id field
          essay: essayQuestions.map(({ id, ...q }) => q) // Remove id field
        },
        autoCorrect: assignmentType === 'mcq' || assignmentType === 'mixed',
        certificateEnabled,
        certificatePassingScore
      };

      // Only include courseId if it exists
      if (courseId) {
        assignmentData.courseId = courseId;
      }

      console.log('=== Calling assignmentsApi.create ===');
      console.log('Final assignment data being sent:', assignmentData);
      console.log('Type of assignmentData:', typeof assignmentData);
      console.log('Assignment data keys:', Object.keys(assignmentData));
      
      const response = await assignmentsApi.create(assignmentData);
      console.log('API Response:', response);
      
      console.log('=== Assignment Created Successfully ===');
      toast.success('Assignment created successfully!');
      
      // Navigate based on whether we have a course or not
      if (courseId) {
        navigate(`/teacher/courses/${courseId}/manage`);
      } else {
        navigate('/teacher/assignments');
      }
      
    } catch (error: any) {
      console.error('=== Create Assignment Error ===', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config);
      
      toast.error(error.response?.data?.message || error.message || 'Failed to create assignment');
    } finally {
      console.log('=== Finally Block ===');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen text="Creating assignment..." />;
  }

  return (
    <div className="create-assignment">
      <div className="page-header">
        <button 
          className="btn btn-ghost mb-4"
          onClick={() => courseId ? navigate(`/teacher/courses/${courseId}/manage`) : navigate('/teacher/assignments')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {courseId ? 'Course' : 'Assignments'}
        </button>
        <div>
          <h1 className="page-title">Create Assignment</h1>
          <p className="page-subtitle">Create a new assignment for your students</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="assignment-form">
        {/* Basic Information */}
        <div className="form-section card">
          <h2 className="section-title">Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="title">Assignment Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter assignment title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the assignment requirements"
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="availableFrom">Available From (Optional)</label>
              <input
                type="datetime-local"
                id="availableFrom"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date *</label>
              <input
                type="datetime-local"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="type">Assignment Type *</label>
            <select
              id="type"
              value={assignmentType}
              onChange={(e) => setAssignmentType(e.target.value as AssignmentType)}
              required
            >
              <option value="essay">Essay / Written Answer</option>
              <option value="mcq">Multiple Choice Questions (MCQ)</option>
              <option value="mixed">Mixed (MCQ + Essay)</option>
            </select>
          </div>

          <div className="form-info">
            <strong>Total Points:</strong> {calculateTotalPoints()}
            {assignmentType === 'mcq' && (
              <span className="auto-correct-badge">Auto-correction enabled</span>
            )}
            {assignmentType === 'mixed' && (
              <span className="auto-correct-badge">MCQ questions will be auto-corrected</span>
            )}
          </div>
        </div>

        {/* MCQ Questions */}
        {(assignmentType === 'mcq' || assignmentType === 'mixed') && (
          <div className="form-section card">
            <div className="section-header">
              <h2 className="section-title">MCQ Questions</h2>
              <button type="button" className="btn btn-primary" onClick={addMCQQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add MCQ Question
              </button>
            </div>

            {mcqQuestions.length === 0 ? (
              <p className="text-gray-500">No MCQ questions added yet</p>
            ) : (
              mcqQuestions.map((question, qIndex) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <h3>Question {qIndex + 1}</h3>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => deleteMCQQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Question</label>
                    <textarea
                      value={question.question}
                      onChange={(e) => updateMCQQuestion(question.id, 'question', e.target.value)}
                      placeholder="Enter your question"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Options</label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="option-input">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() => updateMCQQuestion(question.id, 'correctAnswer', oIndex)}
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...question.options];
                            newOptions[oIndex] = e.target.value;
                            updateMCQQuestion(question.id, 'options', newOptions);
                          }}
                          placeholder={`Option ${oIndex + 1}`}
                          required
                        />
                        <span className="correct-label">
                          {question.correctAnswer === oIndex && '✓ Correct'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label>Points</label>
                    <input
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) => updateMCQQuestion(question.id, 'points', parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Essay Questions */}
        {(assignmentType === 'essay' || assignmentType === 'mixed') && (
          <div className="form-section card">
            <div className="section-header">
              <h2 className="section-title">Essay Questions</h2>
              <button type="button" className="btn btn-primary" onClick={addEssayQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add Essay Question
              </button>
            </div>

            {essayQuestions.length === 0 ? (
              <p className="text-gray-500">No essay questions added yet</p>
            ) : (
              essayQuestions.map((question, qIndex) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <h3>Question {qIndex + 1}</h3>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => deleteEssayQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Question</label>
                    <textarea
                      value={question.question}
                      onChange={(e) => updateEssayQuestion(question.id, 'question', e.target.value)}
                      placeholder="Enter your essay question"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Max Words (optional)</label>
                      <input
                        type="number"
                        min="50"
                        value={question.maxWords || ''}
                        onChange={(e) => updateEssayQuestion(question.id, 'maxWords', parseInt(e.target.value) || undefined)}
                        placeholder="500"
                      />
                    </div>

                    <div className="form-group">
                      <label>Points</label>
                      <input
                        type="number"
                        min="1"
                        value={question.points}
                        onChange={(e) => updateEssayQuestion(question.id, 'points', parseInt(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Certificate Settings */}
        <div className="certificate-section card">
          <h2 className="section-title">🎓 Certificate Settings</h2>
          <p className="section-description" style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Enable certificates for students who pass this assignment.
          </p>
          <div className="form-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={certificateEnabled}
                onChange={(e) => setCertificateEnabled(e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-switch"></span>
              <span style={{ marginLeft: '8px' }}>Enable Certificate</span>
            </label>
          </div>
          {certificateEnabled && (
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label htmlFor="certificatePassingScore">Minimum Passing Score (%)</label>
              <input
                type="number"
                id="certificatePassingScore"
                min="0"
                max="100"
                value={certificatePassingScore}
                onChange={(e) => setCertificatePassingScore(Number(e.target.value))}
                className="form-input"
                style={{ maxWidth: '200px' }}
                required
              />
              <span className="form-hint" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                Students scoring at or above this percentage will receive a certificate.
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Create Assignment
          </button>
          
          {/* Debug Test Button */}
          <button 
            type="button" 
            className="btn btn-secondary ml-2"
            onClick={() => {
              console.log('=== Test button clicked ===');
              console.log('Current form data:', {
                title,
                description,
                dueDate,
                assignmentType,
                mcqQuestions: mcqQuestions.length,
                essayQuestions: essayQuestions.length
              });
            }}
          >
            Test Form Data
          </button>
        </div>
      </form>
    </div>
  );
};
