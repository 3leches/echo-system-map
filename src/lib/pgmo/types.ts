export type LayerId =
  | "front_office"
  | "middle_office"
  | "back_office"
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
}

export const LAYERS: { id: LayerId; label: string; hue: string; description: string }[] = [
  { id: "front_office", label: "Front Office", hue: "oklch(0.78 0.07 90)", description: "Origination, trading, client-facing" },
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