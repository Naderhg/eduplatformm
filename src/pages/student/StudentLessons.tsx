import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi, Course } from '../../api/courses.api';
import { lessonsApi, Lesson } from '../../api/lessons.api';
import { Loader } from '../../components/common/Loader';
import { StudentShellWrapper } from './StudentShellWrapper';
import { BookOpen, Video, FileText, HelpCircle, Play, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface CourseWithLessons {
  course: Course;
  lessons: Lesson[];
  loading: boolean;
  error?: string;
}

export const StudentLessons: React.FC = () => {
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesWithLessons, setCoursesWithLessons] = useState<CourseWithLessons[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const fetchLessonsForCourse = useCallback(async (course: Course) => {
    try {
      const res = await lessonsApi.getAll(course._id);
      const lessonsList = res.data || [];
      setCoursesWithLessons(prev => prev.map(cw =>
        cw.course._id === course._id
          ? { ...cw, lessons: lessonsList, loading: false }
          : cw
      ));
    } catch (e: any) {
      console.error('Failed to fetch lessons for course:', course._id, e);
      setCoursesWithLessons(prev => prev.map(cw =>
        cw.course._id === course._id
          ? { ...cw, loading: false, error: e.response?.data?.message || 'فشل تحميل الدروس' }
          : cw
      ));
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoadingCourses(true);
        const courses = await coursesApi.getEnrolled();
        // Initialize state with loading=true for each course
        const initial: CourseWithLessons[] = courses.map(c => ({ course: c, lessons: [], loading: true }));
        setCoursesWithLessons(initial);
        // Fetch lessons for each course in parallel
        await Promise.all(courses.map(c => fetchLessonsForCourse(c)));
      } catch (e) {
        console.error('Failed to fetch enrolled courses:', e);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadAll();
  }, [fetchLessonsForCourse]);

  // Count total lessons (all) and published lessons
  const totalLessons = coursesWithLessons.reduce((sum, cw) => sum + cw.lessons.length, 0);
  const publishedLessons = coursesWithLessons.reduce((sum, cw) => sum + cw.lessons.filter(l => l.isPublished === true).length, 0);

  const toggleCourse = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  if (loadingCourses) {
    return <StudentShellWrapper><Loader fullScreen text="جاري التحميل..." /></StudentShellWrapper>;
  }

  return (
    <StudentShellWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">الدروس</h1>
          <p className="text-sm text-muted-foreground">كل الدروس من كورساتك المسجلة</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><BookOpen className="size-6" /></div>
            <div><p className="text-2xl font-bold">{coursesWithLessons.length}</p><p className="text-xs text-muted-foreground">كورس مسجل</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Video className="size-6" /></div>
            <div><p className="text-2xl font-bold">{totalLessons}</p><p className="text-xs text-muted-foreground">إجمالي الدروس</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success"><Play className="size-6" /></div>
            <div><p className="text-2xl font-bold">{publishedLessons}</p><p className="text-xs text-muted-foreground">درس متاح</p></div>
          </div>
        </div>

        {/* Lessons by Course */}
        {coursesWithLessons.length > 0 ? (
          <div className="space-y-4">
            {coursesWithLessons.map(({ course, lessons, loading, error }) => {
              const isExpanded = expandedCourse === course._id;
              const publishedOnly = lessons.filter(l => l.isPublished === true);
              const hasUnpublished = lessons.length > publishedOnly.length;
              return (
                <div key={course._id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  {/* Course header (clickable) */}
                  <button onClick={() => toggleCourse(course._id)} className="flex w-full items-center justify-between p-4 text-right transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="size-12 rounded-lg object-cover" />
                      ) : (
                        <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary"><BookOpen className="size-6" /></span>
                      )}
                      <div className="min-w-0">
                        <h3 className="truncate font-bold">{course.title}</h3>
                        <p className="text-xs text-muted-foreground">بقلم {course.teacher?.name || 'مدرس'} · {publishedOnly.length} درس متاح {hasUnpublished && lessons.length > 0 && `· ${lessons.length} إجمالي`}</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="size-5 flex-shrink-0 text-muted-foreground" /> : <ChevronDown className="size-5 flex-shrink-0 text-muted-foreground" />}
                  </button>

                  {/* Lessons list (expandable) */}
                  {isExpanded && (
                    <div className="border-t border-border p-4">
                      {loading ? (
                        <div className="flex justify-center py-6"><Loader text="جاري تحميل الدروس..." /></div>
                      ) : error ? (
                        <div className="flex flex-col items-center py-6 text-center">
                          <AlertCircle className="mb-2 size-8 text-destructive" />
                          <p className="text-sm text-destructive">{error}</p>
                        </div>
                      ) : publishedOnly.length > 0 ? (
                        <div className="space-y-2">
                          {publishedOnly.map((lesson, idx) => (
                            <Link key={lesson._id} to={`/student/courses/${course._id}?lesson=${lesson._id}`}
                              className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 transition-colors hover:bg-accent">
                              <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">{idx + 1}</span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold">{lesson.title}</p>
                                <p className="truncate text-xs text-muted-foreground">{lesson.description}</p>
                                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  {lesson.videoUrl && <span className="flex items-center gap-1"><Video className="size-3" /> فيديو</span>}
                                  {lesson.files?.length > 0 && <span className="flex items-center gap-1"><FileText className="size-3" /> {lesson.files.length} ملف</span>}
                                  {lesson.questions?.length > 0 && <span className="flex items-center gap-1"><HelpCircle className="size-3" /> {lesson.questions.length} سؤال</span>}
                                </div>
                              </div>
                              <Play className="size-5 flex-shrink-0 text-primary" />
                            </Link>
                          ))}
                        </div>
                      ) : lessons.length > 0 ? (
                        <div className="py-6 text-center">
                          <p className="text-sm text-muted-foreground">كل الدروس في هذا الكورس غير منشورة بعد</p>
                          <p className="mt-1 text-xs text-muted-foreground">{lessons.length} درس في انتظار النشر</p>
                        </div>
                      ) : (
                        <div className="py-6 text-center">
                          <p className="text-sm text-muted-foreground">لا توجد دروس في هذا الكورس بعد</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
              <BookOpen className="size-7 text-muted-foreground" />
            </div>
            <h3 className="font-bold">لا توجد كورسات مسجلة</h3>
            <p className="mt-1 text-sm text-muted-foreground">سجل في كورس أولاً لتظهر دروسه هنا</p>
            <Link to="/student/courses" className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">تصفح الكورسات</Link>
          </div>
        )}
      </div>
    </StudentShellWrapper>
  );
};
