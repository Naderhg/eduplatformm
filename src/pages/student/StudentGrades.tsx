import React from 'react';
import './StudentGrades.css';

// Mock grades data
const grades = [
  {
    id: '1',
    courseName: 'Introduction to Web Development',
    assignments: [
      { name: 'HTML Basics Quiz', score: 95, maxScore: 100, date: '2024-02-20' },
      { name: 'CSS Layout Challenge', score: 88, maxScore: 100, date: '2024-02-25' },
      { name: 'JavaScript Fundamentals', score: 92, maxScore: 100, date: '2024-03-01' },
    ],
    overallGrade: 91.7,
  },
  {
    id: '2',
    courseName: 'Advanced React Patterns',
    assignments: [
      { name: 'Component Design', score: 90, maxScore: 100, date: '2024-02-15' },
      { name: 'State Management', score: 85, maxScore: 100, date: '2024-02-28' },
    ],
    overallGrade: 87.5,
  },
];

export const StudentGrades: React.FC = () => {
  const overallAverage = grades.reduce((acc, course) => acc + course.overallGrade, 0) / grades.length;

  return (
    <div className="student-grades">
      <div className="page-header">
        <div>
          <h1 className="page-title">Grades</h1>
          <p className="page-subtitle">Track your academic performance</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grades-overview">
        <div className="grade-stat-card card">
          <div className="grade-circle">
            <svg viewBox="0 0 36 36">
              <path
                className="grade-circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="grade-circle-fill"
                strokeDasharray={`${overallAverage}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="grade-value">{overallAverage.toFixed(1)}%</span>
          </div>
          <div className="grade-stat-info">
            <span className="grade-stat-label">Overall Average</span>
            <span className="grade-stat-description">Across all courses</span>
          </div>
        </div>

        <div className="grade-stat-card card">
          <div className="grade-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="grade-stat-info">
            <span className="grade-stat-value">{grades.length}</span>
            <span className="grade-stat-label">Active Courses</span>
          </div>
        </div>

        <div className="grade-stat-card card">
          <div className="grade-icon grade-icon-success">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="grade-stat-info">
            <span className="grade-stat-value">
              {grades.reduce((acc, course) => acc + course.assignments.length, 0)}
            </span>
            <span className="grade-stat-label">Graded Assignments</span>
          </div>
        </div>
      </div>

      {/* Grades by Course */}
      <div className="grades-by-course">
        {grades.map((course) => (
          <section key={course.id} className="course-grades card">
            <div className="course-grades-header">
              <div className="course-info">
                <h2 className="course-name">{course.courseName}</h2>
                <span className="course-average">
                  Average: <strong>{course.overallGrade.toFixed(1)}%</strong>
                </span>
              </div>
            </div>

            <table className="grades-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {course.assignments.map((assignment, index) => {
                  const percentage = (assignment.score / assignment.maxScore) * 100;
                  return (
                    <tr key={index}>
                      <td className="assignment-name">{assignment.name}</td>
                      <td className="assignment-date">{new Date(assignment.date).toLocaleDateString()}</td>
                      <td className="assignment-score">
                        {assignment.score}/{assignment.maxScore}
                      </td>
                      <td>
                        <span className={`grade-badge ${percentage >= 90 ? 'a' : percentage >= 80 ? 'b' : percentage >= 70 ? 'c' : 'd'}`}>
                          {percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : 'D'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </div>
  );
};
