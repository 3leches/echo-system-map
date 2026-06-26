// Skill catalogue — the things a PgMO agent or analyst can *do* for the firm.
// Vocabulary is PMO/hedge-fund native: initiative, WIG, lead measure, thesis,
// catalyst, coverage, MNPI lens, signal, memo, tear sheet.

import type { LucideIcon } from "lucide-react";
import {
  FileSearch, BookOpen, Bell, ShieldCheck, Mic, Layers,
  LineChart, Newspaper, Calculator, GitCompare,
} from "lucide-react";

export type OutputType =
  | "IC Memo" | "Tear Sheet" | "Signal" | "Watchlist Alert"
  | "Conviction Note" | "Pre-mortem" | "Attribution Report" | "Tracker Update"
  | "Initiative Brief" | "Status Report";

export type AssetClass = "Equities" | "Credit" | "Macro" | "Cross-asset" | "Private";

export type ComplianceLens =
  | "MNPI-safe" | "Restricted-list aware" | "Information barrier" | "Public-only sources";

export interface Skill {
  id: string;
  name: string;
  thesis: string;
  icon: LucideIcon;
  output: OutputType;
  rubric: string;
  assetClass: AssetClass[];
  coverage: string;
  inputs: string[];
  usedInPlaybooks: number;
  lens: ComplianceLens[];
  owner: string;
  version: string;
  status: "Production" | "Beta" | "Draft" | "Deprecated";
  costPer: string;
  p50: string;
  invokedVia: string[];
  tags: string[];
}

export const SKILL_OUTPUTS: OutputType[] = [
  "IC Memo", "Tear Sheet", "Signal", "Watchlist Alert",
  "Conviction Note", "Pre-mortem", "Attribution Report", "Tracker Update",
  "Initiative Brief", "Status Report",
];

export const skills: Skill[] = [
  {
    id: "sk-initiative-brief",
    name: "Initiative Briefer",
    thesis: "Draft a one-page initiative brief — problem, vision, WIG, scope, dependencies, target state — from a free-form ask.",
    icon: BookOpen, output: "Initiative Brief",
    rubric: "Completeness vs. PMO template · clarity of WIG",
    assetClass: ["Equities", "Credit", "Macro"],
    coverage: "Any new ask landing in the PgMO intake",
    inputs: ["initiatives", "workflows", "architecture"],
    usedInPlaybooks: 4,
    lens: ["MNPI-safe"],
    owner: "PgMO · M. Okafor", version: "v2.1.0",
    status: "Production", costPer: "~$0.32 / brief", p50: "14s",
    invokedVia: ["cmd-new-initiative", "cmd-brief"],
    tags: ["intake", "WIG", "PMO"],
  },
  {
    id: "sk-status-rollup",
    name: "Program Status Rollup",
    thesis: "Roll up status across in-flight initiatives — lead measure attainment, milestone slippage, at-risk flags — into a weekly readout.",
    icon: GitCompare, output: "Status Report",
    rubric: "Coverage of in-flight portfolio · variance to plan",
    assetClass: ["Equities", "Credit", "Macro", "Cross-asset", "Private"],
    coverage: "All in-flight initiatives firm-wide",
    inputs: ["initiatives", "leadMeasures", "wigSessions"],
    usedInPlaybooks: 3,
    lens: ["Information barrier"],
    owner: "PgMO · S. Iyer", version: "v1.4.0",
    status: "Production", costPer: "~$0.18 / run", p50: "8s",
    invokedVia: ["cmd-status", "cmd-weekly"],
    tags: ["status", "weekly", "WIG"],
  },
  {
    id: "sk-thesis-draft",
    name: "Thesis Drafter",
    thesis: "Compose a long/short investment thesis with bull, bear and base case from a name's filings, consensus and house view.",
    icon: BookOpen, output: "IC Memo",
    rubric: "Conviction 1–5 · catalyst clarity · downside framed",
    assetClass: ["Equities"],
    coverage: "Single-name equities under PM coverage",
    inputs: ["edgar", "refinitiv", "internal"],
    usedInPlaybooks: 4,
    lens: ["MNPI-safe", "Restricted-list aware"],
    owner: "Research Eng · M. Okafor", version: "v3.1.0",
    status: "Production", costPer: "~$0.42 / run", p50: "18s",
    invokedVia: ["cmd-thesis"],
    tags: ["memo", "long/short", "fundamental"],
  },
  {
    id: "sk-catalyst-watch",
    name: "Catalyst Watch",
    thesis: "Maintain a forward calendar of catalysts and fire alerts when conviction-shifting events land.",
    icon: Bell, output: "Watchlist Alert",
    rubric: "Materiality × surprise vs. consensus",
    assetClass: ["Equities", "Credit"],
    coverage: "All names on PM watchlists + sector coverage",
    inputs: ["edgar", "newswire", "refinitiv"],
    usedInPlaybooks: 3,
    lens: ["MNPI-safe"],
    owner: "Research Eng · S. Iyer", version: "v2.4.0",
    status: "Production", costPer: "~$0.06 / fire", p50: "3s",
    invokedVia: ["cmd-watch", "cmd-catalysts"],
    tags: ["catalyst", "alerting"],
  },
  {
    id: "sk-earnings-delta",
    name: "Earnings Call Sentiment Delta",
    thesis: "Compare management tone, guidance and Q&A defensiveness against prior 4 quarters; flag inflections.",
    icon: Mic, output: "Signal",
    rubric: "Δ-tone z-score · guidance hedging index",
    assetClass: ["Equities"],
    coverage: "S&P 1500 + EU industrials watchlist",
    inputs: ["edgar", "refinitiv"],
    usedInPlaybooks: 2,
    lens: ["MNPI-safe", "Public-only sources"],
    owner: "Quant · D. Hwang", version: "v1.6.2",
    status: "Production", costPer: "~$0.11 / call", p50: "9s",
    invokedVia: ["cmd-call"],
    tags: ["NLP", "earnings"],
  },
  {
    id: "sk-tear-sheet",
    name: "Tear Sheet Builder",
    thesis: "Generate a single-page tear sheet — multiples, ownership, sell-side dispersion, recent revisions.",
    icon: Layers, output: "Tear Sheet",
    rubric: "Completeness % · data freshness SLA",
    assetClass: ["Equities", "Credit"],
    coverage: "Any name in the firm's universe",
    inputs: ["refinitiv", "internal"],
    usedInPlaybooks: 5,
    lens: ["Public-only sources"],
    owner: "Data Eng · J. Lin", version: "v4.0.1",
    status: "Production", costPer: "~$0.04 / sheet", p50: "2s",
    invokedVia: ["cmd-sheet"],
    tags: ["tear sheet"],
  },
  {
    id: "sk-premortem",
    name: "Red-Team Pre-mortem",
    thesis: "Argue the opposite side of an open thesis or initiative — surface unknown unknowns before IC or steerco.",
    icon: ShieldCheck, output: "Pre-mortem",
    rubric: "Distinct objections · counter-evidence linked",
    assetClass: ["Equities", "Credit", "Macro"],
    coverage: "Any open thesis or initiative",
    inputs: ["internal", "newswire"],
    usedInPlaybooks: 2,
    lens: ["MNPI-safe"],
    owner: "Research · R. Klein", version: "v1.2.0",
    status: "Beta", costPer: "~$0.55 / run", p50: "22s",
    invokedVia: ["cmd-redteam"],
    tags: ["multi-agent", "risk"],
  },
  {
    id: "sk-attribution",
    name: "Post-trade Attribution",
    thesis: "Attribute realized P&L to thesis drivers, factor exposure and timing — feed back to the originating analyst.",
    icon: GitCompare, output: "Attribution Report",
    rubric: "Coverage of P&L · factor residual %",
    assetClass: ["Equities", "Cross-asset"],
    coverage: "All closed positions across firm sleeves",
    inputs: ["internal", "refinitiv"],
    usedInPlaybooks: 1,
    lens: ["Information barrier"],
    owner: "Quant · D. Hwang", version: "v2.0.0",
    status: "Production", costPer: "~$0.21 / position", p50: "7s",
    invokedVia: ["cmd-attrib"],
    tags: ["P&L", "factor"],
  },
  {
    id: "sk-house-view",
    name: "House View Sync",
    thesis: "Reconcile a new note against the firm's standing house view — flag divergence, suggest framing.",
    icon: Newspaper, output: "Conviction Note",
    rubric: "Alignment score · divergence rationale",
    assetClass: ["Macro", "Cross-asset"],
    coverage: "All published notes firm-wide",
    inputs: ["internal"],
    usedInPlaybooks: 2,
    lens: ["Information barrier"],
    owner: "CIO Office", version: "v1.0.4",
    status: "Beta", costPer: "~$0.09 / note", p50: "5s",
    invokedVia: ["cmd-houseview"],
    tags: ["governance", "macro"],
  },
  {
    id: "sk-signal-backtest",
    name: "Signal Walk-forward Backtest",
    thesis: "Walk-forward backtest of a candidate signal with realistic borrow, slippage and capacity assumptions.",
    icon: LineChart, output: "Signal",
    rubric: "Sharpe · turnover · capacity at $X",
    assetClass: ["Equities", "Cross-asset"],
    coverage: "Quant sandbox + paper sleeve",
    inputs: ["refinitiv", "internal"],
    usedInPlaybooks: 1,
    lens: ["Public-only sources"],
    owner: "Quant · D. Hwang", version: "v0.9.1",
    status: "Beta", costPer: "~$1.20 / run", p50: "42s",
    invokedVia: ["cmd-backtest"],
    tags: ["backtest"],
  },
  {
    id: "sk-model-flex",
    name: "Model Flexer",
    thesis: "Stress an analyst's working model across rev, margin and multiple scenarios — return implied IRR bands.",
    icon: Calculator, output: "Tracker Update",
    rubric: "Coverage of drivers · sensitivity completeness",
    assetClass: ["Equities", "Private"],
    coverage: "Any working DCF/LBO model",
    inputs: ["internal"],
    usedInPlaybooks: 1,
    lens: ["Information barrier"],
    owner: "Quant · L. Vance", version: "v1.3.0",
    status: "Production", costPer: "~$0.30 / scenario", p50: "12s",
    invokedVia: ["cmd-flex"],
    tags: ["model", "DCF"],
  },
  {
    id: "sk-mnpi-screen",
    name: "MNPI / Restricted-list Screen",
    thesis: "Pre-flight every outbound artifact against MNPI policy, restricted lists and information-barrier rules.",
    icon: ShieldCheck, output: "Tracker Update",
    rubric: "False-positive rate · time-to-decision",
    assetClass: ["Equities", "Credit", "Macro", "Cross-asset", "Private"],
    coverage: "Every artifact published firm-wide",
    inputs: ["internal"],
    usedInPlaybooks: 6,
    lens: ["MNPI-safe", "Restricted-list aware", "Information barrier"],
    owner: "Compliance · J. Park", version: "v5.0.0",
    status: "Production", costPer: "~$0.02 / check", p50: "0.6s",
    invokedVia: ["cmd-screen"],
    tags: ["compliance", "guardrail"],
  },
  {
    id: "sk-coverage-initiate",
    name: "Coverage Initiation Pack",
    thesis: "Bootstrap full coverage of a new name — peer set, multiples history, KPI tree, draft thesis.",
    icon: FileSearch, output: "IC Memo",
    rubric: "Conviction 1–5 · peer-set quality",
    assetClass: ["Equities", "Credit"],
    coverage: "New names being added to firm universe",
    inputs: ["edgar", "refinitiv", "internal"],
    usedInPlaybooks: 1,
    lens: ["MNPI-safe"],
    owner: "Research · R. Klein", version: "v1.0.0",
    status: "Beta", costPer: "~$0.65 / name", p50: "28s",
    invokedVia: ["cmd-initiate"],
    tags: ["coverage", "initiation"],
  },
];