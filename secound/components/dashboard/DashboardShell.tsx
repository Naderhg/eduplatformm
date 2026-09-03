import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { roleLabels, type Role } from "@/lib/dashboard-data";

type NavItem = { to: string; label: string; exact?: boolean };

const roleNav: Record<Role, NavItem[]> = {
  admin: [{ to: "/dashboard/admin", label: "لوحة الإدارة" }],
  teacher: [{ to: "/dashboard/teacher", label: "لوحة المدرس" }],
  student: [{ to: "/dashboard/student", label: "لوحة الطالب" }],
  parent: [{ to: "/dashboard/parent", label: "لوحة ولي الأمر" }],
};

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function DashboardShell({
  role,
  nav,
  children,
}: {
  role: Role;
  nav?: readonly NavItem[];
  children: ReactNode;
}) {
  const items = nav ?? roleNav[role];

  return (
    <div className="container-page grid gap-6 py-8 lg:grid-cols-[260px_1fr]">
      <aside className="h-max rounded-2xl border border-border bg-card p-4 shadow-soft">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {roleLabels[role]}
        </p>
        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to as never}
              activeOptions={{ exact: item.exact ?? false }}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          to={"/dashboard" as never}
          className="mt-4 block rounded-lg border border-border px-3 py-2 text-center text-xs font-bold text-muted-foreground hover:bg-muted"
        >
          تبديل الدور
        </Link>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
