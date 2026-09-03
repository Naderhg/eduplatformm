import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck, Users, BookOpen } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "لوحات التحكم | إديوبورت" },
      { name: "description", content: "اختر دورك: مدير، مدرس، طالب أو ولي أمر للدخول إلى لوحة التحكم." },
      { property: "og:title", content: "لوحات التحكم | إديوبورت" },
      { property: "og:description", content: "لوحات تحكم متكاملة لأربعة أدوار داخل المنصة التعليمية." },
    ],
  }),
  component: DashboardHome,
});

const roles = [
  { to: "/dashboard/admin", label: "مدير المنصة", desc: "إدارة المستخدمين والمدارس والتقارير", Icon: ShieldCheck },
  { to: "/dashboard/teacher", label: "مدرس", desc: "دروس، امتحانات، تصحيح، بث مباشر وبنوك أسئلة", Icon: BookOpen },
  { to: "/dashboard/student", label: "طالب", desc: "الجدول، الواجبات، الدرجات والفصول المباشرة", Icon: GraduationCap },
  { to: "/dashboard/parent", label: "ولي أمر", desc: "متابعة الحضور والدرجات والتواصل مع المدرسين", Icon: Users },
] as const;

function DashboardHome() {
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">اختر لوحة التحكم</h1>
      <p className="mt-2 text-muted-foreground">نموذج تجريبي (فرونت اند) لأربعة أدوار على غرار PowerSchool و Schoology.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map(({ to, label, desc, Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-card"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-4 text-lg font-bold">{label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            <span className="mt-3 inline-block text-sm font-bold text-primary">دخول ←</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
