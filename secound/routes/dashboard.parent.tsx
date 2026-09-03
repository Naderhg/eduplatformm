import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, PageHeader, StatCard } from "@/components/dashboard/DashboardShell";
import { students, messages } from "@/lib/dashboard-data";

export const Route = createFileRoute("/dashboard/parent")({
  head: () => ({
    meta: [
      { title: "لوحة ولي الأمر | إديوبورت" },
      { name: "description", content: "متابعة حضور ودرجات الأبناء والتواصل المباشر مع المدرسين." },
      { property: "og:title", content: "لوحة ولي الأمر | إديوبورت" },
      { property: "og:description", content: "تقارير أسبوعية عن مستوى ابنك وتنبيهات فورية." },
    ],
  }),
  component: ParentDashboard,
});

function ParentDashboard() {
  const child = students[2]!;
  return (
    <DashboardShell role="parent">
      <PageHeader title="متابعة الأبناء" description={`تقرير ${child.name} - ${child.grade}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="المعدل" value={`${child.avg}%`} hint="أقل من متوسط الفصل بـ 9%" />
        <StatCard label="الحضور" value={`${child.attendance}%`} />
        <StatCard label="تأخيرات" value={child.late} hint="هذا الشهر" />
        <StatCard label="واجبات متأخرة" value="2" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">تنبيهات</h2>
          <ul className="space-y-3 text-sm">
            <li className="rounded-xl bg-soft-rose px-3 py-2">درجة منخفضة في كويز الفيزياء (12/20)</li>
            <li className="rounded-xl bg-soft-yellow px-3 py-2">غياب يوم الأحد بدون إذن</li>
            <li className="rounded-xl bg-soft-blue px-3 py-2">تم رفع تقرير المدرس الأسبوعي</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">رسائل المدرسين</h2>
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="rounded-xl bg-muted/60 px-3 py-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>{m.from}</span>
                  <span className="text-xs text-muted-foreground">{m.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{m.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
