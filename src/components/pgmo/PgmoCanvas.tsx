import { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type Edge,
  type EdgeTypes,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

import { LaneBackground } from "./LaneBackground";
import { PgmoNode } from "./PgmoNode";
import { LayerRail } from "./LayerRail";
import { NodeInspector } from "./NodeInspector";
import { usePgmo } from "@/lib/pgmo/store";
import type { PgmoEdgeData, Lens } from "@/lib/pgmo/types";

const nodeTypes: NodeTypes = { pgmo: PgmoNode };

const LENS_TABS: { id: Lens; label: string; sub: string }[] = [
  { id: "workflow", label: "Workflow", sub: "Process & steps" },
  { id: "data",     label: "Data",     sub: "Flows & lineage" },
  { id: "system",   label: "Systems",  sub: "Apps & integrations" },
];

export function PgmoCanvas() {
  return (
    <ReactFlowProvider>
      <Inner />
    </ReactFlowProvider>
  );
}

function Inner() {
  const nodes = usePgmo((s) => s.nodes);
  const edges = usePgmo((s) => s.edges);
  const lens = usePgmo((s) => s.lens);
  const setLens = usePgmo((s) => s.setLens);
  const visibleLayers = usePgmo((s) => s.visibleLayers);
  const highlightLayer = usePgmo((s) => s.highlightLayer);
  const hideDimmed = usePgmo((s) => s.hideDimmed);
  const setHideDimmed = usePgmo((s) => s.setHideDimmed);
  const setSelected = usePgmo((s) => s.setSelected);
  const onNodesChange = usePgmo((s) => s.onNodesChange);
  const onEdgesChange = usePgmo((s) => s.onEdgesChange);
  const onConnect = usePgmo((s) => s.onConnect);

  // Filter edges by current lens (with shared system nodes still showing)
  const styledEdges: Edge<PgmoEdgeData>[] = useMemo(() => {
    return edges.map((e) => {
      const active = e.data?.kind === lens;
      return {
        ...e,
        animated: active && e.data?.kind === "data",
        style: {
          stroke: active
            ? lens === "data"
              ? "var(--enterprise)"
              : lens === "workflow"
                ? "var(--forest)"
                : "var(--ink)"
            : "color-mix(in oklab, var(--taupe) 35%, transparent)",
          strokeWidth: active ? 1.75 : 1,
          strokeDasharray: e.data?.kind === "system" ? "4 3" : undefined,
        },
        labelBgStyle: { fill: "var(--paper)" },
        labelStyle: { fontSize: 10, fill: "var(--taupe)" },
      } as Edge<PgmoEdgeData>;
    });
  }, [edges, lens]);

  const isDimmed = useCallback(
    (n: typeof nodes[number]) => {
      return (
        (lens !== n.data.kind && !(lens === "system" && n.data.shared)) ||
        (highlightLayer !== null && highlightLayer !== n.data.layer)
      );
    },
    [lens, highlightLayer],
  );

  const filteredNodes = useMemo(() => {
    return nodes
      .filter((n) => visibleLayers[n.data.layer])
      .filter((n) => !hideDimmed || !isDimmed(n));
  }, [nodes, visibleLayers, hideDimmed, isDimmed]);

  const filteredEdges = useMemo(() => {
    const ids = new Set(filteredNodes.map((n) => n.id));
    return styledEdges.filter((e) => ids.has(e.source) && ids.has(e.target));
  }, [styledEdges, filteredNodes]);

  const handleSelect = useCallback(
    (_: unknown, node: { id: string }) => setSelected(node.id),
    [setSelected],
  );

  const edgeTypes: EdgeTypes = useMemo(() => ({}), []);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      <LayerRail />
      <div className="relative flex-1">
        {/* Lens tabs */}
        <div className="absolute left-6 top-6 z-20 flex overflow-hidden rounded-sm border border-border bg-paper shadow-sm">
          {LENS_TABS.map((tab) => {
            const active = lens === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLens(tab.id)}
                className={
                  "border-r border-border px-4 py-2 text-left transition-colors last:border-r-0 " +
                  (active ? "bg-primary text-primary-foreground" : "hover:bg-secondary")
                }
              >
                <div className="font-display text-[13px] leading-none">{tab.label}</div>
                <div
                  className={
                    "mt-1 text-[10px] uppercase tracking-wider " +
                    (active ? "text-primary-foreground/75" : "text-muted-foreground")
                  }
                >
                  {tab.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute right-6 top-6 z-20 rounded-sm border border-border bg-paper/95 px-4 py-3 text-[11px] shadow-sm">
          <div className="eyebrow mb-1.5">Legend</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <Legend glyph="◆" label="Workflow" />
            <Legend glyph="▣" label="Data" />
            <Legend glyph="●" label="System" />
            <Legend glyph="—" label="Edge = flow" />
          </div>
          <div className="mt-2 flex items-center gap-1.5 border-t border-border pt-2">
            <span className="h-2 w-2 rounded-sm bg-accent" />
            <span className="text-foreground">Enterprise / shared resource</span>
          </div>

          {/* Dim / Hide toggle */}
          <div className="mt-3 flex items-center gap-1 rounded-sm border border-border bg-paper px-1 py-1 shadow-sm">
            <button
              type="button"
              onClick={() => setHideDimmed(false)}
              className={
                "rounded-sm px-2.5 py-1 text-[11px] font-medium transition-colors " +
                (!hideDimmed ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")
              }
            >
              Dim
            </button>
            <button
              type="button"
              onClick={() => setHideDimmed(true)}
              className={
                "rounded-sm px-2.5 py-1 text-[11px] font-medium transition-colors " +
                (hideDimmed ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")
              }
            >
              Hide
            </button>
          </div>
        </div>

        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleSelect}
          onPaneClick={() => setSelected(null)}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
          minZoom={0.3}
          maxZoom={1.5}
          proOptions={{ hideAttribution: false }}
        >
          <LaneBackground />
          <Background gap={24} size={1} color="color-mix(in oklab, var(--sand) 70%, transparent)" />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            maskColor="color-mix(in oklab, var(--cream) 70%, transparent)"
            nodeColor={() => "var(--forest)"}
            style={{ background: "var(--paper)", border: "1px solid var(--sand)" }}
          />
        </ReactFlow>
      </div>
      <NodeInspector />
    </div>
  );
}

function Legend({ glyph, label }: { glyph: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-foreground">
      <span className="font-display text-primary">{glyph}</span>
      <span>{label}</span>
    </div>
  );
}