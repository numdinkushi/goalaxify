"use client";

import Link from "next/link";

import { NAV_TABS } from "@/lib/constants/navigation";
import { isRouteActive, useActiveRoute } from "@/hooks/use-active-route";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const activeRoute = useActiveRoute();

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-stretch px-1 py-2">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = isRouteActive(activeRoute, tab.href);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1 rounded-xl px-1 py-2 transition-colors",
                isActive
                  ? "text-brand-coral"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-xl transition-colors",
                  isActive && "bg-brand-coral/20",
                )}
              >
                <Icon className="size-4" strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
