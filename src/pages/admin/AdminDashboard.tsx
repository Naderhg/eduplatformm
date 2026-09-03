import { Link } from 'react-router-dom';
import { DashboardShell, PageHeader, StatCard } from '../../components/dashboard/DashboardShell';
import { adminNav, students, exams, teachers, platformCourses, recentUsers } from '../../lib/dashboard-data';

export const AdminDashboard = () => {
  return (
    <DashboardShell roleLabel="مدير المنصة" nav={adminNav}>
      <PageHeader
        title="لوحة مدير النظام"
        description="كل ما يحدث على المنصة في مكان واحد"
        action={
          <Link
            to="/admin/courses"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            + إنشاء كورس
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي الطلاب" value="1,284" hint="+42 هذا الشهر" />
        <StatCard label="المدرسون" value={teachers.length} hint={`${teachers.filter(t => t.status === 'نشط').length} مدرس نشط`} />
        <StatCard label="الكورسات" value={platformCourses.length} hint="3 بانتظار المراجعة" />
        <StatCard label="امتحانات جارية" value={exams.length} hint="هذا الأسبوع" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">أحدث المستخدمين</h2>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.name} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
                <div>
                  <p className="text-sm font-bold">{u.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {u.role} · {u.classes} فصل
                  </p>
                </div>
                <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold">{u.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Student performance */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">أداء الطلاب</h2>
          <div className="space-y-4">
            {students.map((s) => (
              <div key={s.id}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-muted-foreground">{s.avg}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${s.avg}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Active teachers */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">أنشط المدرسين</h2>
          <Link to="/admin/teachers" className="text-sm font-bold text-primary">
            عرض الكل ←
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {teachers.map((t) => (
            <div key={t.id} className="rounded-xl bg-muted/60 px-3 py-2">
              <p className="text-sm font-bold">{t.name}</p>
              <p className="text-xs text-muted-foreground">
                {t.subject} · {t.courses} كورس · {t.students} طالب · ⭐ {t.rating}
              </p>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
};
