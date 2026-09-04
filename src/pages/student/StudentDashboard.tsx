import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { coursesApi, Course } from '../../api/courses.api';
import { assignmentsApi } from '../../api/assignments.api';
import { lessonsApi } from '../../api/lessons.api';
import { Loader } from '../../components/common/Loader';
import { DashboardShell, PageHeader, StatCard } from '../../components/dashboard/DashboardShell';
import { studentNav, studentComingSoon } from '../../lib/dashboard-data';
import { BookOpen, Clock, TrendingUp, Award, Play, FileText, Calendar, CheckCircle, AlertCircle, Video } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courseLessons, setCourseLessons] = useState<Record<string, any[]>>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [enrolledCourses, studentAssignments] = await Promise.all([
        coursesApi.getEnrolled(),
        assignmentsApi.getStudentAssignments().catch(() => []),
      ]);
      setCourses(enrolledCourses || []);
      setAssignments(studentAssignments || []);

      // Fetch lessons for each enrolled course
      if (enrolledCourses && enrolledCourses.length > 0) {
        const lessonsPromises = enrolledCourses.map(c =>
          lessonsApi.getAll(c._id).then(r => ({ courseId: c._id, lessons: r.data || [] })).catch(() => ({ courseId: c._id, lessons: [] }))
        );
        const lessonsResults = await Promise.all(lessonsPromises);
        const lessonsMap: Record<string, any[]> = {};
        lessonsResults.forEach(r => { lessonsMap[r.courseId] = r.lessons; });
        setCourseLessons(lessonsMap);
      }
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <DashboardShell roleLabel="طالب" nav={studentNav} comingSoon={studentComingSoon}>
        <Loader fullScreen text="جاري التحميل..." />
      </DashboardShell>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'طالب';
  const enrolledCount = courses.length;

  // Calculate real stats
  const allLessons = Object.values(courseLessons).flat();
  const totalLessons = allLessons.length;

  // Pending assignments (not submitted and not overdue)
  const pendingAssignments = assignments.filter(a => {
    const hasSubmission = a.submissions && a.submissions.length > 0;
    return !hasSubmission;
  });

  // Graded assignments
  const gradedAssignments = assignments.filter(a => {
    return a.submissions && a.submissions.some((s: any) => s.score !== undefined && s.score !== null);
  });

  // Calculate average score
  let avgScore = 0;
  if (gradedAssignments.length > 0) {
    const totalPercentage = gradedAssignments.reduce((sum, a) => {
      const sub = a.submissions.find((s: any) => s.score !== undefined && s.score !== null);
      if (sub && a.maxScore > 0) {
        return sum + (sub.score / a.maxScore) * 100;
      }
      return sum;
    }, 0);
    avgScore = Math.round(totalPercentage / gradedAssignments.length);
  }

  // Upcoming assignments (pending, sorted by due date)
  const upcomingAssignments = pendingAssignments
    .filter(a => new Date(a.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  return (
    <DashboardShell roleLabel="طالب" nav={studentNav} comingSoon={studentComingSoon}>
      <PageHeader title={`أهلاً ${firstName} 👋`} description="ملخص يومك الدراسي" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="الكورسات المسجلة" value={enrolledCount} />
        <StatCard label="إجمالي الدروس" value={totalLessons} />
        <StatCard label="واجبات متبقية" value={pendingAssignments.length} hint={upcomingAssignments.length > 0 ? 'أقربها قريباً' : undefined} />
        <StatCard label="المعدل العام" value={avgScore > 0 ? `${avgScore}%` : '-'} hint={gradedAssignments.length > 0 ? `من ${gradedAssignments.length} واجب مُصحح` : undefined} />
      </div>

      {/* Continue Learning + Upcoming Assignments */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Continue Learning */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">متابعة التعلم</h2>
            <Link to="/student/courses" className="text-sm font-bold text-primary">عرض الكل</Link>
          </div>
          {courses.length > 0 ? (
            <div className="space-y-3">
              {courses.slice(0, 4).map((course) => {
                const lessons = courseLessons[course._id] || [];
                const publishedLessons = lessons.filter(l => l.isPublished).length;
                const progress = lessons.length > 0 ? Math.round((publishedLessons / lessons.length) * 100) : 0;
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
                        <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">{publishedLessons} من {lessons.length} درس</p>
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
          {upcomingAssignments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAssignments.map((a) => {
                const dueDate = new Date(a.dueDate);
                const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <Link key={a._id} to={`/student/assignments/${a._id}`}
                    className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-3 transition-colors hover:bg-accent">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{a.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.course?.title || 'كورس'}</p>
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${daysLeft <= 3 ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                        {daysLeft > 0 ? `${daysLeft} يوم` : 'متأخر'}
                      </span>
                      <span className="text-xs text-muted-foreground">{dueDate.toLocaleDateString('ar')}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="mb-3 size-12 text-success" />
              <p className="text-sm font-bold">لا توجد واجبات قادمة</p>
              <p className="mt-1 text-xs text-muted-foreground">أنجزت كل واجباتك الحالية</p>
            </div>
          )}
        </section>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle className="size-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{gradedAssignments.length}</p>
            <p className="text-xs text-muted-foreground">واجبات مُصححة</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex size-12 items-center justify-center rounded-full bg-warning/10 text-warning">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{pendingAssignments.length}</p>
            <p className="text-xs text-muted-foreground">واجبات بانتظار التسليم</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Video className="size-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalLessons}</p>
            <p className="text-xs text-muted-foreground">درس متاح</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};
