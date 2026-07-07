import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="goalaxify-page pb-[calc(var(--bottom-nav-height)+1.5rem+env(safe-area-inset-bottom,0px))]">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
