import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Target,
  Workflow as WorkflowIcon,
  Network,
  Database,
  Globe,
  FileText,
  Paperclip,
  ArrowUp,
  X,
  Clock,
  Check,
  CircleDot,
  ChevronRight,
  MoreHorizontal,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useThreads } from "@/lib/research/store";
import { TOOL_META, type AgentStep, type Message, type Thread, type ToolKind } from "@/lib/research/types";

const TOOL_ICONS: Record<ToolKind, LucideIcon> = {
  initiatives: Target,
  workflows: WorkflowIcon,
  architecture: Network,
  data: Database,
  web: Globe,
  compose: FileText,
};

const DEFAULT_TOOLS: Record<ToolKind | "attach", boolean> = {
  initiatives: true,
  workflows: true,
  architecture: true,
  data: true,
  web: false,
  compose: true,
  attach: false,
};

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function ResearchWorkstation({ threadId }: { threadId: string }) {
  const { threads, create, remove, update, moveToTop } = useThreads();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [tools, setTools] = useState(DEFAULT_TOOLS);
  const [toast, setToast] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const active: Thread | undefined = useMemo(
    () => threads.find((t) => t.id === threadId),
    [threads, threadId],
  );

  const visibleThreads = useMemo(
    () => threads.filter((t) => t.title.toLowerCase().includes(search.toLowerCase())),
    [threads, search],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, threadId]);

  useEffect(() => {
    composerRef.current?.focus();
  }, [threadId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // If thread vanished (deleted), bounce to research index.
  useEffect(() => {
    if (threads.length && !active) {
      navigate({ to: "/research/$threadId", params: { threadId: threads[0].id }, replace: true });
    }
  }, [active, threads, navigate]);

  function newInvestigation() {
    const t = create({ title: "Untitled investigation", tag: "Draft" });
    navigate({ to: "/research/$threadId", params: { threadId: t.id } });
    setQuery("");
    setToast("New investigation created");
  }

  function deleteThread(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const remaining = threads.filter((t) => t.id !== id);
    remove(id);
    setToast("Thread archived");
    if (id === threadId) {
      if (remaining.length) {
        navigate({ to: "/research/$threadId", params: { threadId: remaining[0].id }, replace: true });
      } else {
        const t = create();
        navigate({ to: "/research/$threadId", params: { threadId: t.id }, replace: true });
      }
    }
  }

  function runAgent(prompt: string) {
    if (!active) return;
    const enabled = (Object.keys(TOOL_META) as ToolKind[]).filter((k) => tools[k]);
    if (!enabled.length) {
      setToast("Enable at least one capability");
      return;
    }

    const userMsg: Message = {
      role: "user",
      at: nowTime(),
      text: prompt,
      attachments: tools.attach ? ["context.pdf"] : undefined,
    };
    const steps: AgentStep[] = enabled.map((tool, i) => ({
      id: `r-${Date.now()}-${i}`,
      tool,
      title: `Using ${TOOL_META[tool].label}`,
      detail: TOOL_META[tool].detail,
      status: i === 0 ? "running" : "queued",
    }));
    const agentMsg: Message = { role: "agent", at: nowTime(), steps };

    update(threadId, (t) => ({
      ...t,
      title: t.messages.length ? t.title : truncate(prompt, 72),
      tag: t.tag === "Draft" ? "Live" : t.tag,
      messages: [...t.messages, userMsg, agentMsg],
    }));
    moveToTop(threadId);

    steps.forEach((s, i) => {
      const delay = 600 + i * 800;
      setTimeout(() => {
        update(threadId, (t) => {
          const next = [...t.messages];
          const last = next[next.length - 1];
          if (!last || last.role !== "agent") return t;
          const nextSteps = last.steps.map((st, idx) => {
            if (idx < i) return { ...st, status: "done" as const, duration: st.duration ?? `${(0.6 + idx * 0.4).toFixed(1)}s` };
            if (idx === i) return { ...st, status: "done" as const, duration: `${(0.6 + i * 0.4).toFixed(1)}s` };
            if (idx === i + 1) return { ...st, status: "running" as const };
            return st;
          });
          const isLast = i === steps.length - 1;
          const updatedAgent: Message = {
            ...last,
            steps: nextSteps,
            synthesis: isLast
              ? {
                  eyebrow: "Synthesis · simulated",
                  headline: `Working answer for: "${truncate(prompt, 64)}"`,
                  body:
                    "Mock synthesis based on the enabled capabilities. In production this would stream from the PgMO orchestrator with citations to the initiative register, workflow catalog and architecture model.",
                  findings: [
                    { tone: "positive", text: "At least one initiative is already in flight on this topic." },
                    { tone: "positive", text: "Workflow ownership is clearly assigned across two layers." },
                    { tone: "risk",     text: "A shared enterprise dependency is the most likely path of risk." },
                    { tone: "risk",     text: "Investment numbers in the register may be stale; verify with Finance." },
                  ],
                  metrics: [
                    { label: "Confidence",      value: "Medium" },
                    { label: "Initiatives",     value: "3" },
                    { label: "Workflows",       value: "5" },
                    { label: "Horizon",         value: "2 quarters" },
                  ],
                }
              : last.synthesis,
          };
          next[next.length - 1] = updatedAgent;
          return { ...t, messages: next };
        });
      }, delay);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    runAgent(q);
    setQuery("");
  }

  if (!active) {
    return (
      <div className="flex h-full items-center justify-center text-[12px] text-taupe">
        Opening thread…
      </div>
    );
  }

  const running = active.messages.some(
    (m) => m.role === "agent" && m.steps.some((s) => s.status !== "done"),
  );

  return (
    <div className="flex h-full bg-cream text-ink">
      {/* Thread list */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-sand bg-paper/60">
        <div className="border-b border-sand px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-forest">
              <CircleDot className="h-3.5 w-3.5 text-cream" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[19px] text-ink">PgMO</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-taupe">Research OS</div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-2 pt-4">
          <button
            onClick={newInvestigation}
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-sm bg-forest px-3 py-2 text-[13px] text-cream transition-colors hover:bg-forest-deep"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-3.5 w-3.5" /> New investigation
            </span>
            <span className="font-mono text-[10px] opacity-60">⌘N</span>
          </button>
        </div>

        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-taupe" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search threads…"
              className="w-full rounded-sm border border-sand bg-cream py-1.5 pl-8 pr-3 text-[12.5px] focus:border-forest focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-1 mt-3 px-4">
          <span className="text-[10px] uppercase tracking-[0.15em] text-taupe">Recent threads</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-1">
          {visibleThreads.map((t) => {
            const isActive = t.id === threadId;
            return (
              <div key={t.id} className="group/row relative">
                <Link
                  to="/research/$threadId"
                  params={{ threadId: t.id }}
                  className={
                    "mb-0.5 block w-full rounded-sm border px-3 py-2.5 text-left transition-colors " +
                    (isActive
                      ? "border-sand bg-cream"
                      : "border-transparent hover:border-sand hover:bg-cream/60")
                  }
                >
                  <div className="flex items-start justify-between gap-2 pr-4">
                    <div className="line-clamp-2 text-[13px] leading-snug text-ink">{t.title}</div>
                    <span className="mt-0.5 shrink-0 text-[10px] text-taupe">{t.time}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10.5px] tracking-wide text-taupe">
                    <span>{t.tag}</span>
                    <span>·</span>
                    <span className="truncate">{t.scope}</span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={(e) => deleteThread(t.id, e)}
                  className="absolute right-2 top-2.5 rounded-sm p-0.5 text-taupe opacity-0 hover:bg-sand group-hover/row:opacity-100"
                  aria-label="Archive thread"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
          {!visibleThreads.length && (
            <div className="px-3 py-6 text-center text-[12px] text-taupe">No matches</div>
          )}
        </nav>

        <div className="flex items-center gap-2.5 border-t border-sand px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-enterprise/20 text-[11px] font-medium text-enterprise">
            PM
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[12.5px] text-ink">PMO Lead</div>
            <div className="truncate text-[10.5px] text-taupe">Program Management Office</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-sand bg-paper/40 px-8 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="hidden shrink-0 text-[10px] uppercase tracking-[0.15em] text-taupe md:inline">
              Investigation
            </span>
            <ChevronRight className="hidden h-3 w-3 shrink-0 text-taupe md:inline" />
            <h1 className="min-w-0 truncate font-display text-[22px] text-ink">{active.title}</h1>
            <span className="shrink-0 rounded-sm bg-forest/10 px-2 py-0.5 text-[10.5px] uppercase tracking-wider text-forest">
              {running ? "Running" : active.tag}
            </span>
            <span className="hidden truncate text-[11px] text-taupe md:inline">· {active.scope}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setToast("Share link copied")}
              className="hidden rounded-sm border border-sand px-3 py-1.5 text-[12.5px] hover:bg-cream lg:inline-block"
            >
              Share
            </button>
            <button
              type="button"
              onClick={() => setToast("Brief exported as PDF")}
              className="rounded-sm border border-sand px-3 py-1.5 text-[12.5px] hover:bg-cream"
            >
              Export brief
            </button>
            <button
              type="button"
              className="rounded-sm border border-sand p-1.5 hover:bg-cream"
              aria-label="More"
            >
              <MoreHorizontal className="h-4 w-4 text-taupe" />
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-8 px-8 py-10">
            {active.messages.length === 0 && (
              <EmptyState
                onPrompt={(p) => {
                  setQuery(p);
                  composerRef.current?.focus();
                }}
              />
            )}
            {active.messages.map((m, i) =>
              m.role === "user" ? <UserBubble key={i} m={m} /> : <AgentBubble key={i} m={m} />,
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-sand bg-paper/60 px-8 py-5">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-sm border border-sand bg-cream transition-colors focus-within:border-forest">
              <textarea
                ref={composerRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e);
                }}
                placeholder="Ask about an initiative, workflow or dependency…   (⌘↵ to send)"
                rows={2}
                className="w-full resize-none bg-transparent px-4 py-3 text-[14px] placeholder:text-taupe focus:outline-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-sand px-3 py-2">
                <div className="flex flex-wrap items-center gap-1">
                  <CapBtn
                    icon={Paperclip}
                    label="Attach"
                    active={tools.attach}
                    onClick={() => setTools((t) => ({ ...t, attach: !t.attach }))}
                  />
                  {(Object.keys(TOOL_META) as ToolKind[]).map((k) => (
                    <CapBtn
                      key={k}
                      icon={TOOL_ICONS[k]}
                      label={TOOL_META[k].label}
                      active={tools[k]}
                      onClick={() => setTools((t) => ({ ...t, [k]: !t[k] }))}
                    />
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="whitespace-nowrap text-[11px] text-taupe">PgMO Orchestrator · mock</span>
                  <button
                    type="submit"
                    disabled={!query.trim() || running}
                    className="flex h-7 w-7 items-center justify-center rounded-sm bg-forest text-cream hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Send"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center text-[10.5px] text-taupe">
              Mock prototype. No live model calls — agentic steps are simulated for demo purposes.
            </div>
          </div>
        </form>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-sm bg-ink px-3 py-2 text-[12px] text-cream shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onPrompt }: { onPrompt: (p: string) => void }) {
  const examples = [
    "Which initiatives are most at risk this quarter, and why?",
    "Map every workflow that touches the entity master.",
    "Where would automating two workflows free the most analyst time?",
    "What's the critical path to the target IR reporting state?",
  ];
  return (
    <div className="rounded-sm border border-sand bg-paper/50 p-8">
      <div className="text-[10px] uppercase tracking-[0.15em] text-taupe">Start an investigation</div>
      <h2 className="mt-2 font-display text-[26px] leading-tight text-ink">
        Ask the PgMO assistant anything about your firm's programs.
      </h2>
      <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-taupe">
        The orchestrator walks the initiative register, the workflow catalog and the architecture model,
        then synthesizes a brief with citations. Toggle which capabilities it should use below.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onPrompt(ex)}
            className="rounded-sm border border-sand bg-cream px-3 py-2.5 text-left text-[12.5px] text-ink transition-colors hover:border-forest hover:bg-forest/5"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserBubble({ m }: { m: Extract<Message, { role: "user" }> }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-sm border border-forest/20 bg-forest/5 px-4 py-2.5">
        <div className="text-[13.5px] leading-relaxed text-ink whitespace-pre-wrap">{m.text}</div>
        {m.attachments?.length ? (
          <div className="mt-2 flex flex-wrap gap-1 text-[10.5px] text-taupe">
            {m.attachments.map((a) => (
              <span key={a} className="rounded-sm border border-sand bg-paper px-1.5 py-0.5">
                {a}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-1.5 text-right text-[10px] text-taupe">{m.at}</div>
      </div>
    </div>
  );
}

function AgentBubble({ m }: { m: Extract<Message, { role: "agent" }> }) {
  return (
    <div className="space-y-3">
      <ol className="space-y-1.5">
        {m.steps.map((s) => {
          const Icon = TOOL_ICONS[s.tool];
          return (
            <li
              key={s.id}
              className="flex items-start gap-2.5 rounded-sm border border-sand bg-paper/60 px-3 py-2"
            >
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-cream text-taupe">
                <Icon className="h-3 w-3" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[12.5px] text-ink">
                  <span>{s.title}</span>
                  {s.status === "done" && <Check className="h-3 w-3 text-forest" />}
                  {s.status === "running" && <Loader2 className="h-3 w-3 animate-spin text-forest" />}
                  {s.status === "queued" && <Clock className="h-3 w-3 text-taupe" />}
                </div>
                <div className="text-[11.5px] text-taupe">{s.detail}</div>
              </div>
              {s.duration && <span className="text-[10px] text-taupe">{s.duration}</span>}
            </li>
          );
        })}
      </ol>
      {m.synthesis && (
        <div className="rounded-sm border border-sand bg-paper p-5">
          <div className="text-[10px] uppercase tracking-[0.15em] text-taupe">{m.synthesis.eyebrow}</div>
          <h3 className="mt-1 font-display text-[20px] leading-tight text-ink">
            {m.synthesis.headline}
          </h3>
          <p className="mt-3 text-[13.5px] leading-relaxed text-taupe">{m.synthesis.body}</p>
          <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
            {m.synthesis.findings.map((f, i) => (
              <li
                key={i}
                className={
                  "rounded-sm border px-2.5 py-1.5 text-[12px] " +
                  (f.tone === "positive"
                    ? "border-forest/30 bg-forest/5 text-ink"
                    : f.tone === "risk"
                      ? "border-amber-500/30 bg-amber-500/5 text-ink"
                      : "border-sand bg-cream text-ink")
                }
              >
                {f.text}
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {m.synthesis.metrics.map((mt) => (
              <div key={mt.label} className="rounded-sm border border-sand bg-cream px-2.5 py-2">
                <div className="text-[10px] uppercase tracking-[0.12em] text-taupe">{mt.label}</div>
                <div className="mt-0.5 font-display text-[16px] text-ink">{mt.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="text-[10px] text-taupe">{m.at}</div>
    </div>
  );
}

function CapBtn({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[11.5px] transition-colors " +
        (active
          ? "border-forest bg-forest/5 text-forest"
          : "border-sand text-taupe hover:border-forest/40 hover:text-ink")
      }
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}