import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/pgmo/AppShell";
import { usePgmo } from "@/lib/pgmo/store";
import { LAYERS, STATUS_META, type Initiative, type LayerId } from "@/lib/pgmo/types";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/initiatives/$id")({
  head: () => ({
    meta: [
      { title: "Initiative — PgMO" },
      { name: "description", content: "Standard initiative template: vision, problem, layers, linked nodes, milestones, dependencies, KPIs, current and target state." },
    ],
  }),
  component: InitiativeDetail,
});

function InitiativeDetail() {
  const { id } = Route.useParams();
  const initiative = usePgmo((s) => s.initiatives.find((x) => x.id === id));
  const allInitiatives = usePgmo((s) => s.initiatives);
  const upsert = usePgmo((s) => s.upsertInitiative);
  const remove = usePgmo((s) => s.deleteInitiative);
  const nodes = usePgmo((s) => s.nodes);
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Initiative | null>(initiative ?? null);

  // Re-sync if the route id changed
  useMemo(() => setDraft(initiative ?? null), [initiative?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!initiative || !draft) {
    return (
      <AppShell>
        <div className="py-24 text-center">
          <div className="eyebrow">Not found</div>
          <p className="mt-2 text-muted-foreground">That initiative does not exist.</p>
          <Link to="/initiatives" className="mt-6 inline-block text-primary hover:underline">
            ← All initiatives
          </Link>
        </div>
      </AppShell>
    );
  }

  const set = <K extends keyof Initiative>(k: K, v: Initiative[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  const save = () => upsert(draft);
  const linkedNodes = nodes.filter((n) => draft.linkedNodeIds.includes(n.id));

  return (
    <AppShell>
      <div className="flex items-baseline justify-between border-b border-border pb-6">
        <div className="flex-1">
          <Link to="/initiatives" className="eyebrow text-muted-foreground hover:text-foreground">
            ← Initiatives
          </Link>
          <input
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={save}
            className="mt-3 w-full bg-transparent font-display text-5xl text-foreground outline-none"
            placeholder="Initiative name"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            className="rounded-sm bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-forest-deep"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Delete this initiative?")) {
                remove(draft.id);
                navigate({ to: "/initiatives" });
              }
            }}
            className="rounded-sm border border-border px-4 py-2 text-[13px] text-destructive hover:border-destructive"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-12 gap-10">
        {/* Main */}
        <div className="col-span-12 space-y-10 lg:col-span-8">
          <Section eyebrow="01 Vision">
            <textarea
              rows={2}
              value={draft.vision}
              onChange={(e) => set("vision", e.target.value)}
              onBlur={save}
              placeholder="A single sentence describing the future state this initiative serves."
              className="pgmo-input font-display text-xl leading-snug"
            />
          </Section>

          <Section eyebrow="02 Problem">
            <textarea
              rows={3}
              value={draft.problem}
              onChange={(e) => set("problem", e.target.value)}
              onBlur={save}
              placeholder="What's broken today. Who feels it."
              className="pgmo-input"
            />
          </Section>

          <div className="grid grid-cols-2 gap-6">
            <Section eyebrow="03 Current state">
              <textarea
                rows={4}
                value={draft.currentState}
                onChange={(e) => set("currentState", e.target.value)}
                onBlur={save}
                className="pgmo-input"
              />
            </Section>
            <Section eyebrow="04 Target state">
              <textarea
                rows={4}
                value={draft.targetState}
                onChange={(e) => set("targetState", e.target.value)}
                onBlur={save}
                className="pgmo-input"
              />
            </Section>
          </div>

          <Section eyebrow="05 Milestones">
            <div className="space-y-2">
              {draft.milestones.map((m, idx) => (
                <div key={m.id} className="flex items-center gap-3 rounded-sm border border-border bg-paper p-3">
                  <input
                    type="checkbox"
                    checked={m.done}
                    onChange={(e) => {
                      const next = [...draft.milestones];
                      next[idx] = { ...m, done: e.target.checked };
                      set("milestones", next);
                      save();
                    }}
                  />
                  <input
                    value={m.title}
                    onChange={(e) => {
                      const next = [...draft.milestones];
                      next[idx] = { ...m, title: e.target.value };
                      set("milestones", next);
                    }}
                    onBlur={save}
                    className="pgmo-input flex-1"
                  />
                  <input
                    type="date"
                    value={m.date}
                    onChange={(e) => {
                      const next = [...draft.milestones];
                      next[idx] = { ...m, date: e.target.value };
                      set("milestones", next);
                      save();
                    }}
                    className="pgmo-input w-44"
                  />
                  <button
                    onClick={() => {
                      set("milestones", draft.milestones.filter((x) => x.id !== m.id));
                      save();
                    }}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove milestone"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  set("milestones", [
                    ...draft.milestones,
                    { id: `m_${Math.random().toString(36).slice(2, 7)}`, title: "New milestone", date: new Date().toISOString().slice(0, 10), done: false },
                  ]);
                  save();
                }}
                className="text-[12px] text-primary hover:underline"
              >
                + Add milestone
              </button>
            </div>
          </Section>

          <Section eyebrow="06 KPIs">
            <div className="space-y-2">
              {draft.kpis.map((k, idx) => (
                <div key={k.id} className="grid grid-cols-12 items-center gap-2 rounded-sm border border-border bg-paper p-3">
                  <input
                    placeholder="Metric"
                    value={k.name}
                    onChange={(e) => {
                      const next = [...draft.kpis];
                      next[idx] = { ...k, name: e.target.value };
                      set("kpis", next);
                    }}
                    onBlur={save}
                    className="pgmo-input col-span-6"
                  />
                  <input
                    placeholder="Baseline"
                    value={k.baseline}
                    onChange={(e) => {
                      const next = [...draft.kpis];
                      next[idx] = { ...k, baseline: e.target.value };
                      set("kpis", next);
                    }}
                    onBlur={save}
                    className="pgmo-input col-span-3"
                  />
                  <input
                    placeholder="Target"
                    value={k.target}
                    onChange={(e) => {
                      const next = [...draft.kpis];
                      next[idx] = { ...k, target: e.target.value };
                      set("kpis", next);
                    }}
                    onBlur={save}
                    className="pgmo-input col-span-2"
                  />
                  <button
                    onClick={() => {
                      set("kpis", draft.kpis.filter((x) => x.id !== k.id));
                      save();
                    }}
                    className="col-span-1 text-muted-foreground hover:text-destructive"
                    aria-label="Remove KPI"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  set("kpis", [
                    ...draft.kpis,
                    { id: `k_${Math.random().toString(36).slice(2, 7)}`, name: "", baseline: "", target: "" },
                  ]);
                }}
                className="text-[12px] text-primary hover:underline"
              >
                + Add KPI
              </button>
            </div>
          </Section>
        </div>

        {/* Side */}
        <div className="col-span-12 space-y-8 lg:col-span-4">
          <SidePanel title="Status">
            <select
              value={draft.status}
              onChange={(e) => {
                set("status", e.target.value as Initiative["status"]);
                save();
              }}
              className="pgmo-input"
            >
              {Object.entries(STATUS_META).map(([k, m]) => (
                <option key={k} value={k}>
                  {m.label}
                </option>
              ))}
            </select>
          </SidePanel>

          <SidePanel title="Window">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={draft.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                onBlur={save}
                className="pgmo-input"
              />
              <input
                type="date"
                value={draft.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                onBlur={save}
                className="pgmo-input"
              />
            </div>
          </SidePanel>

          <SidePanel title="Owner / sponsor">
            <input
              placeholder="Owner"
              value={draft.owner}
              onChange={(e) => set("owner", e.target.value)}
              onBlur={save}
              className="pgmo-input mb-2"
            />
            <input
              placeholder="Sponsor"
              value={draft.sponsor ?? ""}
              onChange={(e) => set("sponsor", e.target.value)}
              onBlur={save}
              className="pgmo-input"
            />
          </SidePanel>

          <SidePanel title="Investment">
            <input
              placeholder="e.g. $2.4M"
              value={draft.investment ?? ""}
              onChange={(e) => set("investment", e.target.value)}
              onBlur={save}
              className="pgmo-input"
            />
          </SidePanel>

          <SidePanel title="Layers touched">
            <div className="flex flex-wrap gap-1.5">
              {LAYERS.map((l) => {
                const on = draft.layers.includes(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      const next = on ? draft.layers.filter((x) => x !== l.id) : [...draft.layers, l.id as LayerId];
                      set("layers", next);
                      save();
                    }}
                    className={
                      "rounded-sm border px-2 py-1 text-[11px] " +
                      (on ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground")
                    }
                    style={on ? { borderColor: "var(--forest)" } : { borderColor: l.hue }}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
          </SidePanel>

          <SidePanel title="Linked architecture nodes">
            {linkedNodes.length === 0 && (
              <p className="text-[12px] text-muted-foreground">None linked yet.</p>
            )}
            <ul className="space-y-1">
              {linkedNodes.map((n) => (
                <li key={n.id} className="flex items-center justify-between rounded-sm border border-border bg-background px-2.5 py-1.5 text-[12px]">
                  <span>{n.data.label}</span>
                  <button
                    onClick={() => {
                      set("linkedNodeIds", draft.linkedNodeIds.filter((x) => x !== n.id));
                      save();
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <select
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                set("linkedNodeIds", [...draft.linkedNodeIds, e.target.value]);
                save();
              }}
              className="pgmo-input mt-2"
            >
              <option value="">+ Link a node…</option>
              {nodes
                .filter((n) => !draft.linkedNodeIds.includes(n.id))
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.data.label} ({n.data.layer})
                  </option>
                ))}
            </select>
          </SidePanel>

          <SidePanel title="Depends on">
            <div className="space-y-1">
              {draft.dependencies.map((depId) => {
                const dep = allInitiatives.find((x) => x.id === depId);
                if (!dep) return null;
                return (
                  <div key={depId} className="flex items-center justify-between rounded-sm border border-border bg-background px-2.5 py-1.5 text-[12px]">
                    <Link to="/initiatives/$id" params={{ id: depId }} className="hover:text-primary">
                      {dep.name}
                    </Link>
                    <button
                      onClick={() => {
                        set("dependencies", draft.dependencies.filter((x) => x !== depId));
                        save();
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
            <select
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                set("dependencies", [...draft.dependencies, e.target.value]);
                save();
              }}
              className="pgmo-input mt-2"
            >
              <option value="">+ Add dependency…</option>
              {allInitiatives
                .filter((x) => x.id !== draft.id && !draft.dependencies.includes(x.id))
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
            </select>
          </SidePanel>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="eyebrow mb-2">{eyebrow}</div>
      {children}
    </section>
  );
}
function SidePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-paper p-4">
      <div className="eyebrow mb-2">{title}</div>
      {children}
    </div>
  );
}