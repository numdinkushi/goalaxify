import type { LucideIcon } from "lucide-react";
import { Home, Mic, Radio, Settings, UserRound, Wallet } from "lucide-react";

import { AppRoute } from "@/lib/enums";

export const APP_NAME = "Goalaxify";
export const APP_TAGLINE = "Talk your bet.";

export type NavTab = {
  id: string;
  label: string;
  href: AppRoute;
  icon: LucideIcon;
};

export const NAV_TABS: NavTab[] = [
  { id: "home", label: "Home", href: AppRoute.Home, icon: Home },
  { id: "booth", label: "Booth", href: AppRoute.Booth, icon: Mic },
  { id: "live", label: "Live", href: AppRoute.Live, icon: Radio },
  { id: "wallet", label: "Wallet", href: AppRoute.Wallet, icon: Wallet },
  { id: "profiles", label: "Profile", href: AppRoute.Profiles, icon: UserRound },
  { id: "settings", label: "Settings", href: AppRoute.Settings, icon: Settings },
];
