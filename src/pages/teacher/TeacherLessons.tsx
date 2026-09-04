import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DashboardShell, PageHeader } from '../../components/dashboard/DashboardShell';
import { teacherNav, teacherComingSoon } from '../../lib/dashboard-data';
import { useAuth } from '../../hooks/useAuth';
import { coursesApi, Course } from '../../api/courses.api';
import { lessonsApi, Lesson } from '../../api/lessons.api';
import { Loader } from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { Video, BookOpen, FileText, HelpCircle, Plus, Edit, Eye, EyeOff, Clock } from 'lucide-react';

interface CourseLessons {
  course: Course;
  lessons: Lesson[];
}

export const TeacherLessons: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courseLessons, setCourseLessons] = useState<CourseLessons[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const coursesRes = await coursesApi.getByTeacher(user.id);
      const courseList = coursesRes.data || [];

      const lessonsPromises = courseList.map((c: Course) =>
        lessonsApi.getAll(c._id).then(r => ({ course: c, lessons: r.data || [] })).catch(() => ({ course: c, lessons: [] }))
      );
      const results = await Promise.all(lessonsPromises);
      setCourseLessons(results);
    } catch (e) {
      console.error('Lessons fetch error:', e);
      toast.error('فشل تحميل الدروس');
    } finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <DashboardShell roleLabel="مدرس" nav={teacherNav} comingSoon={teacherComingSoon}>
        <Loader fullScreen text="جاري التحميل..." />
      </DashboardShell>
    );
  }

  const allLessons = courseLessons.flatMap(cl => cl.lessons);
  const totalLessons = allLessons.length;
  const publishedCount = allLessons.filter(l => l.isPublished).length;
  const draftCount = totalLessons - publishedCount;

  const tabs: { key: 'all' | 'published' | 'draft'; label: string; count: number }[] = [
    { key: 'all', label: 'الكل', count: totalLessons },
    { key: 'published', label: 'منشور', count: publishedCount },
    { key: 'draft', label: 'مسودة', count: draftCount },
  ];

  return (
    <DashboardShell roleLabel="مدرس" nav={teacherNav} comingSoon={teacherComingSoon}>
      <PageHeader
        title="الدروس"
        description="استعرض وعدّل دروسك في كل الكورسات"
        action={
          <Link to="/teacher/courses" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            <Plus className="ml-1 inline size-4" /> إدارة الكورسات
          </Link>
        }
      />

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Course lessons */}
      {courseLessons.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
          <BookOpen className="mx-auto mb-4 size-16 text-muted-foreground" />
          <h3 className="text-lg font-bold">لا توجد كورسات بعد</h3>
          <p className="mt-1 text-sm text-muted-foreground">أنشئ كورس أولاً ثم أضف إليه الدروس</p>
          <Link to="/teacher/courses/new" className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            إنشاء كورس
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {courseLessons.map(({ course, lessons }) => {
            const filtered = filter === 'all' ? lessons : lessons.filter(l => filter === 'published' ? l.isPublished : !l.isPublished);
            if (filtered.length === 0) return null;
            return (
              <section key={course._id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-5 text-primary" />
                    <h2 className="text-base font-bold">{course.title}</h2>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{filtered.length} درس</span>
                  </div>
                  <Link to={`/teacher/courses/${course._id}/manage`} className="text-sm font-bold text-primary">
                    إدارة ←
                  </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {filtered.map((lesson, idx) => {
                    const hasVideo = !!lesson.videoUrl;
                    const hasFiles = lesson.files && lesson.files.length > 0;
                    const hasQuestions = lesson.questions && lesson.questions.length > 0;
                    return (
                      <article key={lesson._id} className="rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{idx + 1}</span>
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-bold">{lesson.title}</h3>
                              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{lesson.description || 'بدون وصف'}</p>
                            </div>
                          </div>
                          <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            lesson.isPublished ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                          }`}>
                            {lesson.isPublished ? 'منشور' : 'مسودة'}
                          </span>
                        </div>

                        {/* Lesson meta */}
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {hasVideo && <span className="flex items-center gap-1"><Video className="size-3.5" /> فيديو</span>}
                          {hasFiles && <span className="flex items-center gap-1"><FileText className="size-3.5" /> {lesson.files.length} ملف</span>}
                          {hasQuestions && <span className="flex items-center gap-1"><HelpCircle className="size-3.5" /> {lesson.questions.length} سؤال</span>}
                          <span className="flex items-center gap-1"><Clock className="size-3.5" /> {new Date(lesson.createdAt).toLocaleDateString('ar')}</span>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex gap-2">
                          <Link to={`/teacher/courses/${course._id}/manage`}
                            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold transition-colors hover:bg-muted">
                            <Edit className="size-3.5" /> تعديل
                          </Link>
                          {lesson.isPublished ? (
                            <span className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-success">
                              <Eye className="size-3.5" /> منشور
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground">
                              <EyeOff className="size-3.5" /> مخفي
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
};
