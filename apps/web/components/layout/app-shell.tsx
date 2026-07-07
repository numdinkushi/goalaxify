import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-svh pb-24">
      <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
