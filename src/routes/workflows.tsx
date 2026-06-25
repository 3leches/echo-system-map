import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/pgmo/AppShell";
import { WorkflowsBoard } from "@/components/pgmo/WorkflowsBoard";

export const Route = createFileRoute("/workflows")({
  head: () => ({
    meta: [
      { title: "Workflows — PgMO" },
      { name: "description", content: "Map the firm's workflows across every layer. Inspect each step's maturity (current, transition, target) and whether it is manual, automated, deterministic or AI-enhanced." },
      { property: "og:title", content: "Workflows — PgMO" },
      { property: "og:description", content: "Map the firm's workflows by layer and understand automation, AI augmentation and maturity at every step." },
    ],
  }),
  component: WorkflowsPage,
});

function WorkflowsPage() {
  return (
    <AppShell>
      <WorkflowsBoard />
    </AppShell>
  );
}