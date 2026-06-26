import type { Edge, Node } from "reactflow";
import type { PgmoNodeData, PgmoEdgeData, Initiative, LayerId, FirmWig } from "./types";

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
  { id: "n_pms",       x: 320, data: { label: "Portfolio Mgmt", kind: "system", layer: "front_office", vendor: "Aladdin", owner: "PMs", maturity: "current" } },

  // Research
  { id: "n_research",  x: 80,  data: { label: "Idea Generation",   kind: "workflow", layer: "research", owner: "Analysts", maturity: "current", automation: "manual",    execution: "deterministic" } },
  { id: "n_thesis",    x: 320, data: { label: "Thesis Drafting",   kind: "workflow", layer: "research", owner: "Analysts", maturity: "transition", automation: "automated", execution: "ai_enhanced" } },
  { id: "n_models",    x: 560, data: { label: "Valuation Models",  kind: "system",   layer: "research", vendor: "Excel + Python", owner: "Research Eng", maturity: "current" } },
  { id: "n_expert",    x: 800, data: { label: "Expert Network Notes", kind: "data",  layer: "research", owner: "Analysts", maturity: "current" } },

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
  { id: "n_surv",      x: 80,  data: { label: "Trade Surveillance", kind: "system", layer: "compliance", vendor: "NICE Actimize", owner: "Compliance", maturity: "current" } },
  { id: "n_kyc",       x: 320, data: { label: "KYC / AML", kind: "workflow", layer: "compliance", owner: "Compliance", maturity: "current" } },

  // Finance
  { id: "n_gl",        x: 80,  data: { label: "General Ledger", kind: "system", layer: "finance", vendor: "Workday", owner: "Finance", maturity: "current" } },
  { id: "n_treasury",  x: 320, data: { label: "Treasury & Cash", kind: "workflow", layer: "finance", owner: "Treasury", maturity: "current" } },

  // IR
  { id: "n_ir_portal", x: 80,  data: { label: "Investor Portal", kind: "system", layer: "investor_relations", owner: "IR", maturity: "transition" } },
  { id: "n_capact",    x: 320, data: { label: "Capital Activity", kind: "workflow", layer: "investor_relations", owner: "IR", maturity: "current" } },

  // Enterprise (shared)
  { id: "n_sec_master",x: 80,  data: { label: "Security Master", kind: "data", layer: "enterprise", owner: "Data Office", shared: true, maturity: "current" } },
  { id: "n_party",     x: 320, data: { label: "Party / Entity Master", kind: "data", layer: "enterprise", owner: "Data Office", shared: true, maturity: "current" } },
  { id: "n_dwh",       x: 560, data: { label: "Enterprise Data Platform", kind: "system", layer: "enterprise", vendor: "Snowflake", owner: "Data Office", shared: true, maturity: "transition" } },
  { id: "n_iam",       x: 800, data: { label: "Identity & Access", kind: "system", layer: "enterprise", vendor: "Okta", owner: "IT", shared: true, maturity: "current" } },
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
    wig: {
      statement: "Reduce time-to-investor-pack from 8 days to 1 day by Dec 20, 2026.",
      from: "8 days", to: "1 day", deadline: "2026-12-20",
      firmWigId: "fw_dataops",
    },
    leadMeasures: [
      {
        id: "lm_edp_1", name: "Datasets migrated to EDP", unit: "datasets", weeklyTarget: 3,
        weeks: buildWeeks(8, 3, [2, 4, 3, 3, 5, 2, 4, 3]),
      },
      {
        id: "lm_edp_2", name: "Reconciliation rules automated", unit: "rules", weeklyTarget: 5,
        weeks: buildWeeks(8, 5, [3, 5, 4, 6, 5, 4, 6, 5]),
      },
    ],
    wigSessions: [
      { id: "ws1", weekStart: weekAgo(2), commitments: "Migrate 3 datasets; align lineage tags with IR.", results: "2 of 3 datasets migrated; lineage rollout slipped.", clearingPath: "Need infra capacity from Cloud team for the third dataset." },
      { id: "ws2", weekStart: weekAgo(1), commitments: "Finish dataset #3; pair with IR on lineage tags.", results: "Dataset #3 done; lineage tags 80% complete.", clearingPath: "Schedule joint review with IR Friday." },
    ],
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
    wig: {
      statement: "Cut post-trade limit breaches from 12/mo to 0 by Nov 30, 2026.",
      from: "12 / mo", to: "0", deadline: "2026-11-30", firmWigId: "fw_risk",
    },
    leadMeasures: [
      {
        id: "lm_lim_1", name: "Desks on pre-trade limit service", unit: "desks", weeklyTarget: 1,
        weeks: buildWeeks(8, 1, [0, 1, 1, 0, 1, 1, 2, 1]),
      },
    ],
    wigSessions: [
      { id: "ws1", weekStart: weekAgo(1), commitments: "Onboard equities desk to pilot.", results: "Equities live in shadow mode.", clearingPath: "OMS team to allocate integration window." },
    ],
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
    wig: {
      statement: "Reduce manual IR report hours from 1,800 to under 200 per quarter by Jan 31, 2027.",
      from: "1,800 hrs / Q", to: "< 200 hrs / Q", deadline: "2027-01-31", firmWigId: "fw_dataops",
    },
    leadMeasures: [
      {
        id: "lm_ir_1", name: "Investors migrated to portal", unit: "LPs", weeklyTarget: 6,
        weeks: buildWeeks(8, 6, [4, 6, 5, 7, 6, 8, 5, 7]),
      },
      {
        id: "lm_ir_2", name: "Report templates auto-generated", unit: "templates", weeklyTarget: 4,
        weeks: buildWeeks(8, 4, [2, 3, 4, 4, 5, 3, 4, 4]),
      },
    ],
    wigSessions: [],
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
    wig: {
      statement: "Shorten KYC refresh cycle from 45 days to 5 days by Jun 30, 2027.",
      from: "45 days", to: "5 days", deadline: "2027-06-30",
    },
    leadMeasures: [],
    wigSessions: [],
  },
];

export const SEED_FIRM_WIGS: FirmWig[] = [
  {
    id: "fw_dataops",
    statement: "Move the firm from 8-day to 1-day investor reporting by year-end.",
    from: "8 days", to: "1 day", deadline: "2026-12-31",
    baseline: 8, current: 5, target: 1, unit: "days", owner: "COO", trend: "down",
  },
  {
    id: "fw_risk",
    statement: "Eliminate post-trade limit breaches by Q4 2026.",
    from: "12 / mo", to: "0", deadline: "2026-11-30",
    baseline: 12, current: 4, target: 0, unit: "breaches/mo", owner: "CRO", trend: "down",
  },
  {
    id: "fw_alpha",
    statement: "Lift research idea throughput from 18 to 40 vetted theses per quarter.",
    from: "18 / Q", to: "40 / Q", deadline: "2026-12-31",
    baseline: 18, current: 27, target: 40, unit: "theses/Q", owner: "Head of Research", trend: "up",
  },
];

/* ---- helpers used by the seed only ---- */

function weekAgo(n: number): string {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day - n * 7);
  return d.toISOString().slice(0, 10);
}

function buildWeeks(count: number, target: number, actuals: number[]) {
  const weeks = [];
  for (let i = count - 1; i >= 0; i--) {
    weeks.push({
      weekStart: weekAgo(i),
      target,
      actual: actuals[count - 1 - i] ?? 0,
    });
  }
  return weeks;
}

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