import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <Outlet />
    </div>
  ),
});
