import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="mx-auto w-full max-w-lg pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom,0px))]">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
