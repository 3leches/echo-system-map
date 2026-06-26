import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, BookOpen, Tag, ShieldCheck, Sparkles, Copy, Check } from "lucide-react";
import { AppShell } from "@/components/pgmo/AppShell";
import {
  glossary, glossaryById, GLOSSARY_DOMAINS,
  type GlossaryTerm, type GlossaryDomain, type GlossaryStatus,
} from "@/lib/pgmo/glossary-mock";

export const Route = createFileRoute("/glossary")({
  head: () => ({
    meta: [
      { title: "Glossary — PgMO" },
      { name: "description", content: "Shared business terminology used by humans, agents, and AI." },
    ],
  }),
  component: GlossaryPage,
});

const STATUSES: ("All" | GlossaryStatus)[] = ["All", "Approved", "Draft", "Deprecated"];

const statusTone: Record<GlossaryStatus, string> = {
  Approved:   "bg-forest/10 text-forest border-forest/30",
  Draft:      "bg-sand text-taupe border-sand",
  Deprecated: "bg-destructive/10 text-destructive border-destructive/30",
};

function GlossaryPage() {
  const [activeId, setActiveId] = useState(glossary[0].id);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState<"All" | GlossaryDomain>("All");
  const [status, setStatus] = useState<"All" | GlossaryStatus>("All");

  const filtered = useMemo(() => glossary.filter((t) => {
    if (domain !== "All" && t.domain !== domain) return false;
    if (status !== "All" && t.status !== status) return false;
    const q = search.toLowerCase();
    if (q && !t.term.toLowerCase().includes(q)
         && !(t.acronym?.toLowerCase().includes(q))
         && !t.definition.toLowerCase().includes(q)
         && !(t.synonyms ?? []).some((s) => s.toLowerCase().includes(q))) return false;
    return true;
  }), [search, domain, status]);

  const active = glossary.find((t) => t.id === activeId) ?? glossary[0];

  return (
    <AppShell full>
      <div className="flex h-full flex-col bg-cream text-ink">
        <header className="border-b border-sand bg-paper/60 px-8 py-5">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="eyebrow mb-1">Semantic layer</div>
              <h1 className="font-display text-[26px] text-ink">Business Terminology</h1>
              <p className="text-[12.5px] text-taupe mt-1 max-w-2xl">
                Canonical definitions used by the firm, its agents, and AI. Each term carries plain-English meaning
                <em> and</em> agent-facing guidance so generated artefacts speak one language.
              </p>
            </div>
            <div className="flex items-center gap-2 tabular text-[11.5px] text-taupe">
              <span className="px-2 py-0.5 rounded-sm border border-sand bg-paper">{glossary.length} terms</span>
              <span className="px-2 py-0.5 rounded-sm border border-forest/30 bg-forest/10 text-forest">
                {glossary.filter((t) => t.status === "Approved").length} approved
              </span>
            </div>
          </div>
        </header>

        <div className="px-8 py-3 border-b border-sand flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-taupe" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search terms, acronyms, definitions…"
              className="w-80 pl-8 pr-3 py-1.5 bg-paper border border-sand rounded-sm text-[12.5px] focus:outline-none focus:border-forest"
            />
          </div>
          <FilterRow label="Domain" value={domain} options={["All", ...GLOSSARY_DOMAINS]} onChange={(v) => setDomain(v as "All" | GlossaryDomain)} />
          <FilterRow label="Status" value={status} options={STATUSES}                       onChange={(v) => setStatus(v as "All" | GlossaryStatus)} />
        </div>

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-[12.5px]">
              <thead className="sticky top-0 bg-cream border-b border-sand text-taupe">
                <tr className="text-left">
                  <Th>Term</Th><Th>Domain</Th><Th>Owner</Th><Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const isActive = t.id === active.id;
                  return (
                    <tr key={t.id} onClick={() => setActiveId(t.id)}
                      className={`border-b border-sand cursor-pointer hover:bg-paper/60 ${isActive ? "bg-paper" : ""}`}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-start gap-2.5">
                          <span className="w-7 h-7 rounded-sm bg-forest/10 text-forest flex items-center justify-center shrink-0">
                            <BookOpen className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <div className="text-ink">
                              {t.term}
                              {t.acronym && <span className="ml-1.5 text-[11px] text-taupe">({t.acronym})</span>}
                            </div>
                            <div className="text-[11px] text-taupe line-clamp-1 max-w-md">{t.definition}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5"><Pill>{t.domain}</Pill></td>
                      <td className="px-4 py-2.5 text-taupe text-[11.5px]">{t.owner}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-1.5 py-0.5 text-[10px] border rounded-sm ${statusTone[t.status]}`}>{t.status}</span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-[12px] text-taupe italic">No terms match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <aside className="w-[440px] shrink-0 border-l border-sand bg-paper/40 overflow-y-auto p-6">
            <Detail t={active} onPick={setActiveId} />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Detail({ t, onPick }: { t: GlossaryTerm; onPick: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const promptBlock = useMemo(() => buildPromptBlock(t), [t]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(promptBlock);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-sm bg-forest/10 text-forest flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </span>
          <div>
            <div className="font-display text-[18px] text-ink leading-tight">
              {t.term}{t.acronym && <span className="ml-1.5 text-[12px] text-taupe">({t.acronym})</span>}
            </div>
            <div className="text-[11px] text-taupe">{t.domain} · {t.owner} · updated {t.updated}</div>
          </div>
        </div>
        <p className="mt-3 text-[12.5px] text-ink leading-relaxed">{t.definition}</p>
      </div>

      <Section title="Agent & AI guidance" icon={<Sparkles className="w-2.5 h-2.5" />}>
        <div className="border border-forest/20 bg-forest/[0.04] rounded-sm px-3 py-2 text-[12px] text-ink leading-relaxed">
          {t.agentGuidance}
        </div>
      </Section>

      {t.examples && t.examples.length > 0 && (
        <Section title="Examples">
          <div className="space-y-1">
            {t.examples.map((e, i) => (
              <div key={i} className="border border-sand bg-paper px-2.5 py-1.5 rounded-sm text-[11.5px] text-ink">
                {e}
              </div>
            ))}
          </div>
        </Section>
      )}

      {t.synonyms && t.synonyms.length > 0 && (
        <Section title="Also known as">
          <div className="flex flex-wrap gap-1">{t.synonyms.map((s) => <Chip key={s}>{s}</Chip>)}</div>
        </Section>
      )}

      {t.related && t.related.length > 0 && (
        <Section title="Related terms">
          <div className="flex flex-wrap gap-1">
            {t.related.map((rid) => {
              const r = glossaryById[rid];
              if (!r) return null;
              return (
                <button key={rid} onClick={() => onPick(rid)}
                  className="px-1.5 py-0.5 text-[10.5px] border border-sand bg-paper rounded-sm text-ink hover:border-forest">
                  {r.term}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="Compliance lens" icon={<ShieldCheck className="w-2.5 h-2.5" />}>
        <div className="text-[11.5px] text-taupe">
          Owned by <span className="text-ink">{t.owner}</span>. Status <span className="text-ink">{t.status}</span>.
          Agents should treat approved definitions as the firm's source of truth.
        </div>
      </Section>

      <Section title="Prompt block" icon={<Tag className="w-2.5 h-2.5" />}>
        <div className="relative">
          <pre className="border border-sand bg-paper rounded-sm p-2.5 text-[11px] text-ink whitespace-pre-wrap font-mono leading-relaxed">
{promptBlock}
          </pre>
          <button
            onClick={copy}
            className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10.5px] border border-sand bg-cream rounded-sm text-taupe hover:text-ink"
            type="button"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="mt-1.5 text-[10.5px] text-taupe italic">
          Drop into a system prompt so agents use this term consistently.
        </div>
      </Section>
    </div>
  );
}

function buildPromptBlock(t: GlossaryTerm): string {
  return [
    `Term: ${t.term}${t.acronym ? ` (${t.acronym})` : ""}`,
    `Domain: ${t.domain}`,
    `Definition: ${t.definition}`,
    `Agent guidance: ${t.agentGuidance}`,
    t.synonyms?.length ? `Synonyms: ${t.synonyms.join(", ")}` : "",
  ].filter(Boolean).join("\n");
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 font-medium text-[10.5px] uppercase tracking-wider">{children}</th>;
}
function Pill({ children }: { children: React.ReactNode }) {
  return <span className="px-1.5 py-0.5 text-[10.5px] border border-sand bg-paper rounded-sm text-ink">{children}</span>;
}
function Chip({ children }: { children: React.ReactNode }) {
  return <span className="px-1.5 py-0.5 text-[10.5px] bg-sand/60 text-ink rounded-sm">{children}</span>;
}
function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9.5px] uppercase tracking-wider text-taupe mb-1.5 flex items-center gap-1.5">
        {icon} {title}
      </div>
      {children}
    </div>
  );
}
function FilterRow({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10.5px] uppercase tracking-wider text-taupe">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)}
            className={`px-2 py-0.5 text-[11px] border rounded-sm ${value === o ? "border-forest bg-forest/10 text-forest" : "border-sand bg-paper text-taupe hover:text-ink"}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}