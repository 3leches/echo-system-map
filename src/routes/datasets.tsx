import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Database,
  KeyRound,
  Link2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Layers,
  RefreshCw,
  Table2,
} from "lucide-react";
import { AppShell } from "@/components/pgmo/AppShell";
import {
  datasets,
  datasetById,
  inboundRelations,
  DATASET_DOMAINS,
  type Dataset,
  type DatasetDomain,
  type SourceKind,
} from "@/lib/pgmo/datasets-mock";
import { sampleRows } from "@/lib/pgmo/dataset-samples";

export const Route = createFileRoute("/datasets")({
  head: () => ({
    meta: [
      { title: "Data Catalog — PgMO" },
      {
        name: "description",
        content:
          "Every dataset that drives the Program Management Studio: grain, fields, keys, ownership, refresh cadence, quality rules and the surfaces each one feeds.",
      },
      { property: "og:title", content: "Data Catalog — PgMO" },
      {
        property: "og:description",
        content:
          "The complete set of datasets needed to run a hedge fund program management office — portfolio, governance, 4DX execution, architecture, semantic and agentic.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DatasetsPage,
});

const sourceTone: Record<SourceKind, string> = {
  "System of record": "bg-forest/10 text-forest border-forest/30",
  "Manual entry": "bg-sand text-taupe border-sand",
  Derived: "bg-paper text-ink border-sand",
  "Agent-generated": "bg-forest/[0.06] text-forest border-forest/20",
  Reference: "bg-paper text-taupe border-sand",
};

const sensitivityTone: Record<Dataset["sensitivity"], string> = {
  Internal: "text-taupe",
  Confidential: "text-ink",
  Restricted: "text-destructive",
};

function DatasetsPage() {
  const [activeId, setActiveId] = useState(datasets[0].id);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState<"All" | DatasetDomain>("All");

  const filtered = useMemo(
    () =>
      datasets.filter((d) => {
        if (domain !== "All" && d.domain !== domain) return false;
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          d.name.toLowerCase().includes(q) ||
          d.table.toLowerCase().includes(q) ||
          d.purpose.toLowerCase().includes(q) ||
          d.fields.some((f) => f.name.toLowerCase().includes(q))
        );
      }),
    [search, domain],
  );

  const active = datasets.find((d) => d.id === activeId) ?? datasets[0];

  const totalFields = datasets.reduce((n, d) => n + d.fields.length, 0);
  const totalRels = datasets.reduce((n, d) => n + d.relations.length, 0);
  const manual = datasets.filter((d) => d.source === "Manual entry").length;

  return (
    <AppShell full>
      <div className="flex h-full flex-col bg-cream text-ink">
        <header className="border-b border-sand bg-paper/60 px-8 py-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow mb-1">Data catalog</div>
              <h1 className="font-display text-[26px] text-ink">Datasets behind the Studio</h1>
              <p className="mt-1 max-w-3xl text-[12.5px] text-taupe">
                Everything on the Dashboard, Initiatives, Roadmap, Workflows and Architecture is sourced from the
                datasets below. This is the complete inventory of what the firm would need to capture, own and refresh
                to run the Studio on real data — grain, fields, keys, cadence and the surfaces each one feeds.
              </p>
            </div>
            <div className="tabular flex flex-wrap items-center gap-2 text-[11.5px] text-taupe">
              <Stat>{datasets.length} datasets</Stat>
              <Stat>{totalFields} fields</Stat>
              <Stat>{totalRels} relationships</Stat>
              <span className="rounded-sm border border-forest/30 bg-forest/10 px-2 py-0.5 text-forest">
                {manual} manually maintained
              </span>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-3 border-b border-sand px-8 py-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-taupe" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search datasets, tables, fields…"
              className="w-80 rounded-sm border border-sand bg-paper py-1.5 pl-8 pr-3 text-[12.5px] focus:border-forest focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] uppercase tracking-wider text-taupe">Domain</span>
            <div className="flex flex-wrap gap-1">
              {(["All", ...DATASET_DOMAINS] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setDomain(o as "All" | DatasetDomain)}
                  className={`rounded-sm border px-2 py-0.5 text-[11px] ${
                    domain === o
                      ? "border-forest bg-forest/10 text-forest"
                      : "border-sand bg-paper text-taupe hover:text-ink"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-[12.5px]">
              <thead className="sticky top-0 border-b border-sand bg-cream text-taupe">
                <tr className="text-left">
                  <Th>Dataset</Th>
                  <Th>Domain</Th>
                  <Th>Grain</Th>
                  <Th>Source</Th>
                  <Th>Refresh</Th>
                  <Th>Owner</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const isActive = d.id === active.id;
                  return (
                    <tr
                      key={d.id}
                      onClick={() => setActiveId(d.id)}
                      className={`cursor-pointer border-b border-sand hover:bg-paper/60 ${isActive ? "bg-paper" : ""}`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-start gap-2.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-forest/10 text-forest">
                            <Database className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <div className="text-ink">{d.name}</div>
                            <div className="font-mono text-[10.5px] text-taupe">{d.table}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Pill>{d.domain}</Pill>
                      </td>
                      <td className="max-w-[220px] px-4 py-2.5 text-[11.5px] text-taupe">{d.grain}</td>
                      <td className="px-4 py-2.5">
                        <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] ${sourceTone[d.source]}`}>
                          {d.source}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[11.5px] text-taupe">{d.refresh}</td>
                      <td className="px-4 py-2.5 text-[11.5px] text-taupe">{d.owner}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[12px] italic text-taupe">
                      No datasets match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <aside className="w-[460px] shrink-0 overflow-y-auto border-l border-sand bg-paper/40 p-6">
            <Detail d={active} onPick={setActiveId} />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function SampleValues({ d }: { d: Dataset }) {
  const rows = useMemo(() => sampleRows(d, 3), [d]);
  const [row, setRow] = useState(0);
  const [mode, setMode] = useState<"record" | "table">("record");
  const current = rows[Math.min(row, rows.length - 1)];

  return (
    <Section title="Sample values" icon={<Table2 className="h-2.5 w-2.5" />}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {rows.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setMode("record");
                setRow(i);
              }}
              className={`tabular rounded-sm border px-1.5 py-0.5 text-[10.5px] ${
                mode === "record" && i === row
                  ? "border-forest bg-forest/10 text-forest"
                  : "border-sand bg-paper text-taupe hover:text-ink"
              }`}
            >
              Row {i + 1}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setMode(mode === "table" ? "record" : "table")}
          className={`rounded-sm border px-1.5 py-0.5 text-[10.5px] ${
            mode === "table" ? "border-forest bg-forest/10 text-forest" : "border-sand bg-paper text-taupe hover:text-ink"
          }`}
        >
          Table view
        </button>
      </div>

      {mode === "record" ? (
        <div className="overflow-hidden rounded-sm border border-sand bg-paper">
          <table className="w-full text-[11.5px]">
            <tbody>
              {d.fields.map((f) => (
                <tr key={f.name} className="border-b border-sand align-top last:border-b-0">
                  <td className="w-[40%] px-2.5 py-1.5 font-mono text-[10.5px] text-taupe">{f.name}</td>
                  <td className="px-2.5 py-1.5 font-mono text-[10.5px] text-ink">{current[f.name]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-sand bg-paper">
          <table className="min-w-full text-[10.5px]">
            <thead className="border-b border-sand bg-cream/60 text-taupe">
              <tr>
                {d.fields.map((f) => (
                  <th key={f.name} className="whitespace-nowrap px-2 py-1 text-left font-mono font-normal">
                    {f.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-sand last:border-b-0">
                  {d.fields.map((f) => (
                    <td key={f.name} className="max-w-[240px] truncate whitespace-nowrap px-2 py-1 font-mono text-ink">
                      {r[f.name]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-1 text-[10px] italic text-taupe">
        Illustrative records — representative of the {d.seededRows} rows this dataset carries in the prototype.
      </div>
    </Section>
  );
}

function Detail({ d, onPick }: { d: Dataset; onPick: (id: string) => void }) {
  const inbound = inboundRelations(d.id);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-forest/10 text-forest">
            <Database className="h-4 w-4" />
          </span>
          <div>
            <div className="font-display text-[18px] leading-tight text-ink">{d.name}</div>
            <div className="font-mono text-[11px] text-taupe">{d.table}</div>
          </div>
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink">{d.purpose}</p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-sm border border-sand bg-paper px-3 py-2.5 text-[11.5px]">
        <Meta label="Grain" value={d.grain} />
        <Meta label="Source" value={d.source} />
        <Meta label="Owner" value={d.owner} />
        {d.steward && <Meta label="Steward" value={d.steward} />}
        <Meta label="Refresh" value={d.refresh} icon={<RefreshCw className="h-2.5 w-2.5" />} />
        <Meta
          label="Sensitivity"
          value={d.sensitivity}
          className={sensitivityTone[d.sensitivity]}
          icon={<ShieldCheck className="h-2.5 w-2.5" />}
        />
        {d.upstream && <Meta label="Upstream" value={d.upstream} span />}
        <Meta label="Seeded rows (prototype)" value={String(d.seededRows)} />
        <Meta label="Fields" value={String(d.fields.length)} />
      </div>

      <SampleValues d={d} />

      <Section title="Schema" icon={<KeyRound className="h-2.5 w-2.5" />}>

        <div className="overflow-hidden rounded-sm border border-sand bg-paper">
          <table className="w-full text-[11.5px]">
            <tbody>
              {d.fields.map((f) => (
                <tr key={f.name} className="border-b border-sand last:border-b-0 align-top">
                  <td className="w-[42%] px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-ink">{f.name}</span>
                      {f.key === "pk" && <KeyTag>PK</KeyTag>}
                      {f.key === "fk" && <KeyTag>FK</KeyTag>}
                      {f.required && <span className="text-[10px] text-destructive">*</span>}
                    </div>
                    {f.ref && <div className="font-mono text-[10px] text-taupe">→ {f.ref}</div>}
                  </td>
                  <td className="px-2.5 py-1.5">
                    <div className="font-mono text-[10.5px] text-taupe">{f.type}</div>
                    {f.note && <div className="text-[10.5px] text-taupe">{f.note}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-1 text-[10px] text-taupe">
          <span className="text-destructive">*</span> required
        </div>
      </Section>

      <Section title="Relationships" icon={<Link2 className="h-2.5 w-2.5" />}>
        <div className="space-y-1">
          {d.relations.map((r, i) => {
            const target = datasetById[r.to];
            return (
              <div
                key={i}
                className="flex items-start gap-2 rounded-sm border border-sand bg-paper px-2.5 py-1.5 text-[11.5px]"
              >
                <span className="tabular shrink-0 rounded-sm bg-sand/60 px-1 text-[10px] text-ink">{r.cardinality}</span>
                <div className="min-w-0">
                  {target ? (
                    <button
                      type="button"
                      onClick={() => onPick(target.id)}
                      className="text-ink underline decoration-sand underline-offset-2 hover:decoration-forest"
                    >
                      {target.name}
                    </button>
                  ) : (
                    <span className="text-ink">{r.to}</span>
                  )}
                  <span className="font-mono text-[10px] text-taupe"> · via {r.via}</span>
                  {r.note && <div className="text-[10.5px] text-taupe">{r.note}</div>}
                </div>
              </div>
            );
          })}
          {d.relations.length === 0 && <div className="text-[11.5px] italic text-taupe">Standalone dataset.</div>}
        </div>
        {inbound.length > 0 && (
          <div className="mt-2">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-taupe">Referenced by</div>
            <div className="flex flex-wrap gap-1">
              {inbound.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onPick(s.id)}
                  className="rounded-sm border border-sand bg-paper px-1.5 py-0.5 text-[10.5px] text-ink hover:border-forest"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="Feeds these surfaces" icon={<Layers className="h-2.5 w-2.5" />}>
        <div className="flex flex-wrap gap-1">
          {d.surfaces.map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
      </Section>

      {d.qualityRules && d.qualityRules.length > 0 && (
        <Section title="Quality rules" icon={<CheckCircle2 className="h-2.5 w-2.5" />}>
          <ul className="space-y-1">
            {d.qualityRules.map((q, i) => (
              <li
                key={i}
                className="rounded-sm border border-sand bg-paper px-2.5 py-1.5 text-[11.5px] leading-relaxed text-ink"
              >
                {q}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="If this dataset is missing or stale" icon={<AlertTriangle className="h-2.5 w-2.5" />}>
        <div className="rounded-sm border border-destructive/20 bg-destructive/[0.04] px-3 py-2 text-[12px] leading-relaxed text-ink">
          {d.ifMissing}
        </div>
      </Section>
    </div>
  );
}

function Stat({ children }: { children: React.ReactNode }) {
  return <span className="rounded-sm border border-sand bg-paper px-2 py-0.5">{children}</span>;
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 text-[10.5px] font-medium uppercase tracking-wider">{children}</th>;
}
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm border border-sand bg-paper px-1.5 py-0.5 text-[10.5px] text-ink">{children}</span>
  );
}
function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-sm bg-sand/60 px-1.5 py-0.5 text-[10.5px] text-ink">{children}</span>;
}
function KeyTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm border border-forest/30 bg-forest/10 px-1 text-[9px] uppercase text-forest">
      {children}
    </span>
  );
}
function Meta({
  label,
  value,
  icon,
  span,
  className,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  span?: boolean;
  className?: string;
}) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <div className="flex items-center gap-1 text-[9.5px] uppercase tracking-wider text-taupe">
        {icon} {label}
      </div>
      <div className={`text-[11.5px] ${className ?? "text-ink"}`}>{value}</div>
    </div>
  );
}
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-[9.5px] uppercase tracking-wider text-taupe">
        {icon} {title}
      </div>
      {children}
    </div>
  );
}
