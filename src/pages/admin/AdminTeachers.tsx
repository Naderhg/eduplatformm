import { DashboardShell, PageHeader, StatCard } from '../../components/dashboard/DashboardShell';
import { adminNav, teachers, platformCourses } from '../../lib/dashboard-data';
import { useState } from 'react';

export const AdminTeachers = () => {
  const [active, setActive] = useState(teachers[0]!.id);
  const teacher = teachers.find((t) => t.id === active)!;
  const courses = platformCourses.filter((c) => c.teacher === teacher.name);

  return (
    <DashboardShell roleLabel="مدير المنصة" nav={adminNav}>
      <PageHeader title="المدرسون" description="عرض كامل لكل مدرس وكورساته وطلابه" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="عدد المدرسين" value={teachers.length} />
        <StatCard label="إجمالي الكورسات" value={teachers.reduce((a, t) => a + t.courses, 0)} />
        <StatCard label="إجمالي الطلاب" value={teachers.reduce((a, t) => a + t.students, 0)} />
        <StatCard label="متوسط التقييم" value="4.7" hint="من 5" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="h-max rounded-2xl border border-border bg-card p-3 shadow-soft">
          {teachers.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`mb-1 w-full rounded-xl px-3 py-2 text-right ${active === t.id ? 'bg-accent' : 'hover:bg-muted'}`}
            >
              <p className="text-sm font-bold">{t.name}</p>
              <p className="text-xs text-muted-foreground">
                {t.subject} · {t.status}
              </p>
            </button>
          ))}
        </aside>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-lg font-bold">{teacher.name}</h2>
          <p className="text-sm text-muted-foreground">
            {teacher.subject} · {teacher.students} طالب · ⭐ {teacher.rating}
          </p>

          <h3 className="mt-5 mb-3 text-sm font-bold">كورسات المدرس</h3>
          <div className="space-y-2">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
                <div>
                  <p className="text-sm font-bold">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.lessons} درس · {c.students} طالب
                  </p>
                </div>
                <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold">{c.status}</span>
              </div>
            ))}
            {courses.length === 0 && <p className="text-sm text-muted-foreground">لا توجد كورسات منشورة بعد.</p>}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};
