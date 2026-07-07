"use client";

import { ProfileTab } from "@/lib/enums";
import { cn } from "@/lib/utils";

type ProfileTabBarProps = {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
};

const TABS: { id: ProfileTab; label: string }[] = [
  { id: ProfileTab.Details, label: "Details" },
  { id: ProfileTab.Wallet, label: "Wallet" },
  { id: ProfileTab.Bets, label: "Bets" },
];

export function ProfileTabBar({ activeTab, onTabChange }: ProfileTabBarProps) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl border border-border/80 bg-muted/30 p-1">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
