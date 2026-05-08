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

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('Course video error:', e);
    const video = e.currentTarget;
    const error = video.error;
    if (error) {
      console.error('Video error code:', error.code, error.message);
      toast.error('Failed to load video. Please try again later.');
    }
  };

  const handleFileDownload = (file: any) => {
    console.log('=== File Download Clicked ===');
    console.log('File data:', file);
    console.log('File name:', file.name);
    console.log('File URL:', file.url);
    console.log('Course ID:', id);
    
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    
    // Construct the proper URL for course file download
    // The backend expects: /api/files/course/:courseId/:filename
    // Use file.url which contains the actual stored filename, not file.name (original filename)
    const encodedFilename = encodeURIComponent(file.url);
    const downloadUrl = `/api/files/course/${id}/${encodedFilename}`;
    
    // Add authentication token if available
    const token = localStorage.getItem('token');
    const fullUrl = token ? `${BACKEND_URL}${downloadUrl}?token=${token}` : `${BACKEND_URL}${downloadUrl}`;
    
    console.log('Encoded filename:', encodedFilename);
    console.log('Download URL constructed:', fullUrl);
    
    link.href = fullUrl;
    link.download = file.name; // Use original filename for download
    link.target = '_blank';
    document.body.appendChild(link);
    
    console.log('Link added to DOM, about to click...');
    
    link.click();
    
    console.log('Link clicked, removing from DOM...');
    document.body.removeChild(link);
    
    console.log('Download process completed');
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
          <div className="video-container">
            <div 
              className="video-preview"
              onClick={() => setIsVideoOpen(true)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <video 
                className="course-video-player"
                crossOrigin="use-credentials"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
              >
                <source 
                  src={
                    (() => {
                      const url = course.videoUrl?.startsWith('http') ? course.videoUrl : `${BACKEND_URL}${course.videoUrl}`;
                      const token = localStorage.getItem('token');
                      return token ? `${url}?token=${token}` : url;
                    })()
                  } 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
              <div 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Play size={20} />
                Click to play
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {course.videoUrl && (
        <VideoPlayer
          videoUrl={
            (() => {
              const url = course.videoUrl?.startsWith('http') ? course.videoUrl : `${BACKEND_URL}${course.videoUrl}`;
              const token = localStorage.getItem('token');
              return token ? `${url}?token=${token}` : url;
            })()
          }
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
