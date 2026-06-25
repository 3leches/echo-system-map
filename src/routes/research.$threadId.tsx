import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/pgmo/AppShell";
import { ResearchWorkstation } from "@/components/pgmo/ResearchWorkstation";

export const Route = createFileRoute("/research/$threadId")({
  head: () => ({
    meta: [
      { title: "Research — PgMO" },
      { name: "description", content: "Agentic research workstation for program management." },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  return (
    <AppShell full>
      <ResearchWorkstation threadId={threadId} />
    </AppShell>
  );
}