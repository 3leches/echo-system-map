export type LayerId =
  | "front_office"
  | "middle_office"
  | "back_office"
  | "research"
  | "risk"
  | "compliance"
  | "finance"
  | "investor_relations"
  | "enterprise";

export type Lens = "workflow" | "data" | "system";

export type NodeKind = "workflow" | "data" | "system";

export type Maturity = "current" | "transition" | "target";

export type Automation = "manual" | "automated";
export type Execution = "deterministic" | "ai_enhanced";

export interface WorkflowStep {
  id: string;
  label: string;
  automation: Automation;
  execution: Execution;
  description?: string;
}

export interface PgmoNodeData {
  label: string;
  kind: NodeKind;
  layer: LayerId;
  description?: string;
  owner?: string;
  shared?: boolean; // enterprise shared resource
  maturity?: Maturity;
  initiativeIds?: string[];
  vendor?: string;
  // Workflow-only: defaults used when there are no steps, and for the node-level badge
  automation?: Automation;
  execution?: Execution;
  steps?: WorkflowStep[];
}

export interface PgmoEdgeData {
  kind: NodeKind; // workflow step, data flow, or system integration
  label?: string;
}

export type InitiativeStatus =
  | "proposed"
  | "approved"
  | "in_flight"
  | "at_risk"
  | "delivered"
  | "on_hold";

export interface Milestone {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  done: boolean;
}

export interface KPI {
  id: string;
  name: string;
  baseline: string;
  target: string;
}

/* ============================================================
 * 4 Disciplines of Execution (4DX) primitives
 * ============================================================ */

/** Wildly Important Goal — "From X to Y by When" */
export interface WIG {
  statement: string;
  from: string;
  to: string;
  deadline: string; // YYYY-MM-DD
  firmWigId?: string; // initiative WIG → firm WIG link
}

/** Weekly target/actual for a single lead measure */
export interface LeadMeasureWeek {
  weekStart: string; // YYYY-MM-DD (Monday)
  target: number;
  actual: number;
}

/** Lead measure — predictive + influenceable activity */
export interface LeadMeasure {
  id: string;
  name: string;
  unit?: string;
  weeklyTarget: number;
  weeks: LeadMeasureWeek[];
}

/** Weekly WIG session log entry */
export interface WigSession {
  id: string;
  weekStart: string;
  commitments: string;
  results: string;
  clearingPath: string;
}

/** Firm-level WIG with current lag-measure tracking */
export interface FirmWig {
  id: string;
  statement: string;
  from: string;
  to: string;
  deadline: string;
  baseline: number;
  current: number;
  target: number;
  unit?: string;
  owner?: string;
  trend?: "up" | "down" | "flat";
}

/** Standard initiative template — roadmap is computed from these */
export interface Initiative {
  id: string;
  name: string;
  vision: string;
  problem: string;
  layers: LayerId[];
  linkedNodeIds: string[];
  owner: string;
  sponsor?: string;
  status: InitiativeStatus;
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  dependencies: string[]; // other initiative ids
  kpis: KPI[];
  currentState: string;
  targetState: string;
  investment?: string;
  /** 4DX — Wildly Important Goal for this initiative */
  wig?: WIG;
  /** 4DX — Lead measures driving the WIG */
  leadMeasures?: LeadMeasure[];
  /** 4DX — Weekly WIG session log */
  wigSessions?: WigSession[];

  /* ---- PMO governance pack ---- */
  /** Executive summary / status report for the program */
  summary?: ProgramSummary;
  /** Constituent projects rolling up to this program */
  projects?: ConstituentProject[];
  /** Workstreams cutting across the program */
  workstreams?: Workstream[];
  /** Risk & issue register */
  risks?: RiskItem[];
  /** Named cross-program dependencies */
  dependencyLinks?: DependencyLink[];
  /** Key decisions taken / pending */
  decisions?: DecisionLog[];
}

/* ============================================================
 * PMO governance primitives
 * ============================================================ */

export type Rag = "green" | "amber" | "red";

export const RAG_META: Record<Rag, { label: string; tone: string; bg: string }> = {
  green: { label: "On track", tone: "oklch(0.45 0.09 155)", bg: "oklch(0.95 0.03 155)" },
  amber: { label: "Watch",    tone: "oklch(0.58 0.13 75)",  bg: "oklch(0.96 0.04 85)" },
  red:   { label: "Off track",tone: "oklch(0.52 0.18 30)",  bg: "oklch(0.95 0.04 30)" },
};

export interface ProgramSummary {
  /** Reporting period label, e.g. "Week of 24 Aug 2026" */
  period: string;
  overall: Rag;
  schedule: Rag;
  budget: Rag;
  scope: Rag;
  benefits: Rag;
  /** 2-4 sentence narrative for the steering committee */
  narrative: string;
  highlights: string[];
  lowlights: string[];
  asks: string[];
  /** % complete, 0-100 */
  percentComplete: number;
  budgetSpent?: string;
  budgetTotal?: string;
  nextGate?: { name: string; date: string };
}

export type ProjectStage = "discovery" | "design" | "build" | "test" | "deploy" | "closed";

export interface ConstituentProject {
  id: string;
  name: string;
  lead: string;
  workstreamId?: string;
  stage: ProjectStage;
  rag: Rag;
  percentComplete: number;
  startDate: string;
  endDate: string;
  budget?: string;
  spend?: string;
  note?: string;
}

export interface Workstream {
  id: string;
  name: string;
  lead: string;
  layer?: LayerId;
  objective: string;
  rag: Rag;
  headcount?: number;
}

export type RiskType = "risk" | "issue";

export interface RiskItem {
  id: string;
  type: RiskType;
  title: string;
  description?: string;
  category: string;
  owner: string;
  /** 1-5 */
  probability: number;
  /** 1-5 */
  impact: number;
  status: "open" | "mitigating" | "closed" | "escalated";
  mitigation: string;
  dueDate?: string;
  projectId?: string;
}

export type DependencyKind = "data" | "platform" | "vendor" | "resource" | "regulatory" | "decision";

export interface DependencyLink {
  id: string;
  /** initiative id this program depends on */
  onInitiativeId: string;
  kind: DependencyKind;
  description: string;
  neededBy: string;
  status: "on_track" | "at_risk" | "blocked" | "met";
}

export interface DecisionLog {
  id: string;
  title: string;
  date: string;
  decidedBy: string;
  status: "pending" | "approved" | "rejected";
  detail?: string;
}

export const STAGE_META: Record<ProjectStage, { label: string }> = {
  discovery: { label: "Discovery" },
  design: { label: "Design" },
  build: { label: "Build" },
  test: { label: "Test" },
  deploy: { label: "Deploy" },
  closed: { label: "Closed" },
};

export const DEP_STATUS_META: Record<DependencyLink["status"], { label: string; rag: Rag }> = {
  met: { label: "Met", rag: "green" },
  on_track: { label: "On track", rag: "green" },
  at_risk: { label: "At risk", rag: "amber" },
  blocked: { label: "Blocked", rag: "red" },
};


export const LAYERS: { id: LayerId; label: string; hue: string; description: string }[] = [
  { id: "front_office", label: "Front Office", hue: "oklch(0.78 0.07 90)", description: "Origination, trading, client-facing" },
  { id: "research", label: "Research", hue: "oklch(0.80 0.06 150)", description: "Investment research, models, expert networks" },
  { id: "middle_office", label: "Middle Office", hue: "oklch(0.78 0.05 130)", description: "Trade support, valuation, performance" },
  { id: "back_office", label: "Back Office", hue: "oklch(0.80 0.04 70)", description: "Settlements, custody, operations" },
  { id: "risk", label: "Risk", hue: "oklch(0.75 0.07 35)", description: "Market, credit, liquidity, operational risk" },
  { id: "compliance", label: "Compliance", hue: "oklch(0.78 0.06 250)", description: "Regulatory, surveillance, KYC/AML" },
  { id: "finance", label: "Finance", hue: "oklch(0.78 0.05 200)", description: "Accounting, treasury, FP&A" },
  { id: "investor_relations", label: "Investor Relations", hue: "oklch(0.80 0.06 320)", description: "Reporting, capital activity, communications" },
  { id: "enterprise", label: "Enterprise (shared)", hue: "oklch(0.82 0.05 60)", description: "Shared platforms, data, identity, infrastructure" },
];

export const MATURITY_META: Record<Maturity, { label: string; tone: string }> = {
  current:    { label: "Current",    tone: "oklch(0.45 0.08 145)" },
  transition: { label: "Transition", tone: "oklch(0.68 0.14 75)" },
  target:     { label: "Target",     tone: "oklch(0.60 0.10 240)" },
};

export const AUTOMATION_META: Record<Automation, { label: string; short: string; tone: string }> = {
  manual:    { label: "Manual",    short: "M", tone: "oklch(0.65 0.02 80)" },
  automated: { label: "Automated", short: "A", tone: "oklch(0.55 0.12 165)" },
};

export const EXECUTION_META: Record<Execution, { label: string; short: string; tone: string }> = {
  deterministic: { label: "Deterministic", short: "D",  tone: "oklch(0.55 0.08 230)" },
  ai_enhanced:   { label: "AI-enhanced",   short: "AI", tone: "oklch(0.58 0.16 295)" },
};

export const STATUS_META: Record<InitiativeStatus, { label: string; tone: string }> = {
  proposed:   { label: "Proposed",   tone: "oklch(0.65 0.02 80)" },
  approved:   { label: "Approved",   tone: "oklch(0.55 0.08 230)" },
  in_flight:  { label: "In flight",  tone: "oklch(0.45 0.09 155)" },
  at_risk:    { label: "At risk",    tone: "oklch(0.55 0.18 35)" },
  delivered:  { label: "Delivered",  tone: "oklch(0.4 0.06 155)" },
  on_hold:    { label: "On hold",    tone: "oklch(0.6 0.02 80)" },
};