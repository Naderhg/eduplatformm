import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { coursesApi, Course } from '../../api/courses.api';
import { lessonsApi, Lesson } from '../../api/lessons.api';
import { Loader } from '../../components/common/Loader';
import { VideoPlayer } from '../../components/ui/VideoPlayer';
import CommentSection from '../../components/common/CommentSection';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight, Play, Download, BookOpen, User, Clock, FileText,
  Video, HelpCircle, CheckCircle, ChevronDown, ChevronUp, Hash
} from 'lucide-react';
import { StudentShellWrapper } from './StudentShellWrapper';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://deev--edu-platform--fnj72wsf9xl6.code.run';

const getMediaUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.includes('cloudinary.com')) return url;
  return `${BACKEND_URL}${url}`;
};

export const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(searchParams.get('lesson') || null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) {
        setError('Course ID is required');
        setIsLoading(false);
        return;
      }
      try {
        const courseData = await coursesApi.getById(id);
        setCourse(courseData);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'فشل تحميل الكورس';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!id) return;
      try {
        setLessonsLoading(true);
        const res = await lessonsApi.getAll(id);
        setLessons(res.data || []);
      } catch (e) {
        console.error('Failed to fetch lessons:', e);
      } finally {
        setLessonsLoading(false);
      }
    };
    fetchLessons();
  }, [id]);

  const handleFileDownload = (file: any) => {
    const link = document.createElement('a');
    if (file.url && file.url.startsWith('http')) {
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    const token = localStorage.getItem('token');
    const filename = encodeURIComponent(file.url);
    const fullUrl = `${BACKEND_URL}/api/files/course/${id}/${filename}${token ? `?token=${token}` : ''}`;
    link.href = fullUrl;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <StudentShellWrapper><Loader fullScreen text="جاري تحميل الكورس..." /></StudentShellWrapper>;
  }

  if (error || !course) {
    return (
      <StudentShellWrapper>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <BookOpen className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold">الكورس غير موجود</h3>
          <p className="mt-1 text-sm text-muted-foreground">{error || 'الكورس غير متاح أو ليس لديك صلاحية للوصول إليه'}</p>
          <Link to="/student/courses" className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">تصفح الكورسات</Link>
        </div>
      </StudentShellWrapper>
    );
  }

  const publishedLessons = lessons.filter(l => l.isPublished === true);
  const videoUrl = course.videoUrl ? getMediaUrl(course.videoUrl) : '';
  const token = localStorage.getItem('token');
  const finalVideoUrl = videoUrl.includes('cloudinary.com') ? videoUrl : (token ? `${videoUrl}?token=${token}` : videoUrl);

  return (
    <StudentShellWrapper>
      <div className="space-y-6">
        {/* Back link */}
        <Link to="/student/courses" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-primary">
          <ArrowRight className="size-4" /> رجوع للكورسات
        </Link>

        {/* Course Hero */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          {/* Thumbnail / Video preview */}
          {course.thumbnail && (
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <img src={getMediaUrl(course.thumbnail)} alt={course.title} className="size-full object-cover" />
              {course.videoUrl && (
                <button onClick={() => setIsVideoOpen(true)} className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                  <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Play className="size-7" fill="currentColor" />
                  </span>
                </button>
              )}
            </div>
          )}

          <div className="p-5">
            {/* Title + category */}
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              {course.category && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{course.category}</span>}
            </div>

            {/* Teacher info */}
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                {course.teacher?.name?.charAt(0)?.toUpperCase() || 'T'}
              </span>
              <div>
                <p className="text-sm font-bold">{course.teacher?.name || 'مدرس'}</p>
                <p className="text-xs text-muted-foreground">{course.teacher?.email}</p>
              </div>
            </div>

            {/* Meta */}
            <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><BookOpen className="size-4" /> {publishedLessons.length} درس</span>
              <span className="flex items-center gap-1"><User className="size-4" /> {course.studentsCount || 0} طالب</span>
              <span className="flex items-center gap-1"><Clock className="size-4" /> {course.duration} أسبوع</span>
              {course.videoUrl && <span className="flex items-center gap-1"><Video className="size-4" /> فيديو تعريفي</span>}
              {course.files?.length > 0 && <span className="flex items-center gap-1"><FileText className="size-4" /> {course.files.length} ملف</span>}
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-muted-foreground">{course.description}</p>
          </div>
        </div>

        {/* Video Player Button (if no thumbnail but has video) */}
        {course.videoUrl && !course.thumbnail && (
          <button onClick={() => setIsVideoOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:bg-muted">
            <Play className="size-5 text-primary" />
            <span className="font-bold">تشغيل الفيديو التعريفي</span>
          </button>
        )}

        {/* Lessons Section */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold"><BookOpen className="size-5 text-primary" /> دروس الكورس</h2>
            <span className="text-xs text-muted-foreground">{publishedLessons.length} درس متاح</span>
          </div>

          {lessonsLoading ? (
            <div className="flex justify-center py-8"><Loader text="جاري تحميل الدروس..." /></div>
          ) : publishedLessons.length > 0 ? (
            <div className="space-y-2">
              {publishedLessons.map((lesson, idx) => {
                const isExpanded = expandedLesson === lesson._id;
                return (
                  <div key={lesson._id} className="overflow-hidden rounded-xl border border-border bg-background">
                    {/* Lesson header */}
                    <button onClick={() => setExpandedLesson(isExpanded ? null : lesson._id)} className="flex w-full items-center gap-3 p-4 text-right transition-colors hover:bg-muted/50">
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
                      {isExpanded ? <ChevronUp className="size-5 flex-shrink-0 text-muted-foreground" /> : <ChevronDown className="size-5 flex-shrink-0 text-muted-foreground" />}
                    </button>

                    {/* Lesson content (expanded) */}
                    {isExpanded && (
                      <div className="border-t border-border p-4">
                        {/* Lesson video */}
                        {lesson.videoUrl && (
                          <div className="mb-4">
                            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><Video className="size-4 text-primary" /> فيديو الدرس</h4>
                            <div className="overflow-hidden rounded-xl border border-border bg-black">
                              <video src={getMediaUrl(lesson.videoUrl)} controls className="aspect-video w-full" />
                            </div>
                          </div>
                        )}

                        {/* Lesson files */}
                        {lesson.files && lesson.files.length > 0 && (
                          <div className="mb-4">
                            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><FileText className="size-4 text-primary" /> ملفات الدرس</h4>
                            <div className="space-y-2">
                              {lesson.files.map((file, fi) => (
                                <div key={fi} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="size-4 flex-shrink-0 text-muted-foreground" />
                                    <span className="truncate text-sm font-semibold">{file.name}</span>
                                  </div>
                                  <button onClick={() => handleFileDownload(file)} className="flex-shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs font-bold transition-colors hover:bg-muted">
                                    <Download className="inline size-3" /> تحميل
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Lesson questions */}
                        {lesson.questions && lesson.questions.length > 0 && (
                          <div>
                            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><HelpCircle className="size-4 text-primary" /> أسئلة الدرس ({lesson.questions.length})</h4>
                            <div className="space-y-3">
                              {lesson.questions.map((q, qi) => (
                                <div key={qi} className="rounded-xl border border-border bg-muted/30 p-4">
                                  <div className="mb-2 flex items-start justify-between gap-2">
                                    <p className="text-sm font-bold">{qi + 1}. {q.text}</p>
                                    <span className="flex-shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{q.points} نقطة</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    النوع: {q.type === 'mcq' ? 'اختياري' : q.type === 'truefalse' ? 'صح/خطأ' : 'مقالي'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Full description */}
                        <div className="mt-4 rounded-xl bg-muted/30 p-3">
                          <p className="text-sm text-muted-foreground">{lesson.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : lessons.length > 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
                <BookOpen className="size-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold">الدروس غير منشورة بعد</p>
              <p className="mt-1 text-xs text-muted-foreground">{lessons.length} درس في انتظار النشر من المدرس</p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
                <BookOpen className="size-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold">لا توجد دروس في هذا الكورس بعد</p>
              <p className="mt-1 text-xs text-muted-foreground">سيتم إضافة الدروس قريباً</p>
            </div>
          )}
        </div>

        {/* Learning Outcomes & Requirements */}
        <div className="grid gap-4 lg:grid-cols-2">
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold"><CheckCircle className="size-5 text-success" /> ماذا ستتعلم</h3>
              <ul className="space-y-2">
                {course.learningOutcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="mt-0.5 size-4 flex-shrink-0 text-success" /> {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {course.requirements && course.requirements.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold"><BookOpen className="size-5 text-primary" /> المتطلبات</h3>
              <ul className="space-y-2">
                {course.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-2 size-1.5 flex-shrink-0 rounded-full bg-primary" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Course Files */}
        {course.files && course.files.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold"><FileText className="size-5 text-primary" /> ملفات الكورس</h3>
            <div className="space-y-2">
              {course.files.map((file, fi) => (
                <div key={fi} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="size-5" /></span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB · {file.type}</p>
                    </div>
                  </div>
                  <button onClick={() => handleFileDownload(file)} className="flex-shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90">
                    <Download className="inline size-3" /> تحميل
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        {id && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <CommentSection courseId={id} isTeacher={user?.role === 'TEACHER'} />
          </div>
        )}

        {/* Video Player Modal */}
        {course.videoUrl && (
          <VideoPlayer
            videoUrl={finalVideoUrl}
            title={course.title}
            isOpen={isVideoOpen}
            onClose={() => setIsVideoOpen(false)}
          />
        )}
      </div>
    </StudentShellWrapper>
  );
};
