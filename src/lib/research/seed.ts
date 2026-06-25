import type { Thread } from "./types";

export const SEED_THREADS: Thread[] = [
  {
    id: "t_edp",
    title: "Where is the Enterprise Data Platform migration actually blocked?",
    time: "12m",
    tag: "Live",
    scope: "Enterprise · EDP Modernization",
    messages: [
      {
        role: "user",
        at: "10:42",
        text: "Where is the Enterprise Data Platform migration actually blocked, and which downstream initiatives are slipping because of it?",
      },
      {
        role: "agent",
        at: "10:42",
        steps: [
          { id: "s1", tool: "initiatives",  title: "Scanned initiatives",      detail: "4 initiatives reference EDP. 3 list EDP as a dependency.", status: "done", duration: "0.8s" },
          { id: "s2", tool: "architecture", title: "Traced architecture",      detail: "EDP touches Enterprise, Middle Office and IR layers.",     status: "done", duration: "1.1s" },
          { id: "s3", tool: "workflows",    title: "Walked workflows",         detail: "Identified Daily Valuation and IR Reporting as blockers.", status: "done", duration: "0.9s" },
          { id: "s4", tool: "data",         title: "Pulled platform metrics",  detail: "Reconciliation breaks trending up since W-3.",             status: "done", duration: "0.6s" },
          { id: "s5", tool: "compose",      title: "Composed brief",           detail: "Drafted a PM-ready memo with citations.",                  status: "done", duration: "1.2s" },
        ],
        synthesis: {
          eyebrow: "Synthesis · simulated",
          headline: "Security Master migration is the binding constraint",
          body: "Migration of the Security Master is 6 weeks behind plan, which gates the IR Self-Service Portal go-live and the Pre-trade Limits feed. Investor Self-Service is now at risk; KYC Refresh Automation is still on track because it does not consume the new feed yet.",
          findings: [
            { tone: "positive", text: "Snowflake foundation is live and stable; no infra blockers." },
            { tone: "positive", text: "KYC Refresh Automation can sequence after Security Master without slipping its window." },
            { tone: "risk",     text: "Investor Self-Service Portal milestone (Sept 30) is at risk if Security Master slips another sprint." },
            { tone: "risk",     text: "Pre-trade Limits MVP depends on the new reference feed; needs a contingency path." },
          ],
          metrics: [
            { label: "Initiatives touched", value: "3" },
            { label: "Workflows impacted",  value: "5" },
            { label: "Confidence",          value: "Medium-High" },
            { label: "Recommended action",  value: "Add 2 engineers" },
          ],
        },
      },
    ],
  },
  {
    id: "t_limits",
    title: "Should Real-time Pre-trade Limits absorb the OMS replatform scope?",
    time: "2h",
    tag: "Live",
    scope: "Risk · Pre-trade Limits",
    messages: [],
  },
  {
    id: "t_ir",
    title: "What would it take to cut manual investor reports by 90% this year?",
    time: "Yesterday",
    tag: "Live",
    scope: "Investor Relations",
    messages: [],
  },
  {
    id: "t_kyc",
    title: "Where does KYC Refresh Automation depend on the entity master?",
    time: "2d",
    tag: "Draft",
    scope: "Compliance",
    messages: [],
  },
];