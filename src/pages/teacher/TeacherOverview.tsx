import { Link } from 'react-router-dom';
import { DashboardShell, PageHeader, StatCard } from '../../components/dashboard/DashboardShell';
import { teacherNav, teacherComingSoon, lessons, exams, messages } from '../../lib/dashboard-data';

export const TeacherOverview = () => {
  return (
    <DashboardShell roleLabel="مدرس" nav={teacherNav} comingSoon={teacherComingSoon}>
      <PageHeader
        title="نظرة عامة"
        description="ملخص فصولك ونشاط الطلاب"
        action={
          <Link
            to="/teacher/courses/new"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            + كورس جديد
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="الفصول" value="6" />
        <StatCard label="الطلاب" value="187" hint="نشط اليوم: 132" />
        <StatCard label="أوراق بانتظار التصحيح" value="11" />
        <StatCard label="حصص مباشرة قادمة" value="3" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent lessons */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">أحدث الدروس</h2>
          <div className="space-y-3">
            {lessons.slice(0, 3).map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-sm">
                <span className="font-bold">{l.title}</span>
                <span className="text-xs text-muted-foreground">{l.status}</span>
              </div>
            ))}
          </div>
          <Link to="/teacher/lessons" className="mt-4 inline-block text-sm font-bold text-primary">
            كل الدروس ←
          </Link>
        </section>

        {/* Exams needing attention */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">امتحانات تحتاج متابعة</h2>
          <div className="space-y-3">
            {exams.map((e) => (
              <div key={e.id} className="rounded-xl bg-muted/60 px-3 py-2 text-sm">
                <div className="flex justify-between font-bold">
                  <span>{e.title}</span>
                  <span className="text-primary">{e.graded}/{e.submitted} مُصحح</span>
                </div>
                <p className="text-xs text-muted-foreground">{e.subject} · {e.date}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent messages */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-4 text-lg font-bold">آخر الرسائل</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl bg-muted/60 px-3 py-2">
              <p className="text-sm font-bold">{m.from}</p>
              <p className="text-xs text-muted-foreground">{m.text}</p>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
};
