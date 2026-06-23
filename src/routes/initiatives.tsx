import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/pgmo/AppShell";
import { usePgmo, emptyInitiative } from "@/lib/pgmo/store";
import { LAYERS, STATUS_META, type InitiativeStatus } from "@/lib/pgmo/types";
import { useState } from "react";

export const Route = createFileRoute("/initiatives")({
  head: () => ({
    meta: [
      { title: "Initiatives — PgMO" },
      { name: "description", content: "All initiatives, captured against a single standard template. The roadmap is derived from these." },
      { property: "og:title", content: "Initiatives — PgMO" },
      { property: "og:description", content: "All initiatives, captured against a single standard template." },
    ],
  }),
  component: InitiativesList,
});

function InitiativesList() {
  const initiatives = usePgmo((s) => s.initiatives);
  const upsert = usePgmo((s) => s.upsertInitiative);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<InitiativeStatus | "all">("all");

  const visible = filter === "all" ? initiatives : initiatives.filter((i) => i.status === filter);

  return (
    <AppShell>
      <div className="flex items-baseline justify-between border-b border-border pb-8">
        <div>
          <div className="eyebrow">Initiatives</div>
          <h1 className="mt-3 font-display text-5xl text-foreground">
            The standard template, one per change.
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] text-muted-foreground">
            Every initiative captures vision, problem, owner, layers, linked architecture
            nodes, milestones, dependencies and KPIs. The roadmap is computed from them.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const fresh = emptyInitiative();
            fresh.name = "New initiative";
            upsert(fresh);
            navigate({ to: "/initiatives/$id", params: { id: fresh.id } });
          }}
          className="rounded-sm bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground hover:bg-forest-deep"
        >
          New initiative
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={
            "rounded-sm border px-3 py-1.5 text-[11px] " +
            (filter === "all"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border text-muted-foreground hover:text-foreground")
          }
        >
          All · {initiatives.length}
        </button>
        {Object.entries(STATUS_META).map(([k, m]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k as InitiativeStatus)}
            className={
              "rounded-sm border px-3 py-1.5 text-[11px] " +
              (filter === k
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:text-foreground")
            }
          >
            {m.label} · {initiatives.filter((i) => i.status === k).length}
          </button>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-sm border border-border bg-paper">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-secondary text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Initiative</th>
              <th className="px-5 py-3 font-medium">Layers</th>
              <th className="px-5 py-3 font-medium">Owner</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Window</th>
              <th className="px-5 py-3 font-medium">Linked nodes</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((i) => {
              const meta = STATUS_META[i.status];
              return (
                <tr key={i.id} className="border-t border-border hover:bg-secondary/40">
                  <td className="px-5 py-4">
                    <Link
                      to="/initiatives/$id"
                      params={{ id: i.id }}
                      className="font-display text-[16px] text-foreground hover:text-primary"
                    >
                      {i.name || "Untitled"}
                    </Link>
                    <div className="mt-0.5 max-w-xl truncate text-[12px] text-muted-foreground">
                      {i.vision || i.problem || "—"}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {i.layers.map((lid) => {
                        const l = LAYERS.find((x) => x.id === lid);
                        return (
                          <span
                            key={lid}
                            className="rounded-sm border px-1.5 py-0.5 text-[10px]"
                            style={{ borderColor: l?.hue, color: "var(--ink)" }}
                          >
                            {l?.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-foreground">{i.owner || "—"}</td>
                  <td className="px-5 py-4">
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px]"
                      style={{ color: meta.tone }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.tone }} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {fmtDate(i.startDate)} → {fmtDate(i.endDate)}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{i.linkedNodeIds.length}</td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                  No initiatives in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", year: "numeric" });
}