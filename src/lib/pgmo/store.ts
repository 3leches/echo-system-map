import { create } from "zustand";
import type { Edge, Node } from "reactflow";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "reactflow";
import type { PgmoEdgeData, PgmoNodeData, Initiative, LayerId, Lens, Maturity } from "./types";
import { LAYERS } from "./types";
import { buildInitialFlow, SEED_INITIATIVES } from "./seed";

export const LANE_HEIGHT = 170;
export const LANE_TOP = 24;

const layerOrder = LAYERS.map((l) => l.id);
const initial = buildInitialFlow(layerOrder, LANE_HEIGHT, LANE_TOP);

interface PgmoState {
  nodes: Node<PgmoNodeData>[];
  edges: Edge<PgmoEdgeData>[];
  initiatives: Initiative[];
  lens: Lens;
  visibleLayers: Record<LayerId, boolean>;
  highlightLayer: LayerId | null;
  hideDimmed: boolean;
  selectedNodeId: string | null;
  maturityFilter: Maturity | null;

  setLens: (l: Lens) => void;
  toggleLayer: (l: LayerId) => void;
  setHighlight: (l: LayerId | null) => void;
  setHideDimmed: (v: boolean) => void;
  setSelected: (id: string | null) => void;
  setMaturityFilter: (m: Maturity | null) => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (c: Connection) => void;

  updateNode: (id: string, patch: Partial<PgmoNodeData>) => void;
  deleteNode: (id: string) => void;
  addNode: (data: PgmoNodeData, position?: { x: number; y: number }) => string;

  upsertInitiative: (i: Initiative) => void;
  deleteInitiative: (id: string) => void;
  linkInitiativeToNode: (initiativeId: string, nodeId: string) => void;
  unlinkInitiativeFromNode: (initiativeId: string, nodeId: string) => void;
}

export const usePgmo = create<PgmoState>((set, get) => ({
  nodes: initial.nodes,
  edges: initial.edges,
  initiatives: SEED_INITIATIVES,
  lens: "workflow",
  visibleLayers: Object.fromEntries(layerOrder.map((l) => [l, true])) as Record<LayerId, boolean>,
  highlightLayer: null,
  hideDimmed: false,
  selectedNodeId: null,

  setLens: (lens) => set({ lens }),
  toggleLayer: (l) =>
    set((s) => ({ visibleLayers: { ...s.visibleLayers, [l]: !s.visibleLayers[l] } })),
  setHighlight: (l) => set({ highlightLayer: l }),
  setHideDimmed: (v) => set({ hideDimmed: v }),
  setSelected: (id) => set({ selectedNodeId: id }),

  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) as Node<PgmoNodeData>[] })),
  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) as Edge<PgmoEdgeData>[] })),
  onConnect: (c) =>
    set((s) => ({
      edges: addEdge(
        { ...c, type: "smoothstep", data: { kind: s.lens } } as Edge<PgmoEdgeData>,
        s.edges,
      ) as Edge<PgmoEdgeData>[],
    })),

  updateNode: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
    })),
  deleteNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    })),
  addNode: (data, position) => {
    const id = `n_${Math.random().toString(36).slice(2, 9)}`;
    const laneIdx = layerOrder.indexOf(data.layer);
    const pos = position ?? { x: 280, y: LANE_TOP + laneIdx * LANE_HEIGHT + 60 };
    set((s) => ({
      nodes: [...s.nodes, { id, type: "pgmo", position: pos, data }],
      selectedNodeId: id,
    }));
    return id;
  },

  upsertInitiative: (i) =>
    set((s) => {
      const exists = s.initiatives.find((x) => x.id === i.id);
      return {
        initiatives: exists
          ? s.initiatives.map((x) => (x.id === i.id ? i : x))
          : [...s.initiatives, i],
      };
    }),
  deleteInitiative: (id) =>
    set((s) => ({ initiatives: s.initiatives.filter((i) => i.id !== id) })),
  linkInitiativeToNode: (initiativeId, nodeId) =>
    set((s) => ({
      initiatives: s.initiatives.map((i) =>
        i.id === initiativeId && !i.linkedNodeIds.includes(nodeId)
          ? { ...i, linkedNodeIds: [...i.linkedNodeIds, nodeId] }
          : i,
      ),
    })),
  unlinkInitiativeFromNode: (initiativeId, nodeId) =>
    set((s) => ({
      initiatives: s.initiatives.map((i) =>
        i.id === initiativeId
          ? { ...i, linkedNodeIds: i.linkedNodeIds.filter((n) => n !== nodeId) }
          : i,
      ),
    })),
}));

export function emptyInitiative(): Initiative {
  const id = `i_${Math.random().toString(36).slice(2, 9)}`;
  const today = new Date().toISOString().slice(0, 10);
  const inSixMonths = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6)
    .toISOString()
    .slice(0, 10);
  return {
    id,
    name: "",
    vision: "",
    problem: "",
    layers: [],
    linkedNodeIds: [],
    owner: "",
    sponsor: "",
    status: "proposed",
    startDate: today,
    endDate: inSixMonths,
    milestones: [],
    dependencies: [],
    kpis: [],
    currentState: "",
    targetState: "",
    investment: "",
  };
}