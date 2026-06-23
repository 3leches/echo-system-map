import { Handle, Position, type NodeProps } from "reactflow";
import type { PgmoNodeData } from "@/lib/pgmo/types";
import { LAYERS, MATURITY_META, AUTOMATION_META, EXECUTION_META } from "@/lib/pgmo/types";
import { usePgmo } from "@/lib/pgmo/store";

const KIND_GLYPH: Record<PgmoNodeData["kind"], string> = {
  workflow: "◆",
  data: "▣",
  system: "●",
};
const KIND_LABEL: Record<PgmoNodeData["kind"], string> = {
  workflow: "Workflow",
  data: "Data",
  system: "System",
};

export function PgmoNode({ id, data, selected }: NodeProps<PgmoNodeData>) {
  const layer = LAYERS.find((l) => l.id === data.layer);
  const lens = usePgmo((s) => s.lens);
  const highlight = usePgmo((s) => s.highlightLayer);
  const maturityFilter = usePgmo((s) => s.maturityFilter);
  const initiatives = usePgmo((s) => s.initiatives);
  const linkedCount = initiatives.filter((i) => i.linkedNodeIds.includes(id)).length;

  const dim =
    (lens !== data.kind && !(lens === "system" && data.shared)) ||
    (highlight && highlight !== data.layer) ||
    (maturityFilter !== null && data.maturity !== maturityFilter);

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
      {data.kind === "workflow" && (data.automation || data.execution || (data.steps?.length ?? 0) > 0) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1 border-t border-border pt-1.5">
          {data.automation && (
            <span
              className="inline-flex items-center gap-1 rounded-sm px-1.5 py-px text-[9px] font-medium"
              style={{
                color: AUTOMATION_META[data.automation].tone,
                backgroundColor: `color-mix(in oklch, ${AUTOMATION_META[data.automation].tone} 12%, transparent)`,
              }}
              title={`Automation: ${AUTOMATION_META[data.automation].label}`}
            >
              {AUTOMATION_META[data.automation].label}
            </span>
          )}
          {data.execution && (
            <span
              className="inline-flex items-center gap-1 rounded-sm px-1.5 py-px text-[9px] font-medium"
              style={{
                color: EXECUTION_META[data.execution].tone,
                backgroundColor: `color-mix(in oklch, ${EXECUTION_META[data.execution].tone} 12%, transparent)`,
              }}
              title={`Execution: ${EXECUTION_META[data.execution].label}`}
            >
              {EXECUTION_META[data.execution].label}
            </span>
          )}
          {(data.steps?.length ?? 0) > 0 && (
            <span className="ml-auto text-[9px] font-medium text-muted-foreground">
              {data.steps!.length} step{data.steps!.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      )}
      {data.maturity && (
        <span
          className="absolute right-2 top-2 h-[7px] w-[7px] rounded-full"
          style={{ backgroundColor: MATURITY_META[data.maturity].tone }}
          title={MATURITY_META[data.maturity].label}
        />
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}