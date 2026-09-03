import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/dashboard/teacher/live")({
  head: () => ({
    meta: [
      { title: "البث المباشر و Zoom | لوحة المدرس" },
      { name: "description", content: "جدولة الحصص المباشرة عبر Zoom مع تسجيل الحضور والتسجيلات." },
      { property: "og:title", content: "البث المباشر و Zoom | لوحة المدرس" },
      { property: "og:description", content: "ابدأ حصة مباشرة أو جدولها وتابع الحضور والتسجيلات." },
    ],
  }),
  component: LivePage,
});

const sessions = [
  { id: "z1", title: "مراجعة المشتقات", time: "اليوم 5:00 م", status: "قادم", students: 42 },
  { id: "z2", title: "حل مسائل ميكانيكا", time: "غداً 3:30 م", status: "مجدول", students: 38 },
  { id: "z3", title: "شرح الوحدة الثالثة", time: "أمس 6:00 م", status: "تسجيل متاح", students: 35 },
];

function LivePage() {
  return (
    <>
      <PageHeader
        title="البث المباشر"
        description="متكامل مع Zoom — حضور تلقائي وتسجيلات محفوظة"
        action={
          <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            بدء حصة الآن
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="حساب Zoom" value="متصل" hint="teacher@school.edu" />
        <StatCard label="حصص هذا الأسبوع" value="7" />
        <StatCard label="متوسط الحضور" value="88%" />
      </div>

      <div className="mt-6 space-y-3">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <div>
              <p className="font-bold">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.time} · {s.students} طالب</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">{s.status}</span>
              <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold">
                {s.status === "تسجيل متاح" ? "مشاهدة" : "انضمام"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
