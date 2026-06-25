export type ToolKind =
  | "initiatives"
  | "workflows"
  | "architecture"
  | "data"
  | "web"
  | "compose";

export interface AgentStep {
  id: string;
  tool: ToolKind;
  title: string;
  detail: string;
  status: "queued" | "running" | "done";
  duration?: string;
}

export interface Finding {
  tone: "positive" | "risk" | "neutral";
  text: string;
}

export interface Synthesis {
  eyebrow: string;
  headline: string;
  body: string;
  findings: Finding[];
  metrics: { label: string; value: string }[];
}

export interface UserMessage {
  role: "user";
  at: string;
  text: string;
  attachments?: string[];
}

export interface AgentMessage {
  role: "agent";
  at: string;
  steps: AgentStep[];
  synthesis?: Synthesis;
}

export type Message = UserMessage | AgentMessage;

export interface Thread {
  id: string;
  title: string;
  time: string;
  tag: string;          // e.g. "Live", "Draft", "Archived"
  scope: string;        // e.g. "Risk · MiFID Refresh"
  messages: Message[];
}

export const TOOL_META: Record<ToolKind, { label: string; detail: string }> = {
  initiatives:  { label: "Initiatives",  detail: "Scanned the initiative register for relevant programs, owners and status." },
  workflows:    { label: "Workflows",    detail: "Walked the workflow catalog for steps that touch this topic." },
  architecture: { label: "Architecture", detail: "Traced systems, data flows and shared platforms across layers." },
  data:         { label: "Data",         detail: "Pulled latest figures from the enterprise data platform." },
  web:          { label: "Web",          detail: "Scanned external sources, vendor docs and regulator updates." },
  compose:      { label: "Compose",      detail: "Drafted a memo with citations to internal sources." },
};