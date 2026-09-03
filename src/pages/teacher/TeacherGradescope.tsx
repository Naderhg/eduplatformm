import { DashboardShell, PageHeader, StatCard } from '../../components/dashboard/DashboardShell';
import { teacherNav } from '../../lib/dashboard-data';

const rubric = [
  { item: 'خطوات الحل صحيحة', points: 4 },
  { item: 'استخدام القانون المناسب', points: 3 },
  { item: 'الناتج النهائي', points: 2 },
  { item: 'وضوح العرض', points: 1 },
];

export const TeacherGradescope = () => {
  return (
    <DashboardShell roleLabel="مدرس" nav={teacherNav}>
      <PageHeader
        title="Gradescope"
        description="تصحيح مجمّع بمعايير (Rubrics) ومزامنة الدرجات"
        action={
          <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            ربط الحساب
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="حالة الربط" value="متصل" hint="آخر مزامنة قبل 12 دقيقة" />
        <StatCard label="واجبات مزامَنة" value="14" />
        <StatCard label="أوراق مصححة آلياً" value="326" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">معايير التصحيح (Rubric)</h2>
          <div className="space-y-3">
            {rubric.map((r) => (
              <div key={r.item} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-sm">
                <span className="font-semibold">{r.item}</span>
                <span className="rounded-full bg-background px-3 py-1 text-xs font-bold">{r.points} نقطة</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">تجميع الإجابات المتشابهة</h2>
          <p className="text-sm text-muted-foreground">
            صحّح مجموعة إجابات متطابقة مرة واحدة بدل تصحيحها فردياً.
          </p>
          <div className="mt-4 space-y-3">
            {[
              { g: 'مجموعة أ — إجابة صحيحة', n: 22 },
              { g: 'مجموعة ب — خطأ في الإشارة', n: 9 },
              { g: 'مجموعة ج — بدون حل', n: 4 },
            ].map((x) => (
              <div key={x.g} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-sm">
                <span className="font-semibold">{x.g}</span>
                <span className="text-xs text-muted-foreground">{x.n} ورقة</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};
