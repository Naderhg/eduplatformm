import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { assignmentsApi, Submission } from '../../api/assignments.api';
import { Loader } from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { Users, Calendar, CheckCircle, Trophy, Medal, Award } from 'lucide-react';
import './AssignmentSubmissions.css';

export const AssignmentSubmissions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
  const [scores, setScores] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!id) {
        toast.error('Assignment ID is required');
        return;
      }

      try {
        setLoading(true);
        const response = await assignmentsApi.getAssignmentSubmissionsWithRankings(id);
        console.log('=== Submissions with Rankings Data ===');
        console.log('Raw response:', response);
        setSubmissions(response.data);
        setAssignment(response.assignment);
      } catch (error: any) {
        console.error('Failed to fetch submissions:', error);
        const errorMessage = error.response?.data?.message || 'Failed to load submissions';
        toast.error(errorMessage);
        navigate('/teacher/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [id, navigate]);

  const handleGradeSubmission = async (submissionId: string, score: number) => {
    const feedbackText = feedback[submissionId] || '';
    const submission = submissions.find(s => s.id === submissionId);
    
    console.log('=== Grading Submission ===');
    console.log('Submission ID:', submissionId);
    console.log('Score:', score);
    console.log('Feedback:', feedbackText);
    console.log('Submission object:', submission);
    
    try {
      setGrading(submissionId);
      
      // Prepare grading data
      const gradingData: any = { score, feedback: feedbackText };
      
      // If this is a mixed or essay assignment, let backend handle the essay grading
      if (submission?.essayAnswers && submission.essayAnswers.length > 0) {
        // Calculate MCQ score that was already auto-graded
        const mcqScore = submission.mcqAnswers?.reduce((sum: number, a: any) => sum + a.points, 0) || 0;
        // Calculate essay score (total score - MCQ score)
        const essayScore = Math.max(0, score - mcqScore); // Prevent negative scores
        
        // Send essay grades for proper backend processing
        const essayGrades = submission.essayAnswers.map((answer: any) => ({
          questionId: answer.questionId,
          points: essayScore,
          feedback: feedbackText
        }));
        gradingData.essayGrades = essayGrades;
        console.log('MCQ Score:', mcqScore, 'Essay Score:', essayScore);
        console.log('Essay grades:', essayGrades);
        console.log('Final grading data:', gradingData);
      } else {
        // For MCQ-only assignments, just send the score
        console.log('MCQ-only assignment, sending score:', score);
      }
      
      console.log('Sending grading request with data:', gradingData);
      await assignmentsApi.gradeSubmission(submissionId, gradingData.score, gradingData.feedback, gradingData.essayGrades);
      
      // Update submission in local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, score: gradingData.score, gradedAt: new Date().toISOString() } // Use gradingData.score
            : sub
        )
      );
      
      toast.success('Submission graded successfully!');
      delete feedback[submissionId];
      delete scores[submissionId];
    } catch (error: any) {
      console.error('Failed to grade submission:', error);
      const errorMessage = error.response?.data?.message || 'Failed to grade submission';
      toast.error(errorMessage);
    } finally {
      setGrading(null);
    }
  };

  const handleFeedbackChange = (submissionId: string, value: string) => {
    setFeedback(prev => ({
      ...prev,
      [submissionId]: value
    }));
  };

  const handleScoreChange = (submissionId: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [submissionId]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1:
        return <Trophy size={20} className="rank-icon gold" />;
      case 2:
        return <Medal size={20} className="rank-icon silver" />;
      case 3:
        return <Award size={20} className="rank-icon bronze" />;
      default:
        return <span className="rank-number">#{rank}</span>;
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading submissions..." />;
  }

  if (!assignment) {
    return (
      <div className="assignment-submissions">
        <div className="error-container">
          <h2>Assignment not found</h2>
          <button 
            onClick={() => navigate('/teacher/courses')}
            className="btn btn-primary"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assignment-submissions p-3 sm:p-5 max-w-6xl mx-auto">
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 p-4 sm:p-5 bg-card border border-border rounded-lg shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="btn btn-ghost inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-accent transition-colors self-start"
        >
          ← Back
        </button>
        <div className="text-center sm:text-left">
          <h1 className="page-title text-xl sm:text-2xl font-bold text-foreground mb-1">{assignment.title} - Submissions</h1>
          <p className="page-subtitle text-sm sm:text-base text-muted-foreground">
            {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'} received
          </p>
        </div>
      </div>

      {/* Ranking Summary Table */}
      {submissions.length > 0 && (
        <div className="ranking-summary card bg-card border border-border rounded-lg shadow-sm p-4 sm:p-5 mb-6 sm:mb-8">
          <h3 className="ranking-title flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 text-lg sm:text-xl font-semibold text-foreground">
            <Trophy size={20} className="text-primary" />
            Top Performers
          </h3>
          <div className="ranking-table">
            <div className="ranking-header grid grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 bg-secondary/50 border border-border rounded-md text-xs sm:text-sm font-medium text-muted-foreground">
              <span>Rank</span>
              <span>Student</span>
              <span>Score</span>
              <span className="text-right">%</span>
            </div>
            {submissions.slice(0, 5).map((submission, index) => (
              <div key={submission.id} className="ranking-row grid grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 bg-card border border-border rounded-md items-center transition-all hover:bg-secondary/30">
                <span className="rank-cell flex items-center justify-center">
                  {getRankIcon(submission.rank)}
                </span>
                <span className="student-cell text-sm font-medium text-foreground truncate">
                  {submission.student?.name || submission.studentName || 'Unknown Student'}
                </span>
                <span className="score-cell text-sm font-semibold text-success text-right">
                  {submission.score !== undefined ? submission.score : 'Not graded'}
                </span>
                <span className="percentage-cell text-sm font-semibold text-primary text-right">
                  {submission.percentageScore || 0}%
                </span>
              </div>
            ))}
            {submissions.length > 5 && (
              <div className="more-submissions text-center p-3 sm:p-4 text-sm text-muted-foreground bg-secondary/30 border border-border rounded-md border-dashed">
                +{submissions.length - 5} more submissions
              </div>
            )}
          </div>
        </div>
      )}

      <div className="submissions-container">
        {submissions.length === 0 ? (
          <div className="no-submissions flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-lg shadow-sm">
            <Users size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No submissions yet</h3>
            <p className="text-muted-foreground">Students haven't submitted this assignment yet.</p>
          </div>
        ) : (
          <div className="submissions-list space-y-4 sm:space-y-6">
            {submissions.map((submission) => (
              <div key={submission.id} className="submission-card card bg-card border border-border rounded-lg shadow-sm p-4 sm:p-6">
                <div className="submission-header flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-border">
                  <div className="student-info w-full sm:w-auto">
                    <div className="student-name-section mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">{submission.student?.name || submission.studentName || 'Unknown Student'}</h3>
                      <p className="student-email text-sm text-muted-foreground">{submission.student?.email || submission.studentId}</p>
                    </div>
                    <div className="rank-badge flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-secondary/50 border border-border rounded-full">
                      {getRankIcon(submission.rank)}
                    </div>
                  </div>
                  <div className="submission-meta flex flex-col gap-2 sm:gap-3 items-start sm:items-end">
                    <div className="submission-date flex items-center gap-2 text-sm text-primary">
                      <Calendar size={16} />
                      <span>Submitted: {formatDate(submission.submittedAt)}</span>
                    </div>
                    {submission.gradedAt && (
                      <div className="graded-date flex items-center gap-2 text-sm text-success">
                        <CheckCircle size={16} />
                        <span>Graded: {formatDate(submission.gradedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="submission-content space-y-4 sm:space-y-6">
                  <div className="score-section flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-secondary/50 border border-border rounded-lg">
                    <div className="score-display flex items-baseline gap-2">
                      <span className="current-score text-2xl sm:text-3xl font-bold text-foreground">
                        {submission.score !== undefined ? submission.score : 'Not graded'}
                      </span>
                      <span className="max-score text-sm sm:text-base text-muted-foreground font-medium">/ {assignment.maxScore}</span>
                      {assignment?.certificateEnabled && 
                       submission.score !== undefined && 
                       Math.round((submission.score / (assignment?.maxScore || 1)) * 100) >= (assignment?.certificatePassingScore || 50) && (
                        <span title="Certificate earned" style={{ marginLeft: '8px', fontSize: '1.25rem' }}>🏅</span>
                      )}
                    </div>
                    {submission.score !== undefined && (
                      <div className="percentage text-base sm:text-lg font-semibold px-3 py-1 bg-success text-success-foreground rounded-md">
                        {submission.percentageScore || Math.round((submission.score / assignment.maxScore) * 100)}%
                      </div>
                    )}
                  </div>

                  {submission.content && (
                    <div className="content-section p-4 bg-secondary/50 border border-border rounded-lg">
                      <h4 className="text-base font-semibold text-foreground mb-3">Submission Content</h4>
                      <div className="content-text text-sm text-muted-foreground leading-relaxed">
                        {submission.content.split('\n').map((line, index) => (
                          <p key={index} className="mb-2">{line || <br />}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {submission.mcqAnswers && submission.mcqAnswers.length > 0 && (
                    <div className="mcq-section p-4 bg-secondary/50 border border-border rounded-lg">
                      <h4 className="text-base font-semibold text-foreground mb-3">MCQ Answers</h4>
                      <div className="space-y-2">
                        {submission.mcqAnswers.map((answer, index) => (
                          <div key={index} className={`mcq-answer flex justify-between items-center p-3 rounded-md text-sm ${
                            answer.isCorrect ? 'bg-success/10 border border-success/50 text-success' : 'bg-destructive/10 border border-destructive/50 text-destructive'
                          }`}>
                            <span className="answer-label font-medium">Question {index + 1}:</span>
                            <span className="answer-result font-semibold">
                              {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'} ({answer.points} points)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {submission.score === undefined && (
                  <div className="grading-section p-4 sm:p-6 bg-warning/10 border border-warning/50 rounded-lg">
                    <div className="grade-form space-y-4">
                      <div className="grade-input-group flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <label className="font-medium text-foreground min-w-fit">Score:</label>
                        <input
                          type="number"
                          min="0"
                          max={assignment.maxScore}
                          value={scores[submission.id] || ''}
                          onChange={(e) => handleScoreChange(submission.id, e.target.value)}
                          placeholder={`Enter score (0-${assignment.maxScore})`}
                          className="grade-input flex-1 px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                        />
                        <span className="max-score-label text-sm text-muted-foreground font-medium">/ {assignment.maxScore}</span>
                      </div>
                      <div className="feedback-group flex flex-col gap-2">
                        <label className="font-medium text-foreground">Feedback:</label>
                        <textarea
                          value={feedback[submission.id] || ''}
                          onChange={(e) => handleFeedbackChange(submission.id, e.target.value)}
                          placeholder="Provide feedback to the student..."
                          rows={3}
                          className="feedback-textarea w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-vertical"
                        />
                      </div>
                      <button
                        onClick={() => handleGradeSubmission(submission.id, parseInt(scores[submission.id] || '0'))}
                        disabled={grading === submission.id || !scores[submission.id]}
                        className="btn btn-primary inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                      >
                        {grading === submission.id ? 'Grading...' : 'Send Message'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
