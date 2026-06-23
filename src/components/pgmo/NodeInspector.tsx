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

function SegChoice<T extends string>({
  value,
  options,
  onChange,
  size = "sm",
}: {
  value: T | undefined;
  options: { value: T; label: string; tone?: string }[];
  onChange: (v: T) => void;
  size?: "sm" | "xs";
}) {
  const pad = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]";
  return (
    <div className="flex gap-1">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={
              "flex flex-1 items-center justify-center gap-1 rounded-sm border transition-colors " +
              pad +
              " " +
              (active
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:text-foreground")
            }
          >
            {o.tone && (
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: o.tone }} />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function WorkflowStepsSection({
  nodeId,
  data,
  onUpdate,
}: {
  nodeId: string;
  data: PgmoNodeData;
  onUpdate: (id: string, patch: Partial<PgmoNodeData>) => void;
}) {
  const addStep = usePgmo((s) => s.addStep);
  const updateStep = usePgmo((s) => s.updateStep);
  const deleteStep = usePgmo((s) => s.deleteStep);
  const [open, setOpen] = useState(true);

  const steps = data.steps ?? [];
  const autoOpts: { value: Automation; label: string; tone: string }[] = [
    { value: "manual", label: "Manual", tone: AUTOMATION_META.manual.tone },
    { value: "automated", label: "Automated", tone: AUTOMATION_META.automated.tone },
  ];
  const execOpts: { value: Execution; label: string; tone: string }[] = [
    { value: "deterministic", label: "Deterministic", tone: EXECUTION_META.deterministic.tone },
    { value: "ai_enhanced", label: "AI-enhanced", tone: EXECUTION_META.ai_enhanced.tone },
  ];

  return (
    <div className="rounded-sm border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="eyebrow">Workflow steps</div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          {open ? "Collapse" : "Expand"}
        </button>
      </div>

      {open && (
        <div className="space-y-3 p-3">
          {/* Workflow-level defaults */}
          <div className="space-y-2 rounded-sm border border-dashed border-border bg-paper px-2.5 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Workflow defaults
            </div>
            <SegChoice
              value={data.automation ?? "manual"}
              options={autoOpts}
              onChange={(v) => onUpdate(nodeId, { automation: v })}
            />
            <SegChoice
              value={data.execution ?? "deterministic"}
              options={execOpts}
              onChange={(v) => onUpdate(nodeId, { execution: v })}
            />
          </div>

          {steps.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">
              No steps yet. Break this workflow into ordered steps to mark each one as manual or
              automated, deterministic or AI-enhanced.
            </p>
          ) : (
            <ol className="space-y-2">
              {steps.map((step, idx) => (
                <StepRow
                  key={step.id}
                  index={idx + 1}
                  step={step}
                  autoOpts={autoOpts}
                  execOpts={execOpts}
                  onChange={(patch) => updateStep(nodeId, step.id, patch)}
                  onDelete={() => deleteStep(nodeId, step.id)}
                />
              ))}
            </ol>
          )}

          <button
            type="button"
            onClick={() => addStep(nodeId)}
            className="w-full rounded-sm border border-dashed border-border px-2 py-1.5 text-[11px] text-muted-foreground hover:border-primary hover:text-primary"
          >
            + Add step
          </button>
        </div>
      )}
    </div>
  );
}

function StepRow({
  index,
  step,
  autoOpts,
  execOpts,
  onChange,
  onDelete,
}: {
  index: number;
  step: WorkflowStep;
  autoOpts: { value: Automation; label: string; tone: string }[];
  execOpts: { value: Execution; label: string; tone: string }[];
  onChange: (patch: Partial<WorkflowStep>) => void;
  onDelete: () => void;
}) {
  return (
    <li className="space-y-2 rounded-sm border border-border bg-paper px-2.5 py-2">
      <div className="flex items-start gap-2">
        <span className="mt-1 text-[10px] font-medium text-muted-foreground">{index}.</span>
        <input
          className="pgmo-input flex-1"
          value={step.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Step name"
        />
        <button
          type="button"
          onClick={onDelete}
          className="mt-1 text-[12px] text-muted-foreground hover:text-destructive"
          aria-label="Delete step"
        >
          ✕
        </button>
      </div>
      <SegChoice
        value={step.automation}
        options={autoOpts}
        onChange={(v) => onChange({ automation: v })}
        size="xs"
      />
      <SegChoice
        value={step.execution}
        options={execOpts}
        onChange={(v) => onChange({ execution: v })}
        size="xs"
      />
    </li>
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
