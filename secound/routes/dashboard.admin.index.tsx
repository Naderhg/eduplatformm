import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard/DashboardShell";
import { students, exams, teachers, platformCourses } from "@/lib/dashboard-data";

export const Route = createFileRoute("/dashboard/admin/")({
  head: () => ({
    meta: [
      { title: "لوحة مدير النظام | إديوبورت" },
      { name: "description", content: "رؤية كاملة للمنصة: المدرسون والكورسات والطلاب والتقارير." },
      { property: "og:title", content: "لوحة مدير النظام | إديوبورت" },
      { property: "og:description", content: "نظرة شاملة على كل نشاط المنصة التعليمية." },
    ],
  }),
  component: AdminOverview,
});

const users = [
  { name: "م. أحمد سمير", role: "مدرس", status: "نشط", classes: 6 },
  { name: "أ. منى خالد", role: "مدرس", status: "نشط", classes: 4 },
  { name: "يوسف عادل", role: "طالب", status: "نشط", classes: 7 },
  { name: "والد عمر طارق", role: "ولي أمر", status: "بانتظار التفعيل", classes: 1 },
];

function AdminOverview() {
  return (
    <>
      <PageHeader
        title="لوحة مدير النظام"
        description="كل ما يحدث على المنصة في مكان واحد"
        action={
          <Link
            to="/dashboard/admin/courses"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            + إنشاء كورس
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي الطلاب" value="1,284" hint="+42 هذا الشهر" />
        <StatCard label="المدرسون" value={teachers.length * 21} hint={`${teachers.length} مدرس مميز`} />
        <StatCard label="الكورسات" value={platformCourses.length * 9} hint="3 بانتظار المراجعة" />
        <StatCard label="امتحانات جارية" value={exams.length} hint="هذا الأسبوع" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">أحدث المستخدمين</h2>
          <div className="space-y-3">
            {users.map((u) => (
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

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">أنشط المدرسين</h2>
          <Link to="/dashboard/admin/teachers" className="text-sm font-bold text-primary">
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
    </>
  );
}
