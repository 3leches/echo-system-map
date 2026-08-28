/**
 * Data catalog — the datasets that drive the PgMO Studio.
 *
 * This is documentation, not a runtime store. It describes every entity the UI
 * reads from today (currently seeded in-memory) so the firm can see exactly what
 * would need to be captured, owned, and refreshed to run this for real.
 */

export type DatasetDomain =
  | "Portfolio"
  | "Governance"
  | "Execution (4DX)"
  | "Architecture"
  | "Semantic"
  | "Agentic"
  | "Reference";

export type DatasetGrain = string;

export type SourceKind = "System of record" | "Manual entry" | "Derived" | "Agent-generated" | "Reference";

export type Refresh = "Real-time" | "Daily" | "Weekly" | "Monthly" | "On change" | "Ad hoc";

export interface DatasetField {
  name: string;
  type: string;
  /** PK / FK → dataset.field / enum values / required */
  key?: "pk" | "fk";
  ref?: string;
  required?: boolean;
  note?: string;
}

export interface DatasetRelation {
  /** id of the related dataset */
  to: string;
  cardinality: "1:1" | "1:N" | "N:1" | "N:N";
  via: string;
  note?: string;
}

export interface Dataset {
  id: string;
  name: string;
  /** physical/table-style name */
  table: string;
  domain: DatasetDomain;
  grain: DatasetGrain;
  purpose: string;
  owner: string;
  steward?: string;
  source: SourceKind;
  upstream?: string;
  refresh: Refresh;
  /** app surfaces that read this dataset */
  surfaces: string[];
  /** approximate row count in the current seeded prototype */
  seededRows: number;
  fields: DatasetField[];
  relations: DatasetRelation[];
  /** what breaks / degrades if this dataset is missing or stale */
  ifMissing: string;
  qualityRules?: string[];
  sensitivity: "Internal" | "Confidential" | "Restricted";
}

export const DATASET_DOMAINS: DatasetDomain[] = [
  "Portfolio",
  "Governance",
  "Execution (4DX)",
  "Architecture",
  "Semantic",
  "Agentic",
  "Reference",
];

export const datasets: Dataset[] = [
  /* ---------------- Portfolio ---------------- */
  {
    id: "initiatives",
    name: "Initiatives",
    table: "initiatives",
    domain: "Portfolio",
    grain: "One row per program / initiative",
    purpose:
      "The spine of the Studio. Every governance, execution and architecture record hangs off an initiative. Carries the standard initiative template: vision, problem, current → target state, ownership and timeline.",
    owner: "PMO Lead",
    steward: "Program Managers",
    source: "Manual entry",
    refresh: "On change",
    surfaces: ["Dashboard", "Initiatives list", "Initiative detail", "Roadmap", "Architecture canvas"],
    seededRows: 6,
    sensitivity: "Confidential",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "name", type: "text", required: true },
      { name: "vision", type: "text", required: true, note: "Why this exists, in one paragraph" },
      { name: "problem", type: "text", required: true },
      { name: "layers", type: "layer_id[]", note: "FK → layers; which parts of the firm it touches" },
      { name: "linked_node_ids", type: "text[]", key: "fk", ref: "architecture_nodes.id" },
      { name: "owner", type: "text", required: true },
      { name: "sponsor", type: "text", note: "Exec accountable at steering committee" },
      { name: "status", type: "enum", required: true, note: "proposed | approved | in_flight | at_risk | delivered | on_hold" },
      { name: "start_date", type: "date", required: true },
      { name: "end_date", type: "date", required: true },
      { name: "current_state", type: "text" },
      { name: "target_state", type: "text" },
      { name: "investment", type: "money" },
    ],
    relations: [
      { to: "program_summaries", cardinality: "1:1", via: "initiative_id" },
      { to: "constituent_projects", cardinality: "1:N", via: "initiative_id" },
      { to: "workstreams", cardinality: "1:N", via: "initiative_id" },
      { to: "milestones", cardinality: "1:N", via: "initiative_id" },
      { to: "risks", cardinality: "1:N", via: "initiative_id" },
      { to: "dependencies", cardinality: "N:N", via: "on_initiative_id" },
      { to: "kpis", cardinality: "1:N", via: "initiative_id" },
      { to: "initiative_wigs", cardinality: "1:1", via: "initiative_id" },
      { to: "architecture_nodes", cardinality: "N:N", via: "initiative_nodes" },
    ],
    ifMissing: "The entire portfolio view, roadmap and dashboard are empty. Nothing else can be attributed.",
    qualityRules: [
      "end_date must be ≥ start_date",
      "Every in_flight initiative must have an owner and a sponsor",
      "at_risk status requires at least one open risk with impact ≥ 4",
    ],
  },
  {
    id: "kpis",
    name: "Initiative KPIs",
    table: "initiative_kpis",
    domain: "Portfolio",
    grain: "One row per KPI per initiative",
    purpose: "Benefit measures attached to an initiative — the baseline and the target the business case promised.",
    owner: "Benefits Owner",
    source: "Manual entry",
    upstream: "Business case / investment committee paper",
    refresh: "Monthly",
    surfaces: ["Initiative detail", "Dashboard"],
    seededRows: 14,
    sensitivity: "Confidential",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "initiative_id", type: "text", key: "fk", ref: "initiatives.id", required: true },
      { name: "name", type: "text", required: true },
      { name: "baseline", type: "text", required: true },
      { name: "target", type: "text", required: true },
    ],
    relations: [{ to: "initiatives", cardinality: "N:1", via: "initiative_id" }],
    ifMissing: "Benefits realisation cannot be tracked; initiatives report activity but never value.",
  },
  {
    id: "milestones",
    name: "Milestones",
    table: "milestones",
    domain: "Portfolio",
    grain: "One row per milestone per initiative",
    purpose: "Dated commitments used to draw the roadmap and to drive the 'upcoming milestones' feed on the dashboard.",
    owner: "Program Managers",
    source: "Manual entry",
    upstream: "Delivery plan / Jira epics",
    refresh: "Weekly",
    surfaces: ["Roadmap", "Initiative detail", "Dashboard"],
    seededRows: 24,
    sensitivity: "Internal",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "initiative_id", type: "text", key: "fk", ref: "initiatives.id", required: true },
      { name: "title", type: "text", required: true },
      { name: "date", type: "date", required: true },
      { name: "done", type: "boolean", required: true },
      { name: "project_id", type: "text", key: "fk", ref: "constituent_projects.id", note: "Optional roll-up" },
    ],
    relations: [
      { to: "initiatives", cardinality: "N:1", via: "initiative_id" },
      { to: "constituent_projects", cardinality: "N:1", via: "project_id" },
    ],
    ifMissing: "Roadmap has bars with no interlock points; slippage becomes invisible until a gate is missed.",
    qualityRules: ["A milestone dated in the past that is not done should raise a schedule RAG flag"],
  },

  /* ---------------- Governance ---------------- */
  {
    id: "program_summaries",
    name: "Program Status Report",
    table: "program_summaries",
    domain: "Governance",
    grain: "One row per initiative per reporting period",
    purpose:
      "The executive summary the steering committee reads: RAG across schedule / budget / scope / benefits, narrative, highlights, lowlights, asks, % complete and budget burn.",
    owner: "PMO Lead",
    steward: "Program Managers",
    source: "Manual entry",
    refresh: "Weekly",
    surfaces: ["Initiative detail (Executive summary)", "Initiatives list (Portfolio strip)", "Dashboard"],
    seededRows: 4,
    sensitivity: "Confidential",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "initiative_id", type: "text", key: "fk", ref: "initiatives.id", required: true },
      { name: "period", type: "text", required: true, note: "e.g. 'Week of 24 Aug 2026'" },
      { name: "overall", type: "enum rag", required: true },
      { name: "schedule", type: "enum rag", required: true },
      { name: "budget", type: "enum rag", required: true },
      { name: "scope", type: "enum rag", required: true },
      { name: "benefits", type: "enum rag", required: true },
      { name: "narrative", type: "text", required: true, note: "2–4 sentences for the steerco" },
      { name: "highlights", type: "text[]" },
      { name: "lowlights", type: "text[]" },
      { name: "asks", type: "text[]", note: "Explicit asks of the steering committee" },
      { name: "percent_complete", type: "int 0–100", required: true },
      { name: "budget_spent", type: "money" },
      { name: "budget_total", type: "money" },
      { name: "next_gate", type: "json {name, date}" },
    ],
    relations: [{ to: "initiatives", cardinality: "1:1", via: "initiative_id" }],
    ifMissing: "No portfolio RAG roll-up. The initiatives list degrades to a name-and-status table with no executive signal.",
    qualityRules: [
      "A summary older than 14 days should be flagged stale",
      "overall = red requires at least one ask",
    ],
  },
  {
    id: "constituent_projects",
    name: "Constituent Projects",
    table: "constituent_projects",
    domain: "Governance",
    grain: "One row per project inside a program",
    purpose: "The delivery units that roll up into a program — stage, RAG, % complete, lead, budget and spend.",
    owner: "Project Leads",
    source: "System of record",
    upstream: "Jira / delivery tooling",
    refresh: "Daily",
    surfaces: ["Initiative detail (Project status table)", "Initiatives list (Portfolio strip)"],
    seededRows: 16,
    sensitivity: "Confidential",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "initiative_id", type: "text", key: "fk", ref: "initiatives.id", required: true },
      { name: "workstream_id", type: "text", key: "fk", ref: "workstreams.id" },
      { name: "name", type: "text", required: true },
      { name: "lead", type: "text", required: true },
      { name: "stage", type: "enum", required: true, note: "discovery | design | build | test | deploy | closed" },
      { name: "rag", type: "enum rag", required: true },
      { name: "percent_complete", type: "int 0–100", required: true },
      { name: "start_date", type: "date", required: true },
      { name: "end_date", type: "date", required: true },
      { name: "budget", type: "money" },
      { name: "spend", type: "money" },
      { name: "note", type: "text" },
    ],
    relations: [
      { to: "initiatives", cardinality: "N:1", via: "initiative_id" },
      { to: "workstreams", cardinality: "N:1", via: "workstream_id" },
      { to: "risks", cardinality: "1:N", via: "project_id" },
    ],
    ifMissing: "Weighted portfolio completion cannot be calculated; program % complete becomes a guess.",
    qualityRules: ["spend ≤ budget or budget RAG must be amber/red", "stage = closed implies percent_complete = 100"],
  },
  {
    id: "workstreams",
    name: "Workstreams",
    table: "workstreams",
    domain: "Governance",
    grain: "One row per workstream per program",
    purpose: "Cross-cutting delivery teams inside a program, each with an objective, lead, RAG and headcount.",
    owner: "Program Managers",
    source: "Manual entry",
    refresh: "Monthly",
    surfaces: ["Initiative detail (Workstream board)"],
    seededRows: 11,
    sensitivity: "Internal",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "initiative_id", type: "text", key: "fk", ref: "initiatives.id", required: true },
      { name: "name", type: "text", required: true },
      { name: "lead", type: "text", required: true },
      { name: "layer", type: "layer_id", key: "fk", ref: "layers.id" },
      { name: "objective", type: "text", required: true },
      { name: "rag", type: "enum rag", required: true },
      { name: "headcount", type: "int" },
    ],
    relations: [
      { to: "initiatives", cardinality: "N:1", via: "initiative_id" },
      { to: "constituent_projects", cardinality: "1:N", via: "workstream_id" },
      { to: "layers", cardinality: "N:1", via: "layer" },
    ],
    ifMissing: "Projects float free of any organising structure; capacity and headcount conversations lose their anchor.",
  },
  {
    id: "risks",
    name: "Risk & Issue Register",
    table: "risks",
    domain: "Governance",
    grain: "One row per risk or issue",
    purpose:
      "Prioritised register scored by probability × impact, with owner, mitigation and due date. Drives the 'escalated risks' KPI on the portfolio strip.",
    owner: "Program Managers",
    steward: "Risk & Compliance",
    source: "Manual entry",
    refresh: "Weekly",
    surfaces: ["Initiative detail (Risk register)", "Initiatives list (Portfolio strip)", "Dashboard"],
    seededRows: 18,
    sensitivity: "Confidential",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "initiative_id", type: "text", key: "fk", ref: "initiatives.id", required: true },
      { name: "project_id", type: "text", key: "fk", ref: "constituent_projects.id" },
      { name: "type", type: "enum", required: true, note: "risk | issue" },
      { name: "title", type: "text", required: true },
      { name: "description", type: "text" },
      { name: "category", type: "text", required: true, note: "e.g. Data, Vendor, Regulatory, Resource" },
      { name: "owner", type: "text", required: true },
      { name: "probability", type: "int 1–5", required: true },
      { name: "impact", type: "int 1–5", required: true },
      { name: "severity", type: "int (derived)", note: "probability × impact" },
      { name: "status", type: "enum", required: true, note: "open | mitigating | closed | escalated" },
      { name: "mitigation", type: "text", required: true },
      { name: "due_date", type: "date" },
    ],
    relations: [
      { to: "initiatives", cardinality: "N:1", via: "initiative_id" },
      { to: "constituent_projects", cardinality: "N:1", via: "project_id" },
    ],
    ifMissing: "The portfolio looks healthier than it is. No early warning ahead of a RAG flip.",
    qualityRules: [
      "Severity ≥ 16 must be escalated or have a dated mitigation",
      "An issue (type = issue) requires an owner and a due_date",
    ],
  },
  {
    id: "dependencies",
    name: "Dependency Matrix",
    table: "dependencies",
    domain: "Governance",
    grain: "One row per inbound dependency (initiative → initiative)",
    purpose:
      "What each program needs from another program, of what kind, by when, and whether it is on track. The interlock that makes the portfolio a system rather than a list.",
    owner: "PMO Lead",
    source: "Manual entry",
    refresh: "Weekly",
    surfaces: ["Initiative detail (Dependency matrix)", "Roadmap"],
    seededRows: 9,
    sensitivity: "Internal",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "initiative_id", type: "text", key: "fk", ref: "initiatives.id", required: true, note: "The dependent program" },
      { name: "on_initiative_id", type: "text", key: "fk", ref: "initiatives.id", required: true, note: "The program depended upon" },
      { name: "kind", type: "enum", required: true, note: "data | platform | vendor | resource | regulatory | decision" },
      { name: "description", type: "text", required: true },
      { name: "needed_by", type: "date", required: true },
      { name: "status", type: "enum", required: true, note: "on_track | at_risk | blocked | met" },
    ],
    relations: [{ to: "initiatives", cardinality: "N:N", via: "initiative_id / on_initiative_id" }],
    ifMissing: "Cross-program blockers surface only when a date is already missed. No critical-path view.",
    qualityRules: ["needed_by must fall inside the dependent initiative's date range", "No circular dependency chains"],
  },
  {
    id: "decisions",
    name: "Decision Log",
    table: "decisions",
    domain: "Governance",
    grain: "One row per decision",
    purpose: "Audit trail of steering-committee decisions taken or pending, with who decided and when.",
    owner: "PMO Lead",
    source: "Manual entry",
    upstream: "Steering committee minutes",
    refresh: "On change",
    surfaces: ["Initiative detail (Decision log)"],
    seededRows: 12,
    sensitivity: "Confidential",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "initiative_id", type: "text", key: "fk", ref: "initiatives.id", required: true },
      { name: "title", type: "text", required: true },
      { name: "date", type: "date", required: true },
      { name: "decided_by", type: "text", required: true },
      { name: "status", type: "enum", required: true, note: "pending | approved | rejected" },
      { name: "detail", type: "text" },
    ],
    relations: [{ to: "initiatives", cardinality: "N:1", via: "initiative_id" }],
    ifMissing: "Decisions get relitigated. No governance audit trail for internal audit or the regulator.",
  },

  /* ---------------- Execution (4DX) ---------------- */
  {
    id: "firm_wigs",
    name: "Firm WIGs",
    table: "firm_wigs",
    domain: "Execution (4DX)",
    grain: "One row per firm-level Wildly Important Goal",
    purpose:
      "The two or three goals the firm has agreed matter most, expressed as 'from X to Y by when', with baseline / current / target lag measures. Powers the 'Are we winning?' scoreboard.",
    owner: "Executive Committee",
    steward: "Chief of Staff",
    source: "Manual entry",
    refresh: "Weekly",
    surfaces: ["Dashboard (Scoreboard)", "Initiative detail (WIG linkage)"],
    seededRows: 3,
    sensitivity: "Confidential",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "statement", type: "text", required: true },
      { name: "from", type: "text", required: true },
      { name: "to", type: "text", required: true },
      { name: "deadline", type: "date", required: true },
      { name: "baseline", type: "numeric", required: true },
      { name: "current", type: "numeric", required: true },
      { name: "target", type: "numeric", required: true },
      { name: "unit", type: "text" },
      { name: "owner", type: "text" },
      { name: "trend", type: "enum", note: "up | down | flat" },
    ],
    relations: [{ to: "initiative_wigs", cardinality: "1:N", via: "firm_wig_id" }],
    ifMissing: "No scoreboard. Discipline 1 (focus on the wildly important) has nowhere to live.",
    qualityRules: ["No more than 3 active firm WIGs at once — that is the discipline", "current must be refreshed weekly"],
  },
  {
    id: "initiative_wigs",
    name: "Initiative WIGs",
    table: "initiative_wigs",
    domain: "Execution (4DX)",
    grain: "One row per initiative",
    purpose: "Each initiative's own WIG, linked upward to the firm WIG it serves. This is the line of sight from program work to firm outcome.",
    owner: "Program Managers",
    source: "Manual entry",
    refresh: "Monthly",
    surfaces: ["Initiative detail (WIG)", "Roadmap"],
    seededRows: 6,
    sensitivity: "Confidential",
    fields: [
      { name: "initiative_id", type: "text", key: "pk", ref: "initiatives.id", required: true },
      { name: "statement", type: "text", required: true },
      { name: "from", type: "text", required: true },
      { name: "to", type: "text", required: true },
      { name: "deadline", type: "date", required: true },
      { name: "firm_wig_id", type: "text", key: "fk", ref: "firm_wigs.id" },
    ],
    relations: [
      { to: "initiatives", cardinality: "1:1", via: "initiative_id" },
      { to: "firm_wigs", cardinality: "N:1", via: "firm_wig_id" },
      { to: "lead_measures", cardinality: "1:N", via: "initiative_id" },
    ],
    ifMissing: "Initiatives cannot be traced to a firm outcome; the portfolio becomes a spend list.",
  },
  {
    id: "lead_measures",
    name: "Lead Measures",
    table: "lead_measures",
    domain: "Execution (4DX)",
    grain: "One row per lead measure per initiative",
    purpose:
      "The predictive, influenceable activities that move the WIG — with a weekly target. Discipline 2: act on the lead measures.",
    owner: "Program Managers",
    source: "Manual entry",
    refresh: "Weekly",
    surfaces: ["Roadmap (lead measure sub-tracks)", "Initiative detail"],
    seededRows: 13,
    sensitivity: "Internal",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "initiative_id", type: "text", key: "fk", ref: "initiatives.id", required: true },
      { name: "name", type: "text", required: true },
      { name: "unit", type: "text" },
      { name: "weekly_target", type: "numeric", required: true },
    ],
    relations: [
      { to: "initiative_wigs", cardinality: "N:1", via: "initiative_id" },
      { to: "lead_measure_weeks", cardinality: "1:N", via: "lead_measure_id" },
    ],
    ifMissing: "Teams manage the lag measure — which they cannot move directly. Weekly cadence loses its subject.",
    qualityRules: ["2–3 lead measures per WIG; more than 3 dilutes focus"],
  },
  {
    id: "lead_measure_weeks",
    name: "Lead Measure — Weekly Actuals",
    table: "lead_measure_weeks",
    domain: "Execution (4DX)",
    grain: "One row per lead measure per ISO week",
    purpose: "Target vs. actual for each lead measure, week by week. This is the highest-frequency dataset in the Studio and the one that keeps the scoreboard honest.",
    owner: "Workstream Leads",
    source: "Manual entry",
    upstream: "Ideally auto-fed from delivery tooling where the measure is countable",
    refresh: "Weekly",
    surfaces: ["Roadmap (mini charts)", "Initiative detail", "Dashboard"],
    seededRows: 104,
    sensitivity: "Internal",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "lead_measure_id", type: "text", key: "fk", ref: "lead_measures.id", required: true },
      { name: "week_start", type: "date", required: true, note: "Monday of the ISO week" },
      { name: "target", type: "numeric", required: true },
      { name: "actual", type: "numeric", required: true },
    ],
    relations: [{ to: "lead_measures", cardinality: "N:1", via: "lead_measure_id" }],
    ifMissing: "The scoreboard freezes. Nobody can answer 'are we winning?' at a glance.",
    qualityRules: ["week_start must be a Monday", "Unique on (lead_measure_id, week_start)", "Missing week = treated as a miss, not as zero"],
  },
  {
    id: "wig_sessions",
    name: "WIG Session Log",
    table: "wig_sessions",
    domain: "Execution (4DX)",
    grain: "One row per initiative per week",
    purpose:
      "The weekly cadence of accountability (Discipline 4): what we committed to, what actually happened, and what we are clearing out of the path.",
    owner: "Program Managers",
    source: "Manual entry",
    refresh: "Weekly",
    surfaces: ["Dashboard (WIG session log)", "Initiative detail"],
    seededRows: 28,
    sensitivity: "Internal",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "initiative_id", type: "text", key: "fk", ref: "initiatives.id", required: true },
      { name: "week_start", type: "date", required: true },
      { name: "commitments", type: "text", required: true },
      { name: "results", type: "text", required: true },
      { name: "clearing_path", type: "text" },
    ],
    relations: [{ to: "initiatives", cardinality: "N:1", via: "initiative_id" }],
    ifMissing: "4DX collapses into a reporting exercise. No record of commitments made or kept.",
    qualityRules: ["One session per initiative per week; a gap is itself a signal"],
  },
  {
    id: "whirlwind",
    name: "Whirlwind Ratio",
    table: "capacity_whirlwind",
    domain: "Execution (4DX)",
    grain: "One row per team per week",
    purpose:
      "Share of capacity consumed by the day job versus WIG work. The single number that explains why goals slip when nothing appears to be wrong.",
    owner: "Chief of Staff",
    source: "Derived",
    upstream: "Timesheets, capacity plans, or a weekly team self-report",
    refresh: "Weekly",
    surfaces: ["Dashboard (Whirlwind tile)"],
    seededRows: 52,
    sensitivity: "Internal",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "week_start", type: "date", required: true },
      { name: "team", type: "text", note: "Null = firm-wide" },
      { name: "whirlwind_pct", type: "int 0–100", required: true },
      { name: "wig_pct", type: "int (derived)", note: "100 − whirlwind_pct" },
    ],
    relations: [{ to: "workstreams", cardinality: "N:1", via: "team" }],
    ifMissing: "Slippage gets attributed to poor execution rather than to capacity that was never there.",
  },

  /* ---------------- Architecture ---------------- */
  {
    id: "architecture_nodes",
    name: "Architecture Nodes",
    table: "architecture_nodes",
    domain: "Architecture",
    grain: "One row per workflow, dataset or system on the canvas",
    purpose:
      "Every box on the Workflows and Architecture canvases — what it is, which layer it sits in, who owns it, its vendor, its maturity, and whether it is a shared enterprise resource.",
    owner: "Enterprise Architecture",
    steward: "Domain Architects",
    source: "Manual entry",
    upstream: "CMDB / application portfolio where one exists",
    refresh: "Monthly",
    surfaces: ["Architecture canvas", "Workflows board", "Node inspector", "Initiative detail"],
    seededRows: 58,
    sensitivity: "Internal",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "label", type: "text", required: true },
      { name: "kind", type: "enum", required: true, note: "workflow | data | system" },
      { name: "layer", type: "layer_id", key: "fk", ref: "layers.id", required: true },
      { name: "description", type: "text" },
      { name: "owner", type: "text" },
      { name: "vendor", type: "text", note: "Null implies built in-house" },
      { name: "shared", type: "boolean", note: "True = enterprise shared resource" },
      { name: "maturity", type: "enum", required: true, note: "current | transition | target" },
      { name: "automation", type: "enum", note: "manual | automated (workflow nodes)" },
      { name: "execution", type: "enum", note: "deterministic | ai_enhanced (workflow nodes)" },
      { name: "position_x", type: "numeric", note: "Canvas layout" },
      { name: "position_y", type: "numeric" },
    ],
    relations: [
      { to: "architecture_edges", cardinality: "1:N", via: "source_id / target_id" },
      { to: "workflow_steps", cardinality: "1:N", via: "node_id" },
      { to: "layers", cardinality: "N:1", via: "layer" },
      { to: "initiatives", cardinality: "N:N", via: "initiative_nodes" },
    ],
    ifMissing: "No current-state landscape. Initiatives cannot be grounded in what actually exists today.",
    qualityRules: [
      "Every node must belong to exactly one layer",
      "shared = true should imply layer = enterprise or a documented exception",
      "A target-maturity node should be referenced by at least one initiative",
    ],
  },
  {
    id: "architecture_edges",
    name: "Architecture Edges",
    table: "architecture_edges",
    domain: "Architecture",
    grain: "One row per connection between two nodes",
    purpose: "Workflow sequence, data flow, and system integration — the wiring that turns a diagram of boxes into an actual landscape.",
    owner: "Enterprise Architecture",
    source: "Manual entry",
    refresh: "Monthly",
    surfaces: ["Architecture canvas", "Workflows board"],
    seededRows: 71,
    sensitivity: "Internal",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "source_id", type: "text", key: "fk", ref: "architecture_nodes.id", required: true },
      { name: "target_id", type: "text", key: "fk", ref: "architecture_nodes.id", required: true },
      { name: "kind", type: "enum", required: true, note: "workflow | data | system" },
      { name: "label", type: "text", note: "e.g. 'FIX drop copy', 'nightly batch'" },
    ],
    relations: [{ to: "architecture_nodes", cardinality: "N:1", via: "source_id / target_id" }],
    ifMissing: "Impact analysis is impossible — you cannot tell what a change to one system breaks downstream.",
    qualityRules: ["No self-referencing edges", "Edge kind should match the kind of both endpoints"],
  },
  {
    id: "workflow_steps",
    name: "Workflow Steps",
    table: "workflow_steps",
    domain: "Architecture",
    grain: "One row per step within a workflow node",
    purpose:
      "Decomposition of a workflow into steps, each tagged manual vs. automated and deterministic vs. AI-enhanced. This is the dataset that tells you where agentic leverage actually exists.",
    owner: "Domain Leads",
    steward: "Enterprise Architecture",
    source: "Manual entry",
    refresh: "Monthly",
    surfaces: ["Workflows board", "Node inspector"],
    seededRows: 96,
    sensitivity: "Internal",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "node_id", type: "text", key: "fk", ref: "architecture_nodes.id", required: true },
      { name: "label", type: "text", required: true },
      { name: "sequence", type: "int", note: "Order within the workflow" },
      { name: "automation", type: "enum", required: true, note: "manual | automated" },
      { name: "execution", type: "enum", required: true, note: "deterministic | ai_enhanced" },
      { name: "description", type: "text" },
    ],
    relations: [{ to: "architecture_nodes", cardinality: "N:1", via: "node_id" }],
    ifMissing: "Automation opportunity is assessed at whole-workflow granularity, which is too coarse to act on.",
    qualityRules: ["A step marked ai_enhanced should name the skill that performs it"],
  },
  {
    id: "initiative_nodes",
    name: "Initiative ↔ Node Links",
    table: "initiative_nodes",
    domain: "Architecture",
    grain: "One row per initiative-to-node link",
    purpose:
      "The join that makes everything interconnected: which parts of the landscape each initiative changes. Drives canvas highlighting and current → target traceability.",
    owner: "Enterprise Architecture",
    source: "Manual entry",
    refresh: "On change",
    surfaces: ["Architecture canvas (highlighting)", "Initiative detail", "Node inspector"],
    seededRows: 34,
    sensitivity: "Internal",
    fields: [
      { name: "initiative_id", type: "text", key: "fk", ref: "initiatives.id", required: true },
      { name: "node_id", type: "text", key: "fk", ref: "architecture_nodes.id", required: true },
      { name: "change_type", type: "enum", note: "create | modify | retire | consume" },
    ],
    relations: [
      { to: "initiatives", cardinality: "N:1", via: "initiative_id" },
      { to: "architecture_nodes", cardinality: "N:1", via: "node_id" },
    ],
    ifMissing: "The portfolio and the architecture become two disconnected pictures — the exact failure this Studio exists to prevent.",
  },

  /* ---------------- Semantic ---------------- */
  {
    id: "glossary_terms",
    name: "Business Terminology",
    table: "glossary_terms",
    domain: "Semantic",
    grain: "One row per canonical term",
    purpose:
      "The firm's shared vocabulary, with agent-facing guidance so humans and AI use the same definitions. Every generated artefact should resolve its terms here.",
    owner: "Data Governance",
    steward: "Domain Owners",
    source: "Reference",
    refresh: "Ad hoc",
    surfaces: ["Glossary", "Skills (prompt blocks)", "Program Management workstation"],
    seededRows: 42,
    sensitivity: "Internal",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "term", type: "text", required: true },
      { name: "acronym", type: "text" },
      { name: "definition", type: "text", required: true },
      { name: "domain", type: "text", key: "fk", ref: "layers.id", required: true },
      { name: "agent_guidance", type: "text", required: true, note: "How an AI should use this term" },
      { name: "synonyms", type: "text[]" },
      { name: "related", type: "text[]", key: "fk", ref: "glossary_terms.id" },
      { name: "examples", type: "text[]" },
      { name: "owner", type: "text", required: true },
      { name: "status", type: "enum", required: true, note: "Approved | Draft | Deprecated" },
      { name: "updated", type: "date", required: true },
    ],
    relations: [
      { to: "glossary_terms", cardinality: "N:N", via: "related" },
      { to: "layers", cardinality: "N:1", via: "domain" },
      { to: "skills", cardinality: "N:N", via: "prompt context" },
    ],
    ifMissing: "Agents invent definitions. Two reports on the same subject disagree and nobody can say which is right.",
    qualityRules: ["Deprecated terms must point at a replacement", "Approved terms require an owner and a review date"],
  },
  {
    id: "layers",
    name: "Organisational Layers",
    table: "layers",
    domain: "Reference",
    grain: "One row per layer of the firm",
    purpose:
      "The domain taxonomy — front office, research, middle office, back office, risk, compliance, finance, investor relations, and enterprise (shared). Nearly every other dataset joins to it.",
    owner: "COO Office",
    source: "Reference",
    refresh: "Ad hoc",
    surfaces: ["Every canvas, board and filter in the Studio"],
    seededRows: 9,
    sensitivity: "Internal",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "label", type: "text", required: true },
      { name: "description", type: "text", required: true },
      { name: "hue", type: "oklch", required: true, note: "Swimlane colour" },
      { name: "sort_order", type: "int", required: true },
    ],
    relations: [
      { to: "architecture_nodes", cardinality: "1:N", via: "layer" },
      { to: "workstreams", cardinality: "1:N", via: "layer" },
      { to: "glossary_terms", cardinality: "1:N", via: "domain" },
      { to: "initiatives", cardinality: "N:N", via: "layers[]" },
    ],
    ifMissing: "No swimlanes, no filtering, no way to ask 'what does this mean for the middle office?'",
    qualityRules: ["Changing a layer id is a breaking change — it cascades across every dataset"],
  },

  /* ---------------- Agentic ---------------- */
  {
    id: "skills",
    name: "Agent Skills",
    table: "skills",
    domain: "Agentic",
    grain: "One row per agent capability",
    purpose:
      "The catalog of what agents can do — thesis, required inputs, output artefact, and compliance lens. The supply side of automation.",
    owner: "Head of AI Engineering",
    steward: "Compliance (review)",
    source: "Reference",
    refresh: "On change",
    surfaces: ["Skills catalog", "Commands catalog", "Program Management workstation"],
    seededRows: 14,
    sensitivity: "Internal",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "name", type: "text", required: true },
      { name: "thesis", type: "text", required: true, note: "What it is for, in one line" },
      { name: "inputs", type: "text[]", required: true },
      { name: "output_type", type: "text", required: true, note: "Memo, table, alert, brief…" },
      { name: "compliance_lens", type: "text", required: true },
      { name: "datasets_used", type: "text[]", key: "fk", ref: "datasets.id", note: "Which datasets it reads" },
      { name: "status", type: "enum", note: "Live | Beta | Draft" },
    ],
    relations: [
      { to: "commands", cardinality: "1:N", via: "skill_id" },
      { to: "glossary_terms", cardinality: "N:N", via: "prompt context" },
    ],
    ifMissing: "Agent capability becomes tribal knowledge; nobody knows what already exists before building it again.",
    qualityRules: ["Every live skill must declare a compliance lens and the datasets it reads"],
  },
  {
    id: "commands",
    name: "Commands & Triggers",
    table: "commands",
    domain: "Agentic",
    grain: "One row per trigger bound to a skill",
    purpose:
      "How skills get invoked — slash commands, watchlists, schedules, webhooks — plus usage telemetry (runs over 7 days, success rate). The demand side of automation.",
    owner: "Head of AI Engineering",
    source: "System of record",
    upstream: "Agent runtime telemetry",
    refresh: "Real-time",
    surfaces: ["Commands catalog", "Skills catalog"],
    seededRows: 18,
    sensitivity: "Internal",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "trigger", type: "text", required: true, note: "e.g. /program-status" },
      { name: "trigger_type", type: "enum", required: true, note: "slash | watchlist | schedule | webhook" },
      { name: "skill_id", type: "text", key: "fk", ref: "skills.id", required: true },
      { name: "description", type: "text", required: true },
      { name: "runs_7d", type: "int", note: "Telemetry" },
      { name: "success_rate", type: "numeric 0–1", note: "Telemetry" },
      { name: "last_run", type: "timestamp" },
    ],
    relations: [{ to: "skills", cardinality: "N:1", via: "skill_id" }],
    ifMissing: "No visibility into which automations are actually used or reliable; no basis for retiring dead ones.",
    qualityRules: ["Success rate below 0.9 over 7 days should raise a review flag"],
  },
  {
    id: "threads",
    name: "Program Management Threads",
    table: "threads",
    domain: "Agentic",
    grain: "One row per investigation thread (plus messages)",
    purpose:
      "The working record of the Program Management workstation — questions asked, agent reasoning, synthesis produced, and which programs the answer touched.",
    owner: "PMO Lead",
    source: "Agent-generated",
    refresh: "Real-time",
    surfaces: ["Program Management workstation"],
    seededRows: 8,
    sensitivity: "Confidential",
    fields: [
      { name: "id", type: "text", key: "pk", required: true },
      { name: "title", type: "text", required: true },
      { name: "scope", type: "text", note: "Programs / layers in scope" },
      { name: "tag", type: "text" },
      { name: "created_by", type: "text" },
      { name: "created_at", type: "timestamp" },
      { name: "messages", type: "json[]", note: "role, content, citations, skill_id" },
    ],
    relations: [
      { to: "skills", cardinality: "N:N", via: "messages[].skill_id" },
      { to: "initiatives", cardinality: "N:N", via: "scope" },
    ],
    ifMissing: "Analysis is not reproducible and cannot be audited — a problem the moment a decision cites it.",
    qualityRules: ["Every agent answer should carry citations back to a source dataset row"],
  },
];

export const datasetById: Record<string, Dataset> = Object.fromEntries(
  datasets.map((d) => [d.id, d]),
);

/** Datasets that reference the given dataset id via a relation */
export function inboundRelations(id: string): Dataset[] {
  return datasets.filter((d) => d.id !== id && d.relations.some((r) => r.to === id));
}
