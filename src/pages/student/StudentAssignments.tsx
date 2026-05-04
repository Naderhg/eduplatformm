import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { assignmentsApi } from '../../api/assignments.api';
import { Loader } from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { RefreshCw } from 'lucide-react';
import './StudentAssignments.css';

export const StudentAssignments: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  const fetchAssignments = async (showRefreshLoading = false) => {
    if (!user?.id) {
      console.error('No user ID found');
      return;
    }
    
    try {
      if (showRefreshLoading) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      console.log('Fetching student assignments...');
        const response = await assignmentsApi.getStudentAssignments();
        console.log('Student assignments received:', response);
        
        // Debug submission data for each assignment
        response.forEach((assignment: any) => {
          if (assignment.submissions && assignment.submissions.length > 0) {
            console.log(`Assignment "${assignment.title}" submission:`, assignment.submissions[0]);
          }
        });
        
        setAssignments(response);
    } catch (error: any) {
      console.error('Failed to fetch assignments:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load assignments';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAssignments(true);
  };

  // Auto-refresh for assignments awaiting grade
  useEffect(() => {
    const awaitingGradeCount = assignments.filter(a => {
      const hasSubmission = a.submissions && a.submissions.length > 0;
      const isGraded = hasSubmission && a.submissions.some(s => s.score);
      return hasSubmission && !isGraded;
    }).length;

    // Only set up interval if there are assignments awaiting grade
    if (awaitingGradeCount > 0) {
      const interval = setInterval(() => {
        fetchAssignments(false); // Refresh without showing loading
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [assignments, user?.id]);

  useEffect(() => {
    fetchAssignments();
  }, [user?.id]);

  const pendingCount = assignments.filter(a => {
  // Check if student has submitted this assignment
  const hasSubmission = a.submissions && a.submissions.length > 0;
  return !hasSubmission;
}).length;
  const submittedCount = assignments.filter(a => a.submissions && a.submissions.length > 0).length;
  const gradedCount = assignments.filter(a => a.submissions && a.submissions.some(s => s.score)).length;

  const getFilteredAssignments = () => {
    switch (activeFilter) {
      case 'pending':
        return assignments.filter(a => {
          const hasSubmission = a.submissions && a.submissions.length > 0;
          return !hasSubmission;
        });
      case 'submitted':
        return assignments.filter(a => a.submissions && a.submissions.length > 0);
      case 'graded':
        return assignments.filter(a => a.submissions && a.submissions.some(s => s.score));
      default:
        return assignments;
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading assignments..." />;
  }

  const filteredAssignments = getFilteredAssignments();

  return (
    <div className="student-assignments">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">View and submit your assignments</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-ghost refresh-btn"
          title="Refresh assignments"
        >
          <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All ({assignments.length})
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveFilter('pending')}
        >
          Pending ({pendingCount})
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'submitted' ? 'active' : ''}`}
          onClick={() => setActiveFilter('submitted')}
        >
          Submitted ({submittedCount})
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'graded' ? 'active' : ''}`}
          onClick={() => setActiveFilter('graded')}
        >
          Graded ({gradedCount})
        </button>
      </div>

      {/* Assignments List */}
      <div className="assignments-list">
        {filteredAssignments.map((assignment) => {
          const dueDate = new Date(assignment.dueDate);
          const isOverdue = dueDate < new Date();
          const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          // Check submission status
          const hasSubmission = assignment.submissions && assignment.submissions.length > 0;
          const isSubmitted = hasSubmission;
          const isGraded = hasSubmission && assignment.submissions.some(s => s.score);
          const submission = hasSubmission ? assignment.submissions[0] : null;
          
          // Check if recently graded (within last 5 minutes)
          const recentlyGraded = isGraded && submission?.gradedAt && 
            (Date.now() - new Date(submission.gradedAt).getTime()) < 5 * 60 * 1000;

          return (
            <div key={assignment._id} className="assignment-card card">
              <div className="assignment-status-indicator" data-status={isGraded ? 'graded' : isSubmitted ? 'submitted' : 'pending'}></div>
              <div className="assignment-content">
                <div className="assignment-header">
                  <div className="title-section">
                    <h3 className="assignment-title">{assignment.title}</h3>
                    {recentlyGraded && (
                      <span className="newly-graded-badge">🎉 Newly Graded!</span>
                    )}
                  </div>
                  <span className={`status-badge status-${isGraded ? 'graded' : isSubmitted ? 'submitted' : 'pending'}`}>
                    {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : (isOverdue ? 'Overdue' : 'Pending')}
                  </span>
                </div>
                <p className="assignment-course">{assignment.course?.title}</p>
                <div className="assignment-meta">
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Due: {dueDate.toLocaleDateString()}
                  </span>
                  {!isSubmitted && !isGraded && !isOverdue && (
                    <span className={`meta-item ${daysLeft <= 3 ? 'urgent' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {daysLeft} days left
                    </span>
                  )}
                  {isGraded && (
                    <span className="meta-item score">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      Score: {submission?.score || 0}/{assignment.maxScore}
                      {/* Debug info */}
                      {console.log(`Rendering score for ${assignment.title}:`, {
                        submission,
                        score: submission?.score,
                        maxScore: assignment.maxScore,
                        isGraded
                      })}
                    </span>
                  )}
                </div>
              </div>
              <div className="assignment-actions">
                {!isSubmitted && !isGraded && (
                  <Link to={`/student/assignments/${assignment._id}`} className="btn btn-primary">
                    Start
                  </Link>
                )}
                {isSubmitted && !isGraded && (
                  <button className="btn btn-secondary" disabled>
                    Awaiting Grade
                  </button>
                )}
                {isGraded && (
                  <Link to={`/student/assignments/${assignment._id}/results`} className="btn btn-secondary">
                    View Feedback
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
