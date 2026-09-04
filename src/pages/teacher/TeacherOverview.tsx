import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DashboardShell, PageHeader, StatCard } from '../../components/dashboard/DashboardShell';
import { teacherNav, teacherComingSoon } from '../../lib/dashboard-data';
import { useAuth } from '../../hooks/useAuth';
import { coursesApi, Course } from '../../api/courses.api';
import { assignmentsApi } from '../../api/assignments.api';
import { lessonsApi, Lesson } from '../../api/lessons.api';
import { Loader } from '../../components/common/Loader';
import { BookOpen, Users, FileText, ClipboardList, Video, HelpCircle, Plus, MessageCircle } from 'lucide-react';

export const TeacherOverview: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [studentsCount, setStudentsCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [coursesRes, assignmentsRes] = await Promise.all([
        coursesApi.getByTeacher(user.id),
        assignmentsApi.getTeacherAssignments().catch(() => []),
      ]);
      const courseList = coursesRes.data || [];
      setCourses(courseList);
      setAssignments(assignmentsRes || []);

      // Fetch lessons for all courses
      const lessonsPromises = courseList.map(c => lessonsApi.getAll(c._id).then(r => r.data || []).catch(() => []));
      const lessonsResults = await Promise.all(lessonsPromises);
      const flatLessons = lessonsResults.flat();
      setAllLessons(flatLessons);

      // Count unique students
      const totalStudents = courseList.reduce((sum, c: any) => sum + (c.studentsCount || 0), 0);
      setStudentsCount(totalStudents);
    } catch (e) { console.error('Overview fetch error:', e); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <DashboardShell roleLabel="مدرس" nav={teacherNav} comingSoon={teacherComingSoon}>
        <Loader fullScreen text="جاري التحميل..." />
      </DashboardShell>
    );
  }

  const publishedCourses = courses.filter((c: any) => c.status === 'published').length;
  const publishedLessons = allLessons.filter(l => l.isPublished).length;
  const pendingSubmissions = assignments.reduce((sum, a: any) => {
    const subs = a.submissions || [];
    const ungraded = subs.filter((s: any) => s.score === undefined || s.score === null).length;
    return sum + ungraded;
  }, 0);

  // Recent lessons (last 5)
  const recentLessons = [...allLessons]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Assignments needing attention
  const assignmentsNeedingAttention = assignments
    .filter((a: any) => {
      const subs = a.submissions || [];
      const ungraded = subs.filter((s: any) => s.score === undefined || s.score === null).length;
      return ungraded > 0;
    })
    .slice(0, 4);

  return (
    <DashboardShell roleLabel="مدرس" nav={teacherNav} comingSoon={teacherComingSoon}>
      <PageHeader
        title="نظرة عامة"
        description="ملخص فصولك ونشاط الطلاب"
        action={
          <Link to="/teacher/courses/new" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            <Plus className="ml-1 inline size-4" /> كورس جديد
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="الكورسات" value={courses.length} hint={`${publishedCourses} منشور`} />
        <StatCard label="الطلاب" value={studentsCount} />
        <StatCard label="الدروس" value={allLessons.length} hint={`${publishedLessons} منشور`} />
        <StatCard label="واجبات بانتظار التصحيح" value={pendingSubmissions} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent lessons */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">أحدث الدروس</h2>
            <Link to="/teacher/lessons" className="text-sm font-bold text-primary">كل الدروس ←</Link>
          </div>
          {recentLessons.length > 0 ? (
            <div className="space-y-3">
              {recentLessons.map((l) => {
                const course = courses.find((c: any) => c._id === l.course);
                return (
                  <Link key={l._id} to={`/teacher/courses/${l.course}/manage`}
                    className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-sm transition-colors hover:bg-accent">
                    <div className="flex items-center gap-2 min-w-0">
                      {l.videoUrl ? <Video className="size-4 flex-shrink-0 text-primary" /> : <BookOpen className="size-4 flex-shrink-0 text-primary" />}
                      <span className="truncate font-bold">{l.title}</span>
                    </div>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${l.isPublished ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {l.isPublished ? 'منشور' : 'مسودة'}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="mb-3 size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">لا توجد دروس بعد</p>
              <Link to="/teacher/lessons" className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">أضف أول درس</Link>
            </div>
          )}
        </section>

        {/* Assignments needing attention */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">واجبات تحتاج متابعة</h2>
            <Link to="/teacher/assignments" className="text-sm font-bold text-primary">كل الواجبات ←</Link>
          </div>
          {assignmentsNeedingAttention.length > 0 ? (
            <div className="space-y-3">
              {assignmentsNeedingAttention.map((a: any) => {
                const subs = a.submissions || [];
                const ungraded = subs.filter((s: any) => s.score === undefined || s.score === null).length;
                const graded = subs.length - ungraded;
                return (
                  <Link key={a._id} to={`/teacher/assignments/${a._id}/submissions`}
                    className="block rounded-xl bg-muted/60 px-3 py-2 text-sm transition-colors hover:bg-accent">
                    <div className="flex justify-between font-bold">
                      <span className="truncate">{a.title}</span>
                      <span className="flex-shrink-0 text-primary">{graded}/{subs.length} مُصحح</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{a.course?.title || 'كورس'} · {ungraded} بانتظار التصحيح</p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ClipboardList className="mb-3 size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">لا توجد واجبات تحتاج متابعة</p>
            </div>
          )}
        </section>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/teacher/courses" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><BookOpen className="size-6" /></div>
          <div><p className="font-bold">الكورسات</p><p className="text-xs text-muted-foreground">{courses.length} كورس</p></div>
        </Link>
        <Link to="/teacher/lessons" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Video className="size-6" /></div>
          <div><p className="font-bold">الدروس</p><p className="text-xs text-muted-foreground">{allLessons.length} درس</p></div>
        </Link>
        <Link to="/teacher/assignments" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><FileText className="size-6" /></div>
          <div><p className="font-bold">الواجبات</p><p className="text-xs text-muted-foreground">{assignments.length} واجب</p></div>
        </Link>
        <Link to="/teacher/chat" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><MessageCircle className="size-6" /></div>
          <div><p className="font-bold">المحادثات</p><p className="text-xs text-muted-foreground">تواصل مع الطلاب</p></div>
        </Link>
      </div>
    </DashboardShell>
  );
};
