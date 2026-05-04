import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { assignmentsApi, Assignment } from '../../api/assignments.api';
import { Loader } from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { Plus, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import './TeacherAssignments.css';

// Extended interface for teacher view with submissions
interface TeacherAssignment extends Assignment {
  submissions?: any[];
  course?: {
    title: string;
  };
}

export const TeacherAssignments: React.FC = () => {
  const { t } = useLanguage();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    pendingSubmissions: 0,
    gradedSubmissions: 0
  });

  const handlePublishToggle = async (assignmentId: string, currentStatus: string) => {
    try {
      setPublishing(assignmentId);
      
      if (currentStatus === 'published') {
        // Unpublish (set to draft)
        await assignmentsApi.update(assignmentId, { status: 'draft' });
        toast.success(t('teacher.assignments.assignmentPublished'));
      } else {
        // Publish
        await assignmentsApi.publishAssignment(assignmentId);
        toast.success(t('teacher.assignments.assignmentPublishedSuccess'));
      }
      
      // Refresh assignments list
      fetchAssignments();
    } catch (error: any) {
      console.error('Failed to toggle assignment status:', error);
      toast.error(error.response?.data?.message || t('teacher.assignments.updateFailed'));
    } finally {
      setPublishing(null);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // Fetch all assignments created by this teacher
      const response = await assignmentsApi.getTeacherAssignments() as TeacherAssignment[];
      console.log('Teacher assignments:', response);
      
      // Calculate stats
      const totalAssignments = response.length;
      let pendingSubmissions = 0;
      let gradedSubmissions = 0;
      
      response.forEach((assignment: TeacherAssignment) => {
        if (assignment.submissions) {
          assignment.submissions.forEach((submission: any) => {
            if (submission.score !== undefined && submission.score !== null) {
              gradedSubmissions++;
            } else {
              pendingSubmissions++;
            }
          });
        }
      });

      setStats({
        totalAssignments,
        pendingSubmissions,
        gradedSubmissions
      });
      
      setAssignments(response);
    } catch (error: any) {
      console.error('Failed to fetch assignments:', error);
      const errorMessage = error.response?.data?.message || t('teacher.assignments.loadFailed');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) {
    return <Loader fullScreen text={t('common.loading')} />;
  }

  return (
    <div className="teacher-assignments">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('teacher.assignments.title')}</h1>
          <p className="page-subtitle">{t('teacher.assignments.description')}</p>
        </div>
        <Link to="/teacher/assignments/create" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          {t('teacher.assignments.createAssignment')}
        </Link>
      </div>

      {/* Stats */}
      <div className="assignment-stats">
        <div className="stat-card">
          <div className="stat-icon stat-icon-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 2 14 20 10" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalAssignments}</span>
            <span className="stat-label">{t('teacher.assignments.totalAssignments')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.pendingSubmissions}</span>
            <span className="stat-label">{t('teacher.assignments.pendingReview')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.gradedSubmissions}</span>
            <span className="stat-label">{t('commonggraded')}</span>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <section className="assignments-section">
        <div className="section-header">
          <h2 className="section-title">{t('teacher.assignments.allAssignments')}</h2>
          <span className="badge">{assignments.length} {t('teacher.assignments.assignments')}</span>
        </div>

        <div className="assignments-list">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="assignment-card card card-hover">
              <div className="assignment-content">
                <div className="assignment-header">
                  <h3 className="assignment-title">{assignment.title}</h3>
                  <div className="assignment-badges">
                    <span className={`badge ${assignment.submissions?.length > 0 ? 'badge-info' : 'badge-secondary'}`}>
                      {assignment.submissions?.length || 0} {t('teacher.assignments.submissions')}
                    </span>
                    <span className={`badge ${assignment.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                      {assignment.status === 'published' ? t('common.published') : t('common.draft')}
                    </span>
                  </div>
                </div>
                <p className="assignment-course">{assignment.course?.title || 'No course'}</p>
                <div className="assignment-meta">
                  <span className="assignment-due">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {t('common.due')}: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                  <span className="assignment-score">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 12 12 6" />
                    </svg>
                    {assignment.maxScore} {t('teacher.assignments.points')}
                  </span>
                </div>
                <div className="assignment-description">
                  {assignment.description?.length > 100 
                    ? `${assignment.description.substring(0, 100)}...`
                    : assignment.description || 'No description'
                  }
                </div>
              </div>
              <div className="assignment-actions">
                <button
                  onClick={() => handlePublishToggle(assignment.id, assignment.status || 'draft')}
                  disabled={publishing === assignment.id}
                  className={`btn ${assignment.status === 'published' ? 'btn-warning' : 'btn-success'}`}
                >
                  {publishing === assignment.id ? (
                    t('common.loading')
                  ) : assignment.status === 'published' ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      {t('teacher.assignments.setToDraft')}
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      {t('teacher.assignments.publish')}
                    </>
                  )}
                </button>
                <Link to={`/teacher/assignments/${assignment.id}/submissions`} className="btn btn-primary">
                  {t('teacher.assignments.viewSubmissions')}
                </Link>
                <Link to={`/teacher/assignments/${assignment.id}/edit`} className="btn btn-secondary">
                  <Edit className="w-4 h-4 mr-2" />
                  {t('common.edit')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
