import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/atlas/AppShell";
import { AtlasCanvas } from "@/components/atlas/AtlasCanvas";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture Canvas — Atlas" },
      { name: "description", content: "Workflows, data flows and system architecture, organised by enterprise layer. Switch lenses, isolate layers, edit nodes inline." },
      { property: "og:title", content: "Architecture Canvas — Atlas" },
      { property: "og:description", content: "Workflows, data flows and system architecture, organised by enterprise layer." },
    ],
  }),
  component: ArchitecturePage,
});

function ArchitecturePage() {
  return (
    <AppShell full>
      <AtlasCanvas />
    </AppShell>
  );
}