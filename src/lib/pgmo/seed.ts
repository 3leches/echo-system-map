import type { Edge, Node } from "reactflow";
import type { PgmoNodeData, PgmoEdgeData, Initiative, LayerId } from "./types";

// Each layer occupies a horizontal swimlane. Y positions are computed
// from LAYERS order at render time, so seeds just need a layer.
type SeedNode = {
  id: string;
  x: number; // x position within swimlane
  data: PgmoNodeData;
};

export const SEED_NODES: SeedNode[] = [
  // Front office
  { id: "n_orderdesk", x: 80,  data: { label: "Order Management", kind: "system", layer: "front_office", vendor: "Charles River", owner: "Trading", maturity: "current" } },
  { id: "n_research",  x: 320, data: { label: "Research Workflow", kind: "workflow", layer: "front_office", owner: "PMs", maturity: "current" } },
  { id: "n_pms",       x: 560, data: { label: "Portfolio Mgmt", kind: "system", layer: "front_office", vendor: "Aladdin", owner: "PMs", maturity: "current" } },

  // Middle office
  { id: "n_ibor",      x: 80,  data: { label: "IBOR / ABOR", kind: "data", layer: "middle_office", owner: "Ops", maturity: "current" } },
  { id: "n_valuation", x: 320, data: { label: "Daily Valuation", kind: "workflow", layer: "middle_office", owner: "Valuations", maturity: "current" } },
  { id: "n_perf",      x: 560, data: { label: "Performance & Attribution", kind: "system", layer: "middle_office", vendor: "Eagle PACE", owner: "Performance", maturity: "current" } },

  // Back office
  { id: "n_settle",    x: 80,  data: { label: "Settlements", kind: "workflow", layer: "back_office", owner: "Ops", maturity: "current" } },
  { id: "n_recon",     x: 320, data: { label: "Reconciliation", kind: "system", layer: "back_office", vendor: "Duco", owner: "Ops", maturity: "current" } },
  { id: "n_custody",   x: 560, data: { label: "Custody Feeds", kind: "data", layer: "back_office", owner: "Ops", maturity: "current" } },

  // Risk
  { id: "n_risk_eng",  x: 80,  data: { label: "Risk Engine", kind: "system", layer: "risk", vendor: "MSCI RiskMetrics", owner: "Risk", maturity: "current" } },
  { id: "n_limits",    x: 320, data: { label: "Limits Monitoring", kind: "workflow", layer: "risk", owner: "Risk", maturity: "transition" } },

  // Compliance
  { id: "n_surv",      x: 80,  data: { label: "Trade Surveillance", kind: "system", layer: "compliance", vendor: "NICE Actimize", owner: "Compliance" } },
  { id: "n_kyc",       x: 320, data: { label: "KYC / AML", kind: "workflow", layer: "compliance", owner: "Compliance" } },

  // Finance
  { id: "n_gl",        x: 80,  data: { label: "General Ledger", kind: "system", layer: "finance", vendor: "Workday", owner: "Finance" } },
  { id: "n_treasury",  x: 320, data: { label: "Treasury & Cash", kind: "workflow", layer: "finance", owner: "Treasury" } },

  // IR
  { id: "n_ir_portal", x: 80,  data: { label: "Investor Portal", kind: "system", layer: "investor_relations", owner: "IR", maturity: "transition" } },
  { id: "n_capact",    x: 320, data: { label: "Capital Activity", kind: "workflow", layer: "investor_relations", owner: "IR" } },

  // Enterprise (shared)
  { id: "n_sec_master",x: 80,  data: { label: "Security Master", kind: "data", layer: "enterprise", owner: "Data Office", shared: true } },
  { id: "n_party",     x: 320, data: { label: "Party / Entity Master", kind: "data", layer: "enterprise", owner: "Data Office", shared: true } },
  { id: "n_dwh",       x: 560, data: { label: "Enterprise Data Platform", kind: "system", layer: "enterprise", vendor: "Snowflake", owner: "Data Office", shared: true, maturity: "transition" } },
  { id: "n_iam",       x: 800, data: { label: "Identity & Access", kind: "system", layer: "enterprise", vendor: "Okta", owner: "IT", shared: true } },
];

export const SEED_EDGES: Array<{ id: string; source: string; target: string; data: PgmoEdgeData; label?: string }> = [
  // Workflow chain
  { id: "e1", source: "n_research", target: "n_pms",       data: { kind: "workflow" }, label: "ideation" },
  { id: "e2", source: "n_pms",      target: "n_orderdesk", data: { kind: "workflow" }, label: "order" },
  { id: "e3", source: "n_orderdesk",target: "n_settle",    data: { kind: "workflow" }, label: "execution" },
  { id: "e4", source: "n_settle",   target: "n_recon",     data: { kind: "workflow" }, label: "post-trade" },

  // Data flows
  { id: "e5", source: "n_custody",  target: "n_ibor",      data: { kind: "data" } },
  { id: "e6", source: "n_ibor",     target: "n_valuation", data: { kind: "data" } },
  { id: "e7", source: "n_valuation",target: "n_perf",      data: { kind: "data" } },
  { id: "e8", source: "n_sec_master", target: "n_pms",     data: { kind: "data" }, label: "reference" },
  { id: "e9", source: "n_sec_master", target: "n_risk_eng",data: { kind: "data" } },
  { id: "e10",source: "n_party",    target: "n_kyc",       data: { kind: "data" } },
  { id: "e11",source: "n_party",    target: "n_ir_portal", data: { kind: "data" } },
  { id: "e12",source: "n_dwh",      target: "n_perf",      data: { kind: "data" } },
  { id: "e13",source: "n_dwh",      target: "n_ir_portal", data: { kind: "data" } },
  { id: "e14",source: "n_gl",       target: "n_dwh",       data: { kind: "data" } },

  // System integrations
  { id: "e15", source: "n_iam",     target: "n_orderdesk", data: { kind: "system" } },
  { id: "e16", source: "n_iam",     target: "n_ir_portal", data: { kind: "system" } },
  { id: "e17", source: "n_risk_eng",target: "n_limits",    data: { kind: "system" } },
  { id: "e18", source: "n_surv",    target: "n_orderdesk", data: { kind: "system" } },
];

export const SEED_INITIATIVES: Initiative[] = [
  {
    id: "i_edp",
    name: "Enterprise Data Platform Modernization",
    vision: "A single, governed source of investment, risk and reference data powering every desk.",
    problem: "Fragmented data marts force teams to reconcile manually; reporting is slow and inconsistent.",
    layers: ["enterprise", "middle_office", "investor_relations"],
    linkedNodeIds: ["n_dwh", "n_sec_master", "n_party", "n_perf", "n_ir_portal"],
    owner: "Head of Data",
    sponsor: "COO",
    status: "in_flight",
    startDate: "2026-01-15",
    endDate: "2026-12-20",
    milestones: [
      { id: "m1", title: "Snowflake foundation live", date: "2026-03-31", done: true },
      { id: "m2", title: "Security master migrated",  date: "2026-06-30", done: false },
      { id: "m3", title: "IR reporting on EDP",       date: "2026-10-31", done: false },
    ],
    dependencies: [],
    kpis: [
      { id: "k1", name: "Time to investor pack", baseline: "8 days", target: "1 day" },
      { id: "k2", name: "Reconciliation breaks/mo", baseline: "240", target: "<40" },
    ],
    currentState: "Three overlapping warehouses, nightly batch.",
    targetState: "Single platform, near-real-time, governed lineage.",
    investment: "$6.4M",
  },
  {
    id: "i_limits",
    name: "Real-time Pre-trade Limits",
    vision: "Trades validated against limits before execution, across all desks.",
    problem: "Limits are checked post-trade; breaches discovered hours later.",
    layers: ["risk", "front_office"],
    linkedNodeIds: ["n_risk_eng", "n_limits", "n_orderdesk"],
    owner: "CRO",
    sponsor: "CEO",
    status: "approved",
    startDate: "2026-04-01",
    endDate: "2026-11-30",
    milestones: [
      { id: "m1", title: "Limits service MVP", date: "2026-07-15", done: false },
      { id: "m2", title: "OMS integration",     date: "2026-10-15", done: false },
    ],
    dependencies: ["i_edp"],
    kpis: [
      { id: "k1", name: "Post-trade breaches", baseline: "12/mo", target: "0" },
    ],
    currentState: "Manual limit sheets, T+0 review.",
    targetState: "Sub-second pre-trade check at OMS.",
    investment: "$1.8M",
  },
  {
    id: "i_ir",
    name: "Investor Self-Service Portal",
    vision: "Investors access statements, capital activity and performance on demand.",
    problem: "IR team manually produces 600+ bespoke reports each quarter.",
    layers: ["investor_relations", "enterprise"],
    linkedNodeIds: ["n_ir_portal", "n_capact", "n_dwh", "n_iam"],
    owner: "Head of IR",
    sponsor: "CFO",
    status: "in_flight",
    startDate: "2026-02-01",
    endDate: "2027-02-28",
    milestones: [
      { id: "m1", title: "Portal MVP",          date: "2026-05-30", done: true },
      { id: "m2", title: "Statements on-demand", date: "2026-09-30", done: false },
      { id: "m3", title: "Full rollout",         date: "2027-01-31", done: false },
    ],
    dependencies: ["i_edp"],
    kpis: [
      { id: "k1", name: "Manual report hours/quarter", baseline: "1,800", target: "<200" },
    ],
    currentState: "Email + PDF distribution.",
    targetState: "Authenticated portal, real-time data.",
    investment: "$3.2M",
  },
  {
    id: "i_kyc",
    name: "KYC Refresh Automation",
    vision: "Continuous KYC powered by entity master.",
    problem: "Periodic refresh is manual and inconsistent.",
    layers: ["compliance", "enterprise"],
    linkedNodeIds: ["n_kyc", "n_party"],
    owner: "MLRO",
    status: "proposed",
    startDate: "2026-09-01",
    endDate: "2027-06-30",
    milestones: [],
    dependencies: ["i_edp"],
    kpis: [
      { id: "k1", name: "Refresh cycle time", baseline: "45 days", target: "5 days" },
    ],
    currentState: "Spreadsheets + email.",
    targetState: "Event-driven from entity master.",
    investment: "$0.9M",
  },
];

export type SeedNodeList = typeof SEED_NODES;
export type SeedEdgeList = typeof SEED_EDGES;

// Convert seed to react-flow nodes (positions computed by layer order)
export function buildInitialFlow(
  layerOrder: LayerId[],
  laneHeight: number,
  laneTop: number,
): { nodes: Node<PgmoNodeData>[]; edges: Edge<PgmoEdgeData>[] } {
  const yFor = (layer: LayerId) => {
    const idx = layerOrder.indexOf(layer);
    return laneTop + idx * laneHeight + 36;
  };
  const nodes: Node<PgmoNodeData>[] = SEED_NODES.map((n) => ({
    id: n.id,
    type: "pgmo",
    position: { x: 240 + n.x, y: yFor(n.data.layer) },
    data: n.data,
  }));
  const edges: Edge<PgmoEdgeData>[] = SEED_EDGES.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    data: e.data,
    type: "smoothstep",
    animated: false,
  }));
  return { nodes, edges };
}