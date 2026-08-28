/**
 * Illustrative row-level values for every dataset in the catalog.
 *
 * These are representative sample records — they show what a row of each table
 * actually looks like so a reader can judge grain, formats and enum values
 * without needing the live store.
 */

import type { Dataset, DatasetField } from "./datasets-mock";

const ID_PREFIX: Record<string, string> = {
  initiatives: "init",
  kpis: "kpi",
  milestones: "ms",
  program_summaries: "psr",
  constituent_projects: "prj",
  workstreams: "ws",
  risks: "risk",
  dependencies: "dep",
  decisions: "dec",
  firm_wigs: "fwig",
  initiative_wigs: "iwig",
  lead_measures: "lm",
  lead_measure_weeks: "lmw",
  wig_sessions: "wigs",
  whirlwind: "whr",
  architecture_nodes: "node",
  architecture_edges: "edge",
  workflow_steps: "step",
  initiative_nodes: "link",
  glossary_terms: "term",
  layers: "layer",
  skills: "skill",
  commands: "cmd",
  threads: "thr",
};

const INITIATIVE_IDS = ["init-edp", "init-limits", "init-kyc", "init-ibor"];
const NODE_IDS = ["node-oms", "node-pms-core", "node-edp-lake", "node-kyc-hub"];
const LAYERS = ["front_office", "middle_office", "research", "risk", "finance"];

const OWNERS = ["A. Rahman", "J. Whitfield", "M. Okonkwo", "S. Delacroix"];
const TEAMS = ["Data Engineering", "Trading Technology", "Risk Analytics", "Investor Relations"];

const ENUM_FALLBACK: Record<string, string[]> = {
  status: ["in_flight", "at_risk", "approved", "delivered"],
  rag: ["green", "amber", "red", "green"],
  overall: ["amber", "green", "red", "green"],
  schedule: ["amber", "green", "green", "red"],
  budget: ["green", "green", "amber", "green"],
  scope: ["green", "amber", "green", "green"],
  benefits: ["green", "amber", "amber", "green"],
  automation: ["manual", "automated", "automated", "manual"],
  execution: ["deterministic", "ai_enhanced", "deterministic", "ai_enhanced"],
  maturity: ["current", "transition", "target", "current"],
  stage: ["discovery", "build", "test", "deploy"],
  kind: ["workflow", "data", "system", "workflow"],
  type: ["workflow", "data", "system", "workflow"],
  trend: ["up", "flat", "down", "up"],
  trigger_type: ["slash", "schedule", "webhook", "slash"],
  change_type: ["add", "modify", "retire", "add"],
};

/** Free-text sample values keyed by field name. */
const TEXT_BANK: Record<string, string[]> = {
  name: [
    "Enterprise Data Platform",
    "Pre-trade Limits Rebuild",
    "KYC Refresh Programme",
    "IBOR Consolidation",
  ],
  title: [
    "Golden source cutover",
    "Limits engine in shadow mode",
    "Tier-1 client refresh complete",
    "Parallel run sign-off",
  ],
  label: ["Order Management", "Position Store", "Research Data Lake", "Client Onboarding"],
  term: ["Whirlwind", "Lead Measure", "IBOR", "MNPI"],
  acronym: ["WIG", "LM", "IBOR", "MNPI"],
  definition: [
    "The day-job demand that competes with goal work.",
    "A predictive, influenceable weekly measure of progress.",
    "Investment book of record used for intraday positions.",
    "Material non-public information subject to control-room handling.",
  ],
  vision: [
    "One trusted data spine the whole firm reads from.",
    "Risk limits enforced before the order leaves the desk.",
    "Client due diligence that is continuous, not episodic.",
    "A single position truth across front and middle office.",
  ],
  problem: [
    "Six reconciliations run nightly and still disagree by T+1.",
    "Limit breaches are found after execution, not before.",
    "Refresh cycles are manual and miss regulatory deadlines.",
    "Two books of record force daily manual reconciliation.",
  ],
  objective: [
    "Cut manual reconciliation effort by 60% by Q4.",
    "Zero post-trade limit breaches for two consecutive quarters.",
    "100% of tier-1 clients refreshed within SLA.",
    "Single IBOR live for all strategies.",
  ],
  statement: [
    "Move golden-source coverage from 34% to 90% by 31 Dec.",
    "Move pre-trade blocked breaches from 0% to 100% by 30 Sep.",
    "Move tier-1 refresh completion from 41% to 100% by 30 Nov.",
    "Move reconciliation breaks from 240/day to <20/day by Q2.",
  ],
  narrative: [
    "Delivery is tracking to plan; ingestion of the third source slipped one sprint.",
    "Shadow mode is stable; sign-off pending risk committee.",
    "Vendor screening throughput is below plan — mitigation in flight.",
    "Parallel run started on schedule with no material breaks.",
  ],
  description: [
    "Consumes normalised trade events and publishes positions.",
    "Rules engine evaluating exposure before order release.",
    "Curated research and market data for quant workflows.",
    "Case-managed onboarding with document capture.",
  ],
  detail: [
    "Approved at the 12 May steering committee.",
    "Deferred pending vendor security review.",
    "Escalated to the CTO for arbitration.",
    "Accepted with a six-month review point.",
  ],
  note: [
    "Owner confirmed at weekly WIG session.",
    "Refreshed from the delivery plan.",
    "Carried over from prior reporting period.",
    "Flagged for steering committee visibility.",
  ],
  owner: OWNERS,
  sponsor: ["COO", "CRO", "Head of Compliance", "CFO"],
  lead: OWNERS,
  decided_by: ["Steering Committee", "CTO", "Risk Committee", "COO"],
  created_by: OWNERS,
  team: TEAMS,
  domain: ["Portfolio", "Governance", "Architecture", "Execution"],
  category: ["Delivery", "Execution framework", "Data", "Compliance"],
  vendor: ["In-house", "Snowflake", "Bloomberg AIM", "Fenergo"],
  unit: ["%", "count", "days", "bps"],
  period: ["2026-W34", "2026-W35", "2026-W36", "2026-W37"],
  scope: ["Firm-wide", "Front office", "Middle office", "Research"],
  mitigation: [
    "Add a second ingestion squad for four sprints.",
    "Run shadow mode two weeks longer before cutover.",
    "Pre-book vendor capacity for the refresh peak.",
    "Freeze scope until the parallel run completes.",
  ],
  thesis: [
    "Summarise a program's health in the language the ExCo uses.",
    "Screen a draft for MNPI before it leaves the control room.",
    "Draft an initiative from a one-line problem statement.",
    "Explain a variance between plan and actual.",
  ],
  agent_guidance: [
    "Always cite the initiative id you drew the number from.",
    "Never infer a RAG status the PMO has not published.",
    "Prefer lead measures over lag measures when asked about progress.",
    "Use the glossary definition verbatim when defining a term.",
  ],
  trigger: ["/program-status", "/new-initiative", "weekly-wig-digest", "/risk-scan"],
  output_type: ["Markdown brief", "Structured JSON", "Slide outline", "Table"],
  compliance_lens: ["MNPI screened", "Internal only", "Restricted list aware", "No client PII"],
  from: NODE_IDS,
  to: NODE_IDS,
  source_id: NODE_IDS,
  target_id: NODE_IDS,
  node_id: NODE_IDS,
  commitments: [
    "Ship the ingestion contract for source #3.",
    "Walk the limits engine through risk committee.",
    "Clear the tier-1 screening backlog.",
    "Publish the parallel-run break report.",
  ],
  results: [
    "Done — contract signed off Thursday.",
    "Partially — one open question on latency.",
    "Done — backlog cleared to 11 cases.",
    "Missed — analyst on leave, re-committed.",
  ],
  clearing_path: [
    "Need two days of the platform team's time.",
    "Need legal sign-off on the vendor addendum.",
    "Need a decision on the T+0 exception.",
    "Need budget approval for contractor extension.",
  ],
  current_state: [
    "Six overlapping stores, nightly batch reconciliation.",
    "Post-trade limit checks only.",
    "Annual refresh run on spreadsheets.",
    "Two books of record.",
  ],
  target_state: [
    "One golden source with streaming distribution.",
    "Pre-trade enforcement at order entry.",
    "Continuous, risk-scored refresh.",
    "Single IBOR consumed by all desks.",
  ],
  baseline: ["34%", "0%", "41%", "240/day"],
  target: ["90%", "100%", "100%", "<20/day"],
};

const ARRAY_BANK: Record<string, string[][]> = {
  asks: [["Two platform engineers for Q3"], ["Risk committee slot on 14 Sep"]],
  highlights: [["Source #2 live in production"], ["Shadow mode stable for 30 days"]],
  lowlights: [["Source #3 slipped one sprint"], ["Screening throughput below plan"]],
  synonyms: [["day job", "BAU"], ["leading indicator"]],
  related: [["lead_measure", "wig"], ["scoreboard"]],
  inputs: [["initiative_id", "period"], ["draft_text"]],
  examples: [["/program-status init-edp"], ["/new-initiative \"limits\""]],
  datasets_used: [["initiatives", "program_summaries"], ["risks", "dependencies"]],
  linked_node_ids: [NODE_IDS.slice(0, 2), NODE_IDS.slice(2)],
  layers: [LAYERS.slice(0, 2), LAYERS.slice(2, 4)],
};

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function isoDate(offsetDays: number): string {
  const d = new Date(Date.UTC(2026, 7, 31));
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function enumValues(f: DatasetField, i: number): string {
  const fromNote = f.note?.includes("|")
    ? f.note
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length < 28)
    : null;
  if (fromNote && fromNote.length > 1) return pick(fromNote, i);
  return pick(ENUM_FALLBACK[f.name] ?? ["value_a", "value_b", "value_c"], i);
}

function valueFor(d: Dataset, f: DatasetField, i: number): string {
  const t = f.type.toLowerCase();

  if (f.key === "pk" || f.name === "id") {
    return `${ID_PREFIX[d.id] ?? d.id.slice(0, 4)}-${String(i + 1).padStart(3, "0")}`;
  }
  if (f.name === "initiative_id" || f.name === "on_initiative_id" || f.ref === "initiatives.id") {
    return pick(INITIATIVE_IDS, i);
  }
  if (f.key === "fk" && f.ref) {
    const target = f.ref.split(".")[0];
    if (target === "architecture_nodes") return pick(NODE_IDS, i);
    if (target === "layers") return pick(LAYERS, i);
    return `${ID_PREFIX[target] ?? target.slice(0, 4)}-${String((i % 3) + 1).padStart(3, "0")}`;
  }

  if (t.startsWith("enum")) return enumValues(f, i);
  if (t === "boolean") return pick(["true", "false", "true", "false"], i);
  if (t === "date" || t === "timestamp") {
    const base = f.name.includes("start") || f.name === "week_start" ? -90 : f.name.includes("end") ? 210 : 21;
    const v = isoDate(base + i * 14);
    return t === "timestamp" ? `${v}T09:${String(10 + i * 7).padStart(2, "0")}:00Z` : v;
  }
  if (t === "money") return pick(["$4.2M", "$1.85M", "$960k", "$2.4M"], i);
  if (t.startsWith("int 1–5")) return String((i % 5) + 1);
  if (t.startsWith("int 0–100") || t.includes("percent")) return String(35 + i * 17);
  if (t.startsWith("numeric 0–1")) return (0.72 + i * 0.06).toFixed(2);
  if (t.startsWith("int")) return String(3 + i * 4);
  if (t.startsWith("numeric")) return String(12 + i * 9);
  if (t === "oklch") return pick(["oklch(0.62 0.09 150)", "oklch(0.58 0.11 40)", "oklch(0.66 0.07 250)"], i);
  if (t === "layer_id") return pick(LAYERS, i);
  if (t.startsWith("json[")) return "[ …2 messages ]";
  if (t.startsWith("json")) return '{ "name": "Gate 2", "date": "2026-10-15" }';
  if (t.endsWith("[]")) {
    const bank = ARRAY_BANK[f.name];
    const arr = bank ? pick(bank, i) : ["item_a", "item_b"];
    return arr.join(", ");
  }

  const bank = TEXT_BANK[f.name];
  if (bank) return pick(bank, i);
  return `${f.name.replace(/_/g, " ")} ${i + 1}`;
}

export function sampleRows(d: Dataset, count = 3): Record<string, string>[] {
  const n = Math.min(count, Math.max(1, d.seededRows));
  return Array.from({ length: n }, (_, i) =>
    Object.fromEntries(d.fields.map((f) => [f.name, valueFor(d, f, i)])),
  );
}
