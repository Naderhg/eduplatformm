import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminNav } from "@/lib/dashboard-data";

export const Route = createFileRoute("/dashboard/admin")({
  component: () => (
    <DashboardShell role="admin" nav={adminNav}>
      <Outlet />
    </DashboardShell>
  ),
});
