import type { ReactNode } from "react";
import { AppRail } from "./AppRail";

export function AppShell({ children, full = false }: { children: ReactNode; full?: boolean }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <AppRail />
      <main
        className={
          full
            ? "h-full min-w-0 flex-1 overflow-hidden"
            : "min-w-0 flex-1 overflow-y-auto px-8 py-10"
        }
      >
        {children}
      </main>
    </div>
  );
}