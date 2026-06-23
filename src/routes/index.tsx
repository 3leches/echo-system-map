import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/pgmo/AppShell";
import { LAYERS, STATUS_META } from "@/lib/pgmo/types";
import { usePgmo } from "@/lib/pgmo/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PgMO — Enterprise Program Management Studio" },
      { name: "description", content: "The firm's operating system for program delivery. Connect vision, architecture, initiatives and target operating model in one coherent view." },
      { property: "og:title", content: "PgMO — Enterprise Program Management Studio" },
      { property: "og:description", content: "The firm's operating system for program delivery. Connect vision, architecture, initiatives and target operating model in one coherent view." },
    ],
  }),
  component: Index,
});

function Index() {
  const nodes = usePgmo((s) => s.nodes);
  const initiatives = usePgmo((s) => s.initiatives);
  const shared = nodes.filter((n) => n.data.shared).length;
  const byStatus = initiatives.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell>
      <section className="grid grid-cols-12 gap-12 border-b border-border pb-16">
        <div className="col-span-12 lg:col-span-7">
          <div className="eyebrow">Program Management Office</div>
          <h1 className="mt-5 font-display text-[64px] leading-[1.02] text-foreground">
            The leverage to deliver
            <br />
            complex initiatives.
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            PgMO is the firm's operating system for program delivery. It connects
            vision, current-state architecture, live initiatives and the target
            operating model into one coherent view — so leadership knows what is
            happening, why it matters, and how it composes into the future firm.
          </p>
          <div className="mt-10 flex gap-3">
            <Link
              to="/architecture"
              className="rounded-sm bg-primary px-5 py-3 text-[13px] font-medium tracking-wide text-primary-foreground hover:bg-forest-deep"
            >
              Explore the architecture canvas
            </Link>
            <Link
              to="/initiatives"
              className="rounded-sm border border-border bg-paper px-5 py-3 text-[13px] font-medium tracking-wide text-foreground hover:border-primary"
            >
              Review initiatives
            </Link>
          </div>
        </div>

        <aside className="col-span-12 space-y-3 lg:col-span-5">
          <Stat eyebrow="Mapped" value={String(nodes.length)} label="workflow · data · system nodes" />
          <Stat eyebrow="Enterprise" value={String(shared)} label="shared platforms identified" />
          <Stat eyebrow="In flight" value={String(byStatus["in_flight"] ?? 0)} label="initiatives moving today" />
        </aside>
      </section>

      <section className="grid grid-cols-12 gap-12 py-16">
        <div className="col-span-12 lg:col-span-4">
          <div className="eyebrow">The four-state view</div>
          <h2 className="mt-3 font-display text-3xl text-foreground">
            From vision to delivery.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
            PgMO treats every program as a living bridge between where the firm is
            and where it needs to be. The canvas keeps vision, current state,
            active initiatives and target model in one place — so nothing drifts
            out of alignment.
          </p>
        </div>
        <div className="col-span-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border lg:col-span-8">
          {[
            { e: "01 Vision", t: "The strategic intent and target operating model the firm is building toward." },
            { e: "02 Current", t: "The live landscape of workflows, data and systems — mapped by layer." },
            { e: "03 Initiatives", t: "Every program captured in a standard template, linked to the architecture it changes." },
            { e: "04 Target", t: "The future-state model initiatives compose into, with clear dependencies and KPIs." },
          ].map((b) => (
            <div key={b.e} className="bg-paper p-7">
              <div className="eyebrow">{b.e}</div>
              <p className="mt-3 font-display text-[19px] leading-snug text-foreground">{b.t}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="eyebrow">Operating model layers</div>
            <h2 className="mt-3 font-display text-3xl text-foreground">
              Every layer of the firm, in one canvas.
            </h2>
          </div>
          <Link to="/architecture" className="text-[13px] text-primary hover:underline">
            View the canvas →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-4">
          {LAYERS.map((l) => (
            <div key={l.id} className="bg-paper p-5" style={{ boxShadow: `inset 0 3px 0 ${l.hue}` }}>
              <div className="font-display text-[17px] text-foreground">{l.label}</div>
              <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{l.description}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="eyebrow">Initiative pipeline</div>
            <h2 className="mt-3 font-display text-3xl text-foreground">
              Where the firm is investing.
            </h2>
          </div>
          <Link to="/roadmap" className="text-[13px] text-primary hover:underline">
            Open the roadmap →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Object.entries(STATUS_META).map(([k, m]) => (
            <div key={k} className="rounded-sm border border-border bg-paper p-4">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: m.tone }}>
                {m.label}
              </div>
              <div className="mt-1 font-display text-3xl text-foreground">{byStatus[k] ?? 0}</div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ eyebrow, value, label }: { eyebrow: string; value: string; label: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border py-5">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <div className="mt-1 text-[13px] text-muted-foreground">{label}</div>
      </div>
      <div className="font-display text-5xl text-primary">{value}</div>
    </div>
  );
}
