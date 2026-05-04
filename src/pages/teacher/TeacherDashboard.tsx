import React, { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { useFetch } from '../../hooks/useFetch';
import { coursesApi, Course } from '../../api/courses.api';
import { Loader } from '../../components/common/Loader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './TeacherDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const fetchCourses = useCallback(async () => {
    if (!user?.id) return Promise.resolve([] as Course[]);
    try {
      const response = await coursesApi.getByTeacher(user.id);
      const courses = Array.isArray(response) ? response : (response.data || []);
      
      console.log('Fetched courses:', courses);
      console.log('First course thumbnail:', courses[0]?.thumbnail);
      
      // Fetch detailed data for each course to get student counts
      const coursesWithStats = await Promise.all(
        courses.map(async (course: Course) => {
          try {
            const detailedCourse = await coursesApi.getById(course._id || course.id);
            console.log('Detailed course:', detailedCourse);
            return detailedCourse;
          } catch (error) {
            console.error(`Failed to fetch details for course ${course._id}:`, error);
            return course; // Return basic course data if detailed fetch fails
          }
        })
      );
      
      return coursesWithStats;
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error(t('teacher.courses.courseCreated'));
      return [];
    }
  }, [user?.id]);

  const { data: courses = [], isLoading, error } = useFetch<Course[]>(fetchCourses, {
    immediate: true,
    initialData: []
  });

  // Ensure courses is always an array
  const safeCourses = Array.isArray(courses) ? courses : [];

  const stats = {
    totalCourses: safeCourses.length,
    publishedCourses: safeCourses.filter((c: Course) => c.status === 'published').length,
    totalStudents: safeCourses.reduce((acc: number, c: Course) => acc + (c.studentsCount || 0), 0),
    totalLessons: safeCourses.reduce((acc: number, c: Course) => acc + (c.lessonsCount || 0), 0),
  };

  if (isLoading) {
    return <Loader fullScreen text={t('common.loading')} />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>{t('common.error')}</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('teacher.dashboard.welcome')}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">{t('teacher.dashboard.recentActivity')}</p>
        </div>
        <Link to="/teacher/courses/new" className="btn btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t('teacher.courses.createCourse')}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalCourses}</span>
            <span className="stat-label">{t('teacher.dashboard.totalCourses')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.publishedCourses}</span>
            <span className="stat-label">{t('common.published')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalStudents}</span>
            <span className="stat-label">{t('teacher.dashboard.totalStudents')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalLessons}</span>
            <span className="stat-label">{t('common.lessons')}</span>
          </div>
        </div>
      </div>

      {/* Recent Courses */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">{t('teacher.courses.title')}</h2>
          <Link to="/teacher/courses" className="btn btn-ghost">{t('common.viewAll')}</Link>
        </div>

        {courses && courses.length > 0 ? (
          <div className="courses-grid">
            {courses.slice(0, 4).map((course) => {
              console.log('Rendering course:', course.title, 'Thumbnail:', course.thumbnail);
              return (
              <div key={course._id} className="course-card card card-hover">
                <div className="course-thumbnail">
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail.startsWith('http') ? course.thumbnail : `${API_BASE_URL}${course.thumbnail}`} 
                      alt={course.title} 
                      className="course-thumbnail-img"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`course-placeholder ${course.thumbnail ? 'hidden' : ''}`}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <span className={`course-status badge badge-${course.status === 'published' ? 'success' : course.status === 'draft' ? 'warning' : 'error'}`}>
                    {course.status}
                  </span>
                </div>
                <div className="card-body">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description}</p>
                  <div className="course-meta">
                    <span className="course-stat">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                      {course.studentsCount} {t('teacher.students.title')}
                    </span>
                    <span className="course-stat">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                      </svg>
                      {course.lessonsCount} {t('common.lessons')}
                    </span>
                  </div>
                </div>
                <div className="card-footer">
                  <Link to={`/teacher/courses/${course._id}/manage`} className="btn btn-secondary w-full">
                    {t('teacher.courses.manageCourse')}
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
            <h3>{t('teacher.courses.noCourses')}</h3>
            <p>{t('teacher.courses.createNewCourse')}</p>
            <Link to="/teacher/courses/new" className="btn btn-primary">{t('teacher.courses.createCourse')}</Link>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="dashboard-section">
        <h2 className="section-title">{t('common.quickActions')}</h2>
        <div className="quick-actions">
          <Link to="/teacher/courses/new" className="quick-action-card card card-hover">
            <div className="quick-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span>{t('teacher.courses.createNewCourse')}</span>
          </Link>
          <Link to="/teacher/assignments" className="quick-action-card card card-hover">
            <div className="quick-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <span>{t('teacher.assignments.viewSubmissions')}</span>
          </Link>
          <Link to="/teacher/students" className="quick-action-card card card-hover">
            <div className="quick-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span>{t('teacher.students.title')}</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
