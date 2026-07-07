export const BOOTH_STATUS_LABEL = {
  open: "Voice booth open",
  closed: "Betting closed — match in play",
} as const;

export const BET_PLACED_IN_PLAY_LABEL =
  "Your bet is locked until full time";

export function getBoothStatusLabel(boothOpen: boolean): string {
  return boothOpen ? BOOTH_STATUS_LABEL.open : BOOTH_STATUS_LABEL.closed;
}
