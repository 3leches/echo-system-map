import { useMemo } from "react";
import { useAtlas } from "@/lib/atlas/store";
import { LAYERS, type AtlasNodeData, type LayerId, type NodeKind } from "@/lib/atlas/types";
import { Link } from "@tanstack/react-router";

export function NodeInspector() {
  const selectedNodeId = useAtlas((s) => s.selectedNodeId);
  const nodes = useAtlas((s) => s.nodes);
  const initiatives = useAtlas((s) => s.initiatives);
  const updateNode = useAtlas((s) => s.updateNode);
  const deleteNode = useAtlas((s) => s.deleteNode);
  const addNode = useAtlas((s) => s.addNode);
  const setSelected = useAtlas((s) => s.setSelected);

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

  const data = node.data as AtlasNodeData;

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
            className="atlas-input"
            value={data.label}
            onChange={(e) => updateNode(node.id, { label: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select
              className="atlas-input"
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
              className="atlas-input"
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
              className="atlas-input"
              value={data.owner ?? ""}
              onChange={(e) => updateNode(node.id, { owner: e.target.value })}
            />
          </Field>
          <Field label="Vendor / tool">
            <input
              className="atlas-input"
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
            className="atlas-input resize-none"
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

function AddNodeForm({ onAdd }: { onAdd: (d: AtlasNodeData) => void }) {
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
          shared: fd.get("shared") === "on",
        });
        f.reset();
      }}
      className="space-y-3"
    >
      <div className="eyebrow">Add node</div>
      <input name="label" placeholder="Name" className="atlas-input" required />
      <div className="grid grid-cols-2 gap-2">
        <select name="kind" className="atlas-input" defaultValue="system">
          <option value="workflow">Workflow</option>
          <option value="data">Data</option>
          <option value="system">System</option>
        </select>
        <select name="layer" className="atlas-input" defaultValue="front_office">
          {LAYERS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <input name="owner" placeholder="Owner (optional)" className="atlas-input" />
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