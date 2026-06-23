import { Handle, Position, type NodeProps } from "reactflow";
import type { AtlasNodeData } from "@/lib/atlas/types";
import { LAYERS } from "@/lib/atlas/types";
import { useAtlas } from "@/lib/atlas/store";

const KIND_GLYPH: Record<AtlasNodeData["kind"], string> = {
  workflow: "◆",
  data: "▣",
  system: "●",
};
const KIND_LABEL: Record<AtlasNodeData["kind"], string> = {
  workflow: "Workflow",
  data: "Data",
  system: "System",
};

export function AtlasNode({ id, data, selected }: NodeProps<AtlasNodeData>) {
  const layer = LAYERS.find((l) => l.id === data.layer);
  const lens = useAtlas((s) => s.lens);
  const highlight = useAtlas((s) => s.highlightLayer);
  const initiatives = useAtlas((s) => s.initiatives);
  const linkedCount = initiatives.filter((i) => i.linkedNodeIds.includes(id)).length;

  const dim =
    (lens !== data.kind && !(lens === "system" && data.shared)) ||
    (highlight && highlight !== data.layer);

  return (
    <div
      className={
        "group relative w-[200px] rounded-sm border bg-card px-3 py-2.5 text-left shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-opacity " +
        (selected ? "border-primary " : "border-border ") +
        (dim ? "opacity-30" : "opacity-100")
      }
      style={
        data.shared
          ? { boxShadow: "inset 3px 0 0 var(--enterprise)" }
          : { boxShadow: `inset 3px 0 0 ${layer?.hue ?? "transparent"}` }
      }
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center justify-between">
        <span className="eyebrow flex items-center gap-1.5">
          <span style={{ color: data.shared ? "var(--enterprise)" : "var(--forest)" }}>
            {KIND_GLYPH[data.kind]}
          </span>
          {KIND_LABEL[data.kind]}
        </span>
        {data.shared && (
          <span className="rounded-sm bg-accent/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-accent">
            Enterprise
          </span>
        )}
      </div>
      <div className="mt-1 font-display text-[15px] leading-tight text-foreground">
        {data.label}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="truncate">{data.vendor || data.owner || "—"}</span>
        {linkedCount > 0 && (
          <span className="rounded-full bg-primary/10 px-1.5 py-px text-[9px] font-medium text-primary">
            {linkedCount} init.
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}