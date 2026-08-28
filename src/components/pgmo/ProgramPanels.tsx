import { Link } from "@tanstack/react-router";
import {
  DEP_STATUS_META,
  RAG_META,
  STAGE_META,
  type ConstituentProject,
  type DependencyLink,
  type Initiative,
  type ProgramSummary,
  type Rag,
  type RiskItem,
  type Workstream,
} from "@/lib/pgmo/types";

/* ---------------- shared atoms ---------------- */

export function RagPill({ rag, label }: { rag: Rag; label?: string }) {
  const m = RAG_META[rag];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium"
      style={{ background: m.bg, color: m.tone }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.tone }} />
      {label ?? m.label}
    </span>
  );
}

function Bar({ value, tone }: { value: number; tone?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: tone ?? "var(--forest)" }}
      />
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  aside,
  children,
}: {
  eyebrow: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-sm border border-border bg-paper">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2 className="mt-1 font-display text-2xl text-foreground">{title}</h2>
        </div>
        {aside}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function fmt(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/* ---------------- executive summary ---------------- */

export function ExecutiveSummary({ summary }: { summary: ProgramSummary }) {
  const dims: Array<[string, Rag]> = [
    ["Schedule", summary.schedule],
    ["Budget", summary.budget],
    ["Scope", summary.scope],
    ["Benefits", summary.benefits],
  ];
  return (
    <Panel
      eyebrow="Executive summary"
      title="Program status"
      aside={
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{summary.period}</span>
          <RagPill rag={summary.overall} />
        </div>
      }
    >
      <p className="max-w-3xl font-display text-[17px] leading-relaxed text-foreground">
        {summary.narrative}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {dims.map(([label, rag]) => (
          <div key={label} className="rounded-sm border border-border bg-background p-3">
            <div className="eyebrow">{label}</div>
            <div className="mt-2">
              <RagPill rag={rag} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-sm border border-border bg-background p-3">
          <div className="eyebrow">Completion</div>
          <div className="mt-1 font-display text-2xl">{summary.percentComplete}%</div>
          <div className="mt-2">
            <Bar value={summary.percentComplete} />
          </div>
        </div>
        <div className="rounded-sm border border-border bg-background p-3">
          <div className="eyebrow">Budget</div>
          <div className="mt-1 font-display text-2xl">
            {summary.budgetSpent ?? "—"}
            <span className="text-[13px] text-muted-foreground"> / {summary.budgetTotal ?? "—"}</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">Spend to date against approved envelope</div>
        </div>
        <div className="rounded-sm border border-border bg-background p-3">
          <div className="eyebrow">Next gate</div>
          <div className="mt-1 font-display text-[19px] leading-snug">{summary.nextGate?.name ?? "—"}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{fmt(summary.nextGate?.date)}</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <BulletList title="Highlights" tone={RAG_META.green.tone} items={summary.highlights} />
        <BulletList title="Lowlights" tone={RAG_META.red.tone} items={summary.lowlights} />
        <BulletList title="Asks of the steering committee" tone={RAG_META.amber.tone} items={summary.asks} />
      </div>
    </Panel>
  );
}

function BulletList({ title, tone, items }: { title: string; tone: string; items: string[] }) {
  return (
    <div>
      <div className="eyebrow mb-2" style={{ color: tone }}>
        {title}
      </div>
      <ul className="space-y-2">
        {items.length === 0 && <li className="text-[12px] text-muted-foreground">None this period.</li>}
        {items.map((t) => (
          <li key={t} className="flex gap-2 text-[13px] leading-snug text-foreground">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: tone }} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- workstreams ---------------- */

export function WorkstreamBoard({
  workstreams,
  projects,
}: {
  workstreams: Workstream[];
  projects: ConstituentProject[];
}) {
  return (
    <Panel eyebrow="Delivery structure" title="Workstreams">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {workstreams.map((w) => {
          const owned = projects.filter((p) => p.workstreamId === w.id);
          const avg = owned.length
            ? Math.round(owned.reduce((a, p) => a + p.percentComplete, 0) / owned.length)
            : 0;
          return (
            <div key={w.id} className="rounded-sm border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-[17px] leading-snug text-foreground">{w.name}</h3>
                <RagPill rag={w.rag} />
              </div>
              <p className="mt-2 text-[12.5px] leading-snug text-muted-foreground">{w.objective}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{w.lead}</span>
                <span>
                  {owned.length} project{owned.length === 1 ? "" : "s"}
                  {w.headcount ? ` · ${w.headcount} FTE` : ""}
                </span>
              </div>
              <div className="mt-2">
                <Bar value={avg} tone={RAG_META[w.rag].tone} />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ---------------- constituent projects ---------------- */

export function ProjectStatusTable({
  projects,
  workstreams,
}: {
  projects: ConstituentProject[];
  workstreams: Workstream[];
}) {
  const wsName = (id?: string) => workstreams.find((w) => w.id === id)?.name ?? "—";
  const counts = (["green", "amber", "red"] as Rag[]).map(
    (r) => [r, projects.filter((p) => p.rag === r).length] as const,
  );
  return (
    <Panel
      eyebrow="Roll-up"
      title="Constituent project status"
      aside={
        <div className="flex gap-2">
          {counts.map(([r, n]) => (
            <RagPill key={r} rag={r} label={`${n} ${RAG_META[r].label.toLowerCase()}`} />
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-2 pr-4 font-medium">Project</th>
              <th className="py-2 pr-4 font-medium">Workstream</th>
              <th className="py-2 pr-4 font-medium">Lead</th>
              <th className="py-2 pr-4 font-medium">Stage</th>
              <th className="py-2 pr-4 font-medium">Progress</th>
              <th className="py-2 pr-4 font-medium">Window</th>
              <th className="py-2 pr-4 font-medium">Budget</th>
              <th className="py-2 font-medium">RAG</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-border/60 align-top last:border-0">
                <td className="py-3 pr-4">
                  <div className="text-foreground">{p.name}</div>
                  {p.note && <div className="mt-0.5 max-w-sm text-[11.5px] text-muted-foreground">{p.note}</div>}
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{wsName(p.workstreamId)}</td>
                <td className="py-3 pr-4 text-muted-foreground">{p.lead}</td>
                <td className="py-3 pr-4 text-muted-foreground">{STAGE_META[p.stage].label}</td>
                <td className="py-3 pr-4">
                  <div className="w-28">
                    <Bar value={p.percentComplete} tone={RAG_META[p.rag].tone} />
                    <div className="mt-1 text-[11px] text-muted-foreground">{p.percentComplete}%</div>
                  </div>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                  {fmt(p.startDate)} → {fmt(p.endDate)}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                  {p.spend ?? "—"} / {p.budget ?? "—"}
                </td>
                <td className="py-3">
                  <RagPill rag={p.rag} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---------------- risk register ---------------- */

function severityTone(score: number): Rag {
  if (score >= 15) return "red";
  if (score >= 8) return "amber";
  return "green";
}

export function RiskRegister({ risks }: { risks: RiskItem[] }) {
  const sorted = [...risks].sort((a, b) => b.probability * b.impact - a.probability * a.impact);
  const open = sorted.filter((r) => r.status !== "closed");
  return (
    <Panel
      eyebrow="Governance"
      title="Risk & issue register"
      aside={
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {open.filter((r) => r.type === "risk").length} risks · {open.filter((r) => r.type === "issue").length} issues
        </span>
      }
    >
      <div className="space-y-2">
        {sorted.map((r) => {
          const score = r.probability * r.impact;
          const rag = severityTone(score);
          return (
            <div key={r.id} className="rounded-sm border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
                      style={{ borderColor: RAG_META[rag].tone, color: RAG_META[rag].tone }}
                    >
                      {r.type}
                    </span>
                    <h3 className="font-display text-[16px] text-foreground">{r.title}</h3>
                  </div>
                  {r.description && (
                    <p className="mt-1.5 max-w-3xl text-[12.5px] leading-snug text-muted-foreground">{r.description}</p>
                  )}
                  <p className="mt-2 text-[12.5px] leading-snug text-foreground">
                    <span className="text-muted-foreground">Mitigation · </span>
                    {r.mitigation}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-right">
                  <div>
                    <div className="eyebrow">P × I</div>
                    <div className="font-display text-xl" style={{ color: RAG_META[rag].tone }}>
                      {r.probability}×{r.impact} = {score}
                    </div>
                  </div>
                  <RagPill rag={rag} label={r.status.replace("_", " ")} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                <span>Owner · {r.owner}</span>
                <span>Category · {r.category}</span>
                {r.dueDate && <span>Review by · {fmt(r.dueDate)}</span>}
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && <p className="text-[12px] text-muted-foreground">No risks logged.</p>}
      </div>
    </Panel>
  );
}

/* ---------------- dependency matrix ---------------- */

export function DependencyMatrix({
  links,
  initiatives,
}: {
  links: DependencyLink[];
  initiatives: Initiative[];
}) {
  return (
    <Panel eyebrow="Interlock" title="Dependency matrix">
      {links.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          No inbound dependencies — this program can proceed independently.
        </p>
      ) : (
        <table className="w-full text-left text-[13px]">
          <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-2 pr-4 font-medium">Depends on</th>
              <th className="py-2 pr-4 font-medium">Type</th>
              <th className="py-2 pr-4 font-medium">What is needed</th>
              <th className="py-2 pr-4 font-medium">Needed by</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {links.map((d) => {
              const target = initiatives.find((i) => i.id === d.onInitiativeId);
              const meta = DEP_STATUS_META[d.status];
              return (
                <tr key={d.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-4">
                    {target ? (
                      <Link
                        to="/initiatives/$id"
                        params={{ id: target.id }}
                        className="text-foreground hover:text-primary"
                      >
                        {target.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground capitalize">{d.kind}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{d.description}</td>
                  <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">{fmt(d.neededBy)}</td>
                  <td className="py-3">
                    <RagPill rag={meta.rag} label={meta.label} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

/* ---------------- milestone timeline ---------------- */

export function MilestoneTimeline({ initiative }: { initiative: Initiative }) {
  const ms = [...initiative.milestones].sort((a, b) => a.date.localeCompare(b.date));
  const start = new Date(initiative.startDate).getTime();
  const end = new Date(initiative.endDate).getTime();
  const span = Math.max(1, end - start);
  return (
    <Panel eyebrow="Schedule" title="Milestone timeline">
      {ms.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">No milestones defined.</p>
      ) : (
        <>
          <div className="relative mb-6 h-10">
            <div className="absolute top-4 h-px w-full bg-border" />
            {ms.map((m) => {
              const pct = Math.max(0, Math.min(100, ((new Date(m.date).getTime() - start) / span) * 100));
              return (
                <div key={m.id} className="absolute -translate-x-1/2" style={{ left: `${pct}%`, top: 0 }}>
                  <div
                    className="mx-auto mt-2.5 h-3 w-3 rotate-45 border"
                    style={{
                      background: m.done ? RAG_META.green.tone : "var(--paper)",
                      borderColor: m.done ? RAG_META.green.tone : "var(--sand)",
                    }}
                  />
                  <div className="mt-1.5 whitespace-nowrap text-[10px] text-muted-foreground">
                    {new Date(m.date).toLocaleDateString(undefined, { month: "short" })}
                  </div>
                </div>
              );
            })}
          </div>
          <ul className="space-y-1.5">
            {ms.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-sm border border-border bg-background px-3 py-2 text-[13px]"
              >
                <span className={m.done ? "text-muted-foreground line-through" : "text-foreground"}>{m.title}</span>
                <span className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  {fmt(m.date)}
                  <RagPill rag={m.done ? "green" : "amber"} label={m.done ? "Complete" : "Planned"} />
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}

/* ---------------- decision log ---------------- */

export function DecisionLogPanel({ initiative }: { initiative: Initiative }) {
  const decisions = initiative.decisions ?? [];
  return (
    <Panel eyebrow="Governance" title="Decision log">
      {decisions.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">No decisions logged.</p>
      ) : (
        <ul className="space-y-2">
          {decisions.map((d) => (
            <li key={d.id} className="rounded-sm border border-border bg-background px-3 py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[13.5px] text-foreground">{d.title}</div>
                  {d.detail && <div className="mt-0.5 text-[12px] text-muted-foreground">{d.detail}</div>}
                </div>
                <RagPill
                  rag={d.status === "approved" ? "green" : d.status === "pending" ? "amber" : "red"}
                  label={d.status}
                />
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                {d.decidedBy} · {fmt(d.date)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
