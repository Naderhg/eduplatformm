import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { coursesApi, Course } from '../../api/courses.api';
import { Loader } from '../../components/common/Loader';
import { VideoPlayer } from '../../components/ui/VideoPlayer';
import CommentSection from '../../components/common/CommentSection';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Play, Download, BookOpen, User, Clock, FileText } from 'lucide-react';
import './CourseDetails.css';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://deev--edu-platform--fnj72wsf9xl6.code.run';

export const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) {
        setError('Course ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const courseData = await coursesApi.getById(id);
        setCourse(courseData);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to load course details';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const handleFileDownload = (file: any) => {
    const link = document.createElement('a');

    // If it's a Cloudinary or any full HTTP URL → open directly
    if (file.url && file.url.startsWith('http')) {
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Otherwise go through the backend proxy (backward compat for old local files)
    const token = localStorage.getItem('token');
    const filename = encodeURIComponent(file.url);
    const fullUrl = `${BACKEND_URL}/api/files/course/${id}/${filename}${token ? `?token=${token}` : ''}`;
    link.href = fullUrl;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading course details..." />;
  }

  if (error || !course) {
    return (
      <div className="course-details">
        <div className="course-details-header">
          <Link to="/student/courses" className="back-button">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Courses
          </Link>
        </div>
        <div className="error-state card">
          <h3>Course Not Found</h3>
          <p>{error || 'The course you are looking for does not exist or you do not have access to it.'}</p>
          <Link to="/student/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="course-details">
      {/* Header */}
      <div className="course-details-header">
        <Link to="/student/courses" className="back-button">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Courses
        </Link>
      </div>

      {/* Course Info Card */}
      <div className="course-info-card card">
        <div className="course-header">
          <div className="course-info">
            <h1 className="course-title">{course.title}</h1>
            <div className="course-meta">
              <span className="instructor">
                <User className="h-4 w-4 mr-1" />
                {course.teacher.name}
              </span>
              <span className="duration">
                <Clock className="h-4 w-4 mr-1" />
                {course.duration} weeks
              </span>
              <span className="level">
                <BookOpen className="h-4 w-4 mr-1" />
                {course.level}
              </span>
            </div>
          </div>
          {course.thumbnail && (
            <div className="course-thumbnail">
              <img src={course.thumbnail.startsWith('http') ? course.thumbnail : `${BACKEND_URL}${course.thumbnail}`} alt={course.title} />
            </div>
          )}
        </div>

        <div className="course-description">
          <h3>Description</h3>
          <p>{course.description}</p>
        </div>

        {course.category && (
          <div className="course-category">
            <span className="category-badge">{course.category}</span>
          </div>
        )}
      </div>

      {/* Video Section */}
      {course.videoUrl && (
        <div className="course-video card">
          <h3>
            <Play className="h-5 w-5 mr-2" />
            Course Video
          </h3>
          <div
            className="video-container"
            onClick={() => setIsVideoOpen(true)}
            role="button"
            aria-label="Play course video"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsVideoOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            {/* Thumbnail from course thumbnail or black bg */}
            {course.thumbnail ? (
              <img
                src={course.thumbnail.startsWith('http') ? course.thumbnail : `${BACKEND_URL}${course.thumbnail}`}
                alt="Video thumbnail"
                className="course-video-player"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="course-video-player" style={{ background: '#111' }} />
            )}
            <div className="video-play-overlay">
              <div className="video-play-btn-big">
                <Play size={44} fill="white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secure Video Player Modal */}
      {course.videoUrl && (
        <VideoPlayer
          videoUrl={(() => {
            const url = course.videoUrl?.startsWith('http')
              ? course.videoUrl
              : `${BACKEND_URL}${course.videoUrl}`;
            // Cloudinary URLs don't need auth tokens
            if (url.includes('cloudinary.com')) return url;
            const token = localStorage.getItem('token');
            return token ? `${url}?token=${token}` : url;
          })()}
          title={course.title}
          isOpen={isVideoOpen}
          onClose={() => setIsVideoOpen(false)}
        />
      )}

      
      {/* Learning Outcomes */}
      {course.learningOutcomes && course.learningOutcomes.length > 0 && (
        <div className="course-outcomes card">
          <h3>
            <BookOpen className="h-5 w-5 mr-2" />
            What You'll Learn
          </h3>
          <ul className="outcomes-list">
            {course.learningOutcomes.map((outcome, index) => (
              <li key={index}>{outcome}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements */}
      {course.requirements && course.requirements.length > 0 && (
        <div className="course-requirements card">
          <h3>Requirements</h3>
          <ul className="requirements-list">
            {course.requirements.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Course Files */}
      {course.files && course.files.length > 0 && (
        <div className="course-files card">
          <h3>
            <FileText className="h-5 w-5 mr-2" />
            Course Materials
          </h3>
          <div className="files-grid">
            {course.files.map((file) => (
              <div key={file.id} className="file-item">
                <div className="file-info">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div className="file-details">
                    <h4 className="file-name">{file.name}</h4>
                    <p className="file-meta">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleFileDownload(file)}
                  className="btn btn-outline-primary btn-sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Stats */}
      <div className="course-stats card">
        <div className="stats-grid">
          <div className="stat-item">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div>
              <p className="stat-number">{course.lessonsCount || 0}</p>
              <p className="stat-label">Lessons</p>
            </div>
          </div>
          <div className="stat-item">
            <User className="h-8 w-8 text-green-500" />
            <div>
              <p className="stat-number">{course.studentsCount || 0}</p>
              <p className="stat-label">Students</p>
            </div>
          </div>
          <div className="stat-item">
            <FileText className="h-8 w-8 text-purple-500" />
            <div>
              <p className="stat-number">{course.files?.length || 0}</p>
              <p className="stat-label">Files</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {id && (
        <div className="course-comments card">
          <CommentSection courseId={id} isTeacher={user?.role === 'TEACHER'} />
        </div>
      )}
    </div>
  );
};
