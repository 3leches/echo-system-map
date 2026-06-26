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
import type {
  PgmoEdgeData,
  PgmoNodeData,
  Initiative,
  LayerId,
  Lens,
  Maturity,
  WorkflowStep,
  FirmWig,
  LeadMeasure,
  WigSession,
} from "./types";
import { LAYERS } from "./types";
import { buildInitialFlow, SEED_INITIATIVES, SEED_FIRM_WIGS } from "./seed";

export const LANE_HEIGHT = 170;
export const LANE_TOP = 24;

const layerOrder = LAYERS.map((l) => l.id);
const initial = buildInitialFlow(layerOrder, LANE_HEIGHT, LANE_TOP);

interface PgmoState {
  nodes: Node<PgmoNodeData>[];
  edges: Edge<PgmoEdgeData>[];
  initiatives: Initiative[];
  firmWigs: FirmWig[];
  /** % of capacity spent in the day-job "whirlwind" vs. WIG work (0-100) */
  whirlwindRatio: number;
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

  addStep: (nodeId: string, step?: Partial<WorkflowStep>) => void;
  updateStep: (nodeId: string, stepId: string, patch: Partial<WorkflowStep>) => void;
  deleteStep: (nodeId: string, stepId: string) => void;

  upsertInitiative: (i: Initiative) => void;
  deleteInitiative: (id: string) => void;
  linkInitiativeToNode: (initiativeId: string, nodeId: string) => void;
  unlinkInitiativeFromNode: (initiativeId: string, nodeId: string) => void;

  upsertFirmWig: (w: FirmWig) => void;
  deleteFirmWig: (id: string) => void;
  setWhirlwindRatio: (n: number) => void;
}

export const usePgmo = create<PgmoState>((set, get) => ({
  nodes: initial.nodes,
  edges: initial.edges,
  initiatives: SEED_INITIATIVES,
  firmWigs: SEED_FIRM_WIGS,
  whirlwindRatio: 72,
  lens: "workflow",
  visibleLayers: Object.fromEntries(layerOrder.map((l) => [l, true])) as Record<LayerId, boolean>,
  highlightLayer: null,
  hideDimmed: false,
  selectedNodeId: null,
  maturityFilter: null,

  setLens: (lens) => set({ lens }),
  toggleLayer: (l) =>
    set((s) => ({ visibleLayers: { ...s.visibleLayers, [l]: !s.visibleLayers[l] } })),
  setHighlight: (l) => set({ highlightLayer: l }),
  setHideDimmed: (v) => set({ hideDimmed: v }),
  setSelected: (id) => set({ selectedNodeId: id }),
  setMaturityFilter: (m) => set({ maturityFilter: m }),

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

  addStep: (nodeId, step) =>
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as PgmoNodeData;
        const newStep: WorkflowStep = {
          id: `s_${Math.random().toString(36).slice(2, 9)}`,
          label: step?.label ?? "New step",
          automation: step?.automation ?? data.automation ?? "manual",
          execution: step?.execution ?? data.execution ?? "deterministic",
          description: step?.description,
        };
        return { ...n, data: { ...data, steps: [...(data.steps ?? []), newStep] } };
      }),
    })),
  updateStep: (nodeId, stepId, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as PgmoNodeData;
        return {
          ...n,
          data: {
            ...data,
            steps: (data.steps ?? []).map((st) => (st.id === stepId ? { ...st, ...patch } : st)),
          },
        };
      }),
    })),
  deleteStep: (nodeId, stepId) =>
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as PgmoNodeData;
        return {
          ...n,
          data: { ...data, steps: (data.steps ?? []).filter((st) => st.id !== stepId) },
        };
      }),
    })),

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

  upsertFirmWig: (w) =>
    set((s) => {
      const exists = s.firmWigs.find((x) => x.id === w.id);
      return {
        firmWigs: exists ? s.firmWigs.map((x) => (x.id === w.id ? w : x)) : [...s.firmWigs, w],
      };
    }),
  deleteFirmWig: (id) => set((s) => ({ firmWigs: s.firmWigs.filter((w) => w.id !== id) })),
  setWhirlwindRatio: (n) => set({ whirlwindRatio: Math.max(0, Math.min(100, n)) }),
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
    wig: { statement: "", from: "", to: "", deadline: inSixMonths },
    leadMeasures: [],
    wigSessions: [],
  };
}

export function emptyFirmWig(): FirmWig {
  return {
    id: `fw_${Math.random().toString(36).slice(2, 9)}`,
    statement: "",
    from: "",
    to: "",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().slice(0, 10),
    baseline: 0,
    current: 0,
    target: 0,
    unit: "",
    owner: "",
    trend: "flat",
  };
}

export function emptyLeadMeasure(): LeadMeasure {
  return {
    id: `lm_${Math.random().toString(36).slice(2, 9)}`,
    name: "",
    unit: "",
    weeklyTarget: 0,
    weeks: [],
  };
}

export function emptyWigSession(): WigSession {
  const d = new Date();
  // Snap to Monday of current ISO week
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return {
    id: `ws_${Math.random().toString(36).slice(2, 9)}`,
    weekStart: d.toISOString().slice(0, 10),
    commitments: "",
    results: "",
    clearingPath: "",
  };
}