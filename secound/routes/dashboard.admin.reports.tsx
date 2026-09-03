import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardShell";
import { platformCourses, teachers, exams } from "@/lib/dashboard-data";

export const Route = createFileRoute("/dashboard/admin/reports")({
  head: () => ({
    meta: [
      { title: "التقارير | مدير النظام" },
      { name: "description", content: "تقارير الأداء والإيرادات ونشاط المنصة التعليمية." },
      { property: "og:title", content: "التقارير | مدير النظام" },
      { property: "og:description", content: "مؤشرات الإيرادات والتفاعل والامتحانات." },
    ],
  }),
  component: AdminReports,
});

const monthly = [
  { m: "أبريل", v: 62 },
  { m: "مايو", v: 71 },
  { m: "يونيو", v: 58 },
  { m: "يوليو", v: 84 },
  { m: "أغسطس", v: 93 },
];

function AdminReports() {
  const revenue = platformCourses.reduce((a, c) => a + c.price * c.students, 0);

  return (
    <>
      <PageHeader title="التقارير" description="مؤشرات عامة عن أداء المنصة" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="الإيرادات التقديرية" value={`${revenue.toLocaleString("en-US")} ج.م`} />
        <StatCard label="المدرسون النشطون" value={teachers.filter((t) => t.status === "نشط").length} />
        <StatCard label="الامتحانات" value={exams.length} hint="هذا الأسبوع" />
        <StatCard label="نسبة إتمام الكورسات" value="68%" />
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-4 text-lg font-bold">التفاعل الشهري</h2>
        <div className="flex h-48 items-end gap-4">
          {monthly.map((x) => (
            <div key={x.m} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t-xl bg-primary" style={{ height: `${x.v}%` }} />
              <span className="text-xs text-muted-foreground">{x.m}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-4 text-lg font-bold">أعلى الكورسات تسجيلاً</h2>
        <div className="space-y-3">
          {[...platformCourses]
            .sort((a, b) => b.students - a.students)
            .map((c) => (
              <div key={c.id}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{c.title}</span>
                  <span className="text-muted-foreground">{c.students} طالب</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${c.students}%` }} />
                </div>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}
