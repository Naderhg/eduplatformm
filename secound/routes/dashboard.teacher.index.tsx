import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardShell";
import { lessons, exams, messages } from "@/lib/dashboard-data";

export const Route = createFileRoute("/dashboard/teacher/")({
  head: () => ({
    meta: [
      { title: "لوحة المدرس | إديوبورت" },
      { name: "description", content: "إدارة الدروس والامتحانات والتصحيح والبث المباشر وبنوك الأسئلة." },
      { property: "og:title", content: "لوحة المدرس | إديوبورت" },
      { property: "og:description", content: "كل أدوات المدرس في مكان واحد: دروس، امتحانات، تصحيح PDF وZoom." },
    ],
  }),
  component: TeacherOverview,
});

function TeacherOverview() {
  return (
    <>
      <PageHeader title="نظرة عامة" description="ملخص فصولك ونشاط الطلاب" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="الفصول" value="6" />
        <StatCard label="الطلاب" value="187" hint="نشط اليوم: 132" />
        <StatCard label="أوراق بانتظار التصحيح" value="11" />
        <StatCard label="حصص مباشرة قادمة" value="3" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
          <Link to="/dashboard/teacher/lessons" className="mt-4 inline-block text-sm font-bold text-primary">
            كل الدروس ←
          </Link>
        </section>

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
    </>
  );
}
