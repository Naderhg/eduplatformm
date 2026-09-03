import { DashboardShell, PageHeader } from '../../components/dashboard/DashboardShell';
import { teacherNav, questionBanks } from '../../lib/dashboard-data';

const sample = [
  { q: 'عرّف قانون نيوتن الثاني.', type: 'مقالي', level: 'متوسط' },
  { q: 'ناتج ∫2x dx يساوي؟', type: 'MCQ', level: 'سهل' },
  { q: 'الرابطة التساهمية تحدث بين...', type: 'MCQ', level: 'متوسط' },
  { q: 'أثبت أن مشتقة sin(x) هي cos(x).', type: 'مقالي', level: 'صعب' },
];

export const TeacherQuestionBank = () => {
  return (
    <DashboardShell roleLabel="مدرس" nav={teacherNav}>
      <PageHeader
        title="بنوك الأسئلة"
        description="أسئلة جاهزة لإعادة الاستخدام"
        action={
          <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            + بنك جديد
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {questionBanks.map((b) => (
          <article key={b.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-base font-bold">{b.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{b.questions} سؤال · {b.updated}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {b.tags.map((t) => (
                <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{t}</span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-4 text-lg font-bold">أسئلة مختارة</h2>
        <div className="space-y-3">
          {sample.map((s) => (
            <div key={s.q} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
              <p className="text-sm font-semibold">{s.q}</p>
              <span className="text-xs text-muted-foreground">{s.type} · {s.level}</span>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
};
