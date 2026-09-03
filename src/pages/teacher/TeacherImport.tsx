import { DashboardShell, PageHeader } from '../../components/dashboard/DashboardShell';
import { teacherNav } from '../../lib/dashboard-data';
import { useState } from 'react';

const sources = ['Excel / CSV', 'Word (docx)', 'QTI 2.1', 'Moodle XML', 'Google Forms', 'Gradescope'];

export const TeacherImport = () => {
  const [file, setFile] = useState<string | null>(null);

  return (
    <DashboardShell roleLabel="مدرس" nav={teacherNav}>
      <PageHeader title="استيراد بنك أسئلة" description="ارفع أسئلتك السابقة وابدأ فوراً" />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-10 text-center transition-colors hover:border-primary hover:bg-accent/30">
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)}
            />
            <span className="text-sm font-bold">اسحب الملف هنا أو اضغط للاختيار</span>
            <span className="mt-1 text-xs text-muted-foreground">حتى 20 ميجابايت</span>
          </label>
          {file && (
            <p className="mt-3 rounded-xl bg-soft-blue px-3 py-2 text-sm font-semibold">
              تم اختيار: {file} — جاهز للمعالجة
            </p>
          )}
          <button className="mt-4 w-full rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            بدء الاستيراد
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">المصادر المدعومة</h2>
          <div className="grid grid-cols-2 gap-3">
            {sources.map((s) => (
              <div key={s} className="rounded-xl bg-muted/60 px-3 py-3 text-center text-sm font-semibold">
                {s}
              </div>
            ))}
          </div>
          <h3 className="mt-6 text-sm font-bold">آخر عمليات الاستيراد</h3>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>بنك رياضيات 2025 — 340 سؤال — مكتمل</li>
            <li>فيزياء ترم أول — 210 سؤال — مكتمل</li>
          </ul>
        </section>
      </div>
    </DashboardShell>
  );
};
