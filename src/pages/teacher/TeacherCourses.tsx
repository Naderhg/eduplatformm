import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { useFetch } from '../../hooks/useFetch';
import { coursesApi, Course } from '../../api/courses.api';
import { Loader } from '../../components/common/Loader';
import { VideoPlayer } from '../../components/ui/VideoPlayer';
import { Play, FileText, Video, File, Download, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import './TeacherCourses.css';

// Helper function to get full URL for media files
const getMediaUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Handle both /uploads/ and /api/files/ paths
  if (url.startsWith('/uploads/') || url.startsWith('/api/files/')) {
    return `http://localhost:3000${url}`;
  }
  return url;
};

export const TeacherCourses: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  
  const fetchCourses = useCallback(() => {
    if (!user?.id) return Promise.resolve({ data: [], success: true, count: 0, pagination: {} });
    
    return coursesApi.getByTeacher(user.id)
      .then(response => {
        console.log('Raw API response:', response);
        return response; // Return the full response
      })
      .catch(error => {
        console.error('Failed to fetch courses:', error);
        toast.error(t('teacher.courses.courseCreated'));
        return { data: [], success: false, count: 0, pagination: {} };
      });
  }, [user?.id]);

  // Use only one useFetch hook
  const { data: response = { data: [], success: true, count: 0, pagination: {} }, isLoading, error, refetch } = useFetch(fetchCourses, {
    immediate: true,
    initialData: { data: [], success: true, count: 0, pagination: {} }
  });

  // Access courses from the response
  const courses = response.data || [];

  // Ensure courses is always an array
  const safeCourses = Array.isArray(courses) ? courses : [];
  
  // Refresh courses when the component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);



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
    <div className="teacher-courses">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('teacher.courses.title')}</h1>
          <p className="page-subtitle">{t('teacher.courses.description')}</p>
        </div>
        <Link to="/teacher/courses/new" className="btn btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t('teacher.courses.createCourse')}
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button className="filter-tab active">{t('common.all')} ({safeCourses.length})</button>
        <button className="filter-tab">{t('common.published')} ({safeCourses.filter(c => c.status === 'published').length})</button>
        <button className="filter-tab">{t('common.draft')} ({safeCourses.filter(c => c.status === 'draft').length})</button>
      </div>

      {safeCourses.length > 0 ? (
        <div className="courses-list">
          {safeCourses.map((course) => (
            <div key={course._id} className="course-list-item card">
              <div className="course-list-thumbnail">
                {course.videoUrl ? (
                  <div 
                    className="video-thumbnail cursor-pointer"
                    onClick={() => setSelectedVideo({ url: getMediaUrl(course.videoUrl), title: course.title })}
                  >
                    <div className="play-icon">
                      <Play size={24} />
                    </div>
                    {course.thumbnail ? (
                      <img src={getMediaUrl(course.thumbnail)} alt={course.title} className="course-thumbnail" />
                    ) : (
                      <div className="video-placeholder">
                        <Video size={32} />
                      </div>
                    )}
                  </div>
                ) : course.thumbnail ? (
                  <img src={getMediaUrl(course.thumbnail)} alt={course.title} className="course-thumbnail" />
                ) : (
                  <div className="course-placeholder">
                    <FileText size={32} />
                  </div>
                )}
              </div>
              
              <div className="course-list-content">
                <div className="course-list-header">
                  <h3 className="course-list-title">{course.title}</h3>
                  <span className={`badge badge-${course.status === 'published' ? 'success' : course.status === 'draft' ? 'warning' : 'error'}`}>
                    {course.status}
                  </span>
                </div>
                <p className="course-list-description">{course.description}</p>
                <div className="course-list-meta">
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    {course.studentsCount} {t('teacher.students.title')}
                  </span>
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                    {course.lessonsCount} {t('common.lessons')}
                  </span>
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {t('common.updated')} {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="course-list-actions">
                <Link to={`/teacher/courses/${course._id}/manage`} className="btn btn-secondary">
                  <Settings size={16} />
                  {t('common.manage')}
                </Link>
                <button className="btn btn-ghost btn-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
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

      {/* Video Player Modal */}
      <VideoPlayer
        videoUrl={selectedVideo?.url || ''}
        title={selectedVideo?.title || ''}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
};
