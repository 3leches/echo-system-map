import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Terminal, Bot, ShieldCheck, Activity, Tag, ExternalLink, Wand2, Users,
} from "lucide-react";
import { AppShell } from "@/components/pgmo/AppShell";
import { commands, SURFACE_META, type Command, type CommandSurface } from "@/lib/pgmo/commands-mock";
import { skills } from "@/lib/pgmo/skills-mock";

export const Route = createFileRoute("/commands")({
  head: () => ({
    meta: [
      { title: "Commands — PgMO" },
      { name: "description", content: "How analysts and systems invoke skills — slash, watchlist, schedule, webhook." },
    ],
  }),
  component: CommandsPage,
});

const SURFACES: ("All" | CommandSurface)[] = ["All", "Slash", "Watchlist", "Schedule", "Webhook", "Manual"];

function CommandsPage() {
  const [activeId, setActiveId] = useState(commands[0].id);
  const [search, setSearch] = useState("");
  const [surface, setSurface] = useState<"All" | CommandSurface>("All");

  const filtered = useMemo(() => commands.filter((c) => {
    if (surface !== "All" && c.surface !== surface) return false;
    const q = search.toLowerCase();
    if (q && !c.trigger.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q) && !c.tags.some((t) => t.includes(q))) return false;
    return true;
  }), [search, surface]);

  const active = commands.find((c) => c.id === activeId) ?? commands[0];
  const summary = useMemo(() => {
    const acc: Record<CommandSurface, number> = { Slash: 0, Watchlist: 0, Schedule: 0, Webhook: 0, Manual: 0 };
    commands.forEach((c) => acc[c.surface]++);
    return acc;
  }, []);

  return (
    <AppShell full>
      <div className="flex h-full flex-col bg-cream text-ink">
        <header className="border-b border-sand bg-paper/60 px-8 py-5">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="eyebrow mb-1">Catalogue</div>
              <h1 className="font-display text-[26px] text-ink">Commands</h1>
              <p className="text-[12.5px] text-taupe mt-1">
                How analysts and the firm <em>invoke</em> a skill — slash commands, watchlist subscriptions,
                scheduled runs, webhooks. Every command inherits the bound skill's compliance lens.
              </p>
            </div>
            <div className="flex items-center gap-2 tabular text-[12px] flex-wrap">
              {(Object.keys(summary) as CommandSurface[]).map((k) => {
                const meta = SURFACE_META[k]; const I = meta.icon;
                return (
                  <span key={k} className={`px-2 py-0.5 rounded-sm border text-[11px] flex items-center gap-1 ${meta.tone}`}>
                    <I className="w-3 h-3" /> {k} <span className="ml-1 tabular">{summary[k]}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </header>

        <div className="px-8 py-3 border-b border-sand flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-taupe" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search triggers, descriptions or tags…"
              className="w-80 pl-8 pr-3 py-1.5 bg-paper border border-sand rounded-sm text-[12.5px] focus:outline-none focus:border-forest" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] uppercase tracking-wider text-taupe">Surface</span>
            <div className="flex flex-wrap gap-1">
              {SURFACES.map((s) => (
                <button key={s} onClick={() => setSurface(s)}
                  className={`px-2 py-0.5 text-[11px] border rounded-sm ${surface === s ? "border-forest bg-forest/10 text-forest" : "border-sand bg-paper text-taupe hover:text-ink"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-[12.5px]">
              <thead className="sticky top-0 bg-cream border-b border-sand text-taupe">
                <tr className="text-left">
                  <Th>Trigger</Th><Th>Surface</Th><Th>Persona</Th><Th>Scope</Th>
                  <Th className="text-right">Runs · 7d</Th><Th className="text-right">Success</Th><Th>Last run</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const meta = SURFACE_META[c.surface]; const I = meta.icon;
                  const isActive = c.id === active.id;
                  return (
                    <tr key={c.id} onClick={() => setActiveId(c.id)}
                      className={`border-b border-sand cursor-pointer hover:bg-paper/60 ${isActive ? "bg-paper" : ""}`}>
                      <td className="px-4 py-2.5">
                        <div className="font-mono text-ink">{c.trigger}</div>
                        <div className="text-[11px] text-taupe line-clamp-1 max-w-md">{c.description}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-1.5 py-0.5 text-[10.5px] border rounded-sm inline-flex items-center gap-1 ${meta.tone}`}><I className="w-3 h-3" /> {c.surface}</span>
                      </td>
                      <td className="px-4 py-2.5 text-taupe">{c.defaultPersona}</td>
                      <td className="px-4 py-2.5 text-taupe max-w-[24ch] truncate">{c.scope}</td>
                      <td className="px-4 py-2.5 text-right tabular text-taupe">{c.runs7d.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right tabular text-taupe">{c.successRate.toFixed(1)}%</td>
                      <td className="px-4 py-2.5 text-taupe text-[11.5px]">{c.lastRun}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <aside className="w-[420px] shrink-0 border-l border-sand bg-paper/40 overflow-y-auto p-6">
            <Detail c={active} />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Detail({ c }: { c: Command }) {
  const skill = skills.find((s) => s.id === c.boundSkillId);
  const meta = SURFACE_META[c.surface]; const I = meta.icon;
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-[10.5px] text-taupe uppercase tracking-wider">
          <Terminal className="w-3 h-3" /> Command
        </div>
        <div className="mt-1.5 font-mono text-[15px] text-ink bg-cream border border-sand rounded-sm px-2.5 py-1.5">{c.trigger}</div>
        <p className="mt-3 text-[12.5px] text-taupe leading-relaxed">{c.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Surface"><span className="inline-flex items-center gap-1"><I className="w-3 h-3" /> {c.surface}</span></Field>
        <Field label="Default persona">{c.defaultPersona}</Field>
        <Field label="Pinned by">{c.installedBy} analyst{c.installedBy === 1 ? "" : "s"}</Field>
        <Field label="Last run">{c.lastRun}</Field>
      </div>

      <Section title="Scope · sleeve / mandate">
        <div className="text-[12px] text-ink">{c.scope}</div>
      </Section>

      <Section title="Bound skill">
        {skill && (
          <Link to="/skills" className="block border border-sand bg-paper rounded-sm px-3 py-2 hover:border-forest">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] text-ink flex items-center gap-2"><Wand2 className="w-3 h-3 text-forest" /> {skill.name}</span>
              <ExternalLink className="w-3 h-3 text-taupe" />
            </div>
            <div className="text-[11px] text-taupe mt-1 line-clamp-2">{skill.thesis}</div>
          </Link>
        )}
      </Section>

      <Section title="Compliance lens · inherited">
        <div className="flex flex-wrap gap-1">
          {c.lens.map((l) => (
            <span key={l} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10.5px] border border-forest/30 text-forest rounded-sm">
              <ShieldCheck className="w-3 h-3" /> {l}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Performance · 7d">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Runs">{c.runs7d.toLocaleString()}</Field>
          <Field label="Success">{c.successRate.toFixed(2)}%</Field>
        </div>
      </Section>

      <Section title="Tags">
        <div className="flex flex-wrap gap-1">{c.tags.map((t) => (
          <span key={t} className="px-1.5 py-0.5 text-[10.5px] bg-sand/60 text-ink rounded-sm"><Tag className="w-2.5 h-2.5 mr-1 inline" />{t}</span>
        ))}</div>
      </Section>

      <div className="flex items-center gap-1.5 text-[11px] text-taupe pt-2 border-t border-sand">
        <Activity className="w-3 h-3" /> Owner · {c.owner} · <Users className="w-3 h-3" /> pinned by {c.installedBy} <Bot className="w-3 h-3 ml-1" />
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2 font-medium text-[10.5px] uppercase tracking-wider ${className}`}>{children}</th>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-sand bg-paper rounded-sm px-2.5 py-1.5">
      <div className="text-[9.5px] uppercase tracking-wider text-taupe">{label}</div>
      <div className="mt-0.5 text-[12px] text-ink leading-snug">{children}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><div className="text-[9.5px] uppercase tracking-wider text-taupe mb-1.5 flex items-center gap-1.5"><Terminal className="w-2.5 h-2.5" /> {title}</div>{children}</div>;
}