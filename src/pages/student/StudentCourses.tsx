import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFetch } from '../../hooks/useFetch';
import { coursesApi, Course } from '../../api/courses.api';
import { Loader } from '../../components/common/Loader';
import { Search, BookOpen, User, Play, CheckCircle2, Video, FileText, Clock } from 'lucide-react';
import { StudentShellWrapper } from './StudentShellWrapper';

export const StudentCourses: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [searchedCourse, setSearchedCourse] = useState<Course | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchEnrolledCourses = useCallback(() => coursesApi.getEnrolled(), []);
  const { data: enrolledCourses, isLoading: isLoadingEnrolled, refetch: refetchEnrolled } = useFetch<Course[]>(fetchEnrolledCourses);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) {
      toast.error('ادخل ID الكورس للبحث');
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    setSearchedCourse(null);
    try {
      const course = await coursesApi.getById(searchId.trim());
      setSearchedCourse(course);
    } catch (error) {
      setSearchError('الكورس غير موجود. تأكد من صحة الـ ID.');
      toast.error('الكورس غير موجود');
    } finally {
      setIsSearching(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    setIsEnrolling(true);
    try {
      await coursesApi.enroll(courseId);
      toast.success('تم التسجيل في الكورس بنجاح! 🎉');
      setSearchedCourse(null);
      setSearchId('');
      refetchEnrolled();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'فشل التسجيل. ربما أنت مسجل بالفعل.';
      toast.error(errorMessage);
    } finally {
      setIsEnrolling(false);
    }
  };

  // Check if searched course is already enrolled
  const isAlreadyEnrolled = searchedCourse && enrolledCourses?.some(c => c._id === searchedCourse._id);

  if (isLoadingEnrolled) {
    return <StudentShellWrapper><Loader fullScreen text="جاري التحميل..." /></StudentShellWrapper>;
  }

  return (
    <StudentShellWrapper>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">كورساتي</h1>
          <p className="text-sm text-muted-foreground">ابحث عن كورس بالـ ID أو تابع كورساتك المسجلة</p>
        </div>

        {/* Search Bar */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-3 text-base font-bold">التسجيل في كورس جديد</h2>
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="أدخل معرّف الكورس (Course ID)..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pr-11 pl-4 text-sm outline-none focus:border-primary"
                dir="ltr"
              />
            </div>
            <button type="submit" disabled={isSearching} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
              {isSearching ? 'جاري البحث...' : 'بحث'}
            </button>
          </form>
        </div>

        {/* Searched Course Display - Full card with image, video, teacher info */}
        {searchedCourse && (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            {/* Course thumbnail or video */}
            {searchedCourse.thumbnail && (
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <img src={searchedCourse.thumbnail} alt={searchedCourse.title} className="size-full object-cover" />
                {searchedCourse.videoUrl && (
                  <Link to={`/student/courses/${searchedCourse._id}`} className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                    <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground"><Play className="size-6" /></span>
                  </Link>
                )}
              </div>
            )}

            <div className="p-5">
              {/* Title + category badge */}
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-xl font-bold">{searchedCourse.title}</h3>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{searchedCourse.category}</span>
              </div>

              {/* Teacher info */}
              <div className="mb-3 flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {searchedCourse.teacher?.name?.charAt(0)?.toUpperCase() || 'T'}
                </span>
                <div>
                  <p className="text-sm font-bold">{searchedCourse.teacher?.name || 'مدرس'}</p>
                  <p className="text-xs text-muted-foreground">{searchedCourse.teacher?.email}</p>
                </div>
              </div>

              {/* Description */}
              <p className="mb-4 text-sm text-muted-foreground">{searchedCourse.description}</p>

              {/* Meta info */}
              <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><BookOpen className="size-4" /> {searchedCourse.lessonsCount || 0} درس</span>
                <span className="flex items-center gap-1"><User className="size-4" /> {searchedCourse.studentsCount || 0} طالب</span>
                <span className="flex items-center gap-1"><Clock className="size-4" /> {searchedCourse.duration} أسبوع</span>
                {searchedCourse.videoUrl && <span className="flex items-center gap-1"><Video className="size-4" /> فيديو تعريفي</span>}
                {searchedCourse.files?.length > 0 && <span className="flex items-center gap-1"><FileText className="size-4" /> {searchedCourse.files.length} ملف</span>}
              </div>

              {/* Requirements & Outcomes */}
              {(searchedCourse.requirements?.length > 0 || searchedCourse.learningOutcomes?.length > 0) && (
                <div className="mb-4 grid gap-4 sm:grid-cols-2">
                  {searchedCourse.requirements?.length > 0 && (
                    <div className="rounded-xl bg-muted/50 p-3">
                      <h4 className="mb-2 text-xs font-bold">المتطلبات</h4>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {searchedCourse.requirements.slice(0, 4).map((r, i) => <li key={i} className="relative pr-3 before:absolute before:right-0 before:text-primary before:content-['•']">{r}</li>)}
                      </ul>
                    </div>
                  )}
                  {searchedCourse.learningOutcomes?.length > 0 && (
                    <div className="rounded-xl bg-muted/50 p-3">
                      <h4 className="mb-2 text-xs font-bold">مخرجات التعلم</h4>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {searchedCourse.learningOutcomes.slice(0, 4).map((o, i) => <li key={i} className="relative pr-3 before:absolute before:right-0 before:text-primary before:content-['•']">{o}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Enroll button */}
              {isAlreadyEnrolled ? (
                <div className="flex items-center justify-between rounded-xl bg-success/10 p-3">
                  <span className="flex items-center gap-2 text-sm font-bold text-success"><CheckCircle2 className="size-4" /> أنت مسجل في هذا الكورس</span>
                  <Link to={`/student/courses/${searchedCourse._id}`} className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">فتح الكورس</Link>
                </div>
              ) : (
                <button onClick={() => handleEnroll(searchedCourse._id)} disabled={isEnrolling} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
                  {isEnrolling ? 'جاري التسجيل...' : 'التسجيل في الكورس'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search error */}
        {searchError && !isSearching && !searchedCourse && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center">
            <p className="text-sm font-bold text-destructive">{searchError}</p>
          </div>
        )}

        {/* Enrolled Courses */}
        <div>
          <h2 className="mb-4 text-lg font-bold">كورساتي المسجلة ({enrolledCourses?.length || 0})</h2>
          {enrolledCourses && enrolledCourses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((course) => (
                <Link key={course._id} to={`/student/courses/${course._id}`} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:border-primary hover:shadow-card">
                  {/* Thumbnail */}
                  {course.thumbnail ? (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img src={course.thumbnail} alt={course.title} className="size-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-muted">
                      <BookOpen className="size-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="mb-1 line-clamp-1 font-bold">{course.title}</h3>
                    <p className="mb-2 text-xs text-muted-foreground">بقلم {course.teacher?.name || 'مدرس'}</p>
                    <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{course.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><BookOpen className="size-3" /> {course.lessonsCount || 0} درس</span>
                      <span className="font-bold text-primary">متابعة ←</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
              <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
                <BookOpen className="size-7 text-muted-foreground" />
              </div>
              <h3 className="font-bold">لا توجد كورسات مسجلة</h3>
              <p className="mt-1 text-sm text-muted-foreground">استخدم البحث بالأعلى للعثور على كورس والتسجيل فيه</p>
            </div>
          )}
        </div>
      </div>
    </StudentShellWrapper>
  );
};
