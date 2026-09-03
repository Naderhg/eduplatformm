import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { assignmentsApi, Assignment } from '../../api/assignments.api';
import { Loader } from '../../components/common/Loader';
import { DashboardShell, PageHeader, StatCard } from '../../components/dashboard/DashboardShell';
import { teacherNav, teacherComingSoon } from '../../lib/dashboard-data';
import { toast } from 'react-toastify';
import { Plus, Eye, EyeOff, Edit, FileText, Clock, Award, Users } from 'lucide-react';

interface TeacherAssignment extends Assignment {
  submissions?: any[];
  course?: { title: string };
}

export const TeacherAssignments: React.FC = () => {
  const { t } = useLanguage();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    pendingSubmissions: 0,
    gradedSubmissions: 0,
  });

  const handlePublishToggle = async (assignmentId: string, currentStatus: string) => {
    try {
      setPublishing(assignmentId);
      if (currentStatus === 'published') {
        await assignmentsApi.update(assignmentId, { status: 'draft' });
        toast.success(t('teacher.assignments.assignmentPublished'));
      } else {
        await assignmentsApi.publishAssignment(assignmentId);
        toast.success(t('teacher.assignments.assignmentPublishedSuccess'));
      }
      fetchAssignments();
    } catch (error: any) {
      console.error('Failed to toggle assignment status:', error);
      toast.error(error.response?.data?.message || t('teacher.assignments.updateFailed'));
    } finally {
      setPublishing(null);
    }
  };

  const handleCertificateToggle = async (assignmentId: string, currentEnabled: boolean) => {
    try {
      await assignmentsApi.update(assignmentId, { certificateEnabled: !currentEnabled });
      toast.success(!currentEnabled ? 'تم تفعيل الشهادة بنجاح!' : 'تم إلغاء تفعيل الشهادة');
      fetchAssignments();
    } catch (error: any) {
      console.error('Failed to toggle certificate status:', error);
      toast.error(error.response?.data?.message || 'Failed to update certificate settings');
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = (await assignmentsApi.getTeacherAssignments()) as TeacherAssignment[];
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
      setStats({ totalAssignments, pendingSubmissions, gradedSubmissions });
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
    return (
      <DashboardShell roleLabel="مدرس" nav={teacherNav} comingSoon={teacherComingSoon}>
        <Loader fullScreen text={t('common.loading')} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell roleLabel="مدرس" nav={teacherNav} comingSoon={teacherComingSoon}>
      <PageHeader
        title={t('teacher.assignments.title')}
        description={t('teacher.assignments.description')}
        action={
          <Link to="/teacher/assignments/create" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            <Plus className="size-4" /> {t('teacher.assignments.createAssignment')}
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t('teacher.assignments.totalAssignments')} value={stats.totalAssignments} />
        <StatCard label={t('teacher.assignments.pendingReview')} value={stats.pendingSubmissions} />
        <StatCard label={t('common.graded')} value={stats.gradedSubmissions} />
      </div>

      {/* Assignments list */}
      {assignments.length > 0 ? (
        <div className="mt-6 space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-card"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Left: info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold">{assignment.title}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      assignment.status === 'published' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>
                      {assignment.status === 'published' ? t('common.published') : t('common.draft')}
                    </span>
                    {assignment.certificateEnabled && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-soft-yellow px-3 py-1 text-xs font-bold text-warm-foreground">
                        <Award className="size-3" /> شهادة
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">{assignment.course?.title || 'بدون كورس'}</p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="size-4" /> {assignment.submissions?.length || 0} {t('teacher.assignments.submissions')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-4" /> {t('common.due')}: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="size-4" /> {assignment.maxScore} {t('teacher.assignments.points')}
                    </span>
                  </div>

                  {assignment.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {assignment.description.length > 100
                        ? `${assignment.description.substring(0, 100)}...`
                        : assignment.description}
                    </p>
                  )}
                </div>

                {/* Right: actions */}
                <div className="flex flex-shrink-0 flex-wrap gap-2">
                  <button
                    onClick={() => handlePublishToggle(assignment.id, assignment.status || 'draft')}
                    disabled={publishing === assignment.id}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-opacity disabled:opacity-60 ${
                      assignment.status === 'published'
                        ? 'bg-warning/10 text-warning hover:opacity-80'
                        : 'bg-success/10 text-success hover:opacity-80'
                    }`}
                  >
                    {publishing === assignment.id ? (
                      t('common.loading')
                    ) : assignment.status === 'published' ? (
                      <><EyeOff className="size-4" /> {t('teacher.assignments.setToDraft')}</>
                    ) : (
                      <><Eye className="size-4" /> {t('teacher.assignments.publish')}</>
                    )}
                  </button>

                  <Link
                    to={`/teacher/assignments/${assignment.id}/submissions`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
                  >
                    {t('teacher.assignments.viewSubmissions')}
                  </Link>

                  <Link
                    to={`/teacher/assignments/${assignment.id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold transition-colors hover:bg-muted"
                  >
                    <Edit className="size-4" /> {t('common.edit')}
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleCertificateToggle(assignment.id, assignment.certificateEnabled || false)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                      assignment.certificateEnabled
                        ? 'border-warm bg-soft-yellow text-warm-foreground'
                        : 'border-border bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    <Award className="size-4" /> {assignment.certificateEnabled ? 'إلغاء الشهادة' : 'تفعيل الشهادة'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <FileText className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold">لا توجد واجبات</h3>
          <p className="mt-1 text-sm text-muted-foreground">أنشئ أول واجب لطلابك</p>
          <Link to="/teacher/assignments/create" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
            <Plus className="size-4" /> {t('teacher.assignments.createAssignment')}
          </Link>
        </div>
      )}
    </DashboardShell>
  );
};
