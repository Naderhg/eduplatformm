import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { coursesApi } from '../../api/courses.api';
import { assignmentsApi } from '../../api/assignments.api';
import { Loader } from '../../components/common/Loader';
import CommentSection from '../../components/common/CommentSection';
import { toast } from 'react-toastify';
import { 
  Users, 
  BookOpen, 
  Video, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Plus,
  Play,
  Clock,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Users as UsersIcon,
  Send
} from 'lucide-react';
import './ManageCourse.css';

export interface CourseWithDetails {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: 'preparatory' | 'primary' | 'secondary' | 'university';
  duration: number;
  status: 'draft' | 'published' | 'archived';
  requirements: string[];
  learningOutcomes: string[];
  thumbnail: string;
  videoUrl: string;
  files: Array<{
    _id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    createdAt: string;
  }>;
  teacher: {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    createdAt: string;
    updatedAt: string;
  };
  studentsCount: number;
  lessonsCount: number;
  enrollments: Array<{
    _id: string;
    student: {
      _id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const ManageCourse: React.FC = () => {
  const { t } = useLanguage();
  const params = useParams();
  const { id } = useParams<{ id: string }>();
  console.log('Course ID from URL:', id);
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [publishingAssignment, setPublishingAssignment] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'content' | 'assignments' | 'settings'>('overview');

  const fetchAssignments = async () => {
    if (!id) return;
    
    try {
      setAssignmentsLoading(true);
      console.log('Fetching assignments for course:', id);
      const response = await assignmentsApi.getByCourse(id);
      console.log('Assignments data received:', response);
      setAssignments(response);
    } catch (error: any) {
      console.error('Failed to fetch assignments:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load assignments';
      toast.error(errorMessage);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handlePublishAssignment = async (assignmentId: string) => {
    try {
      setPublishingAssignment(assignmentId);
      console.log('Publishing assignment:', assignmentId);
      
      const publishedAssignment = await assignmentsApi.publishAssignment(assignmentId);
      console.log('Assignment published successfully:', publishedAssignment);
      
      // Update the assignment in the local state
      setAssignments(prevAssignments => 
        prevAssignments.map(assignment => 
          assignment._id === assignmentId 
            ? { ...assignment, status: 'published' }
            : assignment
        )
      );
      
      toast.success('Assignment published successfully! Students can now see it.');
    } catch (error: any) {
      console.error('Failed to publish assignment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to publish assignment';
      toast.error(errorMessage);
    } finally {
      setPublishingAssignment(null);
    }
  };

  const handleCertificateToggle = async (assignmentId: string, currentEnabled: boolean) => {
    try {
      console.log('Toggling certificate for assignment:', assignmentId, 'to:', !currentEnabled);
      await assignmentsApi.update(assignmentId, { certificateEnabled: !currentEnabled });
      
      setAssignments(prevAssignments => 
        prevAssignments.map(assignment => 
          assignment._id === assignmentId 
            ? { ...assignment, certificateEnabled: !currentEnabled }
            : assignment
        )
      );
      
      toast.success(!currentEnabled ? 'Certificate enabled successfully!' : 'Certificate disabled successfully!');
    } catch (error: any) {
      console.error('Failed to toggle certificate status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update certificate settings';
      toast.error(errorMessage);
    }
  };

  const handleUpdateStatus = async (newStatus: 'draft' | 'published' | 'archived') => {
    if (!course || !id) return;
    
    // Confirm before changing status
    const confirmMessages = {
      draft: 'Are you sure you want to set this course to draft? Students will not be able to see it.',
      published: 'Are you sure you want to publish this course? Students will be able to enroll and see it.',
      archived: 'Are you sure you want to archive this course? It will be hidden from students but you can still access it.'
    };
    
    if (!window.confirm(confirmMessages[newStatus])) {
      return;
    }
    
    try {
      setUpdatingStatus(true);
      console.log('Updating course status to:', newStatus);
      
      const updatedCourse = await coursesApi.update(id, { status: newStatus });
      console.log('Course status updated successfully:', updatedCourse);
      
      // Update course in local state
      setCourse(prevCourse => prevCourse ? { ...prevCourse, status: newStatus } : null);
      
      const successMessages = {
        draft: 'Course set to draft successfully.',
        published: 'Course published successfully!',
        archived: 'Course archived successfully.'
      };
      
      toast.success(successMessages[newStatus]);
    } catch (error: any) {
      console.error('Failed to update course status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update course status';
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!course || !id) return;
    
    // Strong confirmation for deletion
    if (!window.confirm(
      '⚠️ WARNING: This will permanently delete the course and all its content including:\n\n' +
      '• All lessons and assignments\n' +
      '• All student enrollments\n' +
      '• All files and resources\n' +
      '• All student submissions\n\n' +
      'This action CANNOT be undone.\n\n' +
      'Type "DELETE" to confirm:'
    )) {
      return;
    }
    
    // Double confirmation
    const confirmation = window.prompt('Type "DELETE" to confirm permanent deletion:');
    if (confirmation !== 'DELETE') {
      toast.error('Deletion cancelled. Confirmation text did not match.');
      return;
    }
    
    try {
      setDeleting(true);
      console.log('Deleting course:', id);
      
      await coursesApi.delete(id);
      console.log('Course deleted successfully');
      
      toast.success('Course deleted successfully.');
      
      // Redirect to courses list after deletion
      window.location.href = '/teacher/courses';
    } catch (error: any) {
      console.error('Failed to delete course:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete course';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
  const fetchCourse = async () => {
    if (!user?.id) {
      console.error('No user ID found');
      return;
    }
    
    if (!id) {
      console.error('No course ID provided');
      toast.error(t('teacher.courses.courseCreated'));
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching course with ID:', id);
      const response = await coursesApi.getWithDetails(id);
      console.log('Course data received:', response);
      console.log('Course files:', response.files);
      console.log('Files array length:', response.files?.length);
      setCourse(response);
    } catch (error: any) {
      console.error('Failed to fetch course:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load course details';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  fetchCourse();
}, [id, user?.id]);

useEffect(() => {
  if (activeTab === 'assignments') {
    fetchAssignments();
  }
}, [activeTab, id]);

  if (loading) {
    return <Loader fullScreen text={t('common.loading')} />;
  }

  if (!course) {
    return (
      <div className="error-container">
        <h2>{t('teacher.courses.courseNotFound')}</h2>
        <Link to="/teacher/courses" className="btn btn-primary">
          {t('common.back')} {t('teacher.courses.title')}
        </Link>
      </div>
    );
  }

  const enrolledStudentsCount = course?.studentsCount || 0;
  const publishedLessons = course?.lessonsCount || 0;

  return (
    <div className="manage-course p-3 sm:p-5 max-w-6xl mx-auto">
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 p-4 sm:p-5 bg-card border border-border rounded-lg shadow-sm">
        <div>
          <h1 className="page-title text-xl sm:text-2xl font-bold text-foreground mb-1">{course.title}</h1>
          <p className="page-subtitle text-sm sm:text-base text-muted-foreground">{t('teacher.courses.manageCourseDescription')}</p>
        </div>
        <div className="header-actions flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Link to={`/teacher/courses/${course._id}/edit`} className="btn btn-secondary inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-accent transition-colors">
            <Edit size={16} />
            <span className="hidden sm:inline">{t('teacher.courses.editCourse')}</span>
            <span className="sm:hidden">{t('common.edit')}</span>
          </Link>
          <Link to={`/teacher/courses/${course._id}/content`} className="btn btn-primary inline-flex items-center gap-2 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
            <Plus size={16} />
            <span className="hidden sm:inline">{t('teacher.courses.addContent')}</span>
            <span className="sm:hidden">{t('common.add')}</span>
          </Link>
        </div>
      </div>

      <div className="course-stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="stat-card bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="stat-icon bg-primary/10 text-primary w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0">
            <Users size={20} className="flex sm:hidden" />
            <Users size={28} className="hidden sm:flex" />
          </div>
          <div className="stat-info min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{enrolledStudentsCount}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('teacher.students.enrolledStudents')}</p>
          </div>
        </div>
        <div className="stat-card bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="stat-icon bg-primary/10 text-primary w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0">
            <BookOpen size={20} className="flex sm:hidden" />
            <BookOpen size={28} className="hidden sm:flex" />
          </div>
          <div className="stat-info min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{publishedLessons}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('teacher.courses.publishedLessons')}</p>
          </div>
        </div>
        <div className="stat-card bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="stat-icon bg-primary/10 text-primary w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0">
            <BarChart3 size={20} className="flex sm:hidden" />
            <BarChart3 size={28} className="hidden sm:flex" />
          </div>
          <div className="stat-info min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">0%</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('teacher.courses.avgCompletion')}</p>
          </div>
        </div>
      </div>

      <div className="tabs-container bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="tab-buttons flex flex-nowrap overflow-x-auto border-b border-border">
          <button 
            className={`tab-btn px-3 sm:px-6 py-3 bg-none border-none text-muted-foreground cursor-pointer font-medium transition-colors relative hover:text-primary whitespace-nowrap text-sm sm:text-base ${activeTab === 'overview' ? 'active text-primary border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            {t('teacher.courses.overview')}
          </button>
          <button 
            className={`tab-btn px-3 sm:px-6 py-3 bg-none border-none text-muted-foreground cursor-pointer font-medium transition-colors relative hover:text-primary whitespace-nowrap text-sm sm:text-base ${activeTab === 'students' ? 'active text-primary border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            {t('teacher.students.title')} ({enrolledStudentsCount})
          </button>
          <button 
            className={`tab-btn px-3 sm:px-6 py-3 bg-none border-none text-muted-foreground cursor-pointer font-medium transition-colors relative hover:text-primary whitespace-nowrap text-sm sm:text-base ${activeTab === 'content' ? 'active text-primary border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            {t('teacher.courses.content')}
          </button>
          <button 
            className={`tab-btn px-3 sm:px-6 py-3 bg-none border-none text-muted-foreground cursor-pointer font-medium transition-colors relative hover:text-primary whitespace-nowrap text-sm sm:text-base ${activeTab === 'assignments' ? 'active text-primary border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            {t('teacher.assignments.title')}
          </button>
          <button 
            className={`tab-btn px-3 sm:px-6 py-3 bg-none border-none text-muted-foreground cursor-pointer font-medium transition-colors relative hover:text-primary whitespace-nowrap text-sm sm:text-base ${activeTab === 'settings' ? 'active text-primary border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            {t('common.settings')}
          </button>
        </div>

        <div className="tab-content p-4 sm:p-8">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="course-info bg-secondary/50 border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Course Information</h3>
                <div className="info-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="info-item flex flex-col">
                    <label className="font-medium text-muted-foreground mb-1">Status:</label>
                    <span className={`status-badge px-2 py-1 rounded text-xs font-medium uppercase ${
                      course.status === 'published' ? 'bg-success/10 text-success' : 
                      course.status === 'draft' ? 'bg-muted text-muted-foreground' : 
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="info-item flex flex-col">
                    <label className="font-medium text-muted-foreground mb-1">Category:</label>
                    <span className="text-foreground">{course.category}</span>
                  </div>
                  <div className="info-item flex flex-col">
                    <label className="font-medium text-muted-foreground mb-1">Level:</label>
                    <span className="text-foreground">{course.level}</span>
                  </div>
                  <div className="info-item flex flex-col">
                    <label className="font-medium text-muted-foreground mb-1">Duration:</label>
                    <span className="text-foreground">{course.duration} hours</span>
                  </div>
                  <div className="info-item flex flex-col">
                    <label className="font-medium text-muted-foreground mb-1">Created:</label>
                    <span className="text-foreground">{new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="course-description bg-secondary/50 border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Description</h3>
                <p className="text-muted-foreground leading-relaxed m-0">{course.description}</p>
              </div>

              <div className="requirements-outcomes grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="section">
                  <h4 className="text-base font-semibold text-foreground mb-3">Requirements</h4>
                  <ul className="list-none p-0 m-0">
                    {course.requirements.map((req, index) => (
                      <li key={index} className="text-muted-foreground py-2 relative pl-5 before:content-['•'] before:absolute before:left-0 before:text-primary">{req}</li>
                    ))}
                  </ul>
                </div>
                <div className="section">
                  <h4 className="text-base font-semibold text-foreground mb-3">Learning Outcomes</h4>
                  <ul className="list-none p-0 m-0">
                    {course.learningOutcomes.map((outcome, index) => (
                      <li key={index} className="text-muted-foreground py-2 relative pl-5 before:content-['•'] before:absolute before:left-0 before:text-primary">{outcome}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="students-tab">
              <div className="students-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                <h3 className="text-xl font-semibold text-foreground">Enrolled Students</h3>
                <div className="student-actions w-full sm:w-auto">
                  <button className="btn btn-primary inline-flex items-center gap-2 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors w-full sm:w-auto">
                    <Download size={16} />
                    <span className="hidden sm:inline">Export List</span>
                    <span className="sm:hidden">Export</span>
                  </button>
                </div>
              </div>
              
              <div className="students-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {course.enrollments && course.enrollments.length > 0 ? (
                  course.enrollments.map((enrollment: any, index: number) => (
                    <div key={index} className="student-card bg-card border border-border rounded-lg p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
                      <div className="student-avatar w-10 h-10 sm:w-12 sm:h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm sm:text-lg flex-shrink-0">
                        {enrollment.student?.avatar ? (
                          <img src={enrollment.student.avatar} alt={enrollment.student.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <div className="avatar-placeholder">
                            {enrollment.student?.name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                        )}
                      </div>
                      <div className="student-info flex-1">
                        <h4 className="text-base font-semibold text-foreground mb-1">{enrollment.student?.name || 'Unknown Student'}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{enrollment.student?.email || 'No email'}</p>
                        <span className="enrollment-date inline-flex items-center gap-1 text-xs text-muted-foreground">
                          Enrolled {new Date(enrollment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-students col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle size={48} className="text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No students enrolled yet</h3>
                    <p className="text-muted-foreground">Share your course with students to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="content-tab">
              <div className="content-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                <h3 className="text-xl font-semibold text-foreground">Course Content</h3>
                <div className="content-actions flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <button className="btn btn-primary inline-flex items-center gap-2 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors w-full sm:w-auto">
                    <Plus size={16} />
                    <span className="hidden sm:inline">Add Lesson</span>
                    <span className="sm:hidden">Lesson</span>
                  </button>
                  <button className="btn btn-secondary inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-accent transition-colors w-full sm:w-auto">
                    <FileText size={16} />
                    <span className="hidden sm:inline">Add Resource</span>
                    <span className="sm:hidden">Resource</span>
                  </button>
                </div>
              </div>
              
              <div className="content-grid grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="content-section bg-secondary/50 border border-border rounded-lg p-4 sm:p-6">
                  <h4 className="text-base font-semibold text-foreground mb-4">Lessons</h4>
                  <div className="lessons-list">
                    {course.lessonsCount > 0 ? (
                      <div className="lesson-items space-y-3">
                        {[...Array(course.lessonsCount)].map((_, index) => (
                          <div key={index} className="lesson-item bg-card border border-border rounded-lg p-4 shadow-sm">
                            <div className="lesson-thumbnail text-primary mb-3">
                              <Video size={32} />
                            </div>
                            <div className="lesson-info">
                              <h5 className="text-base font-semibold text-foreground mb-1">Lesson {index + 1}</h5>
                              <p className="text-sm text-muted-foreground mb-2">Click to edit lesson content</p>
                              <div className="lesson-meta flex gap-3">
                                <span className="duration text-xs text-muted-foreground bg-muted px-2 py-1 rounded">30 min</span>
                                <span className="status text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Draft</span>
                              </div>
                            </div>
                            <div className="lesson-actions flex gap-2 mt-3">
                              <button className="btn btn-sm btn-secondary inline-flex items-center gap-1 px-2 py-1 border border-border rounded text-xs font-medium text-foreground bg-card hover:bg-accent transition-colors">
                                <Edit size={14} />
                                Edit
                              </button>
                              <button className="btn btn-sm btn-ghost inline-flex items-center gap-1 px-2 py-1 border border-transparent rounded text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="content-placeholder flex flex-col items-center justify-center py-12 text-center">
                        <Video size={48} className="text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">No lessons added yet</p>
                        <button className="btn btn-primary inline-flex items-center gap-2 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                          <Plus size={16} />
                          Add First Lesson
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="content-section bg-secondary/50 border border-border rounded-lg p-4 sm:p-6">
                  <h4 className="text-base font-semibold text-foreground mb-4">Resources</h4>
                  <div className="resources-list">
                    {console.log('Rendering content section - course.files:', course.files)}
                    {console.log('Files length:', course.files?.length)}
                    {course.files && course.files.length > 0 ? (
                      <div className="resource-items space-y-3">
                        {course.files.map((file: any, index: number) => (
                          <div key={index} className="resource-item bg-card border border-border rounded-lg p-4 shadow-sm">
                            <div className="resource-icon text-muted-foreground mb-3">
                              <FileText size={24} />
                            </div>
                            <div className="resource-info">
                              <h5 className="text-base font-semibold text-foreground mb-1">{file.name}</h5>
                              <p className="text-sm text-muted-foreground">{file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <div className="resource-actions flex gap-2 mt-3">
                              <button className="btn btn-sm btn-secondary inline-flex items-center gap-1 px-2 py-1 border border-border rounded text-xs font-medium text-foreground bg-card hover:bg-accent transition-colors">
                                <Download size={14} />
                                Download
                              </button>
                              <button className="btn btn-sm btn-ghost inline-flex items-center gap-1 px-2 py-1 border border-transparent rounded text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="content-placeholder flex flex-col items-center justify-center py-12 text-center">
                        <FileText size={48} className="text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">No resources added yet</p>
                        <button className="btn btn-secondary inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-accent transition-colors">
                          <Plus size={16} />
                          Add First Resource
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="assignments-tab">
              <div className="assignments-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 p-4 sm:p-5 bg-card border border-border rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-foreground">Course Assignments</h3>
                <Link to={`/teacher/courses/${id}/assignments/new`} className="btn btn-primary inline-flex items-center gap-2 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors w-full sm:w-auto">
                  <Plus size={16} />
                  <span className="hidden sm:inline">Create Assignment</span>
                  <span className="sm:hidden">Create</span>
                </Link>
              </div>
              
              <div className="assignments-content bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                {assignmentsLoading ? (
                  <div className="loading-placeholder flex items-center justify-center py-12">
                    <Loader text="Loading assignments..." />
                  </div>
                ) : assignments && assignments.length > 0 ? (
                  <div className="assignments-list space-y-3 sm:space-y-4 p-4 sm:p-5">
                    {assignments.map((assignment: any) => (
                      <div key={assignment._id} className="assignment-item bg-card border border-border rounded-lg p-4 sm:p-5 shadow-sm hover:border-primary transition-colors">
                        <div className="assignment-content">
                          <div className="assignment-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                            <h4 className="assignment-title text-lg font-semibold text-foreground">{assignment.title}</h4>
                            <span className={`status-badge px-2 py-1 rounded text-xs font-medium uppercase ${
                              assignment.status === 'published' ? 'bg-success/10 text-success' : 
                              assignment.status === 'closed' ? 'bg-destructive/10 text-destructive' : 
                              'bg-muted text-muted-foreground'
                            }`}>
                              {assignment.status}
                            </span>
                            {assignment.certificateEnabled && (
                              <span className="status-badge px-2 py-1 rounded text-xs font-medium uppercase" style={{ backgroundColor: '#fef3c7', color: '#d97706', marginLeft: '8px' }}>
                                🎓 Certificate
                              </span>
                            )}
                          </div>
                          <p className="assignment-description text-muted-foreground mb-4 leading-relaxed">{assignment.description}</p>
                          <div className="assignment-meta flex flex-col sm:flex-row gap-2 sm:gap-5 mb-4">
                            <span className="assignment-type inline-flex items-center gap-1 text-sm text-muted-foreground">
                              <FileText size={16} />
                              {assignment.type?.toUpperCase()}
                            </span>
                            <span className="assignment-points text-sm text-muted-foreground">
                              <strong>{assignment.maxScore}</strong> points
                            </span>
                            <span className="assignment-due-date inline-flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar size={16} />
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="assignment-stats flex justify-between items-center">
                            <span className="submissions-count inline-flex items-center gap-1 text-sm text-muted-foreground">
                              <UsersIcon size={16} />
                              {assignment.submissionsCount || 0} submissions
                            </span>
                          </div>
                        </div>
                        <div className="assignment-actions flex flex-col sm:flex-row gap-2 mt-4">
                          <Link 
                            to={`/teacher/assignments/${assignment._id}/view`} 
                            className="btn btn-secondary btn-sm inline-flex items-center gap-1 px-2 py-1 border border-border rounded text-xs font-medium text-foreground bg-card hover:bg-accent transition-colors w-full sm:w-auto justify-center"
                          >
                            <Edit size={14} />
                            <span className="hidden sm:inline">View</span>
                            <span className="sm:hidden">View</span>
                          </Link>
                          <Link 
                            to={`/teacher/assignments/${assignment._id}/submissions`} 
                            className="btn btn-primary btn-sm inline-flex items-center gap-1 px-2 py-1 border border-transparent rounded text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
                          >
                            <UsersIcon size={14} />
                            <span className="hidden sm:inline">Submissions</span>
                            <span className="sm:hidden">Subs</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleCertificateToggle(assignment._id, assignment.certificateEnabled || false)}
                            className="btn btn-secondary btn-sm inline-flex items-center gap-1 px-2 py-1 border rounded text-xs font-medium w-full sm:w-auto justify-center"
                            style={{
                              backgroundColor: assignment.certificateEnabled ? '#fef3c7' : '#f3f4f6',
                              color: assignment.certificateEnabled ? '#d97706' : '#374151',
                              borderColor: assignment.certificateEnabled ? '#f59e0b' : '#d1d5db'
                            }}
                          >
                            🎓 {assignment.certificateEnabled ? 'Disable Cert' : 'Enable Cert'}
                          </button>
                          {assignment.status === 'draft' && (
                            <button
                              onClick={() => handlePublishAssignment(assignment._id)}
                              disabled={publishingAssignment === assignment._id}
                              className="btn btn-success btn-sm inline-flex items-center gap-1 px-2 py-1 border border-transparent rounded text-xs font-medium text-success-foreground bg-success hover:bg-success/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {publishingAssignment === assignment._id ? (
                                <>
                                  <div className="spinner w-4 h-4 mr-1" />
                                  Publishing...
                                </>
                              ) : (
                                <>
                                  <Send size={14} />
                                  Publish
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="assignments-placeholder flex flex-col items-center justify-center py-12 text-center">
                    <FileText size={48} className="text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No assignments created yet</p>
                    <Link to={`/teacher/courses/${id}/assignments/new`} className="btn btn-primary inline-flex items-center gap-2 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                      <Plus size={16} />
                      Create First Assignment
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-tab p-4 sm:p-5">
              <h3 className="text-xl font-semibold text-foreground mb-4 sm:mb-6">Course Settings</h3>
              <div className="settings-grid grid grid-cols-1 gap-4 sm:gap-6">
                <div className="setting-group bg-secondary/50 border border-border rounded-lg p-4 sm:p-6">
                  <h4 className="text-base font-semibold text-foreground mb-3 sm:mb-4">Course Status</h4>
                  <div className="status-options flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button 
                      className={`status-btn inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-card cursor-pointer font-medium transition-colors hover:border-primary ${
                        course.status === 'draft' ? 'active bg-primary text-primary-foreground border-primary' : ''
                      }`}
                      onClick={() => handleUpdateStatus('draft')}
                      disabled={updatingStatus}
                    >
                      <AlertCircle size={16} />
                      Draft
                    </button>
                    <button 
                      className={`status-btn inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-card cursor-pointer font-medium transition-colors hover:border-primary ${
                        course.status === 'published' ? 'active bg-primary text-primary-foreground border-primary' : ''
                      }`}
                      onClick={() => handleUpdateStatus('published')}
                      disabled={updatingStatus}
                    >
                      <CheckCircle size={16} />
                      Published
                    </button>
                    <button 
                      className={`status-btn inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-card cursor-pointer font-medium transition-colors hover:border-primary ${
                        course.status === 'archived' ? 'active bg-primary text-primary-foreground border-primary' : ''
                      }`}
                      onClick={() => handleUpdateStatus('archived')}
                      disabled={updatingStatus}
                    >
                      <XCircle size={16} />
                      Archived
                    </button>
                    {updatingStatus && (
                      <div className="status-loading inline-flex items-center gap-2 mt-3 px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground">
                        <div className="spinner w-4 h-4" />
                        Updating...
                      </div>
                    )}
                  </div>
                  <p className="setting-description text-sm text-muted-foreground mt-4 leading-relaxed">
                    {course.status === 'draft' && 'Course is in draft mode. Students cannot see or enroll in it.'}
                    {course.status === 'published' && 'Course is published. Students can enroll and access it.'}
                    {course.status === 'archived' && 'Course is archived. Current students can still access it, but new students cannot enroll.'}
                  </p>
                </div>
                
                <div className="setting-group bg-secondary/50 border border-border rounded-lg p-4 sm:p-6">
                  <h4 className="text-base font-semibold text-foreground mb-3 sm:mb-4">Course Access</h4>
                  <div className="access-control">
                    <label className="switch-label inline-flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked={course.status === 'published'} className="w-5 h-5 cursor-pointer" />
                      <span>Allow Self-Enrollment</span>
                    </label>
                    <p className="setting-description text-sm text-muted-foreground mt-2 leading-relaxed">
                      Students can enroll in this course without approval
                    </p>
                  </div>
                </div>
                
                <div className="setting-group bg-secondary/50 border border-border rounded-lg p-4 sm:p-6">
                  <h4 className="text-base font-semibold text-foreground mb-3 sm:mb-4">Danger Zone</h4>
                  <div className="danger-actions mt-4 sm:mt-5">
                    <button 
                      className="btn btn-danger inline-flex items-center gap-2 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                      onClick={handleDeleteCourse}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <>
                          <div className="spinner w-5 h-5 mr-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          Delete Course
                        </>
                      )}
                    </button>
                  </div>
                  <p className="setting-description text-sm text-muted-foreground mt-3 sm:mt-4 leading-relaxed">
                    Permanently delete the course and all its content. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        {id && (
          <div className="course-comments-section mt-8">
            <CommentSection courseId={id} isTeacher={true} />
          </div>
        )}
      </div>
    </div>
  );
};
