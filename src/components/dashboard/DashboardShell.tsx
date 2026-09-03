import { Link, NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { GraduationCap, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export type NavItem = { to: string; label: string; exact?: boolean };
export type ComingSoonItem = { label: string };

/* ── StatCard ── */
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

/* ── PageHeader ── */
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

/* ── DashboardShell ── */
export function DashboardShell({
  roleLabel,
  nav,
  comingSoon,
  children,
}: {
  roleLabel: string;
  nav: readonly NavItem[];
  comingSoon?: readonly ComingSoonItem[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              Dev <span className="text-primary">Community</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground sm:inline-flex">
              {roleLabel}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" /> خروج
            </button>
            <button
              className="rounded-lg border border-border p-2 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="القائمة"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside
          className={`${
            open ? 'block' : 'hidden'
          } h-max rounded-2xl border border-border bg-card p-4 shadow-soft lg:block`}
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {roleLabel}
          </p>
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted hover:text-foreground ${
                    isActive ? 'bg-accent text-primary' : 'text-muted-foreground'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {comingSoon && comingSoon.length > 0 && (
            <>
              <p className="mb-3 mt-6 flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <Sparkles className="size-3.5" /> يتوفر قريباً
              </p>
              <nav className="flex flex-col gap-1">
                {comingSoon.map((item) => (
                  <span
                    key={item.label}
                    className="cursor-not-allowed rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground/50"
                  >
                    {item.label}
                  </span>
                ))}
              </nav>
            </>
          )}
          <Link
            to="/"
            className="mt-4 block rounded-lg border border-border px-3 py-2 text-center text-xs font-bold text-muted-foreground hover:bg-muted"
          >
            العودة للموقع
          </Link>
        </aside>

        {/* Main content */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
