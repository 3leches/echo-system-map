import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Wand2, ShieldCheck, Database, Workflow as WorkflowIcon,
  Activity, Tag, ExternalLink, GitBranch,
} from "lucide-react";
import { AppShell } from "@/components/pgmo/AppShell";
import {
  skills, SKILL_OUTPUTS,
  type Skill, type OutputType, type AssetClass,
} from "@/lib/pgmo/skills-mock";
import { commands } from "@/lib/pgmo/commands-mock";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skills — PgMO" },
      { name: "description", content: "Catalogue of skills agents can run for the firm." },
    ],
  }),
  component: SkillsPage,
});

const ASSET_CLASSES: ("All" | AssetClass)[] = ["All", "Equities", "Credit", "Macro", "Cross-asset", "Private"];
const STATUSES: ("All" | Skill["status"])[] = ["All", "Production", "Beta", "Draft", "Deprecated"];

const statusColor: Record<Skill["status"], string> = {
  Production: "bg-forest/10 text-forest border-forest/30",
  Beta:       "bg-enterprise/10 text-enterprise border-enterprise/30",
  Draft:      "bg-sand text-taupe border-sand",
  Deprecated: "bg-destructive/10 text-destructive border-destructive/30",
};

function SkillsPage() {
  const [activeId, setActiveId] = useState(skills[0].id);
  const [search, setSearch] = useState("");
  const [output, setOutput] = useState<"All" | OutputType>("All");
  const [klass, setKlass] = useState<"All" | AssetClass>("All");
  const [status, setStatus] = useState<"All" | Skill["status"]>("All");

  const filtered = useMemo(() => skills.filter((s) => {
    if (output !== "All" && s.output !== output) return false;
    if (klass !== "All" && !s.assetClass.includes(klass)) return false;
    if (status !== "All" && s.status !== status) return false;
    const q = search.toLowerCase();
    if (q && !s.name.toLowerCase().includes(q) && !s.thesis.toLowerCase().includes(q) && !s.tags.some((t) => t.includes(q))) return false;
    return true;
  }), [search, output, klass, status]);

  const active = skills.find((s) => s.id === activeId) ?? skills[0];

  const summary = useMemo(() => {
    const acc = { Production: 0, Beta: 0, Draft: 0, Deprecated: 0 } as Record<Skill["status"], number>;
    skills.forEach((s) => acc[s.status]++);
    return acc;
  }, []);

  return (
    <AppShell full>
      <div className="flex h-full flex-col bg-cream text-ink">
        <header className="border-b border-sand bg-paper/60 px-8 py-5">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="eyebrow mb-1">Catalogue</div>
              <h1 className="font-display text-[26px] text-ink">Skills</h1>
              <p className="text-[12.5px] text-taupe mt-1">
                The things an agent can <em>do</em> for the desk — initiative briefs, status rollups, thesis drafting,
                tear sheets, MNPI lens. Versioned, owned, and traceable.
              </p>
            </div>
            <div className="flex items-center gap-2 tabular text-[12px]">
              <HealthPill label="Production" count={summary.Production} tone="bg-forest/10 text-forest border-forest/30" />
              <HealthPill label="Beta"       count={summary.Beta}       tone="bg-enterprise/10 text-enterprise border-enterprise/30" />
              <HealthPill label="Draft"      count={summary.Draft}      tone="bg-sand text-taupe border-sand" />
              <HealthPill label="Deprecated" count={summary.Deprecated} tone="bg-destructive/10 text-destructive border-destructive/30" />
            </div>
          </div>
        </header>

        <div className="px-8 py-3 border-b border-sand flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-taupe" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search skills, theses or tags…"
              className="w-80 pl-8 pr-3 py-1.5 bg-paper border border-sand rounded-sm text-[12.5px] focus:outline-none focus:border-forest" />
          </div>
          <FilterRow label="Output"      value={output} options={["All", ...SKILL_OUTPUTS]} onChange={(v) => setOutput(v as "All" | OutputType)} />
          <FilterRow label="Asset class" value={klass}  options={ASSET_CLASSES}             onChange={(v) => setKlass(v as "All" | AssetClass)} />
          <FilterRow label="Status"      value={status} options={STATUSES}                  onChange={(v) => setStatus(v as "All" | Skill["status"])} />
        </div>

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-[12.5px]">
              <thead className="sticky top-0 bg-cream border-b border-sand text-taupe">
                <tr className="text-left">
                  <Th>Skill</Th><Th>Output</Th><Th>Coverage</Th>
                  <Th className="text-right">Playbooks</Th>
                  <Th>Owner</Th><Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const Icon = s.icon;
                  const isActive = s.id === active.id;
                  return (
                    <tr key={s.id} onClick={() => setActiveId(s.id)}
                      className={`border-b border-sand cursor-pointer hover:bg-paper/60 ${isActive ? "bg-paper" : ""}`}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-start gap-2.5">
                          <span className="w-7 h-7 rounded-sm bg-forest/10 text-forest flex items-center justify-center shrink-0"><Icon className="w-3.5 h-3.5" /></span>
                          <div>
                            <div className="text-ink">{s.name}</div>
                            <div className="text-[11px] text-taupe line-clamp-1 max-w-md">{s.thesis}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5"><Pill>{s.output}</Pill></td>
                      <td className="px-4 py-2.5 text-taupe max-w-[18ch] truncate">{s.coverage}</td>
                      <td className="px-4 py-2.5 text-right tabular text-taupe">{s.usedInPlaybooks}</td>
                      <td className="px-4 py-2.5 text-taupe text-[11.5px]">{s.owner}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-1.5 py-0.5 text-[10px] border rounded-sm ${statusColor[s.status]}`}>{s.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <aside className="w-[420px] shrink-0 border-l border-sand bg-paper/40 overflow-y-auto p-6">
            <Detail s={active} />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Detail({ s }: { s: Skill }) {
  const Icon = s.icon;
  const invokers = commands.filter((c) => s.invokedVia.includes(c.id));

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-sm bg-forest/10 text-forest flex items-center justify-center"><Icon className="w-4 h-4" /></span>
          <div>
            <div className="font-display text-[18px] text-ink leading-tight">{s.name}</div>
            <div className="text-[11px] text-taupe">{s.owner} · {s.version}</div>
          </div>
        </div>
        <p className="mt-3 text-[12.5px] text-taupe leading-relaxed">{s.thesis}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Output">{s.output}</Field>
        <Field label="Rubric">{s.rubric}</Field>
        <Field label="P50 latency">{s.p50}</Field>
        <Field label="Cost">{s.costPer}</Field>
      </div>

      <Section title="Coverage & mandate">
        <div className="text-[12px] text-ink">{s.coverage}</div>
        <div className="mt-1.5 flex flex-wrap gap-1">{s.assetClass.map((a) => <Chip key={a}>{a}</Chip>)}</div>
      </Section>

      <Section title="Compliance lens">
        <div className="flex flex-wrap gap-1">
          {s.lens.map((l) => (
            <span key={l} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10.5px] border border-forest/30 text-forest rounded-sm">
              <ShieldCheck className="w-3 h-3" /> {l}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Inputs">
        <div className="space-y-1">
          {s.inputs.map((d) => (
            <div key={d} className="flex items-center justify-between border border-sand bg-paper px-2.5 py-1.5 rounded-sm text-[11.5px]">
              <span className="flex items-center gap-1.5 text-ink"><Database className="w-3 h-3 text-taupe" /> {d}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Reach">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-taupe">
          <WorkflowIcon className="w-3 h-3" /> referenced in {s.usedInPlaybooks} playbook{s.usedInPlaybooks === 1 ? "" : "s"}
        </div>
      </Section>

      <Section title="Invoked via">
        {invokers.length === 0 && <Empty>No commands bound.</Empty>}
        <div className="space-y-1">
          {invokers.map((c) => (
            <Link key={c.id} to="/commands" className="flex items-center justify-between border border-sand bg-paper px-2.5 py-1.5 rounded-sm font-mono text-[11.5px] text-ink hover:border-forest">
              <span>{c.trigger}</span><ExternalLink className="w-3 h-3 text-taupe" />
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Tags">
        <div className="flex flex-wrap gap-1">{s.tags.map((t) => <Chip key={t}><Tag className="w-2.5 h-2.5 mr-1 inline" />{t}</Chip>)}</div>
      </Section>

      <div className="flex items-center gap-1.5 text-[11px] text-taupe pt-2 border-t border-sand">
        <Activity className="w-3 h-3" /> Version {s.version} · <GitBranch className="w-3 h-3" /> {s.owner.split("·")[1]?.trim() ?? s.owner}
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2 font-medium text-[10.5px] uppercase tracking-wider ${className}`}>{children}</th>;
}
function HealthPill({ label, count, tone }: { label: string; count: number; tone: string }) {
  return <span className={`px-2 py-0.5 rounded-sm border text-[11px] ${tone}`}>{label} <span className="ml-1 tabular">{count}</span></span>;
}
function Pill({ children }: { children: React.ReactNode }) {
  return <span className="px-1.5 py-0.5 text-[10.5px] border border-sand bg-paper rounded-sm text-ink">{children}</span>;
}
function Chip({ children }: { children: React.ReactNode }) {
  return <span className="px-1.5 py-0.5 text-[10.5px] bg-sand/60 text-ink rounded-sm">{children}</span>;
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
  return <div><div className="text-[9.5px] uppercase tracking-wider text-taupe mb-1.5 flex items-center gap-1.5"><Wand2 className="w-2.5 h-2.5" /> {title}</div>{children}</div>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] text-taupe italic">{children}</div>;
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