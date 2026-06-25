import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/pgmo/AppShell";
import { useThreads } from "@/lib/research/store";

export const Route = createFileRoute("/research/")({
  head: () => ({
    meta: [
      { title: "Research — PgMO" },
      { name: "description", content: "Agentic research workstation for program management. Investigate initiatives, workflows and data with an AI assistant." },
    ],
  }),
  component: ResearchIndex,
});

function ResearchIndex() {
  const { threads, create } = useThreads();
  const navigate = useNavigate();

  useEffect(() => {
    const first = threads[0];
    if (first) {
      navigate({ to: "/research/$threadId", params: { threadId: first.id }, replace: true });
    } else {
      const t = create();
      navigate({ to: "/research/$threadId", params: { threadId: t.id }, replace: true });
    }
  }, [threads, create, navigate]);

  return (
    <AppShell full>
      <div className="flex h-full items-center justify-center text-[12px] text-taupe">
        Opening research workstation…
      </div>
    </AppShell>
  );
}