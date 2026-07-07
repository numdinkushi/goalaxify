"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AppRoute, ProfileTab } from "@/lib/enums";

const VALID_TABS = new Set<string>(Object.values(ProfileTab));

export function useProfileTab(defaultTab: ProfileTab = ProfileTab.Details) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab = VALID_TABS.has(rawTab ?? "")
    ? (rawTab as ProfileTab)
    : defaultTab;

  const setActiveTab = useCallback(
    (tab: ProfileTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === defaultTab) {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }

      const query = params.toString();
      router.replace(
        query ? `${AppRoute.Profiles}?${query}` : AppRoute.Profiles,
        { scroll: false },
      );
    },
    [defaultTab, router, searchParams],
  );

  return {
    activeTab,
    setActiveTab,
    pathname,
  };
}

export function profileTabHref(tab: ProfileTab): string {
  if (tab === ProfileTab.Details) {
    return AppRoute.Profiles;
  }

  return `${AppRoute.Profiles}?tab=${tab}`;
}
