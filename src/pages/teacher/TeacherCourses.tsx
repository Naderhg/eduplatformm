import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { useFetch } from '../../hooks/useFetch';
import { coursesApi, Course } from '../../api/courses.api';
import { Loader } from '../../components/common/Loader';
import { VideoPlayer } from '../../components/ui/VideoPlayer';
import { Play, FileText, Video, Settings, Users, BookOpen, Clock, Plus, Copy, Hash } from 'lucide-react';
import { DashboardShell, PageHeader, StatCard } from '../../components/dashboard/DashboardShell';
import { teacherNav, teacherComingSoon } from '../../lib/dashboard-data';
import { toast } from 'react-toastify';

const getMediaUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/') || url.startsWith('/api/files/')) {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://deev--edu-platform--fnj72wsf9xl6.code.run/api';
    const backendBaseUrl = apiBaseUrl.replace('/api', '');
    return `${backendBaseUrl}${url}`;
  }
  return url;
};

export const TeacherCourses: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  const [filter, setFilter] = useState('all');

  const fetchCourses = useCallback(() => {
    if (!user?.id) return Promise.resolve({ data: [], success: true, count: 0, pagination: {} });
    return coursesApi.getByTeacher(user.id)
      .then(response => response)
      .catch(error => {
        console.error('Failed to fetch courses:', error);
        toast.error(t('teacher.courses.courseCreated'));
        return { data: [], success: false, count: 0, pagination: {} };
      });
  }, [user?.id]);

  const { data: response = { data: [], success: true, count: 0, pagination: {} }, isLoading, error, refetch } = useFetch(fetchCourses, {
    immediate: true,
    initialData: { data: [], success: true, count: 0, pagination: {} }
  });

  const courses = response.data || [];
  const safeCourses = Array.isArray(courses) ? courses : [];

  useEffect(() => {
    refetch();
  }, [refetch]);

  const stats = {
    total: safeCourses.length,
    published: safeCourses.filter((c: Course) => c.status === 'published').length,
    draft: safeCourses.filter((c: Course) => c.status === 'draft').length,
    students: safeCourses.reduce((acc: number, c: Course) => acc + (c.studentsCount || 0), 0),
  };

  const filtered = filter === 'all'
    ? safeCourses
    : safeCourses.filter((c: Course) => c.status === filter);

  if (isLoading) {
    return (
      <DashboardShell roleLabel="مدرس" nav={teacherNav} comingSoon={teacherComingSoon}>
        <Loader fullScreen text={t('common.loading')} />
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell roleLabel="مدرس" nav={teacherNav} comingSoon={teacherComingSoon}>
        <PageHeader title={t('teacher.courses.title')} description={t('teacher.courses.description')} />
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <p className="text-muted-foreground">{error.message}</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            {t('common.retry')}
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell roleLabel="مدرس" nav={teacherNav} comingSoon={teacherComingSoon}>
      <PageHeader
        title={t('teacher.courses.title')}
        description={t('teacher.courses.description')}
        action={
          <Link to="/teacher/courses/new" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            <Plus className="size-4" /> {t('teacher.courses.createCourse')}
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('teacher.dashboard.totalCourses')} value={stats.total} />
        <StatCard label={t('common.published')} value={stats.published} />
        <StatCard label={t('common.draft')} value={stats.draft} />
        <StatCard label={t('teacher.dashboard.totalStudents')} value={stats.students} />
      </div>

      {/* Filter tabs */}
      <div className="mb-6 mt-6 flex flex-wrap gap-2">
        {[
          { key: 'all', label: `${t('common.all')} (${stats.total})` },
          { key: 'published', label: `${t('common.published')} (${stats.published})` },
          { key: 'draft', label: `${t('common.draft')} (${stats.draft})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Courses list */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((course) => (
            <div
              key={course._id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-card sm:flex-row sm:items-center"
            >
              {/* Thumbnail */}
              <div className="flex-shrink-0 overflow-hidden rounded-xl">
                {course.videoUrl ? (
                  <div
                    className="relative flex size-32 cursor-pointer items-center justify-center bg-muted"
                    onClick={() => setSelectedVideo({ url: getMediaUrl(course.videoUrl), title: course.title })}
                  >
                    {course.thumbnail ? (
                      <img src={getMediaUrl(course.thumbnail)} alt={course.title} className="size-full object-cover" />
                    ) : (
                      <Video className="size-8 text-muted-foreground" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="size-8 text-white" />
                    </div>
                  </div>
                ) : course.thumbnail ? (
                  <img src={getMediaUrl(course.thumbnail)} alt={course.title} className="size-32 object-cover" />
                ) : (
                  <div className="flex size-32 items-center justify-center bg-muted">
                    <FileText className="size-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold leading-6">{course.title}</h3>
                  <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                    course.status === 'published' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                    {course.status}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
                {/* Course ID - pinned/visible for sharing with students */}
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1" dir="ltr">
                  <Hash className="size-3 text-primary" />
                  <span className="text-xs font-bold text-primary">ID: {course._id}</span>
                  <button
                    onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(course._id); toast.success('تم نسخ ID الكورس'); }}
                    className="ml-1 rounded p-0.5 text-primary hover:bg-primary/10 transition-colors"
                    title="نسخ الـ ID"
                  >
                    <Copy className="size-3" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-4" /> {course.studentsCount} {t('teacher.students.title')}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="size-4" /> {course.lessonsCount} {t('common.lessons')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-4" /> {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-shrink-0 gap-2">
                <Link
                  to={`/teacher/courses/${course._id}/manage`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold transition-colors hover:bg-muted"
                >
                  <Settings className="size-4" /> {t('common.manage')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <BookOpen className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold">{t('teacher.courses.noCourses')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t('teacher.courses.createNewCourse')}</p>
          <Link to="/teacher/courses/new" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
            <Plus className="size-4" /> {t('teacher.courses.createCourse')}
          </Link>
        </div>
      )}

      {/* Video Player Modal */}
      <VideoPlayer
        videoUrl={selectedVideo?.url || ''}
        title={selectedVideo?.title || ''}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </DashboardShell>
  );
};
