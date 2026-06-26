import { Link, useRouterState } from "@tanstack/react-router";
import {
  Briefcase,
  Workflow as WorkflowIcon,
  Network,
  Target,
  Calendar,
  Settings,
  HelpCircle,
  CircleDot,
  LayoutDashboard,
  Wand2,
  Terminal,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

const items: { to: string; icon: LucideIcon; label: string; match: (p: string) => boolean }[] = [
  { to: "/",            icon: LayoutDashboard, label: "Dashboard",          match: (p) => p === "/" },
  { to: "/research",    icon: Briefcase,    label: "Program Management", match: (p) => p.startsWith("/research") },
  { to: "/workflows",   icon: WorkflowIcon, label: "Workflows",    match: (p) => p.startsWith("/workflows") },
  { to: "/architecture",icon: Network,      label: "Architecture", match: (p) => p.startsWith("/architecture") },
  { to: "/initiatives", icon: Target,       label: "Initiatives",  match: (p) => p.startsWith("/initiatives") },
  { to: "/roadmap",     icon: Calendar,     label: "Roadmap",      match: (p) => p.startsWith("/roadmap") },
  { to: "/skills",      icon: Wand2,        label: "Skills",       match: (p) => p.startsWith("/skills") },
  { to: "/commands",    icon: Terminal,     label: "Commands",     match: (p) => p.startsWith("/commands") },
  { to: "/glossary",    icon: BookOpen,     label: "Glossary",     match: (p) => p.startsWith("/glossary") },
];

export function AppRail() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex w-14 shrink-0 flex-col items-center border-r border-sand bg-paper py-4">
      <Link
        to="/"
        aria-label="PgMO home"
        className="mb-5 flex h-9 w-9 items-center justify-center rounded-sm bg-forest text-cream"
      >
        <CircleDot className="h-4 w-4" strokeWidth={2.5} />
      </Link>
      <nav className="flex flex-col gap-1">
        {items.map(({ to, icon: Icon, label, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={to}
              to={to}
              title={label}
              className={
                "group relative flex h-9 w-9 items-center justify-center rounded-sm transition-colors " +
                (active
                  ? "bg-forest/10 text-forest"
                  : "text-taupe hover:bg-cream hover:text-ink")
              }
            >
              <Icon className="h-4 w-4" />
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 -translate-x-[1px] rounded-r-sm bg-forest" />
              )}
              <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-sm bg-ink px-2 py-1 text-[11px] text-cream opacity-0 group-hover:opacity-100">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-1">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-sm text-taupe hover:bg-cream hover:text-ink"
          title="Settings"
          type="button"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-sm text-taupe hover:bg-cream hover:text-ink"
          title="Help"
          type="button"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}