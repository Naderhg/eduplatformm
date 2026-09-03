import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { coursesApi } from '../../api/courses.api';
import { assignmentsApi } from '../../api/assignments.api';
import { lessonsApi, Lesson, LessonQuestion, CreateLessonData } from '../../api/lessons.api';
import { Loader } from '../../components/common/Loader';
import CommentSection from '../../components/common/CommentSection';
import { TeacherShellWrapper } from './TeacherShellWrapper';
import { toast } from 'react-toastify';
import {
  Users, BookOpen, Video, FileText, Download, Edit, Trash2, Plus,
  Play, Clock, BarChart3, CheckCircle, XCircle, AlertCircle, Calendar,
  Send, X, Upload, HelpCircle, Save, Copy, Hash
} from 'lucide-react';

export interface CourseWithDetails {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: 'preparatory' | 'primary' | 'secondary' | 'university';
  duration: number;
  status: 'draft' | 'published' | 'archived';
  requirements: string[];
  learningOutcomes: string[];
  thumbnail: string;
  videoUrl: string;
  files: Array<{ _id: string; name: string; type: string; size: number; url: string; createdAt: string }>;
  teacher: { _id: string; name: string; email: string; role: string; avatar: string; createdAt: string; updatedAt: string };
  studentsCount: number;
  lessonsCount: number;
  enrollments: Array<{ _id: string; student: { _id: string; name: string; email: string; avatar?: string }; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
}

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://deev--edu-platform--fnj72wsf9xl6.code.run';

// ============ Lesson Modal Component ============
interface LessonModalProps {
  courseId: string;
  lesson: Lesson | null;
  onClose: () => void;
  onSaved: () => void;
}

const LessonModal: React.FC<LessonModalProps> = ({ courseId, lesson, onClose, onSaved }) => {
  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [isPublished, setIsPublished] = useState(lesson?.isPublished || false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [lessonFiles, setLessonFiles] = useState<File[]>([]);
  const [questions, setQuestions] = useState<LessonQuestion[]>(lesson?.questions || []);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl || '');

  // Question form state
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<'mcq' | 'truefalse' | 'short'>('mcq');
  const [qChoices, setQChoices] = useState<string[]>(['', '', '', '']);
  const [qAnswer, setQAnswer] = useState('');
  const [qPoints, setQPoints] = useState(1);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);

  const resetQuestionForm = () => {
    setQText(''); setQAnswer(''); setQChoices(['', '', '', '']); setQPoints(1); setQType('mcq'); setEditingQuestionIdx(null);
  };

  const startEditQuestion = (idx: number) => {
    const q = questions[idx];
    setQText(q.text);
    setQType(q.type);
    setQChoices(q.type === 'mcq' && q.choices?.length ? [...q.choices] : ['', '', '', '']);
    setQAnswer(q.correctAnswer);
    setQPoints(q.points);
    setEditingQuestionIdx(idx);
  };

  const addQuestion = () => {
    if (!qText.trim()) { toast.error('اكتب نص السؤال'); return; }

    if (qType === 'mcq') {
      const filledChoices = qChoices.filter(c => c.trim());
      if (filledChoices.length < 2) { toast.error('اكتب اختيارين على الأقل'); return; }
      if (!qAnswer.trim()) { toast.error('اختر الإجابة الصحيحة'); return; }
      if (!filledChoices.includes(qAnswer)) { toast.error('الإجابة الصحيحة يجب أن تكون أحد الاختيارات'); return; }
    }
    if (qType === 'truefalse' && !qAnswer) { toast.error('اختر الإجابة الصحيحة'); return; }
    if (qType === 'short' && !qAnswer.trim()) { toast.error('اكتب الإجابة الصحيحة'); return; }

    const newQ: LessonQuestion = {
      text: qText.trim(),
      type: qType,
      choices: qType === 'mcq' ? qChoices.filter(c => c.trim()) : undefined,
      correctAnswer: qAnswer.trim(),
      points: qPoints,
    };

    if (editingQuestionIdx !== null) {
      // Update existing question
      const updated = [...questions];
      updated[editingQuestionIdx] = newQ;
      setQuestions(updated);
      toast.success('تم تحديث السؤال');
    } else {
      setQuestions([...questions, newQ]);
      toast.success('تم إضافة السؤال');
    }
    resetQuestionForm();
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
    if (editingQuestionIdx === idx) resetQuestionForm();
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) { toast.error('العنوان والوصف مطلوبان'); return; }
    setSaving(true);
    try {
      const data: CreateLessonData = { title, description, isPublished, questions };
      let savedLesson: Lesson;
      if (lesson) {
        const res = await lessonsApi.update(courseId, lesson._id, data);
        savedLesson = res.data;
      } else {
        const res = await lessonsApi.create(courseId, data);
        savedLesson = res.data;
      }

      // Upload video if selected
      if (videoFile) {
        setUploadingVideo(true);
        try {
          await lessonsApi.uploadVideo(courseId, savedLesson._id, videoFile);
          toast.success('تم رفع الفيديو');
        } catch (e) { toast.error('فشل رفع الفيديو'); }
        setUploadingVideo(false);
      }

      // Upload files if selected
      if (lessonFiles.length > 0) {
        setUploadingFiles(true);
        try {
          await lessonsApi.uploadFiles(courseId, savedLesson._id, lessonFiles);
          toast.success('تم رفع الملفات');
        } catch (e) { toast.error('فشل رفع الملفات'); }
        setUploadingFiles(false);
      }

      toast.success(lesson ? 'تم تحديث الدرس' : 'تم إنشاء الدرس');
      onSaved();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{lesson ? 'تعديل الدرس' : 'درس جديد'}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted"><X className="size-5" /></button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-bold">عنوان الدرس</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="مثال: المشتقات - مقدمة" />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-bold">الوصف</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="وصف مختصر للدرس" />
        </div>

        {/* Video upload */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-bold">فيديو الدرس</label>
          {videoUrl && !videoFile && (
            <p className="mb-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">الفيديو الحالي: {videoUrl.split('/').pop()}</p>
          )}
          <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-primary-foreground" />
        </div>

        {/* Files upload */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-bold">ملفات مرفقة</label>
          <input type="file" multiple onChange={e => setLessonFiles(e.target.files ? Array.from(e.target.files) : [])} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-4 file:py-2 file:text-sm file:font-bold" />
          {lesson?.files && lesson.files.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs font-bold text-muted-foreground">الملفات الحالية:</p>
              {lesson.files.map((f, fi) => (
                <div key={fi} className="flex items-center gap-2 rounded-lg bg-muted/60 px-2 py-1 text-xs">
                  <FileText className="size-3 text-muted-foreground" />
                  <span className="truncate">{f.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Questions section */}
        <div className="mb-4 rounded-xl border border-border p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><HelpCircle className="size-4" /> أسئلة الدرس ({questions.length})</h3>

          {/* Existing questions */}
          {questions.length > 0 && (
            <div className="mb-3 space-y-2">
              {questions.map((q, i) => (
                <div key={i} className={`rounded-lg border p-3 ${editingQuestionIdx === i ? 'border-primary bg-primary/5' : 'bg-muted/60'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 text-xs">
                      <p className="font-bold">{i + 1}. {q.text}</p>
                      <p className="text-muted-foreground">{q.type === 'mcq' ? 'اختياري' : q.type === 'truefalse' ? 'صح/خطأ' : 'مقالي'} · {q.points} نقطة</p>
                      {q.type === 'mcq' && q.choices && q.choices.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {q.choices.map((c, ci) => (
                            <span key={ci} className={`rounded px-1.5 py-0.5 text-[10px] ${c === q.correctAnswer ? 'bg-success/20 text-success font-bold' : 'bg-muted'}`}>
                              {c}{c === q.correctAnswer ? ' ✓' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                      {q.type !== 'mcq' && (
                        <p className="mt-1 text-[10px] text-success">الإجابة: {q.correctAnswer}</p>
                      )}
                    </div>
                    <div className="flex flex-shrink-0 gap-1">
                      <button onClick={() => startEditQuestion(i)} className="rounded p-1 text-primary hover:bg-primary/10" title="تعديل"><Edit className="size-3.5" /></button>
                      <button onClick={() => removeQuestion(i)} className="rounded p-1 text-destructive hover:bg-destructive/10" title="حذف"><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add question form */}
          <div className="space-y-2 border-t border-border pt-3">
            <input value={qText} onChange={e => setQText(e.target.value)} placeholder="نص السؤال" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none" />
            <div className="flex gap-2">
              <select value={qType} onChange={e => { setQType(e.target.value as any); setQAnswer(''); }} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
                <option value="mcq">اختياري</option>
                <option value="truefalse">صح/خطأ</option>
                <option value="short">مقالي</option>
              </select>
              <input type="number" value={qPoints} onChange={e => setQPoints(Number(e.target.value))} min={1} className="w-20 rounded-lg border border-border bg-background px-2 py-2 text-sm" placeholder="نقاط" />
            </div>

            {qType === 'mcq' && (
              <div className="space-y-1">
                {qChoices.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correctChoice" checked={qAnswer === c} onChange={() => setQAnswer(c)} disabled={!c.trim()} />
                    <input value={c} onChange={e => { const nc = [...qChoices]; nc[i] = e.target.value; setQChoices(nc); }} placeholder={`اختيار ${i + 1}`} className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
                  </div>
                ))}
              </div>
            )}
            {qType === 'truefalse' && (
              <div className="flex gap-3">
                <label className="flex items-center gap-1"><input type="radio" name="tf" checked={qAnswer === 'true'} onChange={() => setQAnswer('true')} /> صح</label>
                <label className="flex items-center gap-1"><input type="radio" name="tf" checked={qAnswer === 'false'} onChange={() => setQAnswer('false')} /> خطأ</label>
              </div>
            )}
            {qType === 'short' && (
              <input value={qAnswer} onChange={e => setQAnswer(e.target.value)} placeholder="الإجابة الصحيحة" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            )}

            <button onClick={addQuestion} type="button" className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">
              {editingQuestionIdx !== null ? '✓ حفظ التعديل' : '+ إضافة سؤال'}
            </button>
            {editingQuestionIdx !== null && (
              <button onClick={resetQuestionForm} type="button" className="w-full rounded-lg border border-border px-3 py-2 text-sm font-bold hover:bg-muted">إلغاء التعديل</button>
            )}
          </div>
        </div>

        {/* Published toggle */}
        <label className="mb-4 flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="size-4" />
          <span className="text-sm font-bold">نشر الدرس للطلاب</span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-bold">إلغاء</button>
          <button onClick={handleSave} disabled={saving || uploadingVideo || uploadingFiles} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {saving || uploadingVideo || uploadingFiles ? (uploadingVideo ? 'رفع الفيديو...' : uploadingFiles ? 'رفع الملفات...' : 'حفظ...') : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ Main ManageCourse Component ============
export const ManageCourse: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [publishingAssignment, setPublishingAssignment] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'content' | 'assignments' | 'settings'>('content');
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [studentsProgress, setStudentsProgress] = useState<{ lessons: Array<{ _id: string; title: string; order: number; questionsCount: number }>; students: Array<any> } | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);

  const fetchLessons = async () => {
    if (!id) return;
    try {
      setLessonsLoading(true);
      const response = await lessonsApi.getAll(id);
      setLessons(response.data);
    } catch (error) { console.error('Failed to fetch lessons:', error); }
    finally { setLessonsLoading(false); }
  };

  const fetchStudentsProgress = async () => {
    if (!id) return;
    try {
      setProgressLoading(true);
      const response = await lessonsApi.getCourseStudentsProgress(id);
      setStudentsProgress(response.data);
    } catch (error) { console.error('Failed to fetch students progress:', error); }
    finally { setProgressLoading(false); }
  };

  const fetchAssignments = async () => {
    if (!id) return;
    try {
      setAssignmentsLoading(true);
      const response = await assignmentsApi.getByCourse(id);
      setAssignments(response);
    } catch (error) { console.error('Failed to fetch assignments:', error); }
    finally { setAssignmentsLoading(false); }
  };

  const handleFileDownload = (file: any) => {
    if (file.url && file.url.startsWith('http')) { window.open(file.url, '_blank'); return; }
    const token = localStorage.getItem('token');
    const filename = encodeURIComponent(file.url);
    const fullUrl = `${BACKEND_URL}/api/files/course/${id}/${filename}${token ? `?token=${token}` : ''}`;
    window.open(fullUrl, '_blank');
  };

  const handlePublishAssignment = async (assignmentId: string) => {
    try {
      setPublishingAssignment(assignmentId);
      await assignmentsApi.publishAssignment(assignmentId);
      setAssignments(prev => prev.map(a => a._id === assignmentId ? { ...a, status: 'published' } : a));
      toast.success('تم نشر الواجب');
    } catch (e: any) { toast.error(e.response?.data?.message || 'فشل النشر'); }
    finally { setPublishingAssignment(null); }
  };

  const handleCertificateToggle = async (assignmentId: string, currentEnabled: boolean) => {
    try {
      await assignmentsApi.update(assignmentId, { certificateEnabled: !currentEnabled });
      setAssignments(prev => prev.map(a => a._id === assignmentId ? { ...a, certificateEnabled: !currentEnabled } : a));
      toast.success(!currentEnabled ? 'تم تفعيل الشهادة' : 'تم إلغاء الشهادة');
    } catch (e: any) { toast.error(e.response?.data?.message || 'فشل'); }
  };

  const handleUpdateStatus = async (newStatus: 'draft' | 'published' | 'archived') => {
    if (!course || !id) return;
    if (!window.confirm(`هل تريد تغيير حالة الكورس إلى ${newStatus}؟`)) return;
    try {
      setUpdatingStatus(true);
      await coursesApi.update(id, { status: newStatus });
      setCourse(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success('تم تحديث الحالة');
    } catch (e: any) { toast.error(e.response?.data?.message || 'فشل'); }
    finally { setUpdatingStatus(false); }
  };

  const handleDeleteCourse = async () => {
    if (!course || !id) return;
    if (!window.confirm('⚠️ سيتم حذف الكورس وكل محتواه نهائياً. متابعة؟')) return;
    const confirmation = window.prompt('اكتب "DELETE" للتأكيد:');
    if (confirmation !== 'DELETE') { toast.error('تم الإلغاء'); return; }
    try {
      setDeleting(true);
      await coursesApi.delete(id);
      toast.success('تم حذف الكورس');
      window.location.href = '/teacher/courses';
    } catch (e: any) { toast.error(e.response?.data?.message || 'فشل الحذف'); }
    finally { setDeleting(false); }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!id) return;
    if (!window.confirm('هل تريد حذف هذا الدرس؟')) return;
    try {
      setDeletingLessonId(lessonId);
      await lessonsApi.delete(id, lessonId);
      toast.success('تم حذف الدرس');
      fetchLessons();
    } catch (e: any) { toast.error(e.response?.data?.message || 'فشل الحذف'); }
    finally { setDeletingLessonId(null); }
  };

  const handleToggleLessonPublish = async (lesson: Lesson) => {
    if (!id) return;
    try {
      await lessonsApi.update(id, lesson._id, { isPublished: !lesson.isPublished });
      toast.success(lesson.isPublished ? 'تم إلغاء النشر' : 'تم النشر');
      fetchLessons();
    } catch (e: any) { toast.error(e.response?.data?.message || 'فشل'); }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user?.id || !id) return;
      try {
        setLoading(true);
        const response = await coursesApi.getWithDetails(id);
        setCourse(response);
      } catch (e: any) { toast.error(e.response?.data?.message || 'فشل تحميل الكورس'); }
      finally { setLoading(false); }
    };
    fetchCourse();
  }, [id, user?.id]);

  useEffect(() => {
    if (activeTab === 'assignments') fetchAssignments();
    if (activeTab === 'content') fetchLessons();
    if (activeTab === 'students') fetchStudentsProgress();
  }, [activeTab, id]);

  if (loading) return <TeacherShellWrapper><Loader fullScreen text={t('common.loading')} /></TeacherShellWrapper>;

  if (!course) return <TeacherShellWrapper><div className="p-8 text-center"><h2>الكورس غير موجود</h2><Link to="/teacher/courses" className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-primary-foreground">رجوع للكورسات</Link></div></TeacherShellWrapper>;

  const enrolledStudentsCount = course?.studentsCount || 0;
  const publishedLessons = lessons.filter(l => l.isPublished).length;

  return (
    <TeacherShellWrapper>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold">{course.title}</h1>
          <p className="text-sm text-muted-foreground">{t('teacher.courses.manageCourseDescription')}</p>
          {/* Course ID - pinned/visible for sharing with students */}
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1" dir="ltr">
            <Hash className="size-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">ID: {course._id}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(course._id); toast.success('تم نسخ ID الكورس'); }}
              className="ml-1 rounded p-0.5 text-primary transition-colors hover:bg-primary/10"
              title="نسخ الـ ID"
            >
              <Copy className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <Link to={`/teacher/courses/${course._id}/edit`} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-bold hover:bg-muted">
            <Edit className="size-4" /> تعديل
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Users className="size-6" /></div>
          <div><h3 className="text-2xl font-bold">{enrolledStudentsCount}</h3><p className="text-xs text-muted-foreground">طالب مسجل</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><BookOpen className="size-6" /></div>
          <div><h3 className="text-2xl font-bold">{lessons.length}</h3><p className="text-xs text-muted-foreground">درس</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><BarChart3 className="size-6" /></div>
          <div><h3 className="text-2xl font-bold">{publishedLessons}</h3><p className="text-xs text-muted-foreground">درس منشور</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex overflow-x-auto border-b border-border">
          {[
            { key: 'content' as const, label: 'الدروس' },
            { key: 'assignments' as const, label: 'الواجبات' },
            { key: 'students' as const, label: `الطلاب (${enrolledStudentsCount})` },
            { key: 'overview' as const, label: 'نظرة عامة' },
            { key: 'settings' as const, label: 'الإعدادات' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap px-4 py-3 text-sm font-bold transition-colors ${activeTab === tab.key ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* CONTENT TAB - Lessons management */}
          {activeTab === 'content' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">محتوى الكورس</h3>
                <button onClick={() => { setEditingLesson(null); setShowLessonModal(true); }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                  <Plus className="size-4" /> درس جديد
                </button>
              </div>

              {lessonsLoading ? (
                <div className="flex justify-center py-12"><Loader text="جاري التحميل..." /></div>
              ) : lessons.length > 0 ? (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div key={lesson._id} className="rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-1 gap-3">
                          <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            {lesson.videoUrl ? <Video className="size-5" /> : <BookOpen className="size-5" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold">{index + 1}. {lesson.title}</h4>
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${lesson.isPublished ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                                {lesson.isPublished ? 'منشور' : 'مسودة'}
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{lesson.description}</p>
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              {lesson.videoUrl && <span className="flex items-center gap-1"><Video className="size-3" /> فيديو</span>}
                              {lesson.files?.length > 0 && <span className="flex items-center gap-1"><FileText className="size-3" /> {lesson.files.length} ملف</span>}
                              {lesson.questions?.length > 0 && <span className="flex items-center gap-1"><HelpCircle className="size-3" /> {lesson.questions.length} سؤال</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 gap-1">
                          <button onClick={() => handleToggleLessonPublish(lesson)} title={lesson.isPublished ? 'إلغاء النشر' : 'نشر'}
                            className="rounded-lg p-2 hover:bg-muted">
                            {lesson.isPublished ? <XCircle className="size-4 text-muted-foreground" /> : <CheckCircle className="size-4 text-success" />}
                          </button>
                          <button onClick={() => { setEditingLesson(lesson); setShowLessonModal(true); }} title="تعديل"
                            className="rounded-lg p-2 hover:bg-muted"><Edit className="size-4" /></button>
                          <button onClick={() => handleDeleteLesson(lesson._id)} disabled={deletingLessonId === lesson._id} title="حذف"
                            className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted"><Video className="size-8 text-muted-foreground" /></div>
                  <h3 className="text-lg font-bold">لا توجد دروس بعد</h3>
                  <p className="mt-1 text-sm text-muted-foreground">أضف أول درس للكورس</p>
                  <button onClick={() => { setEditingLesson(null); setShowLessonModal(true); }}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
                    <Plus className="size-4" /> إضافة أول درس
                  </button>
                </div>
              )}

              {/* Resources section */}
              <div className="mt-8 rounded-xl border border-border bg-background p-4">
                <h4 className="mb-3 text-base font-bold">ملفات الكورس</h4>
                {course.files && course.files.length > 0 ? (
                  <div className="space-y-2">
                    {course.files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                        <div className="flex items-center gap-2"><FileText className="size-4 text-muted-foreground" /><span className="text-sm font-semibold">{file.name}</span></div>
                        <button onClick={() => handleFileDownload(file)} className="rounded-lg border border-border px-2 py-1 text-xs font-bold hover:bg-muted"><Download className="inline size-3" /> تحميل</button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">لا توجد ملفات</p>}
              </div>
            </div>
          )}

          {/* ASSIGNMENTS TAB */}
          {activeTab === 'assignments' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">واجبات الكورس</h3>
                <Link to={`/teacher/courses/${id}/assignments/new`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                  <Plus className="size-4" /> واجب جديد
                </Link>
              </div>
              {assignmentsLoading ? <div className="flex justify-center py-12"><Loader text="جاري التحميل..." /></div>
              : assignments.length > 0 ? (
                <div className="space-y-3">
                  {assignments.map((a: any) => (
                    <div key={a._id} className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold">{a.title}</h4>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${a.status === 'published' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{a.status}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span><Calendar className="inline size-3" /> {new Date(a.dueDate).toLocaleDateString()}</span>
                        <span>{a.maxScore} نقطة</span>
                        {a.certificateEnabled && <span className="text-warm-foreground">🎓 شهادة</span>}
                      </div>
                      <div className="mt-3 flex gap-2">
                        {a.status === 'draft' && <button onClick={() => handlePublishAssignment(a._id)} disabled={publishingAssignment === a._id} className="rounded-lg bg-success/10 px-3 py-1.5 text-xs font-bold text-success"><Send className="inline size-3" /> نشر</button>}
                        <Link to={`/teacher/assignments/${a._id}/submissions`} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">التسليمات</Link>
                        <button onClick={() => handleCertificateToggle(a._id, a.certificateEnabled || false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold">🎓 {a.certificateEnabled ? 'إلغاء' : 'تفعيل'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted"><FileText className="size-8 text-muted-foreground" /></div>
                  <p className="text-muted-foreground">لا توجد واجبات</p>
                  <Link to={`/teacher/courses/${id}/assignments/new`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"><Plus className="size-4" /> إنشاء واجب</Link>
                </div>
              )}
            </div>
          )}

          {/* STUDENTS TAB - with progress & grades */}
          {activeTab === 'students' && (
            <div>
              <h3 className="mb-4 text-lg font-bold">الطلاب وتقدمهم في الدروس</h3>

              {progressLoading ? (
                <div className="flex justify-center py-12"><Loader text="جاري تحميل تقدم الطلاب..." /></div>
              ) : course.enrollments && course.enrollments.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary cards */}
                  {studentsProgress && studentsProgress.students.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-border bg-background p-4">
                        <p className="text-xs text-muted-foreground">إجمالي الطلاب</p>
                        <p className="text-2xl font-bold">{studentsProgress.students.length}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-background p-4">
                        <p className="text-xs text-muted-foreground">متوسط المشاهدات</p>
                        <p className="text-2xl font-bold">
                          {studentsProgress.students.length > 0
                            ? (studentsProgress.students.reduce((sum, s) => sum + s.viewedCount, 0) / studentsProgress.students.length).toFixed(1)
                            : 0}
                          <span className="text-sm text-muted-foreground"> / {studentsProgress.lessons.length}</span>
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-background p-4">
                        <p className="text-xs text-muted-foreground">متوسط الدرجات</p>
                        <p className="text-2xl font-bold">
                          {studentsProgress.students.length > 0 && studentsProgress.students.some(s => s.totalMaxScore > 0)
                            ? Math.round(studentsProgress.students.reduce((sum, s) => sum + (s.totalMaxScore > 0 ? (s.totalScore / s.totalMaxScore) * 100 : 0), 0) / studentsProgress.students.filter(s => s.totalMaxScore > 0).length)
                            : 0}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Students table */}
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="text-right">
                          <th className="p-3 font-bold">الطالب</th>
                          <th className="p-3 text-center font-bold">الدروس المشاهدة</th>
                          <th className="p-3 text-center font-bold">إجابات مُرسلة</th>
                          <th className="p-3 text-center font-bold">الدرجة الكلية</th>
                          <th className="p-3 font-bold">تفاصيل الدروس</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(studentsProgress?.students || course.enrollments.map((en: any) => ({
                          student: { _id: en.student?._id, name: en.student?.name, email: en.student?.email, avatar: en.student?.avatar },
                          lessons: {},
                          totalScore: 0,
                          totalMaxScore: 0,
                          viewedCount: 0,
                          submittedCount: 0,
                        }))).map((sp: any, i: number) => {
                          const totalLessons = studentsProgress?.lessons.length || lessons.length;
                          const percentage = sp.totalMaxScore > 0 ? Math.round((sp.totalScore / sp.totalMaxScore) * 100) : null;
                          return (
                            <tr key={i} className="border-t border-border hover:bg-muted/30">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                    {sp.student?.name?.charAt(0)?.toUpperCase() || 'S'}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="truncate font-bold">{sp.student?.name || 'طالب'}</p>
                                    <p className="truncate text-xs text-muted-foreground">{sp.student?.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <span className="font-bold">{sp.viewedCount || 0}</span>
                                <span className="text-xs text-muted-foreground"> / {totalLessons}</span>
                              </td>
                              <td className="p-3 text-center">
                                <span className="font-bold">{sp.submittedCount || 0}</span>
                              </td>
                              <td className="p-3 text-center">
                                {percentage !== null ? (
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${percentage >= 50 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                    {sp.totalScore} / {sp.totalMaxScore} ({percentage}%)
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1">
                                  {(studentsProgress?.lessons || []).map((lesson: any) => {
                                    const lp = sp.lessons?.[lesson._id];
                                    if (!lp) {
                                      return <span key={lesson._id} title={`${lesson.title}: لم يفتح`} className="size-2.5 rounded-full bg-muted" />;
                                    }
                                    if (lp.submittedAt) {
                                      const pct = lp.maxScore > 0 ? Math.round((lp.score / lp.maxScore) * 100) : 0;
                                      return <span key={lesson._id} title={`${lesson.title}: ${lp.score}/${lp.maxScore} (${pct}%)`} className={`size-2.5 rounded-full ${pct >= 50 ? 'bg-success' : 'bg-destructive'}`} />;
                                    }
                                    if (lp.viewed) {
                                      return <span key={lesson._id} title={`${lesson.title}: تمت المشاهدة`} className="size-2.5 rounded-full bg-primary" />;
                                    }
                                    return <span key={lesson._id} className="size-2.5 rounded-full bg-muted" />;
                                  })}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-muted" /> لم يفتح</span>
                    <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-primary" /> تمت المشاهدة</span>
                    <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-success" /> نجح</span>
                    <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-destructive" /> رسب</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="mb-4 size-12 text-muted-foreground" />
                  <p className="text-muted-foreground">لا يوجد طلاب مسجلون</p>
                </div>
              )}
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-background p-5">
                <h3 className="mb-3 text-base font-bold">معلومات الكورس</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div><span className="text-xs text-muted-foreground">الحالة</span><p><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${course.status === 'published' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{course.status}</span></p></div>
                  <div><span className="text-xs text-muted-foreground">المادة</span><p className="font-bold">{course.category}</p></div>
                  <div><span className="text-xs text-muted-foreground">المستوى</span><p className="font-bold">{course.level}</p></div>
                  <div><span className="text-xs text-muted-foreground">المدة</span><p className="font-bold">{course.duration} أسبوع</p></div>
                  <div><span className="text-xs text-muted-foreground">تاريخ الإنشاء</span><p className="font-bold">{new Date(course.createdAt).toLocaleDateString()}</p></div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background p-5">
                <h3 className="mb-2 text-base font-bold">الوصف</h3>
                <p className="text-sm text-muted-foreground">{course.description}</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-5">
                  <h4 className="mb-2 text-sm font-bold">المتطلبات</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">{course.requirements.map((r, i) => <li key={i} className="relative pr-4 before:absolute before:right-0 before:text-primary before:content-['•']">{r}</li>)}</ul>
                </div>
                <div className="rounded-xl border border-border bg-background p-5">
                  <h4 className="mb-2 text-sm font-bold">مخرجات التعلم</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">{course.learningOutcomes.map((o, i) => <li key={i} className="relative pr-4 before:absolute before:right-0 before:text-primary before:content-['•']">{o}</li>)}</ul>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-background p-5">
                <h4 className="mb-3 text-base font-bold">حالة الكورس</h4>
                <div className="flex flex-wrap gap-2">
                  {(['draft', 'published', 'archived'] as const).map(s => (
                    <button key={s} onClick={() => handleUpdateStatus(s)} disabled={updatingStatus}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${course.status === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}>
                      {s === 'draft' && <AlertCircle className="size-4" />}
                      {s === 'published' && <CheckCircle className="size-4" />}
                      {s === 'archived' && <XCircle className="size-4" />}
                      {s === 'draft' ? 'مسودة' : s === 'published' ? 'منشور' : 'مؤرشف'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
                <h4 className="mb-3 text-base font-bold text-destructive">منطقة الخطر</h4>
                <button onClick={handleDeleteCourse} disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground disabled:opacity-60">
                  <Trash2 className="size-4" /> {deleting ? 'جاري الحذف...' : 'حذف الكورس'}
                </button>
                <p className="mt-2 text-xs text-muted-foreground">سيتم حذف الكورس وكل دروسه وواجباته نهائياً</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      {id && <div className="mt-6"><CommentSection courseId={id} isTeacher={true} /></div>}

      {/* Lesson Modal */}
      {showLessonModal && (
        <LessonModal
          courseId={id!}
          lesson={editingLesson}
          onClose={() => { setShowLessonModal(false); setEditingLesson(null); }}
          onSaved={() => { setShowLessonModal(false); setEditingLesson(null); fetchLessons(); }}
        />
      )}
    </TeacherShellWrapper>
  );
};
