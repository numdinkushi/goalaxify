/**
 * Goalaxify — Stadium Night palette
 * Deep navy base with coral (logo), gold odds, and live-green accents.
 */

export const palette = {
  /** App background */
  navy: "#0B1324",
  /** Cards & panels */
  surface: "#152238",
  /** Elevated surfaces */
  surfaceRaised: "#1C2B44",
  /** Logo / primary CTA */
  coral: "#FF5A45",
  /** Odds, wins, highlights */
  gold: "#FBBF24",
  /** Live / positive movement */
  live: "#10B981",
  /** Info / secondary accent */
  electric: "#38BDF8",
  /** Primary text */
  snow: "#F8FAFC",
  /** Muted text */
  slate: "#94A3B8",
  /** Borders */
  border: "#243047",
} as const;

export type PaletteColor = keyof typeof palette;

export const semantic = {
  background: palette.navy,
  foreground: palette.snow,
  primary: palette.coral,
  primaryForeground: palette.snow,
  secondary: palette.gold,
  secondaryForeground: palette.navy,
  accent: palette.electric,
  accentForeground: palette.navy,
  muted: palette.surface,
  mutedForeground: palette.slate,
  card: palette.surface,
  cardForeground: palette.snow,
  border: palette.border,
  ring: palette.coral,
  destructive: "#EF4444",
  success: palette.live,
  warning: palette.gold,
} as const;

export type SemanticColor = keyof typeof semantic;

/** Legacy token aliases — maps old class names to new palette values */
export const legacyTokens = {
  coral: palette.coral,
  charcoal: palette.snow,
  blush: palette.navy,
  pastelPink: palette.gold,
  cream: palette.surfaceRaised,
  mint: palette.live,
  dustyBlue: palette.electric,
  white: palette.surfaceRaised,
} as const;
