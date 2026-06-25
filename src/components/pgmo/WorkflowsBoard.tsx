import { useMemo, useState } from "react";
import { usePgmo } from "@/lib/pgmo/store";
import {
  LAYERS,
  MATURITY_META,
  type LayerId,
  type Maturity,
  type PgmoNodeData,
} from "@/lib/pgmo/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WorkflowStepsSection } from "./NodeInspector";
import type { Node } from "reactflow";
import { Plus, Sparkles, Cog, Hand, Workflow as WorkflowIcon } from "lucide-react";

type MaturityFilter = "all" | Maturity;

const FILTERS: { id: MaturityFilter; label: string }[] = [
  { id: "all", label: "All states" },
  { id: "current", label: "Current" },
  { id: "transition", label: "Transition" },
  { id: "target", label: "Target" },
];

const MATURITY_BADGE: Record<Maturity, string> = {
  current: "bg-[color-mix(in_oklab,var(--forest)_10%,transparent)] text-primary",
  transition: "bg-amber-100 text-amber-900",
  target: "bg-emerald-100 text-emerald-900",
};

export function WorkflowsBoard() {
  const nodes = usePgmo((s) => s.nodes);
  const updateNode = usePgmo((s) => s.updateNode);
  const addNode = usePgmo((s) => s.addNode);
  const [filter, setFilter] = useState<MaturityFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingLayer, setAddingLayer] = useState<LayerId | null>(null);

  const workflows = useMemo(
    () => nodes.filter((n) => n.data.kind === "workflow"),
    [nodes],
  );

  const byLayer = useMemo(() => {
    const map = new Map<LayerId, Node<PgmoNodeData>[]>();
    for (const layer of LAYERS) map.set(layer.id, []);
    for (const n of workflows) {
      if (filter !== "all" && (n.data.maturity ?? "current") !== filter) continue;
      map.get(n.data.layer)?.push(n);
    }
    return map;
  }, [workflows, filter]);

  const stats = useMemo(() => {
    let auto = 0;
    let ai = 0;
    let totalSteps = 0;
    for (const n of workflows) {
      const steps = n.data.steps ?? [];
      totalSteps += steps.length;
      if (steps.length === 0) {
        if ((n.data.automation ?? "manual") === "automated") auto++;
        if ((n.data.execution ?? "deterministic") === "ai_enhanced") ai++;
      } else {
        if (steps.every((s) => s.automation === "automated")) auto++;
        if (steps.some((s) => s.execution === "ai_enhanced")) ai++;
      }
    }
    return { total: workflows.length, auto, ai, totalSteps };
  }, [workflows]);

  const selected = selectedId ? nodes.find((n) => n.id === selectedId) ?? null : null;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-8 py-10">
      {/* Header */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <div className="eyebrow mb-2">Domain orchestration & maturity</div>
          <h1 className="font-display text-4xl text-primary">Workflow architecture</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every workflow the firm runs, grouped by domain. Filter by maturity, scan automation and
            AI posture at a glance, and drill in to manage steps.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-paper p-1">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={
                  "rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors " +
                  (active
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Domain grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {LAYERS.map((layer, idx) => {
          const items = byLayer.get(layer.id) ?? [];
          const total = workflows.filter((n) => n.data.layer === layer.id).length;
          return (
            <section
              key={layer.id}
              className="group flex flex-col rounded-xl border border-border bg-paper p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5"
            >
              <header className="mb-5 flex items-start justify-between">
                <span className="rounded border border-border bg-background px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-primary">
                  Layer {String(idx + 1).padStart(2, "0")}
                </span>
                <MaturityDots nodes={workflows.filter((n) => n.data.layer === layer.id)} />
              </header>

              <h2 className="font-display text-2xl text-primary">{layer.label}</h2>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                {total} workflow{total === 1 ? "" : "s"}
              </p>

              <div className="mt-5 space-y-3">
                {items.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-[11px] text-muted-foreground">
                    No workflows match this filter.
                  </p>
                ) : (
                  items.map((n) => (
                    <WorkflowCard key={n.id} node={n} onOpen={() => setSelectedId(n.id)} />
                  ))
                )}

                <button
                  onClick={() => setAddingLayer(layer.id)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3 w-3" /> Add workflow
                </button>
              </div>
            </section>
          );
        })}
      </div>

      {/* Insight footer */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary p-8 text-primary-foreground">
        <div>
          <h3 className="font-display text-xl">Portfolio at a glance</h3>
          <p className="mt-1 text-sm opacity-70">
            {stats.total} workflows mapped · {stats.auto} fully automated ·{" "}
            {stats.ai} AI-enhanced · {stats.totalSteps} steps tracked
          </p>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelectedId(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <div className="eyebrow mb-1">
                  {LAYERS.find((l) => l.id === selected.data.layer)?.label}
                </div>
                <DialogTitle className="font-display text-3xl text-primary">
                  {selected.data.label}
                </DialogTitle>
                {selected.data.description && (
                  <p className="pt-1 text-sm text-muted-foreground">{selected.data.description}</p>
                )}
              </DialogHeader>

              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                <Field label="Owner" value={selected.data.owner || "—"} />
                <Field label="Vendor / tool" value={selected.data.vendor || "—"} />
                <Field
                  label="Maturity"
                  value={MATURITY_META[selected.data.maturity ?? "current"].label}
                />
              </div>

              <div className="mt-5">
                <WorkflowStepsSection nodeId={selected.id} data={selected.data} onUpdate={updateNode} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add workflow dialog */}
      <Dialog open={!!addingLayer} onOpenChange={(v) => !v && setAddingLayer(null)}>
        <DialogContent className="max-w-md">
          {addingLayer && (
            <>
              <DialogHeader>
                <div className="eyebrow mb-1">
                  {LAYERS.find((l) => l.id === addingLayer)?.label}
                </div>
                <DialogTitle className="font-display text-2xl text-primary">
                  New workflow
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const id = addNode({
                    label: String(fd.get("label") || "Untitled workflow"),
                    kind: "workflow",
                    layer: addingLayer,
                    owner: String(fd.get("owner") || ""),
                    maturity: (fd.get("maturity") as Maturity) || "current",
                    automation: (fd.get("automation") as "manual" | "automated") || "manual",
                    execution:
                      (fd.get("execution") as "deterministic" | "ai_enhanced") || "deterministic",
                    description: String(fd.get("description") || ""),
                  });
                  setAddingLayer(null);
                  setSelectedId(id);
                }}
                className="mt-4 space-y-3"
              >
                <input
                  name="label"
                  required
                  placeholder="Workflow name"
                  className="pgmo-input"
                  autoFocus
                />
                <input name="owner" placeholder="Owner" className="pgmo-input" />
                <div className="grid grid-cols-3 gap-2">
                  <select name="maturity" defaultValue="current" className="pgmo-input">
                    <option value="current">Current</option>
                    <option value="transition">Transition</option>
                    <option value="target">Target</option>
                  </select>
                  <select name="automation" defaultValue="manual" className="pgmo-input">
                    <option value="manual">Manual</option>
                    <option value="automated">Automated</option>
                  </select>
                  <select name="execution" defaultValue="deterministic" className="pgmo-input">
                    <option value="deterministic">Deterministic</option>
                    <option value="ai_enhanced">AI-enhanced</option>
                  </select>
                </div>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="What does this workflow do?"
                  className="pgmo-input"
                />
                <button
                  type="submit"
                  className="w-full rounded-md bg-primary py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:opacity-90"
                >
                  Create workflow
                </button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-paper px-3 py-2">
      <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm">{value}</div>
    </div>
  );
}

function MaturityDots({ nodes }: { nodes: Node<PgmoNodeData>[] }) {
  const has = (m: Maturity) => nodes.some((n) => (n.data.maturity ?? "current") === m);
  const dot = (on: boolean, color: string) =>
    on ? color : "bg-muted";
  return (
    <div className="flex gap-1" title="Maturity mix in this domain">
      <span className={"h-2 w-2 rounded-full " + dot(has("current"), "bg-primary/70")} />
      <span className={"h-2 w-2 rounded-full " + dot(has("transition"), "bg-amber-500")} />
      <span className={"h-2 w-2 rounded-full " + dot(has("target"), "bg-emerald-500")} />
    </div>
  );
}

function WorkflowCard({
  node,
  onOpen,
}: {
  node: Node<PgmoNodeData>;
  onOpen: () => void;
}) {
  const data = node.data;
  const steps = data.steps ?? [];
  const maturity = data.maturity ?? "current";

  // Aggregate posture
  const isAutomated =
    steps.length > 0
      ? steps.every((s) => s.automation === "automated")
      : (data.automation ?? "manual") === "automated";
  const hasAI =
    steps.length > 0
      ? steps.some((s) => s.execution === "ai_enhanced")
      : (data.execution ?? "deterministic") === "ai_enhanced";
  const hasManual =
    steps.length > 0
      ? steps.some((s) => s.automation === "manual")
      : (data.automation ?? "manual") === "manual";

  return (
    <button
      onClick={onOpen}
      className="w-full rounded-lg border border-dashed border-border bg-background p-3 text-left transition-all hover:border-primary/60 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <WorkflowIcon className="h-3.5 w-3.5 shrink-0 text-primary/60" />
          <span className="truncate text-sm font-semibold">{data.label}</span>
        </div>
        <span
          className={
            "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider " +
            MATURITY_BADGE[maturity]
          }
        >
          {MATURITY_META[maturity].label}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {hasAI && (
          <Pill icon={<Sparkles className="h-2.5 w-2.5" />} tone="ai">
            AI-enhanced
          </Pill>
        )}
        {isAutomated ? (
          <Pill icon={<Cog className="h-2.5 w-2.5" />} tone="auto">
            Automated
          </Pill>
        ) : hasManual ? (
          <Pill icon={<Hand className="h-2.5 w-2.5" />} tone="manual">
            Manual
          </Pill>
        ) : null}
        <Pill tone="neutral">
          {steps.length > 0 ? `${steps.length} steps` : "No steps yet"}
        </Pill>
        {data.shared && <Pill tone="enterprise">Enterprise</Pill>}
      </div>
    </button>
  );
}

function Pill({
  children,
  tone,
  icon,
}: {
  children: React.ReactNode;
  tone: "ai" | "auto" | "manual" | "neutral" | "enterprise";
  icon?: React.ReactNode;
}) {
  const cls = {
    ai: "bg-violet-50 text-violet-800 border-violet-100",
    auto: "bg-emerald-50 text-emerald-800 border-emerald-100",
    manual: "bg-orange-50 text-orange-800 border-orange-100",
    neutral: "bg-paper text-muted-foreground border-border",
    enterprise: "bg-amber-50 text-amber-900 border-amber-100",
  }[tone];
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider " +
        cls
      }
    >
      {icon}
      {children}
    </span>
  );
}
