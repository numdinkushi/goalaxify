"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { NAV_TABS } from "@/lib/constants/navigation";
import { isRouteActive, useActiveRoute } from "@/hooks/use-active-route";
import { cn } from "@/lib/utils";

function BottomNavBar() {
  const activeRoute = useActiveRoute();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-card/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch px-0.5 py-1.5 sm:px-1 sm:py-2">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = isRouteActive(activeRoute, tab.href);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 transition-colors sm:gap-1 sm:px-1 sm:py-2",
                isActive
                  ? "text-brand-coral"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-xl transition-colors sm:size-8",
                  isActive && "bg-brand-coral/20",
                )}
              >
                <Icon className="size-4" strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span className="max-w-full truncate text-[9px] font-medium sm:text-[10px]">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Render on document.body so fixed positioning is never trapped by app layout wrappers. */
export function BottomNav() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(<BottomNavBar />, document.body);
}
