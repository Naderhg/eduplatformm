import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardShell";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/teacher/quizzes")({
  head: () => ({
    meta: [
      { title: "اختبارات فورية | لوحة المدرس" },
      { name: "description", content: "أطلق اختباراً فورياً داخل الحصة وشاهد إجابات الطلاب لحظياً." },
      { property: "og:title", content: "اختبارات فورية | لوحة المدرس" },
      { property: "og:description", content: "اختبارات لحظية بنتائج مباشرة أثناء الشرح." },
    ],
  }),
  component: QuizzesPage,
});

const answers = [
  { choice: "أ", pct: 18 },
  { choice: "ب", pct: 62 },
  { choice: "ج", pct: 12 },
  { choice: "د", pct: 8 },
];

function QuizzesPage() {
  const [live, setLive] = useState(false);
  return (
    <>
      <PageHeader
        title="اختبارات فورية"
        description="سؤال سريع أثناء الحصة ونتائج لحظية"
        action={
          <button
            onClick={() => setLive((v) => !v)}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${
              live ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            {live ? "إنهاء الاختبار" : "إطلاق اختبار"}
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="الحالة" value={live ? "جاري الآن" : "متوقف"} />
        <StatCard label="المشاركون" value={live ? 132 : 0} />
        <StatCard label="متوسط زمن الإجابة" value="14 ث" />
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-bold">السؤال الحالي</h2>
        <p className="mt-2 text-sm text-muted-foreground">ما ناتج تفاضل الدالة f(x) = 3x² + 2x ؟</p>
        <div className="mt-4 space-y-3">
          {answers.map((a) => (
            <div key={a.choice}>
              <div className="flex justify-between text-sm font-semibold">
                <span>الاختيار {a.choice}</span>
                <span className="text-muted-foreground">{live ? `${a.pct}%` : "—"}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: live ? `${a.pct}%` : "0%" }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
