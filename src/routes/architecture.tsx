import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/pgmo/AppShell";
import { PgmoCanvas } from "@/components/pgmo/PgmoCanvas";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture Canvas — PgMO" },
      { name: "description", content: "Workflows, data flows and system architecture, organised by enterprise layer. Switch lenses, isolate layers, edit nodes inline." },
      { property: "og:title", content: "Architecture Canvas — PgMO" },
      { property: "og:description", content: "Workflows, data flows and system architecture, organised by enterprise layer." },
    ],
  }),
  component: ArchitecturePage,
});

function ArchitecturePage() {
  return (
    <AppShell full>
      <PgmoCanvas />
    </AppShell>
  );
}