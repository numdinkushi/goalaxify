export const PWA_NAME = "Goalaxify";
export const PWA_SHORT_NAME = "Goalaxify";
export const PWA_DESCRIPTION =
  "Voice-native World Cup predictions, live goal moments, and verified settlement.";
export const PWA_THEME_COLOR = "#ff5a45";
export const PWA_BACKGROUND_COLOR = "#0b1324";
export const PWA_CACHE_VERSION = "v1.0.1";

export const PWA_ICON_PATHS = {
  base: "/assets/logo/logo.png",
  icon192: "/assets/logo/logo-192x192.png",
  icon512: "/assets/logo/logo-512x512.png",
  icon96: "/assets/logo/logo-96x96.png",
} as const;

export const PWA_STATIC_ASSETS = [
  "/",
  "/manifest.json",
  PWA_ICON_PATHS.icon192,
  PWA_ICON_PATHS.icon512,
  PWA_ICON_PATHS.base,
] as const;

export const PWA_ROUTES = [
  "/",
  "/booth",
  "/live",
  "/profiles",
  "/leaderboard",
  "/settings",
  "/wallet",
] as const;
