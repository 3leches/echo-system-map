import { useMemo, useState } from "react";
import { usePgmo } from "@/lib/pgmo/store";
import {
  LAYERS,
  MATURITY_META,
  AUTOMATION_META,
  EXECUTION_META,
  type PgmoNodeData,
  type LayerId,
  type NodeKind,
  type Maturity,
  type Automation,
  type Execution,
  type WorkflowStep,
} from "@/lib/pgmo/types";
import { Link } from "@tanstack/react-router";

export function NodeInspector() {
  const selectedNodeId = usePgmo((s) => s.selectedNodeId);
  const nodes = usePgmo((s) => s.nodes);
  const initiatives = usePgmo((s) => s.initiatives);
  const updateNode = usePgmo((s) => s.updateNode);
  const deleteNode = usePgmo((s) => s.deleteNode);
  const addNode = usePgmo((s) => s.addNode);
  const setSelected = usePgmo((s) => s.setSelected);

  const node = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );
  const linkedInitiatives = useMemo(
    () => initiatives.filter((i) => node && i.linkedNodeIds.includes(node.id)),
    [initiatives, node],
  );

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-l border-border bg-paper">
      <LegendPanel />
      {!node ? (
        <>
          <div className="border-b border-border px-5 py-4">
            <div className="eyebrow">Inspector</div>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
              Select a node on the canvas to edit, or add a new one below.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <AddNodeForm
              onAdd={(d) => {
                addNode(d);
              }}
            />
          </div>
        </>
      ) : (
        <NodeEditPanel
          node={node}
          data={node.data as PgmoNodeData}
          linkedInitiatives={linkedInitiatives}
          onUpdate={updateNode}
          onDelete={deleteNode}
          onClose={() => setSelected(null)}
        />
      )}
    </aside>
  );
}

function LegendPanel() {
  const hideDimmed = usePgmo((s) => s.hideDimmed);
  const setHideDimmed = usePgmo((s) => s.setHideDimmed);
  const maturityFilter = usePgmo((s) => s.maturityFilter);
  const setMaturityFilter = usePgmo((s) => s.setMaturityFilter);

  return (
    <div className="border-b border-border px-5 py-4">
      <div className="eyebrow mb-2">Legend</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <LegendItem glyph="◆" label="Workflow" />
        <LegendItem glyph="▣" label="Data" />
        <LegendItem glyph="●" label="System" />
        <LegendItem glyph="—" label="Edge = flow" />
      </div>
      <div className="mt-2 flex items-center gap-1.5 border-t border-border pt-2">
        <span className="h-2 w-2 rounded-sm bg-accent" />
        <span className="text-[11px] text-foreground">Enterprise / shared resource</span>
      </div>

      {/* Dim / Hide toggle */}
      <div className="mt-3 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setHideDimmed(false)}
          className={
            "rounded-sm border px-2.5 py-1 text-[11px] font-medium transition-colors " +
            (!hideDimmed
              ? "border-primary bg-primary/5 text-primary"
              : "border-border text-muted-foreground hover:text-foreground")
          }
        >
          Dim
        </button>
        <button
          type="button"
          onClick={() => setHideDimmed(true)}
          className={
            "rounded-sm border px-2.5 py-1 text-[11px] font-medium transition-colors " +
            (hideDimmed
              ? "border-primary bg-primary/5 text-primary"
              : "border-border text-muted-foreground hover:text-foreground")
          }
        >
          Hide
        </button>
      </div>

      {/* Maturity filter */}
      <div className="mt-3">
        <div className="eyebrow mb-1.5">Maturity</div>
        <div className="flex flex-wrap gap-1">
          {([null, "current", "transition", "target"] as (Maturity | null)[]).map((m) => {
            const active = maturityFilter === m;
            const label = m ? MATURITY_META[m].label : "All";
            const tone = m ? MATURITY_META[m].tone : undefined;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setMaturityFilter(m)}
                className={
                  "flex items-center gap-1 rounded-sm border px-2 py-1 text-[11px] font-medium transition-colors " +
                  (active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground")
                }
              >
                {tone && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tone }} />}
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LegendItem({ glyph, label }: { glyph: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-foreground">
      <span className="font-display text-primary">{glyph}</span>
      <span>{label}</span>
    </div>
  );
}

function NodeEditPanel({
  node,
  data,
  linkedInitiatives,
  onUpdate,
  onDelete,
  onClose,
}: {
  node: { id: string; data: unknown };
  data: PgmoNodeData;
  linkedInitiatives: { id: string; name: string; linkedNodeIds: string[] }[];
  onUpdate: (id: string, patch: Partial<PgmoNodeData>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-start justify-between border-b border-border px-5 py-4">
        <div>
          <div className="eyebrow">Node</div>
          <div className="mt-1 font-display text-xl leading-tight text-foreground">{data.label}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <Field label="Name">
          <input
            className="pgmo-input"
            value={data.label}
            onChange={(e) => onUpdate(node.id, { label: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select
              className="pgmo-input"
              value={data.kind}
              onChange={(e) => onUpdate(node.id, { kind: e.target.value as NodeKind })}
            >
              <option value="workflow">Workflow</option>
              <option value="data">Data</option>
              <option value="system">System</option>
            </select>
          </Field>
          <Field label="Layer">
            <select
              className="pgmo-input"
              value={data.layer}
              onChange={(e) => onUpdate(node.id, { layer: e.target.value as LayerId })}
            >
              {LAYERS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Owner">
            <input
              className="pgmo-input"
              value={data.owner ?? ""}
              onChange={(e) => onUpdate(node.id, { owner: e.target.value })}
            />
          </Field>
          <Field label="Vendor / tool">
            <input
              className="pgmo-input"
              value={data.vendor ?? ""}
              onChange={(e) => onUpdate(node.id, { vendor: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Maturity">
          <div className="flex gap-1">
            {(["current", "transition", "target"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onUpdate(node.id, { maturity: m })}
                className={
                  "flex-1 rounded-sm border px-2 py-1.5 text-[11px] capitalize " +
                  (data.maturity === m
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground")
                }
              >
                {m}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Description">
          <textarea
            rows={3}
            className="pgmo-input resize-none"
            value={data.description ?? ""}
            onChange={(e) => onUpdate(node.id, { description: e.target.value })}
          />
        </Field>
        <label className="flex items-center gap-2 text-[12px] text-foreground">
          <input
            type="checkbox"
            checked={!!data.shared}
            onChange={(e) => onUpdate(node.id, { shared: e.target.checked })}
          />
          Mark as enterprise / shared resource
        </label>

        {data.kind === "workflow" && (
          <WorkflowStepsSection nodeId={node.id} data={data} onUpdate={onUpdate} />
        )}

        <div>
          <div className="eyebrow mb-2">Linked initiatives</div>
          {linkedInitiatives.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">
              No initiatives reference this node yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {linkedInitiatives.map((i) => (
                <li key={i.id}>
                  <Link
                    to="/initiatives/$id"
                    params={{ id: i.id }}
                    className="block rounded-sm border border-border bg-background px-2.5 py-1.5 text-[12px] hover:border-primary"
                  >
                    {i.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-border px-5 py-3">
        <button
          type="button"
          onClick={() => onDelete(node.id)}
          className="text-[12px] text-destructive hover:underline"
        >
          Delete node
        </button>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="eyebrow mb-1">{label}</div>
      {children}
    </label>
  );
}

function AddNodeForm({ onAdd }: { onAdd: (d: PgmoNodeData) => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = e.currentTarget as HTMLFormElement;
        const fd = new FormData(f);
        onAdd({
          label: String(fd.get("label") || "Untitled"),
          kind: fd.get("kind") as NodeKind,
          layer: fd.get("layer") as LayerId,
          owner: String(fd.get("owner") || ""),
          vendor: String(fd.get("vendor") || ""),
          maturity: (fd.get("maturity") as Maturity) || "current",
          description: String(fd.get("description") || ""),
          shared: fd.get("shared") === "on",
        });
        f.reset();
      }}
      className="space-y-3"
    >
      <div className="eyebrow">Add node</div>
      <input name="label" placeholder="Name" className="pgmo-input" required />
      <div className="grid grid-cols-2 gap-2">
        <select name="kind" className="pgmo-input" defaultValue="system">
          <option value="workflow">Workflow</option>
          <option value="data">Data</option>
          <option value="system">System</option>
        </select>
        <select name="layer" className="pgmo-input" defaultValue="front_office">
          {LAYERS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input name="owner" placeholder="Owner (optional)" className="pgmo-input" />
        <input name="vendor" placeholder="Vendor / tool (optional)" className="pgmo-input" />
      </div>
      <Field label="Maturity">
        <div className="flex gap-1">
          {(["current", "transition", "target"] as const).map((m) => (
            <label
              key={m}
              className="flex-1 cursor-pointer rounded-sm border border-border px-2 py-1.5 text-center text-[11px] capitalize text-muted-foreground transition-colors hover:text-foreground has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary"
            >
              <input
                type="radio"
                name="maturity"
                value={m}
                defaultChecked={m === "current"}
                className="sr-only"
              />
              {m}
            </label>
          ))}
        </div>
      </Field>
      <textarea
        name="description"
        placeholder="Description (optional)"
        rows={3}
        className="pgmo-input resize-none"
      />
      <label className="flex items-center gap-2 text-[12px]">
        <input type="checkbox" name="shared" />
        Enterprise / shared
      </label>
      <button
        type="submit"
        className="w-full rounded-sm bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground hover:bg-forest-deep"
      >
        Add to canvas
      </button>
    </form>
  );
}
