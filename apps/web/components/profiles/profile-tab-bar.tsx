"use client";

import { ProfileTab } from "@/lib/enums";
import { useTranslation } from "@/hooks/use-translation";

const TAB_KEYS: Record<ProfileTab, string> = {
  [ProfileTab.Details]: "profiles.tabs.details",
  [ProfileTab.Wallet]: "profiles.tabs.wallet",
  [ProfileTab.Bets]: "profiles.tabs.bets",
};
import { cn } from "@/lib/utils";

type ProfileTabBarProps = {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
};

const TABS = [ProfileTab.Details, ProfileTab.Wallet, ProfileTab.Bets] as const;

export function ProfileTabBar({ activeTab, onTabChange }: ProfileTabBarProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl border border-border/80 bg-muted/30 p-1">
      {TABS.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={cn(
              "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(TAB_KEYS[tab])}
          </button>
        );
      })}
    </div>
  );
}
