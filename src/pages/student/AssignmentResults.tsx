import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentsApi, Submission } from '../../api/assignments.api';
import { Loader } from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { Trophy, Medal, Award } from 'lucide-react';
import './AssignmentResults.css';

export const AssignmentResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!id) {
        toast.error('Assignment ID is required');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch both student's submission and public rankings
        const [submissionResponse, rankingsResponse] = await Promise.all([
          assignmentsApi.getSubmissionByAssignment(id),
          assignmentsApi.getAssignmentPublicRankings(id)
        ]);
        
        console.log('Submission results:', submissionResponse);
        console.log('Rankings data:', rankingsResponse);
        
        setSubmission(submissionResponse);
        setRankings(rankingsResponse.data);
        
        // Get assignment details for max score
        const assignmentDetails = await assignmentsApi.getById(id);
        setAssignment(assignmentDetails);
      } catch (error: any) {
        console.error('Failed to fetch results:', error);
        const errorMessage = error.response?.data?.message || 'Failed to load results';
        toast.error(errorMessage);
        navigate('/student/assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1:
        return <Trophy size={16} className="rank-icon text-yellow-500" />;
      case 2:
        return <Medal size={16} className="rank-icon text-gray-400" />;
      case 3:
        return <Award size={16} className="rank-icon text-orange-500" />;
      default:
        return <span className="rank-number text-sm font-medium text-muted-foreground">#{rank}</span>;
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading results..." />;
  }

  if (!submission || !assignment) {
    return (
      <div className="assignment-results p-3 sm:p-5 max-w-6xl mx-auto">
        <div className="error-container flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-muted-foreground mb-4">Results not found</h2>
          <button 
            onClick={() => navigate('/student/assignments')}
            className="btn btn-primary inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  // Debug the score data
  console.log('=== Assignment Results Debug ===');
  console.log('Submission:', submission);
  console.log('Assignment:', assignment);
  console.log('Submission score:', submission.score);
  console.log('MCQ Answers:', submission.mcqAnswers);
  console.log('Essay Answers:', submission.essayAnswers);
  
  // Calculate what the score should be
  let calculatedScore = 0;
  if (submission.mcqAnswers) {
    const mcqScore = submission.mcqAnswers.reduce((sum: number, answer: any) => sum + answer.points, 0);
    calculatedScore += mcqScore;
    console.log('MCQ calculated score:', mcqScore);
  }
  if (submission.essayAnswers) {
    const essayScore = submission.essayAnswers.reduce((sum: number, answer: any) => sum + (answer.points || 0), 0);
    calculatedScore += essayScore;
    console.log('Essay calculated score:', essayScore);
  }
  console.log('Total calculated score:', calculatedScore);

  // Use the calculated score to ensure we get the total (MCQ + Essay)
  const totalScore = calculatedScore || submission.score || 0;
  const percentage = totalScore !== undefined 
    ? Math.round((totalScore / assignment.maxScore) * 100) 
    : 0;

  return (
    <div className="assignment-results p-3 sm:p-5 max-w-6xl mx-auto">
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 p-4 sm:p-5 bg-card border border-border rounded-lg shadow-sm">
        <button 
          onClick={() => navigate('/student/assignments')}
          className="btn btn-ghost inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-accent transition-colors self-start"
        >
          ← Back to Assignments
        </button>
        <div className="text-center sm:text-left">
          <h1 className="page-title text-xl sm:text-2xl font-bold text-foreground mb-1">{assignment.title} - Results</h1>
          <p className="page-subtitle text-sm sm:text-base text-muted-foreground">Submitted: {formatDate(submission.submittedAt)}</p>
        </div>
      </div>

      <div className="results-container space-y-4 sm:space-y-6">
        <div className="score-summary bg-gradient-to-br from-primary to-secondary text-primary-foreground p-6 sm:p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-5">Your Score</h2>
          <div className="score-display flex items-baseline justify-center gap-2 text-3xl sm:text-4xl font-bold mb-4">
            <span className="current-score text-5xl sm:text-6xl font-extrabold">
              {totalScore !== undefined ? totalScore : 'Not graded'}
            </span>
            <span className="max-score text-2xl sm:text-3xl opacity-80">/ {assignment.maxScore}</span>
          </div>
          {totalScore !== undefined && (
            <div className="percentage text-lg sm:text-xl font-semibold px-4 py-2 bg-white/20 rounded-full inline-block mb-4">
              {percentage}% {percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '📚'}
            </div>
          )}
          {submission.gradedAt && (
            <div className="graded-date text-sm opacity-90">
              Graded: {formatDate(submission.gradedAt)}
            </div>
          )}
        </div>

        {assignment.certificateEnabled && totalScore !== undefined && (
          Math.round((totalScore / assignment.maxScore) * 100) >= (assignment.certificatePassingScore || 50)
        ) && (
          <div className="certificate-earned bg-card border-2 border-green-500 rounded-lg shadow-sm p-6 text-center border-solid">
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Certificate Earned!</h3>
            <p className="text-muted-foreground mb-4">Congratulations! You've passed this assignment and earned a certificate.</p>
            <button
              onClick={() => navigate(`/student/assignments/${id}/certificate`)}
              className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              🏆 View Certificate
            </button>
          </div>
        )}

        {/* Ranking Summary Table */}
        {rankings.length > 0 && (
          <div className="ranking-summary bg-card border border-border rounded-lg shadow-sm p-4 sm:p-5">
            <h3 className="ranking-title flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 text-lg sm:text-xl font-semibold text-foreground">
              <Trophy size={20} className="text-primary" />
              Class Rankings
            </h3>
            <div className="ranking-table">
              <div className="ranking-header grid grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 bg-secondary/50 border border-border rounded-md text-xs sm:text-sm font-medium text-muted-foreground">
                <span>Rank</span>
                <span>Student</span>
                <span>Score</span>
                <span className="text-right">%</span>
              </div>
              {rankings.slice(0, 5).map((item) => (
                <div key={item.id} className={`ranking-row grid grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 bg-card border border-border rounded-md items-center transition-all hover:bg-secondary/30 ${
                  item.student._id === submission?.student?._id ? 'your-rank bg-warning/10 border-warning/50' : ''
                }`}>
                  <span className="rank-cell flex items-center justify-center">
                    {getRankIcon(item.rank)}
                  </span>
                  <span className="student-cell text-sm font-medium text-foreground truncate">
                    {item.student.name}
                  </span>
                  <span className="score-cell text-sm font-semibold text-success text-right">
                    {item.score !== undefined ? item.score : 'Not graded'}
                  </span>
                  <span className="percentage-cell text-sm font-semibold text-primary text-right">
                    {item.percentageScore || 0}%
                  </span>
                </div>
              ))}
              {rankings.length > 5 && (
                <div className="more-submissions text-center p-3 sm:p-4 text-sm text-muted-foreground bg-secondary/30 border border-border rounded-md border-dashed">
                  +{rankings.length - 5} more students
                </div>
              )}
            </div>
          </div>
        )}

        {submission.feedback && (
          <div className="feedback-section bg-card border border-border rounded-lg shadow-sm p-4 sm:p-5">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Teacher Feedback</h3>
            <div className="feedback-content bg-secondary/50 border-l-4 border-primary p-4 rounded-md text-sm text-muted-foreground leading-relaxed">
              {submission.feedback}
            </div>
          </div>
        )}

        {submission.content && (
          <div className="content-section bg-card border border-border rounded-lg shadow-sm p-4 sm:p-5">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Your Submission</h3>
            <div className="submission-content bg-secondary/50 p-4 rounded-md text-sm text-muted-foreground leading-relaxed">
              {submission.content.split('\n').map((line, index) => (
                <p key={index} className="mb-2">{line || <br />}</p>
              ))}
            </div>
          </div>
        )}

        {assignment.questions?.mcq && assignment.questions.mcq.length > 0 && (
          <div className="mcq-results bg-card border border-border rounded-lg shadow-sm p-4 sm:p-5">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-5">Multiple Choice Answers</h3>
            {assignment.questions.mcq.map((question, index) => (
              <div key={question._id || question.id} className="mcq-result bg-secondary/50 border border-border rounded-lg p-4 sm:p-5 mb-4 last:mb-0">
                <div className="question-text text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4 leading-relaxed">
                  <strong>Question {index + 1}:</strong> {question.question}
                </div>
                <div className="options-list space-y-2 mb-3 sm:mb-4">
                  {question.options.map((option, oIndex) => (
                    <div 
                      key={oIndex} 
                      className={`option p-3 sm:p-4 rounded-md border text-sm transition-all ${
                        oIndex === question.correctAnswer 
                          ? 'bg-success border-success text-success' 
                          : 'bg-card border-border'
                      } ${
                        submission.mcqAnswers?.find(a => a.questionId === (question._id || question.id))?.selectedAnswer === oIndex 
                          ? 'border-2 border-primary' 
                          : ''
                      } ${
                        submission.mcqAnswers?.find(a => a.questionId === (question._id || question.id))?.selectedAnswer === oIndex && 
                        oIndex !== question.correctAnswer 
                          ? 'bg-destructive/10 border-destructive text-destructive' 
                          : ''
                      }`}
                    >
                      {option}
                      {oIndex === question.correctAnswer && ' ✓'}
                      {submission.mcqAnswers?.find(a => a.questionId === (question._id || question.id))?.selectedAnswer === oIndex && 
                       oIndex !== question.correctAnswer && ' ✗'}
                    </div>
                  ))}
                </div>
                <div className="result-status">
                  {submission.mcqAnswers?.find(a => a.questionId === (question._id || question.id))?.isCorrect ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-success/10 text-success border border-success">
                      ✓ Correct ({question.points} points)
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-destructive/10 text-destructive border border-destructive">
                      ✗ Incorrect (0 points)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
