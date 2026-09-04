import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assignmentsApi } from '../../api/assignments.api';
import { coursesApi, Course } from '../../api/courses.api';
import { TeacherShellWrapper } from './TeacherShellWrapper';
import { Loader } from '../../components/common/Loader';
import { ArrowLeft, Plus, Trash2, Save, FileText, HelpCircle, Award, Video, BookOpen } from 'lucide-react';
import './CreateAssignment.css';

type AssignmentType = 'mcq' | 'essay' | 'mixed';

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface EssayQuestion {
  id: string;
  question: string;
  maxWords?: number;
  points: number;
}

export const CreateAssignment: React.FC = () => {
  const params = useParams<{ id?: string }>();
  const courseId = params.id;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('essay');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [certificateEnabled, setCertificateEnabled] = useState(false);
  const [certificatePassingScore, setCertificatePassingScore] = useState(50);

  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [essayQuestions, setEssayQuestions] = useState<EssayQuestion[]>([]);

  // Fetch course details if courseId is provided
  useEffect(() => {
    if (!courseId) return;
    setLoadingCourse(true);
    coursesApi.getById(courseId)
      .then(c => setCourse(c))
      .catch(() => toast.error('فشل تحميل بيانات الكورس'))
      .finally(() => setLoadingCourse(false));
  }, [courseId]);

  const addMCQQuestion = () => {
    setMcqQuestions([...mcqQuestions, {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 10
    }]);
  };

  const updateMCQQuestion = (id: string, field: keyof MCQQuestion, value: any) => {
    setMcqQuestions(qs => qs.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const deleteMCQQuestion = (id: string) => {
    setMcqQuestions(qs => qs.filter(q => q.id !== id));
  };

  const addMCQOption = (qId: string) => {
    setMcqQuestions(qs => qs.map(q => q.id === qId ? { ...q, options: [...q.options, ''] } : q));
  };

  const removeMCQOption = (qId: string, oIndex: number) => {
    setMcqQuestions(qs => qs.map(q => {
      if (q.id !== qId || q.options.length <= 2) return q;
      const newOptions = q.options.filter((_, i) => i !== oIndex);
      const newCorrect = q.correctAnswer >= newOptions.length ? 0 : q.correctAnswer > oIndex ? q.correctAnswer - 1 : q.correctAnswer;
      return { ...q, options: newOptions, correctAnswer: newCorrect };
    }));
  };

  const addEssayQuestion = () => {
    setEssayQuestions([...essayQuestions, {
      id: Date.now().toString(),
      question: '',
      maxWords: 500,
      points: 20
    }]);
  };

  const updateEssayQuestion = (id: string, field: keyof EssayQuestion, value: any) => {
    setEssayQuestions(qs => qs.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const deleteEssayQuestion = (id: string) => {
    setEssayQuestions(qs => qs.filter(q => q.id !== id));
  };

  const calculateTotalPoints = () => {
    return mcqQuestions.reduce((s, q) => s + q.points, 0) + essayQuestions.reduce((s, q) => s + q.points, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return toast.error('من فضلك أدخل عنوان الواجب');
    if (!description.trim()) return toast.error('من فضلك أدخل وصف الواجب');
    if (!dueDate) return toast.error('من فضلك اختر تاريخ التسليم');
    if (availableFrom && new Date(availableFrom) >= new Date(dueDate)) {
      return toast.error('تاريخ الإتاحة يجب أن يكون قبل تاريخ التسليم');
    }

    const hasQuestions = assignmentType === 'mcq' ? mcqQuestions.length > 0 :
      assignmentType === 'essay' ? essayQuestions.length > 0 :
        mcqQuestions.length > 0 || essayQuestions.length > 0;

    if (!hasQuestions) return toast.error('من فضلك أضف سؤالاً واحداً على الأقل');

    for (const q of mcqQuestions) {
      if (!q.question.trim()) return toast.error('من فضلك املأ كل أسئلة الاختيار');
      if (q.options.some(o => !o.trim())) return toast.error('من فضلك املأ كل خيارات الاختيار');
    }
    for (const q of essayQuestions) {
      if (!q.question.trim()) return toast.error('من فضلك املأ كل الأسئلة المقالية');
    }

    setIsLoading(true);
    try {
      const totalPoints = calculateTotalPoints();
      const assignmentData: any = {
        title,
        description,
        availableFrom: availableFrom ? new Date(availableFrom).toISOString() : undefined,
        dueDate: new Date(dueDate).toISOString(),
        maxScore: totalPoints,
        type: assignmentType,
        questions: {
          mcq: mcqQuestions.map(({ id, ...q }) => q),
          essay: essayQuestions.map(({ id, ...q }) => q)
        },
        autoCorrect: assignmentType === 'mcq' || assignmentType === 'mixed',
        certificateEnabled,
        certificatePassingScore
      };

      if (courseId) assignmentData.courseId = courseId;

      await assignmentsApi.create(assignmentData);
      toast.success('تم إنشاء الواجب بنجاح');
      navigate(courseId ? `/teacher/courses/${courseId}/manage` : '/teacher/assignments');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'فشل إنشاء الواجب');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || loadingCourse) {
    return (
      <TeacherShellWrapper>
        <Loader fullScreen text={isLoading ? 'جاري إنشاء الواجب...' : 'جاري التحميل...'} />
      </TeacherShellWrapper>
    );
  }

  return (
    <TeacherShellWrapper>
      <div className="create-assignment" dir="rtl">
        <div className="page-header">
          <button
            className="btn btn-ghost mb-4"
            onClick={() => courseId ? navigate(`/teacher/courses/${courseId}/manage`) : navigate('/teacher/assignments')}
          >
            <ArrowLeft className="ml-1 size-4" /> رجوع لـ{courseId ? 'الكورس' : 'الواجبات'}
          </button>
          <div>
            <h1 className="page-title">إنشاء واجب جديد</h1>
            <p className="page-subtitle">{course ? `للكورس: ${course.title}` : 'أنشئ واجباً جديداً لطلابك'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="assignment-form">
          {/* Basic Info */}
          <div className="form-section card">
            <h2 className="section-title">المعلومات الأساسية</h2>

            <div className="form-group">
              <label>عنوان الواجب *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="أدخل عنوان الواجب" required />
            </div>

            <div className="form-group">
              <label>الوصف *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="اشرح متطلبات الواجب" rows={4} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>متاح من (اختياري)</label>
                <input type="datetime-local" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} />
              </div>
              <div className="form-group">
                <label>تاريخ التسليم *</label>
                <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>نوع الواجب *</label>
              <select value={assignmentType} onChange={e => setAssignmentType(e.target.value as AssignmentType)} required>
                <option value="essay">سؤال مقالي / إجابة كتابية</option>
                <option value="mcq">اختيار من متعدد (MCQ)</option>
                <option value="mixed">مختلط (MCQ + مقالي)</option>
              </select>
            </div>

            <div className="form-info">
              <strong>إجمالي الدرجات:</strong> {calculateTotalPoints()}
              {(assignmentType === 'mcq' || assignmentType === 'mixed') && (
                <span className="auto-correct-badge">تصحيح تلقائي للـ MCQ</span>
              )}
            </div>
          </div>

          {/* MCQ Questions */}
          {(assignmentType === 'mcq' || assignmentType === 'mixed') && (
            <div className="form-section card">
              <div className="section-header">
                <h2 className="section-title">أسئلة الاختيار من متعدد</h2>
                <button type="button" className="btn btn-primary" onClick={addMCQQuestion}>
                  <Plus className="ml-1 size-4" /> إضافة سؤال
                </button>
              </div>

              {mcqQuestions.length === 0 ? (
                <div className="empty-state">
                  <HelpCircle className="size-10 text-muted-foreground" />
                  <p>لم تتم إضافة أسئلة اختيار من متعدد بعد</p>
                </div>
              ) : (
                mcqQuestions.map((q, qIdx) => (
                  <div key={q.id} className="question-card">
                    <div className="question-header">
                      <h3>سؤال {qIdx + 1}</h3>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteMCQQuestion(q.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </button>
                    </div>

                    <div className="form-group">
                      <label>نص السؤال</label>
                      <textarea value={q.question} onChange={e => updateMCQQuestion(q.id, 'question', e.target.value)} placeholder="اكتب السؤال" rows={2} required />
                    </div>

                    <div className="form-group">
                      <label>الخيارات (اختر الإجابة الصحيحة)</label>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="option-input">
                          <input type="radio" name={`correct-${q.id}`} checked={q.correctAnswer === oIdx} onChange={() => updateMCQQuestion(q.id, 'correctAnswer', oIdx)} />
                          <input type="text" value={opt} onChange={e => {
                            const newOpts = [...q.options]; newOpts[oIdx] = e.target.value;
                            updateMCQQuestion(q.id, 'options', newOpts);
                          }} placeholder={`الخيار ${oIdx + 1}`} required />
                          {q.correctAnswer === oIdx && <span className="correct-label">✓ صحيح</span>}
                          {q.options.length > 2 && (
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeMCQOption(q.id, oIdx)}>
                              <Trash2 className="size-3.5 text-destructive" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={() => addMCQOption(q.id)}>
                        <Plus className="ml-1 size-3" /> إضافة خيار
                      </button>
                    </div>

                    <div className="form-group">
                      <label>الدرجة</label>
                      <input type="number" min="1" value={q.points} onChange={e => updateMCQQuestion(q.id, 'points', parseInt(e.target.value) || 1)} required />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Essay Questions */}
          {(assignmentType === 'essay' || assignmentType === 'mixed') && (
            <div className="form-section card">
              <div className="section-header">
                <h2 className="section-title">الأسئلة المقالية</h2>
                <button type="button" className="btn btn-primary" onClick={addEssayQuestion}>
                  <Plus className="ml-1 size-4" /> إضافة سؤال
                </button>
              </div>

              {essayQuestions.length === 0 ? (
                <div className="empty-state">
                  <FileText className="size-10 text-muted-foreground" />
                  <p>لم تتم إضافة أسئلة مقالية بعد</p>
                </div>
              ) : (
                essayQuestions.map((q, qIdx) => (
                  <div key={q.id} className="question-card">
                    <div className="question-header">
                      <h3>سؤال {qIdx + 1}</h3>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteEssayQuestion(q.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </button>
                    </div>

                    <div className="form-group">
                      <label>نص السؤال</label>
                      <textarea value={q.question} onChange={e => updateEssayQuestion(q.id, 'question', e.target.value)} placeholder="اكتب السؤال المقالي" rows={3} required />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>الحد الأقصى للكلمات (اختياري)</label>
                        <input type="number" min="50" value={q.maxWords || ''} onChange={e => updateEssayQuestion(q.id, 'maxWords', parseInt(e.target.value) || undefined)} placeholder="500" />
                      </div>
                      <div className="form-group">
                        <label>الدرجة</label>
                        <input type="number" min="1" value={q.points} onChange={e => updateEssayQuestion(q.id, 'points', parseInt(e.target.value) || 1)} required />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Certificate */}
          <div className="certificate-section card">
            <h2 className="section-title">إعدادات الشهادة</h2>
            <p className="section-description">فعّل الشهادات للطلاب الذين يجتازون هذا الواجب</p>
            <div className="form-group">
              <label className="toggle-label">
                <input type="checkbox" checked={certificateEnabled} onChange={e => setCertificateEnabled(e.target.checked)} className="toggle-input" />
                <span className="toggle-switch"></span>
                <span>تفعيل الشهادة</span>
              </label>
            </div>
            {certificateEnabled && (
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>الحد الأدنى للنجاح (%)</label>
                <input type="number" min="0" max="100" value={certificatePassingScore} onChange={e => setCertificatePassingScore(Number(e.target.value))} style={{ maxWidth: '200px' }} required />
                <span className="form-hint">الطلاب الحاصلون على هذه النسبة أو أكثر سيحصلون على شهادة</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              <Save className="ml-1 size-4" /> إنشاء الواجب
            </button>
          </div>
        </form>
      </div>
    </TeacherShellWrapper>
  );
};
