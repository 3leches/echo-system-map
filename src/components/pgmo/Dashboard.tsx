import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  Network,
  Workflow as WorkflowIcon,
  ArrowUpRight,
  CircleDot,
  Trophy,
  ArrowDown,
  ArrowUp,
  Minus,
  Wind,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { usePgmo } from "@/lib/pgmo/store";
import {
  LAYERS,
  STATUS_META,
  type Initiative,
  type InitiativeStatus,
  type FirmWig,
} from "@/lib/pgmo/types";

function parseInvestment(s?: string): number {
  if (!s) return 0;
  const m = s.match(/([\d.]+)\s*([MK]?)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = m[2]?.toUpperCase();
  return unit === "M" ? n * 1_000_000 : unit === "K" ? n * 1_000 : n;
}
function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function daysUntil(s: string): number {
  return Math.ceil((new Date(s).getTime() - Date.now()) / 86_400_000);
}

export function Dashboard() {
  const initiatives = usePgmo((s) => s.initiatives);
  const nodes = usePgmo((s) => s.nodes);
  const firmWigs = usePgmo((s) => s.firmWigs);
  const whirlwindRatio = usePgmo((s) => s.whirlwindRatio);
  const setWhirlwindRatio = usePgmo((s) => s.setWhirlwindRatio);

  const stats = useMemo(() => {
    const byStatus = initiatives.reduce<Record<InitiativeStatus, number>>(
      (acc, i) => ({ ...acc, [i.status]: (acc[i.status] ?? 0) + 1 }),
      {} as Record<InitiativeStatus, number>,
    );
    const investment = initiatives.reduce((s, i) => s + parseInvestment(i.investment), 0);
    const allMilestones = initiatives.flatMap((i) =>
      i.milestones.map((m) => ({ ...m, initiative: i })),
    );
    const doneMs = allMilestones.filter((m) => m.done).length;
    const totalMs = allMilestones.length;
    const upcoming = allMilestones
      .filter((m) => !m.done)
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .slice(0, 5);
    const atRisk = initiatives.filter((i) => i.status === "at_risk");
    const inFlight = initiatives.filter((i) => i.status === "in_flight");
    const layerCounts = LAYERS.map((l) => ({
      layer: l,
      count: initiatives.filter((i) => i.layers.includes(l.id)).length,
    }));
    return {
      byStatus,
      investment,
      milestoneProgress: totalMs ? Math.round((doneMs / totalMs) * 100) : 0,
      milestoneDone: doneMs,
      milestoneTotal: totalMs,
      upcoming,
      atRisk,
      inFlight,
      layerCounts,
    };
  }, [initiatives]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <header className="border-b border-sand pb-6">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-taupe">
          <CircleDot className="h-3 w-3 text-forest" />
          Program Management Office
        </div>
        <h1 className="mt-3 font-display text-[40px] leading-tight text-ink">
          The firm's operating system for program delivery.
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-taupe">
          A single pane of glass connecting strategy, initiatives, workflows and architecture —
          so leaders can see how today's landscape is moving toward the target vision.
        </p>
      </header>

      {/* Mission / Vision */}
      <section className="grid gap-4 md:grid-cols-2">
        <Panel eyebrow="Mission" title="Deliver leverage across the firm.">
          Run the firm's most complex initiatives as one coordinated program — connecting front,
          middle and back office, research, risk, compliance and IR around a shared roadmap.
        </Panel>
        <Panel eyebrow="Vision" title="A connected firm, governed by one model.">
          Every workflow, dataset and system traced to the initiative that's moving it from current
          to target state — with measurable KPIs at every layer.
        </Panel>
      </section>

      {/* KPI tiles */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={Target}
          label="Active initiatives"
          value={String(stats.inFlight.length + (stats.byStatus.approved ?? 0))}
          hint={`${initiatives.length} total in register`}
          tone="ink"
        />
        <Kpi
          icon={AlertTriangle}
          label="At risk"
          value={String(stats.atRisk.length)}
          hint={stats.atRisk.length ? "Needs attention" : "All green"}
          tone={stats.atRisk.length ? "warn" : "good"}
        />
        <Kpi
          icon={CheckCircle2}
          label="Milestone progress"
          value={`${stats.milestoneProgress}%`}
          hint={`${stats.milestoneDone} of ${stats.milestoneTotal} delivered`}
          tone="good"
        />
        <Kpi
          icon={DollarSign}
          label="Program investment"
          value={fmtMoney(stats.investment)}
          hint="Across all initiatives"
          tone="ink"
        />
      </section>

      {/* 4DX Scoreboard */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-taupe">
              <Trophy className="h-3 w-3 text-forest" /> Scoreboard · 4DX
            </div>
            <h2 className="mt-1 font-display text-[22px] text-ink">Are we winning?</h2>
          </div>
          <div className="text-[11px] text-taupe">
            A compact players&apos; scoreboard for every firm-level WIG.
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {firmWigs.map((w) => (
            <ScoreboardCard key={w.id} w={w} />
          ))}
          <WhirlwindCard ratio={whirlwindRatio} onChange={setWhirlwindRatio} />
        </div>
      </section>

      {/* Two-column body */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Portfolio health */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Portfolio health"
              hint="Status distribution across the initiative register"
              action={
                <Link
                  to="/initiatives"
                  className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-forest hover:underline"
                >
                  Open register <ArrowUpRight className="h-3 w-3" />
                </Link>
              }
            />
            <StatusBar initiatives={initiatives} />
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {(Object.keys(STATUS_META) as InitiativeStatus[]).map((s) => (
                <div key={s} className="flex items-center justify-between rounded-sm border border-sand bg-paper/40 px-3 py-2 text-[12.5px]">
                  <span className="flex items-center gap-2 text-ink">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: STATUS_META[s].tone }}
                    />
                    {STATUS_META[s].label}
                  </span>
                  <span className="font-mono text-taupe">{stats.byStatus[s] ?? 0}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Initiatives table */}
          <Card>
            <CardHeader
              title="Initiatives in flight"
              hint="Top programs driving the firm from current to target state"
              action={
                <Link
                  to="/roadmap"
                  className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-forest hover:underline"
                >
                  Roadmap <ArrowUpRight className="h-3 w-3" />
                </Link>
              }
            />
            <div className="mt-2 divide-y divide-sand">
              {initiatives.slice(0, 6).map((i) => (
                <InitiativeRow key={i.id} i={i} />
              ))}
            </div>
          </Card>
        </div>

        {/* Side rail */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Upcoming milestones" hint="Next 5 across all initiatives" />
            <div className="mt-2 space-y-3">
              {stats.upcoming.length === 0 && (
                <div className="text-[12px] text-taupe">No open milestones.</div>
              )}
              {stats.upcoming.map((m) => {
                const d = daysUntil(m.date);
                const overdue = d < 0;
                return (
                  <Link
                    key={m.id + m.initiative.id}
                    to="/initiatives/$id"
                    params={{ id: m.initiative.id }}
                    className="block rounded-sm border border-sand bg-paper/40 px-3 py-2.5 hover:border-forest"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[13px] leading-snug text-ink">{m.title}</div>
                      <span
                        className={
                          "shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] " +
                          (overdue
                            ? "bg-red-100 text-red-700"
                            : d <= 14
                            ? "bg-amber-100 text-amber-800"
                            : "bg-forest/10 text-forest")
                        }
                      >
                        {overdue ? `${Math.abs(d)}d late` : `${d}d`}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10.5px] text-taupe">
                      <Clock className="h-3 w-3" /> {fmtDate(m.date)} · {m.initiative.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="Coverage by layer" hint="Initiatives touching each domain" />
            <div className="mt-2 space-y-2">
              {stats.layerCounts.map(({ layer, count }) => {
                const max = Math.max(...stats.layerCounts.map((l) => l.count), 1);
                const pct = (count / max) * 100;
                return (
                  <div key={layer.id} className="flex items-center gap-3 text-[12px]">
                    <span className="w-36 shrink-0 text-ink">{layer.label}</span>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-sand/60">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ width: `${pct}%`, background: layer.hue }}
                      />
                    </div>
                    <span className="w-6 text-right font-mono text-taupe">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="Jump into" />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <QuickLink to="/research" icon={Target} label="Program inquiry" />
              <QuickLink to="/workflows" icon={WorkflowIcon} label="Workflows" />
              <QuickLink to="/architecture" icon={Network} label="Architecture" />
              <QuickLink to="/initiatives" icon={Layers} label="Initiatives" />
            </div>
          </Card>
        </div>
      </section>

      {/* Landscape footer */}
      <section className="rounded-sm border border-sand bg-paper/40 px-6 py-5">
        <div className="grid gap-6 sm:grid-cols-3">
          <Stat label="Workflows mapped" value={String(nodes.filter((n) => n.data.kind === "workflow").length)} />
          <Stat label="Systems in landscape" value={String(nodes.filter((n) => n.data.kind === "system").length)} />
          <Stat label="Data assets" value={String(nodes.filter((n) => n.data.kind === "data").length)} />
        </div>
      </section>
    </div>
  );
}

/* ============================ 4DX ============================ */

function ScoreboardCard({ w }: { w: FirmWig }) {
  // direction = "down" means lower is better (e.g. breaches, days)
  const lowerIsBetter = w.target < w.baseline;
  const span = Math.abs(w.target - w.baseline) || 1;
  const progressed = lowerIsBetter ? w.baseline - w.current : w.current - w.baseline;
  const pct = Math.max(0, Math.min(100, (progressed / span) * 100));
  const winning = pct >= 60;
  const onPace = pct >= 30 && pct < 60;
  const tone = winning ? "text-forest" : onPace ? "text-amber-700" : "text-red-600";
  const trendIcon =
    w.trend === "up" ? ArrowUp : w.trend === "down" ? ArrowDown : Minus;
  const TrendIcon = trendIcon;

  return (
    <div className="relative overflow-hidden rounded-sm border border-sand bg-paper/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-taupe">Firm WIG</div>
        <span
          className={
            "rounded-sm px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider " +
            (winning
              ? "bg-forest/10 text-forest"
              : onPace
              ? "bg-amber-100 text-amber-800"
              : "bg-red-100 text-red-700")
          }
        >
          {winning ? "Winning" : onPace ? "On pace" : "Behind"}
        </span>
      </div>
      <div className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-ink">{w.statement}</div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-taupe">Current</div>
          <div className={`font-display text-[34px] leading-none ${tone}`}>
            {w.current}
            {w.unit && <span className="ml-1 text-[12px] text-taupe">{w.unit}</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-taupe">Target</div>
          <div className="font-display text-[18px] text-ink">{w.target}</div>
          <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-taupe">
            <TrendIcon className="h-3 w-3" /> from {w.baseline}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-1.5 overflow-hidden rounded-full bg-sand/60">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: winning ? "var(--forest)" : onPace ? "#b45309" : "#dc2626",
            }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-taupe">
          <span>{Math.round(pct)}% to goal</span>
          <span>by {new Date(w.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      {w.owner && (
        <div className="mt-2 text-[10.5px] text-taupe">Owner · {w.owner}</div>
      )}
    </div>
  );
}

function WhirlwindCard({ ratio, onChange }: { ratio: number; onChange: (n: number) => void }) {
  const wig = 100 - ratio;
  const healthy = wig >= 20;
  return (
    <div className="rounded-sm border border-sand bg-paper/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-taupe">Whirlwind ratio</div>
        <span
          className={
            "rounded-sm px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider " +
            (healthy ? "bg-forest/10 text-forest" : "bg-red-100 text-red-700")
          }
        >
          {healthy ? "Protected" : "WIG starved"}
        </span>
      </div>
      <div className="mt-1.5 text-[12px] leading-snug text-taupe">
        Share of firm capacity spent on the day-job versus the WIGs.
      </div>

      <div className="mt-3 flex items-end gap-3">
        <div className="flex items-center gap-1.5">
          <Wind className="h-4 w-4 text-amber-700" />
          <div>
            <div className="font-display text-[28px] leading-none text-ink">{ratio}%</div>
            <div className="text-[10px] uppercase tracking-wider text-taupe">Whirlwind</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-forest" />
          <div className="text-right">
            <div className="font-display text-[28px] leading-none text-forest">{wig}%</div>
            <div className="text-[10px] uppercase tracking-wider text-taupe">WIG</div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full border border-sand">
        <div style={{ width: `${ratio}%`, background: "#b45309" }} />
        <div style={{ width: `${wig}%`, background: "var(--forest)" }} />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={ratio}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-forest"
        aria-label="Whirlwind ratio"
      />
      <div className="mt-1 text-[10px] text-taupe">
        Healthy zone: ≤ 80% whirlwind (≥ 20% WIG capacity).
      </div>
    </div>
  );
}

function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-sand bg-paper/40 px-5 py-5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-taupe">{eyebrow}</div>
      <div className="mt-2 font-display text-[22px] leading-snug text-ink">{title}</div>
      <p className="mt-2 text-[13px] leading-relaxed text-taupe">{children}</p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-sm border border-sand bg-cream/60 p-5">{children}</div>;
}

function CardHeader({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 pb-3">
      <div>
        <h3 className="font-display text-[18px] text-ink">{title}</h3>
        {hint && <div className="mt-0.5 text-[11px] text-taupe">{hint}</div>}
      </div>
      {action}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone: "ink" | "good" | "warn";
}) {
  const toneClass =
    tone === "good" ? "text-forest" : tone === "warn" ? "text-amber-700" : "text-ink";
  return (
    <div className="rounded-sm border border-sand bg-paper/50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] uppercase tracking-wider text-taupe">{label}</span>
        <Icon className={`h-4 w-4 ${toneClass}`} />
      </div>
      <div className={`mt-2 font-display text-[28px] leading-none ${toneClass}`}>{value}</div>
      <div className="mt-1.5 text-[11px] text-taupe">{hint}</div>
    </div>
  );
}

function StatusBar({ initiatives }: { initiatives: Initiative[] }) {
  const total = initiatives.length || 1;
  const order: InitiativeStatus[] = ["in_flight", "approved", "proposed", "at_risk", "on_hold", "delivered"];
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full border border-sand bg-sand/40">
      {order.map((s) => {
        const c = initiatives.filter((i) => i.status === s).length;
        if (!c) return null;
        return (
          <div
            key={s}
            title={`${STATUS_META[s].label}: ${c}`}
            style={{ width: `${(c / total) * 100}%`, background: STATUS_META[s].tone }}
          />
        );
      })}
    </div>
  );
}

function InitiativeRow({ i }: { i: Initiative }) {
  const done = i.milestones.filter((m) => m.done).length;
  const total = i.milestones.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <Link
      to="/initiatives/$id"
      params={{ id: i.id }}
      className="block py-3 transition-colors hover:bg-paper/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: STATUS_META[i.status].tone }}
            />
            <div className="truncate text-[13.5px] text-ink">{i.name}</div>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-taupe">
            <span>{STATUS_META[i.status].label}</span>
            <span>·</span>
            <span>{i.owner}</span>
            {i.investment && (<><span>·</span><span>{i.investment}</span></>)}
            <span>·</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> {done}/{total} milestones
            </span>
          </div>
        </div>
        <div className="w-32 shrink-0">
          <div className="h-1.5 overflow-hidden rounded-full bg-sand/60">
            <div
              className="h-full rounded-full bg-forest"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 text-right font-mono text-[10.5px] text-taupe">{pct}%</div>
        </div>
      </div>
    </Link>
  );
}

function QuickLink({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-sm border border-sand bg-paper/40 px-3 py-2.5 text-[12.5px] text-ink transition-colors hover:border-forest hover:bg-cream"
    >
      <Icon className="h-3.5 w-3.5 text-forest" />
      {label}
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wider text-taupe">{label}</div>
      <div className="mt-1 font-display text-[26px] text-ink">{value}</div>
    </div>
  );
}