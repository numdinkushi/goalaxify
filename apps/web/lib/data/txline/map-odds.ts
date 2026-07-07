import type { ThreeWayOdds } from "@goalaxify/domain";

import { buildOddsFromDecimals } from "@/lib/utils/odds";

type RawRecord = Record<string, unknown>;

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function pickDecimal(
  source: RawRecord,
  keys: string[],
): number | null {
  for (const key of keys) {
    const value = asNumber(source[key]);
    if (value && value > 1) return value;
  }
  return null;
}

function extractOutcomeDecimals(node: RawRecord): ThreeWayOdds | null {
  const home =
    pickDecimal(node, ["home", "homeDecimal", "homeOdds", "1"]) ??
    pickDecimal(node, ["homeWin", "home_win"]);
  const draw =
    pickDecimal(node, ["draw", "drawDecimal", "drawOdds", "X", "x"]) ??
    pickDecimal(node, ["drawWin", "draw_win"]);
  const away =
    pickDecimal(node, ["away", "awayDecimal", "awayOdds", "2"]) ??
    pickDecimal(node, ["awayWin", "away_win"]);

  if (home && draw && away) {
    return buildOddsFromDecimals(home, draw, away);
  }

  return null;
}

function normalizeTxlinePrice(value: number): number {
  if (value >= 100) {
    return value / 1000;
  }

  return value;
}

function mapTxlineStablePriceEntry(raw: unknown): ThreeWayOdds | null {
  if (!raw || typeof raw !== "object") return null;

  const entry = raw as RawRecord;
  const superOddsType = String(entry.SuperOddsType ?? entry.superOddsType ?? "");
  if (!superOddsType.includes("1X2_PARTICIPANT_RESULT")) {
    return null;
  }

  const marketPeriod = entry.MarketPeriod ?? entry.marketPeriod;
  if (marketPeriod !== null && marketPeriod !== undefined) {
    return null;
  }

  const priceNames = entry.PriceNames ?? entry.priceNames;
  const prices = entry.Prices ?? entry.prices;
  if (!Array.isArray(priceNames) || !Array.isArray(prices) || prices.length < 3) {
    return null;
  }

  const byName: RawRecord = {};
  for (let index = 0; index < priceNames.length; index += 1) {
    const name = String(priceNames[index]).toLowerCase();
    const price = asNumber(prices[index]);
    if (!price) continue;

    if (name === "part1" || name === "home") byName.home = normalizeTxlinePrice(price);
    if (name === "draw") byName.draw = normalizeTxlinePrice(price);
    if (name === "part2" || name === "away") byName.away = normalizeTxlinePrice(price);
  }

  return extractOutcomeDecimals(byName);
}

/**
 * Best-effort mapper for TxLINE odds snapshots.
 * Falls back to null when the payload shape is unknown.
 */
export function mapTxlineOddsSnapshot(raw: unknown): ThreeWayOdds | null {
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      const mapped = mapTxlineStablePriceEntry(entry);
      if (mapped) return mapped;
    }

    return null;
  }

  if (!raw || typeof raw !== "object") return null;

  const root = raw as RawRecord;

  const direct = extractOutcomeDecimals(root);
  if (direct) return direct;

  const nestedKeys = ["odds", "market", "matchWinner", "match_winner", "data", "snapshot"];
  for (const key of nestedKeys) {
    const nested = root[key];
    if (nested && typeof nested === "object") {
      const mapped = extractOutcomeDecimals(nested as RawRecord);
      if (mapped) return mapped;
    }
  }

  if (Array.isArray(root.outcomes)) {
    const byLabel: RawRecord = {};
    for (const item of root.outcomes) {
      if (!item || typeof item !== "object") continue;
      const entry = item as RawRecord;
      const label = String(entry.label ?? entry.name ?? entry.outcome ?? "").toLowerCase();
      const price = asNumber(entry.price ?? entry.odds ?? entry.decimal);
      if (!price) continue;
      if (label.includes("home") || label === "1") byLabel.home = price;
      if (label.includes("draw") || label === "x") byLabel.draw = price;
      if (label.includes("away") || label === "2") byLabel.away = price;
    }
    const mapped = extractOutcomeDecimals(byLabel);
    if (mapped) return mapped;
  }

  return null;
}
