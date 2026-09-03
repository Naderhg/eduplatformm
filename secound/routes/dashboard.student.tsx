import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, PageHeader, StatCard } from "@/components/dashboard/DashboardShell";
import { lessons, exams } from "@/lib/dashboard-data";

export const Route = createFileRoute("/dashboard/student")({
  head: () => ({
    meta: [
      { title: "لوحة الطالب | إديوبورت" },
      { name: "description", content: "الجدول الدراسي والواجبات والدرجات والفصول المباشرة للطالب." },
      { property: "og:title", content: "لوحة الطالب | إديوبورت" },
      { property: "og:description", content: "تابع دروسك وواجباتك ودرجاتك في مكان واحد." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  return (
    <DashboardShell role="student">
      <PageHeader title="أهلاً يوسف 👋" description="ملخص يومك الدراسي" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="المعدل العام" value="88%" hint="+3% عن الشهر الماضي" />
        <StatCard label="نسبة الحضور" value="96%" />
        <StatCard label="واجبات متبقية" value="3" hint="أقربها غداً" />
        <StatCard label="حصص مباشرة اليوم" value="2" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">جدول الدروس</h2>
          <div className="space-y-3">
            {lessons.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
                <div>
                  <p className="text-sm font-bold">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{l.subject} · {l.date}</p>
                </div>
                <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                  دخول
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">الامتحانات والدرجات</h2>
          <div className="space-y-3">
            {exams.map((e) => (
              <div key={e.id} className="rounded-xl bg-muted/60 px-3 py-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>{e.title}</span>
                  <span className="text-primary">{e.graded ? "مُصحح" : "قادم"}</span>
                </div>
                <p className="text-xs text-muted-foreground">{e.subject} · {e.date} · {e.questions} سؤال</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
