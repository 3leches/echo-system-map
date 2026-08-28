import type {
  ConstituentProject,
  DecisionLog,
  DependencyLink,
  ProgramSummary,
  RiskItem,
  Workstream,
} from "./types";

export interface ProgramExtras {
  summary: ProgramSummary;
  projects: ConstituentProject[];
  workstreams: Workstream[];
  risks: RiskItem[];
  dependencyLinks: DependencyLink[];
  decisions: DecisionLog[];
}

/**
 * Governance pack per initiative — executive summary, constituent projects,
 * workstreams, risk register, dependency matrix and decision log.
 * Merged onto SEED_INITIATIVES in the store.
 */
export const PROGRAM_EXTRAS: Record<string, ProgramExtras> = {
  /* ---------------- Enterprise Data Platform ---------------- */
  i_edp: {
    summary: {
      period: "Week of 24 Aug 2026",
      overall: "amber",
      schedule: "amber",
      budget: "green",
      scope: "green",
      benefits: "green",
      narrative:
        "Foundation is live and two of five source domains are cut over. Security master migration is running four weeks behind because reference-data quality in the legacy mart is worse than surveyed. Budget and scope remain stable; the recovery plan trades two weeks of float against the IR reporting gate rather than the year-end WIG.",
      highlights: [
        "Snowflake foundation certified by Risk and Compliance — production workloads approved.",
        "Positions and transactions domains cut over; nightly reconciliation breaks down 38% month-on-month.",
        "Lineage tagging standard ratified by the Data Council; adopted by IR and Performance.",
      ],
      lowlights: [
        "Security master migration 4 weeks late — 11% of instrument records fail the golden-record rule set.",
        "Two data engineers rolled off to the limits programme, cutting build capacity ~20%.",
      ],
      asks: [
        "Approve two contract data engineers through Q4 (in-budget, uses contingency).",
        "COO to arbitrate ownership of vendor instrument identifiers between Ops and Research Eng.",
      ],
      percentComplete: 46,
      budgetSpent: "$2.9M",
      budgetTotal: "$6.4M",
      nextGate: { name: "Gate 3 — Reference data cutover", date: "2026-09-18" },
    },
    workstreams: [
      { id: "ws_edp_plat", name: "Platform & Infrastructure", lead: "R. Okafor", layer: "enterprise", objective: "Landing zone, governance, cost controls and environment promotion.", rag: "green", headcount: 6 },
      { id: "ws_edp_ref", name: "Reference & Master Data", lead: "M. Alvarez", layer: "enterprise", objective: "Golden records for instruments, parties and hierarchies.", rag: "red", headcount: 5 },
      { id: "ws_edp_ibor", name: "Investment Data Domains", lead: "S. Nakamura", layer: "middle_office", objective: "Positions, transactions, valuations and performance onto the platform.", rag: "amber", headcount: 7 },
      { id: "ws_edp_cons", name: "Consumption & Reporting", lead: "H. Brandt", layer: "investor_relations", objective: "Semantic layer, certified datasets and IR reporting migration.", rag: "green", headcount: 4 },
      { id: "ws_edp_chg", name: "Adoption & Change", lead: "P. Devlin", objective: "Decommission legacy marts, retrain desks, enforce data contracts.", rag: "amber", headcount: 3 },
    ],
    projects: [
      { id: "p_edp_1", name: "Snowflake landing zone & governance", lead: "R. Okafor", workstreamId: "ws_edp_plat", stage: "closed", rag: "green", percentComplete: 100, startDate: "2026-01-15", endDate: "2026-03-31", budget: "$1.1M", spend: "$1.0M", note: "Delivered two weeks early; underspend redeployed to contingency." },
      { id: "p_edp_2", name: "Positions & transactions cutover", lead: "S. Nakamura", workstreamId: "ws_edp_ibor", stage: "deploy", rag: "green", percentComplete: 88, startDate: "2026-03-01", endDate: "2026-09-15", budget: "$1.4M", spend: "$1.1M" },
      { id: "p_edp_3", name: "Security master migration", lead: "M. Alvarez", workstreamId: "ws_edp_ref", stage: "build", rag: "red", percentComplete: 41, startDate: "2026-04-01", endDate: "2026-06-30", budget: "$1.2M", spend: "$0.8M", note: "Four weeks late — golden-record rules failing on 11% of instruments." },
      { id: "p_edp_4", name: "Party / entity master consolidation", lead: "M. Alvarez", workstreamId: "ws_edp_ref", stage: "design", rag: "amber", percentComplete: 22, startDate: "2026-06-01", endDate: "2026-11-30", budget: "$0.9M", spend: "$0.2M" },
      { id: "p_edp_5", name: "Semantic layer & certified datasets", lead: "H. Brandt", workstreamId: "ws_edp_cons", stage: "build", rag: "green", percentComplete: 55, startDate: "2026-05-01", endDate: "2026-10-31", budget: "$0.8M", spend: "$0.4M" },
      { id: "p_edp_6", name: "IR reporting migration", lead: "H. Brandt", workstreamId: "ws_edp_cons", stage: "design", rag: "amber", percentComplete: 18, startDate: "2026-08-01", endDate: "2026-12-20", budget: "$0.6M", spend: "$0.1M", note: "Start gated by security master cutover." },
      { id: "p_edp_7", name: "Legacy mart decommission", lead: "P. Devlin", workstreamId: "ws_edp_chg", stage: "discovery", rag: "amber", percentComplete: 9, startDate: "2026-09-01", endDate: "2027-01-31", budget: "$0.4M", spend: "$0.05M" },
    ],
    risks: [
      { id: "r_edp_1", type: "issue", title: "Instrument golden-record rules failing", description: "11% of instrument records cannot be resolved to a single golden record because vendor identifiers conflict between Ops and Research Eng feeds.", category: "Data quality", owner: "M. Alvarez", probability: 5, impact: 4, status: "escalated", mitigation: "Stand up a two-week remediation squad; escalate identifier ownership to COO for arbitration.", dueDate: "2026-09-12", projectId: "p_edp_3" },
      { id: "r_edp_2", type: "risk", title: "Engineering capacity drain to limits programme", category: "Resource", owner: "R. Okafor", probability: 4, impact: 3, status: "mitigating", mitigation: "Approve two contract engineers from contingency; ring-fence EDP core team through Q4.", dueDate: "2026-09-05" },
      { id: "r_edp_3", type: "risk", title: "IR reporting gate slips past year-end", category: "Schedule", owner: "H. Brandt", probability: 3, impact: 5, status: "open", mitigation: "Run IR semantic modelling in parallel with reference cutover instead of sequentially.", dueDate: "2026-10-01", projectId: "p_edp_6" },
      { id: "r_edp_4", type: "risk", title: "Cloud consumption exceeds run-rate model", category: "Financial", owner: "R. Okafor", probability: 2, impact: 3, status: "mitigating", mitigation: "Warehouse auto-suspend, per-domain tagging, monthly FinOps review with Finance." },
      { id: "r_edp_5", type: "risk", title: "Legacy marts kept alive past decommission date", category: "Benefits realisation", owner: "P. Devlin", probability: 3, impact: 4, status: "open", mitigation: "Publish decommission contract per desk with a named sponsor and a hard read-only date." },
      { id: "r_edp_6", type: "issue", title: "Lineage tags incomplete for IR datasets", category: "Governance", owner: "H. Brandt", probability: 3, impact: 2, status: "mitigating", mitigation: "Joint IR/Data review each Friday until coverage reaches 100%.", dueDate: "2026-09-04" },
    ],
    dependencyLinks: [],
    decisions: [
      { id: "d_edp_1", title: "Snowflake selected as strategic platform", date: "2026-01-20", decidedBy: "Investment Committee", status: "approved", detail: "Three-year commitment with annual consumption review." },
      { id: "d_edp_2", title: "Instrument identifier ownership", date: "2026-09-10", decidedBy: "COO", status: "pending", detail: "Ops vs Research Eng ownership of vendor identifier mastering." },
      { id: "d_edp_3", title: "Contract engineering uplift funded from contingency", date: "2026-09-03", decidedBy: "Steering Committee", status: "pending" },
    ],
  },

  /* ---------------- Real-time Pre-trade Limits ---------------- */
  i_limits: {
    summary: {
      period: "Week of 24 Aug 2026",
      overall: "green",
      schedule: "green",
      budget: "green",
      scope: "amber",
      benefits: "green",
      narrative:
        "Mobilisation complete and the equities desk is running the limits service in shadow mode with zero false positives over ten trading days. Scope is amber: Trading has asked to extend coverage to FX forwards, which is outside the approved MVP. Dependency on the enterprise data platform for instrument reference data remains the single largest schedule threat.",
      highlights: [
        "Equities shadow-mode live; 10 sessions, 0 false positives, p99 latency 140ms.",
        "Risk and Compliance signed off the limit rule taxonomy without change requests.",
      ],
      lowlights: [
        "FX forwards scope request pending — would add roughly six weeks if accepted.",
        "OMS integration window not yet allocated by the trading platform team.",
      ],
      asks: [
        "Trading to confirm an OMS integration window before 30 Sep.",
        "Steering to rule on FX forwards: MVP scope or phase two.",
      ],
      percentComplete: 28,
      budgetSpent: "$0.4M",
      budgetTotal: "$1.8M",
      nextGate: { name: "Gate 2 — MVP readiness", date: "2026-07-15" },
    },
    workstreams: [
      { id: "ws_lim_svc", name: "Limits Service", lead: "A. Ferreira", layer: "risk", objective: "Sub-second rule evaluation engine with full audit trail.", rag: "green", headcount: 5 },
      { id: "ws_lim_oms", name: "OMS Integration", lead: "J. Whitcombe", layer: "front_office", objective: "Pre-trade hook in the order path with graceful degradation.", rag: "amber", headcount: 4 },
      { id: "ws_lim_gov", name: "Rules & Governance", lead: "N. Osei", layer: "compliance", objective: "Limit taxonomy, approvals, breach handling and evidence.", rag: "green", headcount: 2 },
    ],
    projects: [
      { id: "p_lim_1", name: "Limit rule engine MVP", lead: "A. Ferreira", workstreamId: "ws_lim_svc", stage: "build", rag: "green", percentComplete: 62, startDate: "2026-04-01", endDate: "2026-07-15", budget: "$0.7M", spend: "$0.35M" },
      { id: "p_lim_2", name: "Equities desk shadow pilot", lead: "A. Ferreira", workstreamId: "ws_lim_svc", stage: "test", rag: "green", percentComplete: 70, startDate: "2026-06-01", endDate: "2026-09-30", budget: "$0.2M", spend: "$0.1M" },
      { id: "p_lim_3", name: "OMS pre-trade hook", lead: "J. Whitcombe", workstreamId: "ws_lim_oms", stage: "design", rag: "amber", percentComplete: 15, startDate: "2026-07-01", endDate: "2026-10-15", budget: "$0.6M", spend: "$0.05M", note: "Awaiting integration window from trading platform team." },
      { id: "p_lim_4", name: "Breach workflow & evidence pack", lead: "N. Osei", workstreamId: "ws_lim_gov", stage: "design", rag: "green", percentComplete: 30, startDate: "2026-06-15", endDate: "2026-11-30", budget: "$0.3M", spend: "$0.07M" },
    ],
    risks: [
      { id: "r_lim_1", type: "risk", title: "Reference data from EDP not ready for cutover", category: "Dependency", owner: "A. Ferreira", probability: 4, impact: 5, status: "mitigating", mitigation: "Fallback to the legacy security master feed for the MVP; contract-test the EDP interface now.", dueDate: "2026-09-30" },
      { id: "r_lim_2", type: "risk", title: "Latency budget breached under peak load", category: "Technical", owner: "A. Ferreira", probability: 2, impact: 5, status: "mitigating", mitigation: "Load test at 3x peak volume; pre-compute limit snapshots per desk." },
      { id: "r_lim_3", type: "issue", title: "OMS integration window unallocated", category: "Resource", owner: "J. Whitcombe", probability: 5, impact: 4, status: "escalated", mitigation: "CRO to raise at the Trading Technology forum; propose a 30 Sep decision date.", dueDate: "2026-09-30", projectId: "p_lim_3" },
      { id: "r_lim_4", type: "risk", title: "Scope creep — FX forwards added to MVP", category: "Scope", owner: "CRO", probability: 3, impact: 3, status: "open", mitigation: "Hold to approved MVP; log FX forwards as a phase-two change request." },
    ],
    dependencyLinks: [],
    decisions: [
      { id: "d_lim_1", title: "Build vs buy — build the limits service", date: "2026-03-18", decidedBy: "Investment Committee", status: "approved", detail: "Vendor options failed the sub-second latency requirement." },
      { id: "d_lim_2", title: "FX forwards in MVP scope", date: "2026-09-15", decidedBy: "Steering Committee", status: "pending" },
    ],
  },

  /* ---------------- Investor Self-Service Portal ---------------- */
  i_ir: {
    summary: {
      period: "Week of 24 Aug 2026",
      overall: "amber",
      schedule: "amber",
      budget: "red",
      scope: "green",
      benefits: "green",
      narrative:
        "The portal MVP is live with 34 LPs onboarded and satisfaction scoring 4.6 of 5. Budget is red: identity and entitlement work was underestimated by roughly $0.5M once per-LP entitlement rules were fully mapped. Statements-on-demand depends on the enterprise data platform's IR datasets, which are gated behind the reference-data cutover.",
      highlights: [
        "34 LPs live on the portal; 4.6/5 satisfaction across 21 responses.",
        "Capital activity notices now generated automatically — 240 manual hours saved this quarter.",
      ],
      lowlights: [
        "Entitlement model complexity has driven a $0.5M forecast overrun.",
        "Statements-on-demand cannot start until EDP publishes certified IR datasets.",
      ],
      asks: [
        "Approve a $0.5M budget uplift for identity and entitlements.",
        "Confirm the EDP IR dataset delivery date so the statements gate can be re-baselined.",
      ],
      percentComplete: 52,
      budgetSpent: "$2.1M",
      budgetTotal: "$3.2M",
      nextGate: { name: "Gate 3 — Statements on demand", date: "2026-09-30" },
    },
    workstreams: [
      { id: "ws_ir_portal", name: "Portal Experience", lead: "L. Chen", layer: "investor_relations", objective: "LP-facing experience, document delivery and self-service reporting.", rag: "green", headcount: 6 },
      { id: "ws_ir_idm", name: "Identity & Entitlements", lead: "T. Bauer", layer: "enterprise", objective: "Okta federation and per-LP entitlement enforcement.", rag: "red", headcount: 4 },
      { id: "ws_ir_data", name: "IR Data & Reporting", lead: "H. Brandt", layer: "enterprise", objective: "Certified performance, capital account and statement datasets.", rag: "amber", headcount: 4 },
      { id: "ws_ir_ops", name: "IR Operating Model", lead: "K. Aduba", layer: "investor_relations", objective: "Retire manual report production and re-skill the IR team.", rag: "green", headcount: 3 },
    ],
    projects: [
      { id: "p_ir_1", name: "Portal MVP", lead: "L. Chen", workstreamId: "ws_ir_portal", stage: "closed", rag: "green", percentComplete: 100, startDate: "2026-02-01", endDate: "2026-05-30", budget: "$0.9M", spend: "$0.9M" },
      { id: "p_ir_2", name: "Okta federation & entitlements", lead: "T. Bauer", workstreamId: "ws_ir_idm", stage: "build", rag: "red", percentComplete: 48, startDate: "2026-04-01", endDate: "2026-10-31", budget: "$0.6M", spend: "$0.75M", note: "Forecast overrun $0.5M — entitlement matrix far larger than scoped." },
      { id: "p_ir_3", name: "Statements on demand", lead: "H. Brandt", workstreamId: "ws_ir_data", stage: "design", rag: "amber", percentComplete: 20, startDate: "2026-06-01", endDate: "2026-09-30", budget: "$0.7M", spend: "$0.2M" },
      { id: "p_ir_4", name: "Capital activity automation", lead: "K. Aduba", workstreamId: "ws_ir_ops", stage: "test", rag: "green", percentComplete: 76, startDate: "2026-03-15", endDate: "2026-10-15", budget: "$0.5M", spend: "$0.3M" },
      { id: "p_ir_5", name: "LP migration waves 2-5", lead: "K. Aduba", workstreamId: "ws_ir_ops", stage: "build", rag: "green", percentComplete: 34, startDate: "2026-06-01", endDate: "2027-01-31", budget: "$0.5M", spend: "$0.15M" },
    ],
    risks: [
      { id: "r_ir_1", type: "issue", title: "Entitlement scope underestimated", category: "Financial", owner: "T. Bauer", probability: 5, impact: 4, status: "escalated", mitigation: "Freeze entitlement rule variants at 12 patterns; request $0.5M uplift at September steering.", dueDate: "2026-09-08", projectId: "p_ir_2" },
      { id: "r_ir_2", type: "risk", title: "IR datasets late from EDP", category: "Dependency", owner: "H. Brandt", probability: 4, impact: 4, status: "mitigating", mitigation: "Build statements against a staged extract; swap to certified datasets on cutover.", dueDate: "2026-10-15" },
      { id: "r_ir_3", type: "risk", title: "LP adoption stalls below 60%", category: "Benefits realisation", owner: "K. Aduba", probability: 3, impact: 4, status: "open", mitigation: "Relationship-manager-led onboarding with a hard cut of email PDF distribution at wave 4." },
      { id: "r_ir_4", type: "risk", title: "Investor data exposed across LP boundaries", category: "Compliance", owner: "T. Bauer", probability: 2, impact: 5, status: "mitigating", mitigation: "Independent penetration test plus automated entitlement regression suite on every release." },
    ],
    dependencyLinks: [],
    decisions: [
      { id: "d_ir_1", title: "Okta chosen for LP identity federation", date: "2026-03-02", decidedBy: "CTO", status: "approved" },
      { id: "d_ir_2", title: "$0.5M entitlement budget uplift", date: "2026-09-08", decidedBy: "Steering Committee", status: "pending" },
    ],
  },

  /* ---------------- KYC Refresh Automation ---------------- */
  i_kyc: {
    summary: {
      period: "Week of 24 Aug 2026",
      overall: "green",
      schedule: "green",
      budget: "green",
      scope: "green",
      benefits: "amber",
      narrative:
        "In definition. Business case is drafted and the process baseline is complete: 45-day average refresh cycle across 1,240 counterparties. Benefits are amber until the party master consolidation date is confirmed, since event-driven refresh cannot start without it.",
      highlights: [
        "Process baseline complete — 45-day cycle, 62% of effort is manual document chase.",
        "MLRO and Compliance aligned on a risk-tiered refresh policy.",
      ],
      lowlights: ["Benefits case depends on the party master date, which is not yet fixed."],
      asks: ["Confirm party master consolidation delivery date to lock the business case."],
      percentComplete: 6,
      budgetSpent: "$0.05M",
      budgetTotal: "$0.9M",
      nextGate: { name: "Gate 1 — Business case approval", date: "2026-09-25" },
    },
    workstreams: [
      { id: "ws_kyc_pol", name: "Policy & Risk Tiering", lead: "D. Marchetti", layer: "compliance", objective: "Risk-tiered refresh policy and regulator-ready evidence model.", rag: "green", headcount: 2 },
      { id: "ws_kyc_auto", name: "Automation & Data", lead: "S. Iqbal", layer: "enterprise", objective: "Event-driven triggers from the party master; document intake automation.", rag: "amber", headcount: 3 },
    ],
    projects: [
      { id: "p_kyc_1", name: "Process baseline & business case", lead: "D. Marchetti", workstreamId: "ws_kyc_pol", stage: "discovery", rag: "green", percentComplete: 65, startDate: "2026-07-01", endDate: "2026-09-25", budget: "$0.1M", spend: "$0.05M" },
      { id: "p_kyc_2", name: "Event-driven refresh triggers", lead: "S. Iqbal", workstreamId: "ws_kyc_auto", stage: "discovery", rag: "amber", percentComplete: 5, startDate: "2026-09-01", endDate: "2027-03-31", budget: "$0.5M", spend: "$0" },
    ],
    risks: [
      { id: "r_kyc_1", type: "risk", title: "Party master unavailable when build starts", category: "Dependency", owner: "S. Iqbal", probability: 4, impact: 4, status: "open", mitigation: "Sequence the policy workstream first; hold build mobilisation until the EDP party master date is confirmed." },
      { id: "r_kyc_2", type: "risk", title: "Regulatory expectations change mid-build", category: "Regulatory", owner: "D. Marchetti", probability: 2, impact: 4, status: "open", mitigation: "Design the policy engine as configurable rules rather than hard-coded logic." },
    ],
    dependencyLinks: [],
    decisions: [
      { id: "d_kyc_1", title: "Business case approval", date: "2026-09-25", decidedBy: "Investment Committee", status: "pending" },
    ],
  },
};

/** Cross-program dependency matrix, keyed by the dependent initiative. */
export const PROGRAM_DEPENDENCIES: Record<string, DependencyLink[]> = {
  i_limits: [
    { id: "dl_1", onInitiativeId: "i_edp", kind: "data", description: "Certified instrument reference data for limit evaluation.", neededBy: "2026-09-30", status: "at_risk" },
    { id: "dl_2", onInitiativeId: "i_edp", kind: "platform", description: "Streaming positions feed for intraday exposure.", neededBy: "2026-10-15", status: "on_track" },
  ],
  i_ir: [
    { id: "dl_3", onInitiativeId: "i_edp", kind: "data", description: "Certified performance and capital account datasets for statements.", neededBy: "2026-10-15", status: "at_risk" },
    { id: "dl_4", onInitiativeId: "i_edp", kind: "decision", description: "Party master ownership decision to finalise LP entitlement mapping.", neededBy: "2026-09-10", status: "blocked" },
  ],
  i_kyc: [
    { id: "dl_5", onInitiativeId: "i_edp", kind: "data", description: "Consolidated party / entity master as the trigger source.", neededBy: "2026-11-30", status: "on_track" },
  ],
};
