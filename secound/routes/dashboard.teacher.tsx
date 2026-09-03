import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { teacherNav } from "@/lib/dashboard-data";

export const Route = createFileRoute("/dashboard/teacher")({
  component: () => (
    <DashboardShell role="teacher" nav={teacherNav}>
      <Outlet />
    </DashboardShell>
  ),
});
