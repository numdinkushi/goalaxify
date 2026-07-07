import type { LucideIcon } from "lucide-react";
import { Home, Mic, Radio, Settings, Trophy, UserRound } from "lucide-react";

import { AppRoute } from "@/lib/enums";

export const APP_NAME = "Goalaxify";

export type NavTabId =
  | "home"
  | "booth"
  | "live"
  | "profiles"
  | "leaderboard"
  | "settings";

export type NavTabDef = {
  id: NavTabId;
  labelKey: `nav.${NavTabId}`;
  href: AppRoute;
  icon: LucideIcon;
};

export const NAV_TAB_DEFS: NavTabDef[] = [
  { id: "home", labelKey: "nav.home", href: AppRoute.Home, icon: Home },
  { id: "booth", labelKey: "nav.booth", href: AppRoute.Booth, icon: Mic },
  { id: "live", labelKey: "nav.live", href: AppRoute.Live, icon: Radio },
  {
    id: "profiles",
    labelKey: "nav.profiles",
    href: AppRoute.Profiles,
    icon: UserRound,
  },
  {
    id: "leaderboard",
    labelKey: "nav.leaderboard",
    href: AppRoute.Leaderboard,
    icon: Trophy,
  },
  {
    id: "settings",
    labelKey: "nav.settings",
    href: AppRoute.Settings,
    icon: Settings,
  },
];
