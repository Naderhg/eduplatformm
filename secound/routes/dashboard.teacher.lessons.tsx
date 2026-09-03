import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { lessons } from "@/lib/dashboard-data";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/teacher/lessons")({
  head: () => ({
    meta: [
      { title: "إدارة الدروس | لوحة المدرس" },
      { name: "description", content: "إنشاء وجدولة ونشر الدروس ومتابعة تقدم الطلاب فيها." },
      { property: "og:title", content: "إدارة الدروس | لوحة المدرس" },
      { property: "og:description", content: "دروس منشورة ومسودات ومجدولة مع نسب الإكمال." },
    ],
  }),
  component: LessonsPage,
});

function LessonsPage() {
  const [filter, setFilter] = useState("الكل");
  const tabs = ["الكل", "منشور", "مسودة", "مجدول"];
  const list = filter === "الكل" ? lessons : lessons.filter((l) => l.status === filter);

  return (
    <>
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
              filter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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
    </>
  );
}
