import type { MatchOutcome, ThreeWayOdds } from "@goalaxify/domain";

/** Implied win chance from a share of the pool (0–100). */
export function impliedPct(outcomeTotal: number, poolTotal: number): number {
  if (poolTotal <= 0) return 0;
  return (outcomeTotal / poolTotal) * 100;
}

/** What 1 unit returns in a parimutuel pool (e.g. 2.45×). */
export function decimalReturn(outcomeTotal: number, poolTotal: number): number {
  if (outcomeTotal <= 0) return 0;
  return poolTotal / outcomeTotal;
}

/** Convert bookmaker decimal odds to implied probability %. */
export function decimalToImpliedPct(decimalOdds: number): number {
  if (decimalOdds <= 1) return 0;
  return (1 / decimalOdds) * 100;
}

/** Normalize three-way percentages so they sum to ~100. */
export function normalizeThreeWay(
  homePct: number,
  drawPct: number,
  awayPct: number,
): Pick<ThreeWayOdds, "homePct" | "drawPct" | "awayPct"> {
  const total = homePct + drawPct + awayPct;
  if (total <= 0) {
    return { homePct: 33.33, drawPct: 33.34, awayPct: 33.33 };
  }

  const scale = 100 / total;
  return {
    homePct: homePct * scale,
    drawPct: drawPct * scale,
    awayPct: awayPct * scale,
  };
}

export function buildOddsFromDecimals(
  homeDecimal: number,
  drawDecimal: number,
  awayDecimal: number,
): ThreeWayOdds {
  const raw = normalizeThreeWay(
    decimalToImpliedPct(homeDecimal),
    decimalToImpliedPct(drawDecimal),
    decimalToImpliedPct(awayDecimal),
  );

  return {
    ...raw,
    homeReturn: homeDecimal,
    drawReturn: drawDecimal,
    awayReturn: awayDecimal,
  };
}

export function getOutcomeValue(
  odds: ThreeWayOdds,
  outcome: MatchOutcome,
): { pct: number; returnMultiplier?: number } {
  switch (outcome) {
    case "home":
      return { pct: odds.homePct, returnMultiplier: odds.homeReturn };
    case "draw":
      return { pct: odds.drawPct, returnMultiplier: odds.drawReturn };
    case "away":
      return { pct: odds.awayPct, returnMultiplier: odds.awayReturn };
  }
}
