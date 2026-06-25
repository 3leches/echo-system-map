import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Overview" },
  { to: "/architecture", label: "Architecture" },
  { to: "/initiatives", label: "Initiatives" },
  { to: "/roadmap", label: "Roadmap" },
];

export function AppShell({ children, full = false }: { children: ReactNode; full?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-paper/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-8">
          <Link to="/" className="flex items-baseline gap-3">
            <span className="font-display text-2xl tracking-[0.18em] text-primary">PgMO</span>
            <span className="eyebrow hidden sm:inline">Studio</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "rounded px-4 py-2 text-sm transition-colors " +
                    (active ? "text-primary" : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {item.label}
                  {active && <span className="mt-1 block h-px w-full bg-primary" aria-hidden />}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className={full ? "flex-1" : "mx-auto w-full max-w-[1600px] flex-1 px-8 py-10"}>
        {children}
      </main>
      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 text-xs text-muted-foreground">
          <span>© PgMO Studio</span>
          <span className="eyebrow">Built for complex program delivery</span>
        </div>
      </footer>
    </div>
  );
}