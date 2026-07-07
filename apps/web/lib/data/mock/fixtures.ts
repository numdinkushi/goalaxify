import { AppRoute } from "@/lib/enums";

export const MOCK_ACTION_CARDS = [
  {
    id: "enter-booth",
    title: "Enter Booth",
    description: "Talk your prediction with the stadium announcer.",
    cta: "Start voice session",
    href: AppRoute.Booth,
    variant: "default" as const,
  },
  {
    id: "the-pitch",
    title: "The Pitch",
    description: "Goal moments, clips, and live match pulse.",
    cta: "Open live feed",
    href: AppRoute.Live,
    variant: "secondary" as const,
  },
];

export const MOCK_SETTLEMENT_BADGE = {
  label: "Settled on Solana with",
  provider: "TxLINE proof",
};

export const MOCK_MOMENTS = [
  {
    fixtureId: 1001,
    minute: 12,
    homeScore: 1,
    awayScore: 0,
    eventType: "goal" as const,
    summary: "Brazil strike early from the edge of the box.",
    createdAt: Date.now() - 1000 * 60 * 28,
  },
  {
    fixtureId: 1001,
    minute: 34,
    homeScore: 1,
    awayScore: 1,
    eventType: "goal" as const,
    summary: "Morocco equalise with a clinical counter.",
    createdAt: Date.now() - 1000 * 60 * 6,
  },
  {
    fixtureId: 1001,
    minute: 45,
    homeScore: 1,
    awayScore: 1,
    eventType: "halftime" as const,
    summary: "All square at the break — booth still open.",
    createdAt: Date.now() - 1000 * 60 * 2,
  },
];
