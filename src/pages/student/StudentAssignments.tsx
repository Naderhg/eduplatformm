import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { assignmentsApi } from '../../api/assignments.api';
import { Loader } from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { StudentShellWrapper } from './StudentShellWrapper';
import { RefreshCw, FileText, Clock, CheckCircle, AlertCircle, Award, Play, Calendar } from 'lucide-react';
import './StudentAssignments.css';

type FilterType = 'all' | 'pending' | 'submitted' | 'graded';

export const StudentAssignments: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const fetchAssignments = useCallback(async (showRefreshLoading = false) => {
    if (!user?.id) return;
    try {
      if (showRefreshLoading) setRefreshing(true);
      else setLoading(true);
      const response = await assignmentsApi.getStudentAssignments();
      setAssignments(response || []);
    } catch (error: any) {
      console.error('Failed to fetch assignments:', error);
      toast.error('فشل تحميل الواجبات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // Auto-refresh for assignments awaiting grade
  useEffect(() => {
    const awaitingGradeCount = assignments.filter(a => {
      const hasSubmission = a.submissions && a.submissions.length > 0;
      const isGraded = hasSubmission && a.submissions.some((s: any) => s.score !== undefined && s.score !== null);
      return hasSubmission && !isGraded;
    }).length;

    if (awaitingGradeCount > 0) {
      const interval = setInterval(() => fetchAssignments(false), 30000);
      return () => clearInterval(interval);
    }
  }, [assignments, user?.id, fetchAssignments]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const pendingCount = assignments.filter(a => !(a.submissions && a.submissions.length > 0)).length;
  const submittedCount = assignments.filter(a => a.submissions && a.submissions.length > 0).length;
  const gradedCount = assignments.filter(a => a.submissions && a.submissions.some((s: any) => s.score !== undefined && s.score !== null)).length;

  const getFilteredAssignments = () => {
    switch (activeFilter) {
      case 'pending': return assignments.filter(a => !(a.submissions && a.submissions.length > 0));
      case 'submitted': return assignments.filter(a => a.submissions && a.submissions.length > 0);
      case 'graded': return assignments.filter(a => a.submissions && a.submissions.some((s: any) => s.score !== undefined && s.score !== null));
      default: return assignments;
    }
  };

  if (loading) {
    return (
      <StudentShellWrapper>
        <Loader fullScreen text="جاري التحميل..." />
      </StudentShellWrapper>
    );
  }

  const filteredAssignments = getFilteredAssignments();

  const tabs: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'الكل', count: assignments.length },
    { key: 'pending', label: 'بانتظار التسليم', count: pendingCount },
    { key: 'submitted', label: 'تم التسليم', count: submittedCount },
    { key: 'graded', label: 'تم التصحيح', count: gradedCount },
  ];

  return (
    <StudentShellWrapper>
      <div className="student-assignments" dir="rtl">
        <div className="page-header">
          <div>
            <h1 className="page-title">الواجبات</h1>
            <p className="page-subtitle">استعرض واجباتك وسلّم إجاباتك</p>
          </div>
          <button onClick={() => fetchAssignments(true)} disabled={refreshing} className="btn btn-ghost refresh-btn" title="تحديث">
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'جاري التحديث...' : 'تحديث'}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${activeFilter === tab.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Assignments List */}
        {filteredAssignments.length > 0 ? (
          <div className="assignments-list">
            {filteredAssignments.map((assignment) => {
              const dueDate = new Date(assignment.dueDate);
              const isOverdue = dueDate < new Date();
              const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const hasSubmission = assignment.submissions && assignment.submissions.length > 0;
              const isGraded = hasSubmission && assignment.submissions.some((s: any) => s.score !== undefined && s.score !== null);
              const submission = hasSubmission ? assignment.submissions[0] : null;
              const recentlyGraded = isGraded && submission?.gradedAt &&
                (Date.now() - new Date(submission.gradedAt).getTime()) < 5 * 60 * 1000;
              const status = isGraded ? 'graded' : hasSubmission ? 'submitted' : isOverdue ? 'overdue' : 'pending';

              return (
                <div key={assignment._id} className="assignment-card card">
                  <div className="assignment-status-indicator" data-status={status}></div>
                  <div className="assignment-content">
                    <div className="assignment-header">
                      <div className="title-section">
                        <h3 className="assignment-title">{assignment.title}</h3>
                        {recentlyGraded && <span className="newly-graded-badge">🎉 تم التصحيح حديثاً!</span>}
                      </div>
                      <span className={`status-badge status-${status}`}>
                        {isGraded ? 'تم التصحيح' : hasSubmission ? 'تم التسليم' : isOverdue ? 'متأخر' : 'بانتظار التسليم'}
                      </span>
                    </div>
                    <p className="assignment-course">{assignment.course?.title || 'كورس'}</p>
                    <div className="assignment-meta">
                      <span className="meta-item">
                        <Calendar className="size-4" />
                        التسليم: {dueDate.toLocaleDateString('ar')}
                      </span>
                      {!hasSubmission && !isGraded && !isOverdue && (
                        <span className={`meta-item ${daysLeft <= 3 ? 'urgent' : ''}`}>
                          <Clock className="size-4" />
                          {daysLeft > 0 ? `${daysLeft} يوم متبقي` : 'متأخر'}
                        </span>
                      )}
                      {isGraded && submission && (
                        <span className="meta-item score">
                          <Award className="size-4" />
                          الدرجة: {submission.score || 0}/{assignment.maxScore}
                        </span>
                      )}
                      {hasSubmission && !isGraded && (
                        <span className="meta-item">
                          <CheckCircle className="size-4" />
                          بانتظار التصحيح
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="assignment-actions">
                    {!hasSubmission && !isGraded && (
                      <Link to={`/student/assignments/${assignment._id}`} className="btn btn-primary">
                        <Play className="ml-1 size-4" /> ابدأ
                      </Link>
                    )}
                    {hasSubmission && !isGraded && (
                      <button className="btn btn-secondary" disabled>
                        <Clock className="ml-1 size-4" /> بانتظار التصحيح
                      </button>
                    )}
                    {isGraded && (
                      <Link to={`/student/assignments/${assignment._id}/results`} className="btn btn-secondary">
                        <FileText className="ml-1 size-4" /> عرض النتيجة
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <FileText className="size-16 text-muted-foreground" />
            <h3 className="text-lg font-bold">لا توجد واجبات</h3>
            <p className="text-sm text-muted-foreground">
              {activeFilter === 'all' ? 'لا توجد واجبات مخصصة لك حالياً' : 'لا توجد واجبات في هذا التصنيف'}
            </p>
          </div>
        )}
      </div>
    </StudentShellWrapper>
  );
};
