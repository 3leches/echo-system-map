// Business terminology used by humans, agents, and AI prompts.
// Acts as the firm's shared semantic layer so generated artefacts use
// consistent language across initiatives, skills, and commands.

export type GlossaryDomain =
  | "Front Office"
  | "Middle Office"
  | "Back Office"
  | "Research"
  | "Risk"
  | "Compliance"
  | "Finance"
  | "Investor Relations"
  | "Technology"
  | "Enterprise";

export type GlossaryStatus = "Approved" | "Draft" | "Deprecated";

export interface GlossaryTerm {
  id: string;
  term: string;
  acronym?: string;
  domain: GlossaryDomain;
  status: GlossaryStatus;
  definition: string;
  agentGuidance: string; // How an agent / LLM should use the term
  examples?: string[];
  synonyms?: string[];
  related?: string[]; // ids of related terms
  owner: string;
  updated: string; // ISO date
}

export const GLOSSARY_DOMAINS: GlossaryDomain[] = [
  "Front Office", "Middle Office", "Back Office", "Research",
  "Risk", "Compliance", "Finance", "Investor Relations",
  "Technology", "Enterprise",
];

export const glossary: GlossaryTerm[] = [
  {
    id: "wig",
    term: "Wildly Important Goal",
    acronym: "WIG",
    domain: "Enterprise",
    status: "Approved",
    definition:
      "A single, measurable outcome of the form 'From X to Y by When' that the firm or a team commits to above the whirlwind of day-to-day work.",
    agentGuidance:
      "When drafting an initiative or status update, surface the WIG verbatim. Never invent a WIG — pull from the initiative record. Always express in 'From X to Y by When' form.",
    examples: ["From 62% to 85% same-day reconciliation by Q4 2026"],
    synonyms: ["Firm-wide goal", "North-star objective"],
    related: ["lead-measure", "scoreboard"],
    owner: "PgMO",
    updated: "2026-05-12",
  },
  {
    id: "lead-measure",
    term: "Lead Measure",
    domain: "Enterprise",
    status: "Approved",
    definition:
      "A predictive, influenceable activity metric that drives progress toward a WIG. Tracked weekly.",
    agentGuidance:
      "Distinguish from lag measures. Lead measures are things the team can act on this week (calls made, reconciliations cleared); lag measures are outcomes (revenue, WIG attainment).",
    examples: ["# of break items cleared per analyst per day"],
    related: ["wig", "whirlwind"],
    owner: "PgMO",
    updated: "2026-05-12",
  },
  {
    id: "whirlwind",
    term: "Whirlwind",
    domain: "Enterprise",
    status: "Approved",
    definition:
      "The day-to-day operational work required to keep the firm running. Distinct from goal-advancing work on the WIG.",
    agentGuidance:
      "Use 'whirlwind' (not BAU, not run-the-bank) for routine operational load when summarising for executives.",
    synonyms: ["BAU", "Run-the-bank"],
    related: ["wig", "lead-measure"],
    owner: "PgMO",
    updated: "2026-05-12",
  },
  {
    id: "mnpi",
    term: "Material Non-Public Information",
    acronym: "MNPI",
    domain: "Compliance",
    status: "Approved",
    definition:
      "Information about an issuer that is both material to an investment decision and not publicly disseminated. Trading on MNPI is prohibited.",
    agentGuidance:
      "Any agent producing research or thesis output MUST run the MNPI screen before publishing. If a source is flagged, redact and notify Compliance — never paraphrase the underlying fact.",
    related: ["expert-network", "wall-crossing"],
    owner: "Compliance",
    updated: "2026-06-01",
  },
  {
    id: "wall-crossing",
    term: "Wall Crossing",
    domain: "Compliance",
    status: "Approved",
    definition:
      "Formal process by which an investor is brought 'over the wall' and given access to MNPI under a confidentiality agreement, accepting trading restrictions until the information is public.",
    agentGuidance:
      "Treat wall-crossed names as restricted: do not surface them in idea-generation prompts or unrestricted dashboards.",
    related: ["mnpi", "restricted-list"],
    owner: "Compliance",
    updated: "2026-06-01",
  },
  {
    id: "restricted-list",
    term: "Restricted List",
    domain: "Compliance",
    status: "Approved",
    definition:
      "List of securities that the firm cannot trade due to MNPI, regulatory, or policy constraints.",
    agentGuidance:
      "Cross-check any ticker mentioned in agent output against the live restricted list before producing trade ideas or thesis briefs.",
    related: ["mnpi", "wall-crossing"],
    owner: "Compliance",
    updated: "2026-06-01",
  },
  {
    id: "catalyst",
    term: "Catalyst",
    domain: "Research",
    status: "Approved",
    definition:
      "A discrete, dated event expected to re-rate a security (earnings, regulatory decision, capital action, product launch).",
    agentGuidance:
      "When summarising a thesis, list catalysts with a date and conviction (High/Medium/Low). Avoid vague catalysts ('macro recovery'); require a concrete trigger.",
    examples: ["Q3 earnings · 28 Oct · High conviction"],
    related: ["thesis", "tear-sheet"],
    owner: "Research",
    updated: "2026-04-18",
  },
  {
    id: "thesis",
    term: "Investment Thesis",
    domain: "Research",
    status: "Approved",
    definition:
      "Structured argument for a position, comprising view, variant perception, catalysts, risks, sizing, and exit.",
    agentGuidance:
      "Always produce thesis output in the firm's six-section template. Do not invent a 'variant perception' — if not provided, mark as 'TBD by analyst'.",
    related: ["catalyst", "tear-sheet"],
    owner: "Research",
    updated: "2026-04-18",
  },
  {
    id: "tear-sheet",
    term: "Tear Sheet",
    domain: "Research",
    status: "Approved",
    definition:
      "One-page company summary used by PMs for rapid review: business model, financials, valuation, key catalysts, risks.",
    agentGuidance:
      "Tear sheets are public-data only. Never include MNPI or expert-network attributions.",
    related: ["thesis", "mnpi"],
    owner: "Research",
    updated: "2026-04-18",
  },
  {
    id: "var",
    term: "Value at Risk",
    acronym: "VaR",
    domain: "Risk",
    status: "Approved",
    definition:
      "Estimated worst-case loss over a defined horizon at a defined confidence level (e.g. 1-day 99% VaR).",
    agentGuidance:
      "Always state horizon and confidence. Do not compare VaR figures across desks without normalising both.",
    related: ["stress-test", "gross-exposure"],
    owner: "Risk",
    updated: "2026-03-22",
  },
  {
    id: "stress-test",
    term: "Stress Test",
    domain: "Risk",
    status: "Approved",
    definition:
      "Scenario-based revaluation of the portfolio under prescribed shocks (e.g. 2008 replay, rates +200bps).",
    agentGuidance:
      "Stress tests are scenario-based, not statistical. Distinguish clearly from VaR in agent output.",
    related: ["var"],
    owner: "Risk",
    updated: "2026-03-22",
  },
  {
    id: "gross-exposure",
    term: "Gross Exposure",
    domain: "Risk",
    status: "Approved",
    definition: "Sum of absolute values of long and short positions, expressed as % of NAV.",
    agentGuidance: "Pair with net exposure when summarising book risk; one without the other is misleading.",
    related: ["var"],
    owner: "Risk",
    updated: "2026-03-22",
  },
  {
    id: "t+1",
    term: "T+1 Settlement",
    domain: "Middle Office",
    status: "Approved",
    definition:
      "Trade settlement on the business day following execution. Standard for US equities since May 2024.",
    agentGuidance:
      "When discussing settlement risk or operational SLAs, default to T+1 for US/Canadian equities; T+2 elsewhere unless specified.",
    related: ["break-item"],
    owner: "Operations",
    updated: "2026-02-10",
  },
  {
    id: "break-item",
    term: "Break Item",
    domain: "Middle Office",
    status: "Approved",
    definition: "A reconciliation discrepancy between the firm's records and a counterparty or custodian.",
    agentGuidance:
      "Categorise breaks by age (T, T+1, aged) and value. Aged breaks > 5 days are escalation-worthy.",
    related: ["t+1"],
    owner: "Operations",
    updated: "2026-02-10",
  },
  {
    id: "nav",
    term: "Net Asset Value",
    acronym: "NAV",
    domain: "Finance",
    status: "Approved",
    definition: "Total assets minus liabilities, divided by units outstanding. Struck daily or monthly per fund.",
    agentGuidance:
      "Use official NAV from Fund Accounting only. Do not derive NAV from PMS positions in client-facing output.",
    related: ["aum"],
    owner: "Finance",
    updated: "2026-01-30",
  },
  {
    id: "aum",
    term: "Assets Under Management",
    acronym: "AUM",
    domain: "Finance",
    status: "Approved",
    definition: "Total market value of investments managed on behalf of clients.",
    agentGuidance:
      "AUM is point-in-time. Always specify the as-of date. Distinguish from committed capital for private vehicles.",
    related: ["nav"],
    owner: "Finance",
    updated: "2026-01-30",
  },
  {
    id: "high-water-mark",
    term: "High-Water Mark",
    domain: "Finance",
    status: "Approved",
    definition:
      "The highest NAV a fund has previously reached on which performance fees were paid; new fees accrue only above this mark.",
    agentGuidance: "Reference per share-class. Reset rules vary by fund — check fund terms before asserting.",
    related: ["nav"],
    owner: "Finance",
    updated: "2026-01-30",
  },
  {
    id: "ddq",
    term: "Due Diligence Questionnaire",
    acronym: "DDQ",
    domain: "Investor Relations",
    status: "Approved",
    definition: "Standardised questionnaire used by allocators to evaluate the firm's operations, risk, and strategy.",
    agentGuidance:
      "DDQ answers must be sourced from the canonical answer library, not regenerated. Flag any answer older than 90 days for IR review.",
    related: ["lp-letter"],
    owner: "Investor Relations",
    updated: "2026-05-04",
  },
  {
    id: "lp-letter",
    term: "LP Letter",
    domain: "Investor Relations",
    status: "Approved",
    definition: "Periodic written communication to Limited Partners covering performance, positioning, and outlook.",
    agentGuidance:
      "Drafts must pass Compliance before distribution. Do not include forward-looking returns or performance guarantees.",
    related: ["ddq"],
    owner: "Investor Relations",
    updated: "2026-05-04",
  },
  {
    id: "pms",
    term: "Portfolio Management System",
    acronym: "PMS",
    domain: "Technology",
    status: "Approved",
    definition:
      "System of record for positions, trades, and P&L used by Front and Middle Office.",
    agentGuidance:
      "PMS positions are intraday and may differ from accounting NAV. Use PMS for trading decisions, NAV for client reporting.",
    related: ["oms", "ems"],
    owner: "Technology",
    updated: "2026-06-15",
  },
  {
    id: "oms",
    term: "Order Management System",
    acronym: "OMS",
    domain: "Front Office",
    status: "Approved",
    definition: "System that captures, routes, and tracks orders through their lifecycle.",
    agentGuidance: "Distinguish OMS (order lifecycle) from EMS (execution venues).",
    related: ["pms", "ems"],
    owner: "Technology",
    updated: "2026-06-15",
  },
  {
    id: "ems",
    term: "Execution Management System",
    acronym: "EMS",
    domain: "Front Office",
    status: "Approved",
    definition: "System optimised for routing and executing orders across venues and algorithms.",
    agentGuidance: "Use EMS for execution-quality discussion; use OMS for order-state discussion.",
    related: ["oms", "pms"],
    owner: "Technology",
    updated: "2026-06-15",
  },
  {
    id: "initiative",
    term: "Initiative",
    domain: "Enterprise",
    status: "Approved",
    definition:
      "A scoped programme of work with a Vision, WIG, lead measures, owner, sponsor, milestones, and target date — the firm's standard unit of change.",
    agentGuidance:
      "When the user says 'project', 'effort', or 'workstream' in a PgMO context, normalise to 'initiative' and use the standard initiative template.",
    synonyms: ["Programme", "Workstream", "Project"],
    related: ["wig", "roadmap"],
    owner: "PgMO",
    updated: "2026-05-12",
  },
  {
    id: "roadmap",
    term: "Roadmap",
    domain: "Enterprise",
    status: "Approved",
    definition:
      "Time-phased view of initiatives and their lead measures across the firm, used to communicate the path from current to target landscape.",
    agentGuidance:
      "Roadmap items are derived from initiatives — never invent roadmap entries that do not correspond to an existing initiative.",
    related: ["initiative", "wig"],
    owner: "PgMO",
    updated: "2026-05-12",
  },
  {
    id: "enterprise-resource",
    term: "Enterprise Resource",
    domain: "Enterprise",
    status: "Approved",
    definition:
      "A workflow, dataset, or system that is shared across two or more organizational layers and governed centrally.",
    agentGuidance:
      "Flag any node tagged 'enterprise' as requiring cross-functional review before modification proposals.",
    related: ["initiative"],
    owner: "PgMO",
    updated: "2026-05-12",
  },
];

export const glossaryById = Object.fromEntries(glossary.map((t) => [t.id, t]));