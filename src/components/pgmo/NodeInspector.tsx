import { useMemo } from "react";
import { usePgmo } from "@/lib/pgmo/store";
import { LAYERS, type PgmoNodeData, type LayerId, type NodeKind } from "@/lib/pgmo/types";
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

  if (!node) {
    return (
      <aside className="flex h-full w-[340px] shrink-0 flex-col border-l border-border bg-paper">
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
      </aside>
    );
  }

  const data = node.data as PgmoNodeData;

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-l border-border bg-paper">
      <div className="flex items-start justify-between border-b border-border px-5 py-4">
        <div>
          <div className="eyebrow">Node</div>
          <div className="mt-1 font-display text-xl leading-tight text-foreground">{data.label}</div>
        </div>
        <button
          type="button"
          onClick={() => setSelected(null)}
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
            onChange={(e) => updateNode(node.id, { label: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select
              className="pgmo-input"
              value={data.kind}
              onChange={(e) => updateNode(node.id, { kind: e.target.value as NodeKind })}
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
              onChange={(e) => updateNode(node.id, { layer: e.target.value as LayerId })}
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
              onChange={(e) => updateNode(node.id, { owner: e.target.value })}
            />
          </Field>
          <Field label="Vendor / tool">
            <input
              className="pgmo-input"
              value={data.vendor ?? ""}
              onChange={(e) => updateNode(node.id, { vendor: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Maturity">
          <div className="flex gap-1">
            {(["current", "transition", "target"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => updateNode(node.id, { maturity: m })}
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
            onChange={(e) => updateNode(node.id, { description: e.target.value })}
          />
        </Field>
        <label className="flex items-center gap-2 text-[12px] text-foreground">
          <input
            type="checkbox"
            checked={!!data.shared}
            onChange={(e) => updateNode(node.id, { shared: e.target.checked })}
          />
          Mark as enterprise / shared resource
        </label>

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
          onClick={() => deleteNode(node.id)}
          className="text-[12px] text-destructive hover:underline"
        >
          Delete node
        </button>
      </div>
    </aside>
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