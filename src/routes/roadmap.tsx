import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/pgmo/AppShell";
import { usePgmo } from "@/lib/pgmo/store";
import { LAYERS, STATUS_META, type LayerId, type Initiative } from "@/lib/pgmo/types";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — PgMO" },
      { name: "description", content: "A timeline view of every initiative, grouped by layer, computed from the standard initiative template." },
      { property: "og:title", content: "Roadmap — PgMO" },
      { property: "og:description", content: "A timeline view of every initiative, grouped by layer." },
    ],
  }),
  component: Roadmap,
});

function Roadmap() {
  const initiatives = usePgmo((s) => s.initiatives);
  const [showLeads, setShowLeads] = useState(true);

  const { months, minMs, totalMs } = useMemo(() => {
    if (initiatives.length === 0) {
      const now = new Date();
      return { months: [], minMs: now.getTime(), totalMs: 1 };
    }
    const min = Math.min(...initiatives.map((i) => new Date(i.startDate).getTime()));
    const max = Math.max(...initiatives.map((i) => new Date(i.endDate).getTime()));
    const start = new Date(min);
    start.setDate(1);
    const end = new Date(max);
    end.setMonth(end.getMonth() + 1, 1);
    const ms: { date: Date; label: string }[] = [];
    const cursor = new Date(start);
    while (cursor < end) {
      ms.push({ date: new Date(cursor), label: cursor.toLocaleDateString(undefined, { month: "short", year: "2-digit" }) });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return { months: ms, minMs: start.getTime(), totalMs: end.getTime() - start.getTime() };
  }, [initiatives]);

  const byLayer = useMemo(() => {
    const m = new Map<LayerId, typeof initiatives>();
    LAYERS.forEach((l) => m.set(l.id, []));
    initiatives.forEach((i) => {
      const layers = i.layers.length > 0 ? i.layers : (["enterprise"] as LayerId[]);
      layers.forEach((l) => {
        if (!m.get(l)?.find((x) => x.id === i.id)) {
          m.get(l)?.push(i);
        }
      });
    });
    return m;
  }, [initiatives]);

  const pct = (ms: number) => ((ms - minMs) / totalMs) * 100;

  return (
    <AppShell>
      <div className="border-b border-border pb-8">
        <div className="eyebrow">Roadmap</div>
        <h1 className="mt-3 font-display text-5xl text-foreground">
          The firm's journey, in months and layers.
        </h1>
        <p className="mt-3 max-w-2xl text-[14px] text-muted-foreground">
          Every bar is one initiative, drawn from its standard template. Toggle lead measures
          to expand 4DX sub-tracks under each bar.
        </p>
        <div className="mt-4 flex items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setShowLeads((v) => !v)}
            className={
              "rounded-sm border px-3 py-1.5 " +
              (showLeads
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:text-foreground")
            }
          >
            {showLeads ? "✓ Lead measures shown" : "Show lead measures"}
          </button>
          <span className="text-muted-foreground">
            Sub-tracks render below each bar with weekly target vs. actual hit rate.
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="overflow-x-auto rounded-sm border border-border bg-paper">
        <div className="min-w-[1100px]">
          {/* Month header */}
          <div className="grid border-b border-border" style={{ gridTemplateColumns: "200px 1fr" }}>
            <div className="border-r border-border px-4 py-3 eyebrow">Layer</div>
            <div className="relative h-10">
              {months.map((m, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-dashed border-border pl-1.5 pt-2 text-[10px] uppercase tracking-wider text-muted-foreground"
                  style={{ left: `${pct(m.date.getTime())}%` }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {LAYERS.map((layer) => {
            const items = byLayer.get(layer.id) ?? [];
            const rowH = showLeads ? 48 : 30;
            const minH = Math.max(80, items.length * rowH + 24);
            return (
              <div
                key={layer.id}
                className="grid border-b border-border"
                style={{ gridTemplateColumns: "200px 1fr" }}
              >
                <div
                  className="border-r border-border px-4 py-4"
                  style={{ boxShadow: `inset 3px 0 0 ${layer.hue}` }}
                >
                  <div className="font-display text-[15px] text-foreground">{layer.label}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{items.length} init.</div>
                </div>
                <div className="relative py-3" style={{ minHeight: minH }}>
                  {/* Month grid lines */}
                  {months.map((m, i) => (
                    <div
                      key={i}
                      className="absolute top-0 h-full border-l border-dashed border-border/60"
                      style={{ left: `${pct(m.date.getTime())}%` }}
                    />
                  ))}
                  {items.map((i, idx) => {
                    const start = new Date(i.startDate).getTime();
                    const end = new Date(i.endDate).getTime();
                    const left = pct(start);
                    const width = Math.max(((end - start) / totalMs) * 100, 2);
                    const meta = STATUS_META[i.status];
                    const top = 12 + idx * rowH;
                    return (
                      <div key={i.id} className="absolute" style={{ left: `${left}%`, width: `${width}%`, top }}>
                        <Link
                          to="/initiatives/$id"
                          params={{ id: i.id }}
                          className="flex h-7 items-center overflow-hidden rounded-sm border bg-background px-2 text-[11px] hover:z-10 hover:shadow"
                          style={{
                            borderColor: meta.tone,
                            boxShadow: `inset 3px 0 0 ${meta.tone}`,
                          }}
                          title={`${i.name} — ${meta.label}${i.wig?.statement ? "\nWIG: " + i.wig.statement : ""}`}
                        >
                          <span className="truncate font-medium text-foreground">{i.name}</span>
                        </Link>
                        {showLeads && (i.leadMeasures ?? []).slice(0, 2).map((lm) => {
                          const totalT = lm.weeks.reduce((s, w) => s + w.target, 0);
                          const totalA = lm.weeks.reduce((s, w) => s + w.actual, 0);
                          const hit = totalT ? Math.min(100, (totalA / totalT) * 100) : 0;
                          const ok = hit >= 90;
                          const pace = hit >= 60;
                          return (
                            <div key={lm.id} className="mt-1 flex items-center gap-1" title={`${lm.name}: ${totalA}/${totalT} ${lm.unit ?? ""}`}>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand/70">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${hit}%`,
                                    background: ok ? "var(--forest)" : pace ? "#b45309" : "#dc2626",
                                  }}
                                />
                              </div>
                              <span className="w-8 shrink-0 text-right font-mono text-[9px] text-muted-foreground">
                                {Math.round(hit)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LeadMeasuresPanel initiatives={initiatives} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-[11px]">
        {Object.entries(STATUS_META).map(([k, m]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm" style={{ background: m.tone }} />
            <span className="text-muted-foreground">{m.label}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function LeadMeasuresPanel({ initiatives }: { initiatives: Initiative[] }) {
  const rows = initiatives.flatMap((i) =>
    (i.leadMeasures ?? []).map((lm) => {
      const totalT = lm.weeks.reduce((s, w) => s + w.target, 0);
      const totalA = lm.weeks.reduce((s, w) => s + w.actual, 0);
      const last = lm.weeks[lm.weeks.length - 1];
      const hit = totalT ? Math.round((totalA / totalT) * 100) : 0;
      return { initiative: i, lm, totalT, totalA, last, hit };
    }),
  );
  return (
    <aside className="rounded-sm border border-border bg-paper p-4">
      <div className="eyebrow">Lead measures — weekly cadence</div>
      <p className="mt-1 text-[11.5px] text-muted-foreground">
        4DX scoreboard: are the predictive activities hitting their weekly targets?
      </p>
      <div className="mt-4 space-y-3">
        {rows.length === 0 && (
          <div className="text-[12px] text-muted-foreground">No lead measures defined yet.</div>
        )}
        {rows.map(({ initiative, lm, totalT, totalA, last, hit }) => {
          const ok = hit >= 90;
          const pace = hit >= 60;
          const tone = ok ? "var(--forest)" : pace ? "#b45309" : "#dc2626";
          return (
            <Link
              key={initiative.id + lm.id}
              to="/initiatives/$id"
              params={{ id: initiative.id }}
              className="block rounded-sm border border-border bg-background p-2.5 hover:border-primary"
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="truncate text-[12.5px] text-foreground">{lm.name}</div>
                <div className="shrink-0 font-mono text-[11px]" style={{ color: tone }}>{hit}%</div>
              </div>
              <div className="mt-0.5 truncate text-[10.5px] text-muted-foreground">{initiative.name}</div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-sand/60">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, hit)}%`, background: tone }} />
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{totalA}/{totalT} {lm.unit ?? ""}</span>
                <span>{last ? `last wk ${last.actual}/${last.target}` : "no weeks yet"}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}