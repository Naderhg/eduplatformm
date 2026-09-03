import { DashboardShell, PageHeader } from '../../components/dashboard/DashboardShell';
import { teacherNav, teacherComingSoon, lessons } from '../../lib/dashboard-data';
import { useState } from 'react';

export const TeacherLessons = () => {
  const [filter, setFilter] = useState('الكل');
  const tabs = ['الكل', 'منشور', 'مسودة', 'مجدول'];
  const list = filter === 'الكل' ? lessons : lessons.filter((l) => l.status === filter);

  return (
    <DashboardShell roleLabel="مدرس" nav={teacherNav} comingSoon={teacherComingSoon}>
      <PageHeader
        title="الدروس"
        description="أنشئ درساً جديداً أو عدّل الدروس الحالية"
        action={
          <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            + درس جديد
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              filter === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((l) => (
          <article key={l.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <h2 className="text-base font-bold">{l.title}</h2>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                {l.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{l.subject} · {l.date} · {l.students} طالب</p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold">تعديل</button>
              <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold">مرفقات</button>
              <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold">حضور</button>
            </div>
          </article>
        ))}
      </div>

      {list.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">لا توجد درروس في هذا التصنيف.</p>
      )}
    </DashboardShell>
  );
};
