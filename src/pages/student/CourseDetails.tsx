import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { coursesApi, Course } from '../../api/courses.api';
import { lessonsApi, Lesson, LessonQuestion } from '../../api/lessons.api';
import { Loader } from '../../components/common/Loader';
import { VideoPlayer } from '../../components/ui/VideoPlayer';
import CommentSection from '../../components/common/CommentSection';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight, Play, Download, BookOpen, User, Clock, FileText,
  Video, HelpCircle, CheckCircle, XCircle, ChevronDown, ChevronUp, Hash, Send, Award
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

  // Student answers state: { [lessonId]: { [questionIndex]: answer } }
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({});
  // Submission results: { [lessonId]: { score, maxScore, answers: [{questionIndex, answer, correct}] } }
  const [results, setResults] = useState<Record<string, { score: number; maxScore: number; answers: any[] } | null>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const markedViewedRef = useRef<Set<string>>(new Set());

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
        const fetchedLessons = res.data || [];
        setLessons(fetchedLessons);

        // Fetch saved progress for each lesson that has questions
        if (user?.role === 'STUDENT') {
          const progressPromises = fetchedLessons
            .filter(l => l.questions && l.questions.length > 0)
            .map(async (lesson) => {
              try {
                const progRes = await lessonsApi.getProgress(lesson._id);
                if (progRes.data && progRes.data.submittedAt) {
                  // Reconstruct results from saved progress
                  return {
                    lessonId: lesson._id,
                    result: {
                      score: progRes.data.score,
                      maxScore: progRes.data.maxScore,
                      answers: progRes.data.answers || [],
                    },
                    savedAnswers: (progRes.data.answers || []).reduce((acc: Record<number, string>, a: any) => {
                      acc[a.questionIndex] = a.answer;
                      return acc;
                    }, {} as Record<number, string>),
                  };
                }
              } catch (e) { /* ignore */ }
              return null;
            });

          const progressResults = await Promise.all(progressPromises);
          const restoredAnswers: Record<string, Record<number, string>> = {};
          const restoredResults: Record<string, { score: number; maxScore: number; answers: any[] } | null> = {};
          progressResults.forEach((pr) => {
            if (pr) {
              restoredAnswers[pr.lessonId] = pr.savedAnswers;
              restoredResults[pr.lessonId] = pr.result;
            }
          });
          setAnswers(restoredAnswers);
          setResults(restoredResults);
        }
      } catch (e) {
        console.error('Failed to fetch lessons:', e);
      } finally {
        setLessonsLoading(false);
      }
    };
    fetchLessons();
  }, [id, user?.id]);

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

  // Mark lesson as viewed when expanded
  const handleLessonExpand = (lessonId: string) => {
    const isExpanded = expandedLesson === lessonId;
    setExpandedLesson(isExpanded ? null : lessonId);
    // Mark as viewed when expanding (only once per session)
    if (!isExpanded && user?.role === 'STUDENT' && !markedViewedRef.current.has(lessonId)) {
      markedViewedRef.current.add(lessonId);
      lessonsApi.markViewed(lessonId).catch(() => { /* silent fail */ });
    }
  };

  // Set answer for a question
  const setAnswer = (lessonId: string, qIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [lessonId]: { ...(prev[lessonId] || {}), [qIndex]: answer },
    }));
  };

  // Submit answers for a lesson
  const handleSubmitAnswers = async (lesson: Lesson) => {
    const lessonAnswers = answers[lesson._id] || {};
    const unanswered = lesson.questions.filter((_, qi) => !lessonAnswers[qi]?.trim());
    if (unanswered.length > 0) {
      if (!window.confirm(`لديك ${unanswered.length} سؤال بدون إجابة. هل تريد الإرسال؟`)) return;
    }

    const formattedAnswers = lesson.questions.map((_, qi) => ({
      questionIndex: qi,
      answer: lessonAnswers[qi] || '',
    }));

    setSubmitting(lesson._id);
    try {
      const res = await lessonsApi.submitAnswers(lesson._id, formattedAnswers);
      setResults(prev => ({ ...prev, [lesson._id]: res.data }));
      toast.success(`تم الإرسال! نتيجتك: ${res.data.score}/${res.data.maxScore}`);
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'فشل الإرسال');
    } finally {
      setSubmitting(null);
    }
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
                    <button onClick={() => handleLessonExpand(lesson._id)} className="flex w-full items-center gap-3 p-4 text-right transition-colors hover:bg-muted/50">
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

                        {/* Lesson questions - interactive */}
                        {lesson.questions && lesson.questions.length > 0 && (
                          <div>
                            <h4 className="mb-3 flex items-center gap-1.5 text-sm font-bold"><HelpCircle className="size-4 text-primary" /> أسئلة الدرس ({lesson.questions.length})</h4>
                            <div className="space-y-3">
                              {lesson.questions.map((q, qi) => {
                                const lessonResult = results[lesson._id];
                                const answerResult = lessonResult?.answers?.find(a => a.questionIndex === qi);
                                const isAnswered = !!answerResult;
                                const studentAnswer = answers[lesson._id]?.[qi] || '';

                                return (
                                  <div key={qi} className={`rounded-xl border p-4 ${isAnswered ? (answerResult.correct ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5') : 'border-border bg-muted/30'}`}>
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                      <p className="text-sm font-bold">{qi + 1}. {q.text}</p>
                                      <span className="flex-shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{q.points} نقطة</span>
                                    </div>

                                    {/* Answer input - disabled after submission */}
                                    <div className="mt-2">
                                      {q.type === 'mcq' && q.choices && (
                                        <div className="space-y-1.5">
                                          {q.choices.map((choice, ci) => (
                                            <label key={ci} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm transition-colors ${
                                              isAnswered
                                                ? choice === q.correctAnswer
                                                  ? 'border-success bg-success/10'
                                                  : choice === studentAnswer
                                                    ? 'border-destructive bg-destructive/10'
                                                    : 'border-border opacity-60'
                                                : studentAnswer === choice
                                                  ? 'border-primary bg-primary/5'
                                                  : 'border-border hover:bg-muted/50'
                                            } ${isAnswered ? 'cursor-default' : ''}`}>
                                              <input
                                                type="radio"
                                                name={`q-${lesson._id}-${qi}`}
                                                checked={studentAnswer === choice}
                                                disabled={isAnswered}
                                                onChange={() => setAnswer(lesson._id, qi, choice)}
                                                className="size-4"
                                              />
                                              <span>{choice}</span>
                                              {isAnswered && choice === q.correctAnswer && <CheckCircle className="mr-auto size-4 text-success" />}
                                              {isAnswered && choice === studentAnswer && choice !== q.correctAnswer && <XCircle className="mr-auto size-4 text-destructive" />}
                                            </label>
                                          ))}
                                        </div>
                                      )}

                                      {q.type === 'truefalse' && (
                                        <div className="flex gap-3">
                                          {['true', 'false'].map(opt => (
                                            <label key={opt} className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border p-2.5 text-sm font-bold transition-colors ${
                                              isAnswered
                                                ? opt === q.correctAnswer
                                                  ? 'border-success bg-success/10 text-success'
                                                  : opt === studentAnswer
                                                    ? 'border-destructive bg-destructive/10 text-destructive'
                                                    : 'border-border opacity-60'
                                                : studentAnswer === opt
                                                  ? 'border-primary bg-primary/5 text-primary'
                                                  : 'border-border hover:bg-muted/50'
                                            } ${isAnswered ? 'cursor-default' : ''}`}>
                                              <input
                                                type="radio"
                                                name={`q-${lesson._id}-${qi}`}
                                                checked={studentAnswer === opt}
                                                disabled={isAnswered}
                                                onChange={() => setAnswer(lesson._id, qi, opt)}
                                                className="size-4"
                                              />
                                              {opt === 'true' ? 'صح' : 'خطأ'}
                                              {isAnswered && opt === q.correctAnswer && <CheckCircle className="size-4" />}
                                              {isAnswered && opt === studentAnswer && opt !== q.correctAnswer && <XCircle className="size-4" />}
                                            </label>
                                          ))}
                                        </div>
                                      )}

                                      {q.type === 'short' && (
                                        <div>
                                          <textarea
                                            value={studentAnswer}
                                            onChange={e => setAnswer(lesson._id, qi, e.target.value)}
                                            disabled={isAnswered}
                                            rows={2}
                                            placeholder="اكتب إجابتك هنا..."
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-70"
                                          />
                                          {isAnswered && (
                                            <p className={`mt-1.5 text-xs ${answerResult.correct ? 'text-success' : 'text-destructive'}`}>
                                              {answerResult.correct ? '✓ إجابة صحيحة' : '✗ إجابة خاطئة'}
                                              {!answerResult.correct && ` · الإجابة الصحيحة: ${q.correctAnswer}`}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Show correct answer after submission for mcq/truefalse */}
                                    {isAnswered && q.type !== 'short' && !answerResult.correct && (
                                      <p className="mt-2 text-xs text-success">الإجابة الصحيحة: {q.type === 'truefalse' ? (q.correctAnswer === 'true' ? 'صح' : 'خطأ') : q.correctAnswer}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Submit button or results summary */}
                            {results[lesson._id] ? (
                              <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4">
                                <div className="flex items-center gap-2">
                                  <Award className="size-5 text-primary" />
                                  <span className="text-sm font-bold">النتيجة: {results[lesson._id]!.score} / {results[lesson._id]!.maxScore}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {results[lesson._id]!.maxScore > 0 ? Math.round((results[lesson._id]!.score / results[lesson._id]!.maxScore) * 100) : 0}%
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSubmitAnswers(lesson)}
                                disabled={submitting === lesson._id}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
                              >
                                <Send className="size-4" />
                                {submitting === lesson._id ? 'جاري الإرسال...' : 'إرسال الإجابات'}
                              </button>
                            )}
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
