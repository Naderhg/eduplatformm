import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { coursesApi, Course } from '../../api/courses.api';
import { Loader } from '../../components/common/Loader';
import { DashboardShell, PageHeader, StatCard } from '../../components/dashboard/DashboardShell';
import { studentNav, studentComingSoon } from '../../lib/dashboard-data';
import { BookOpen, Clock, TrendingUp, Award, Play, Calendar, FileText } from 'lucide-react';

const upcomingAssignments = [
  { id: '1', title: 'Build a Simple HTML Page', courseName: 'Introduction to Web Development', dueDate: '2026-09-01T23:59:00Z', status: 'pending' },
  { id: '2', title: 'Style Your Portfolio', courseName: 'Introduction to Web Development', dueDate: '2026-09-15T23:59:00Z', status: 'pending' },
];

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  const fetchCourses = useCallback(() => coursesApi.getEnrolled(), []);
  const { data: courses, isLoading } = useFetch<Course[]>(fetchCourses);

  if (isLoading) {
    return (
      <DashboardShell roleLabel="طالب" nav={studentNav} comingSoon={studentComingSoon}>
        <Loader fullScreen text="جاري التحميل..." />
      </DashboardShell>
    );
  }

  const enrolledCount = courses?.length || 0;
  const firstName = user?.name?.split(' ')[0] || 'طالب';

  return (
    <DashboardShell roleLabel="طالب" nav={studentNav} comingSoon={studentComingSoon}>
      <PageHeader title={`أهلاً ${firstName} 👋`} description="ملخص يومك الدراسي" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="الكورسات المسجلة" value={enrolledCount} />
        <StatCard label="الدروس المكتملة" value="12" hint="من 28" />
        <StatCard label="واجبات متبقية" value={upcomingAssignments.length} hint="أقربها قريباً" />
        <StatCard label="المعدل العام" value="88%" hint="+3% عن الشهر الماضي" />
      </div>

      {/* Continue Learning + Upcoming Assignments */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Continue Learning */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">متابعة التعلم</h2>
          {courses && courses.length > 0 ? (
            <div className="space-y-3">
              {courses.slice(0, 3).map((course) => {
                const progress = Math.floor(Math.random() * 60) + 20;
                return (
                  <Link key={course._id} to={`/student/courses/${course._id}`}
                    className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-3 transition-colors hover:bg-accent">
                    <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BookOpen className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{course.title}</p>
                      <p className="truncate text-xs text-muted-foreground">بقلم {course.teacher?.name || 'مدرس'}</p>
                      <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <Play className="size-5 flex-shrink-0 text-primary" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
                <BookOpen className="size-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold">لا توجد كورسات مسجلة</p>
              <p className="mt-1 text-xs text-muted-foreground">تصفح الكورسات المتاحة وابدأ التعلم</p>
              <Link to="/student/courses" className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                تصفح الكورسات
              </Link>
            </div>
          )}
        </section>

        {/* Upcoming Assignments */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">الواجبات القادمة</h2>
            <Link to="/student/assignments" className="text-sm font-bold text-primary">عرض الكل</Link>
          </div>
          <div className="space-y-3">
            {upcomingAssignments.map((a) => {
              const dueDate = new Date(a.dueDate);
              const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <Link key={a.id} to={`/student/assignments/${a.id}`}
                  className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-3 transition-colors hover:bg-accent">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.courseName}</p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${daysLeft <= 3 ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                      {daysLeft > 0 ? `${daysLeft} يوم` : 'متأخر'}
                    </span>
                    <span className="text-xs text-muted-foreground">{dueDate.toLocaleDateString()}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* Recent Activity / Quick Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <TrendingUp className="size-8 text-success" />
          <div><p className="text-2xl font-bold">96%</p><p className="text-xs text-muted-foreground">نسبة الحضور</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Award className="size-8 text-warm-foreground" />
          <div><p className="text-2xl font-bold">2</p><p className="text-xs text-muted-foreground">شهادات مكتملة</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Clock className="size-8 text-primary" />
          <div><p className="text-2xl font-bold">24س</p><p className="text-xs text-muted-foreground">وقت الدراسة هذا الأسبوع</p></div>
        </div>
      </div>
    </DashboardShell>
  );
};
