import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/atlas/AppShell";
import { useAtlas } from "@/lib/atlas/store";
import { LAYERS, STATUS_META, type LayerId } from "@/lib/atlas/types";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — Atlas" },
      { name: "description", content: "A timeline view of every initiative, grouped by layer, computed from the standard initiative template." },
      { property: "og:title", content: "Roadmap — Atlas" },
      { property: "og:description", content: "A timeline view of every initiative, grouped by layer." },
    ],
  }),
  component: Roadmap,
});

function Roadmap() {
  const initiatives = useAtlas((s) => s.initiatives);

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
          Every bar is one initiative, drawn from its standard template. Dependencies flow
          left to right; click a bar to open the initiative.
        </p>
      </div>

      <div className="mt-10 overflow-x-auto rounded-sm border border-border bg-paper">
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
                <div className="relative min-h-[80px] py-3">
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
                    return (
                      <Link
                        key={i.id}
                        to="/initiatives/$id"
                        params={{ id: i.id }}
                        className="absolute flex h-7 items-center overflow-hidden rounded-sm border bg-background px-2 text-[11px] hover:z-10 hover:shadow"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          top: 12 + (idx % 3) * 30,
                          borderColor: meta.tone,
                          boxShadow: `inset 3px 0 0 ${meta.tone}`,
                        }}
                        title={`${i.name} — ${meta.label}`}
                      >
                        <span className="truncate font-medium text-foreground">{i.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
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