import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { coursesApi, Course } from '../../api/courses.api';
import { Loader } from '../../components/common/Loader';
import './StudentDashboard.css';

// Mock progress data
const courseProgress = [
  { courseId: '1', progress: 65 },
  { courseId: '2', progress: 30 },
];

const upcomingAssignments = [
  {
    id: '1',
    title: 'Build a Simple HTML Page',
    courseName: 'Introduction to Web Development',
    dueDate: '2024-03-01T23:59:00Z',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Style Your Portfolio',
    courseName: 'Introduction to Web Development',
    dueDate: '2024-03-15T23:59:00Z',
    status: 'pending',
  },
];

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const fetchCourses = useCallback(() => coursesApi.getEnrolled(), []);
  const { data: courses, isLoading } = useFetch<Course[]>(fetchCourses);

  if (isLoading) {
    return <Loader fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="student-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Continue your learning journey</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="progress-overview">
        <div className="progress-card card">
          <div className="progress-card-header">
            <div className="progress-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div>
              <span className="progress-value">{courses?.length || 0}</span>
              <span className="progress-label">Enrolled Courses</span>
            </div>
          </div>
        </div>

        <div className="progress-card card">
          <div className="progress-card-header">
            <div className="progress-icon progress-icon-success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <span className="progress-value">12</span>
              <span className="progress-label">Completed Lessons</span>
            </div>
          </div>
        </div>

        <div className="progress-card card">
          <div className="progress-card-header">
            <div className="progress-icon progress-icon-warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <span className="progress-value">{upcomingAssignments.length}</span>
              <span className="progress-label">Pending Assignments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Continue Learning</h2>
        </div>

        {courses && courses.length > 0 ? (
          <div className="learning-cards">
            {courses.slice(0, 2).map((course) => {
              const progress = courseProgress.find(p => p.courseId === course._id)?.progress || 0;
              return (
                <div key={course._id} className="learning-card card card-hover">
                  <div className="learning-thumbnail">
                    <div className="learning-placeholder">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="learning-content">
                    <h3 className="learning-title">{course.title}</h3>
                    <p className="learning-instructor">by {course.teacher.name}</p>
                    <div className="learning-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="progress-text">{progress}% complete</span>
                    </div>
                    <Link to={`/student/courses/${course._id}`} className="btn btn-primary mt-4">
                      Continue
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state card">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h3>No enrolled courses</h3>
            <p>Browse available courses to start learning</p>
            <Link to="/student/courses" className="btn btn-primary">Browse Courses</Link>
          </div>
        )}
      </section>

      {/* Upcoming Assignments */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Upcoming Assignments</h2>
          <Link to="/student/assignments" className="btn btn-ghost">View All</Link>
        </div>

        <div className="assignments-list">
          {upcomingAssignments.map((assignment) => {
            const dueDate = new Date(assignment.dueDate);
            const isOverdue = dueDate < new Date();
            const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={assignment.id} className="assignment-item card">
                <div className="assignment-info">
                  <h3 className="assignment-title">{assignment.title}</h3>
                  <p className="assignment-course">{assignment.courseName}</p>
                </div>
                <div className="assignment-due">
                  <span className={`due-badge ${isOverdue ? 'overdue' : daysLeft <= 3 ? 'soon' : ''}`}>
                    {isOverdue ? 'Overdue' : `${daysLeft} days left`}
                  </span>
                  <span className="due-date">{dueDate.toLocaleDateString()}</span>
                </div>
                <Link to={`/student/assignments/${assignment.id}`} className="btn btn-secondary">
                  Start
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
