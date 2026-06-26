import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/pgmo/AppShell";
import { Dashboard } from "@/components/pgmo/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PgMO — Program Management Dashboard" },
      {
        name: "description",
        content:
          "Mission, vision and live KPIs across the Program Management Office — initiatives in flight, delivery health, investment and roadmap signals.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}