"use client";

import { usePathname } from "next/navigation";

import { AppRoute } from "@/lib/enums";

export function useActiveRoute(): AppRoute {
  const pathname = usePathname();

  switch (pathname) {
    case AppRoute.Booth:
      return AppRoute.Booth;
    case AppRoute.Live:
      return AppRoute.Live;
    case AppRoute.Wallet:
      return AppRoute.Wallet;
    case AppRoute.Settings:
      return AppRoute.Settings;
    default:
      return AppRoute.Home;
  }
}

export function isRouteActive(current: AppRoute, href: AppRoute): boolean {
  return current === href;
}
