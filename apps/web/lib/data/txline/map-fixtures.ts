import type { FixtureCatalogEntry } from "@/lib/constants/fixtures";
import { teamFromName } from "@/lib/constants/teams";
import { MatchStatus } from "@/lib/enums";
import { deriveMatchStatus, isBoothOpenForMatch } from "@/lib/utils/match";

type RawRecord = Record<string, unknown>;

export type TxlineFixtureRecord = {
  fixtureId: number;
  kickoffAt: string;
  homeName: string;
  awayName: string;
  venue?: string;
  round?: string;
  competition?: string;
  reportedStatus: MatchStatus;
};

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeKickoff(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
  }

  return null;
}

function mapReportedStatus(raw: RawRecord, kickoffAt: string): MatchStatus {
  const status = asString(raw.Status ?? raw.status ?? raw.MatchStatus)?.toLowerCase();

  if (status?.includes("half")) {
    return MatchStatus.Halftime;
  }

  if (
    status?.includes("finish") ||
    status?.includes("full") ||
    status?.includes("ended") ||
    status?.includes("complete")
  ) {
    return MatchStatus.Finished;
  }

  if (status?.includes("live") || status?.includes("inplay") || status?.includes("in_play")) {
    return MatchStatus.Live;
  }

  return deriveMatchStatus(kickoffAt, MatchStatus.Scheduled);
}

export function mapTxlineFixture(raw: unknown): TxlineFixtureRecord | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as RawRecord;
  const fixtureId = asNumber(record.FixtureId ?? record.fixtureId ?? record.id);
  const kickoffAt = normalizeKickoff(record.StartTime ?? record.startTime ?? record.kickoffAt);

  if (!fixtureId || !kickoffAt) {
    return null;
  }

  const participant1 = asString(record.Participant1 ?? record.participant1);
  const participant2 = asString(record.Participant2 ?? record.participant2);

  if (!participant1 || !participant2) {
    return null;
  }

  const participant1IsHome = record.Participant1IsHome ?? record.participant1IsHome;
  const homeName =
    participant1IsHome === false ? participant2 : participant1;
  const awayName =
    participant1IsHome === false ? participant1 : participant2;

  return {
    fixtureId,
    kickoffAt,
    homeName,
    awayName,
    venue: asString(record.Venue ?? record.venue ?? record.Location) ?? undefined,
    round:
      asString(record.Round ?? record.round ?? record.Stage ?? record.Competition) ??
      undefined,
    competition: asString(record.Competition ?? record.competition) ?? undefined,
    reportedStatus: mapReportedStatus(record, kickoffAt),
  };
}

export function mapTxlineFixturesSnapshot(raw: unknown): TxlineFixtureRecord[] {
  const entries = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? ((raw as RawRecord).fixtures ??
        (raw as RawRecord).data ??
        (raw as RawRecord).snapshot)
      : null;

  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => mapTxlineFixture(entry))
    .filter((entry): entry is TxlineFixtureRecord => entry !== null);
}

const MATCH_LOOKBACK_MS = 105 * 60 * 1000;

function isWorldCupFixture(fixture: TxlineFixtureRecord): boolean {
  return fixture.competition?.toLowerCase().includes("world cup") ?? false;
}

function fixtureSortScore(fixture: TxlineFixtureRecord, now: number): number {
  const kickoff = Date.parse(fixture.kickoffAt);
  const isLive =
    fixture.reportedStatus === MatchStatus.Live ||
    fixture.reportedStatus === MatchStatus.Halftime;

  if (isLive) return 0;
  if (kickoff >= now) return 1_000_000_000 + kickoff;
  return 2_000_000_000 + kickoff;
}

function namesMatch(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function listUpcomingTxlineFixtures(
  fixtures: TxlineFixtureRecord[],
  options?: { horizonDays?: number },
): TxlineFixtureRecord[] {
  const horizonMs = (options?.horizonDays ?? 14) * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const worldCup = fixtures.filter(isWorldCupFixture);
  const pool = worldCup.length > 0 ? worldCup : fixtures;

  return pool
    .filter((fixture) => {
      const kickoff = Date.parse(fixture.kickoffAt);
      return (
        kickoff >= now - MATCH_LOOKBACK_MS && kickoff <= now + horizonMs
      );
    })
    .filter(
      (fixture) =>
        deriveMatchStatus(fixture.kickoffAt, fixture.reportedStatus) !==
        MatchStatus.Finished,
    )
    .sort((left, right) => fixtureSortScore(left, now) - fixtureSortScore(right, now));
}

export function txlineFixtureToCatalogEntry(
  txlineFixture: TxlineFixtureRecord,
): FixtureCatalogEntry {
  const status = deriveMatchStatus(
    txlineFixture.kickoffAt,
    txlineFixture.reportedStatus,
  );

  return {
    ref: `TXLINE-${txlineFixture.fixtureId}`,
    fixtureId: txlineFixture.fixtureId,
    txlineFixtureId: txlineFixture.fixtureId,
    home: teamFromName(txlineFixture.homeName),
    away: teamFromName(txlineFixture.awayName),
    venue: txlineFixture.venue ?? txlineFixture.competition ?? "TBD",
    kickoffAt: txlineFixture.kickoffAt,
    round: txlineFixture.round ?? txlineFixture.competition ?? "World Cup",
    status,
    boothOpen: isBoothOpenForMatch(txlineFixture.kickoffAt, status),
    featured: false,
  };
}

export function pickFeaturedTxlineFixture(
  fixtures: TxlineFixtureRecord[],
): TxlineFixtureRecord | null {
  if (fixtures.length === 0) return null;

  const now = Date.now();
  const worldCup = fixtures.filter(isWorldCupFixture);
  const pool = worldCup.length > 0 ? worldCup : fixtures;

  const relevant = pool
    .filter((fixture) => Date.parse(fixture.kickoffAt) >= now - MATCH_LOOKBACK_MS)
    .sort((left, right) => fixtureSortScore(left, now) - fixtureSortScore(right, now));

  return relevant[0] ?? pool[0] ?? null;
}

export function pickTxlineFixtureForCatalog(
  fixtures: TxlineFixtureRecord[],
  catalog: FixtureCatalogEntry,
): TxlineFixtureRecord | null {
  if (catalog.txlineFixtureId) {
    const byId = fixtures.find(
      (fixture) => fixture.fixtureId === catalog.txlineFixtureId,
    );
    if (byId) {
      return byId;
    }
  }

  const byTeams = fixtures.find(
    (fixture) =>
      (namesMatch(fixture.homeName, catalog.home.name) &&
        namesMatch(fixture.awayName, catalog.away.name)) ||
      (namesMatch(fixture.homeName, catalog.away.name) &&
        namesMatch(fixture.awayName, catalog.home.name)),
  );

  if (byTeams) {
    return byTeams;
  }

  return pickFeaturedTxlineFixture(fixtures);
}

export function mergeTxlineFixtureIntoCatalog(
  catalog: FixtureCatalogEntry,
  txlineFixture: TxlineFixtureRecord,
): FixtureCatalogEntry {
  const status = deriveMatchStatus(
    txlineFixture.kickoffAt,
    txlineFixture.reportedStatus,
  );

  return {
    ...catalog,
    txlineFixtureId: txlineFixture.fixtureId,
    kickoffAt: txlineFixture.kickoffAt,
    venue: txlineFixture.venue ?? txlineFixture.competition ?? catalog.venue,
    round: txlineFixture.round ?? catalog.round,
    status,
    boothOpen: isBoothOpenForMatch(txlineFixture.kickoffAt, status),
    home: teamFromName(txlineFixture.homeName),
    away: teamFromName(txlineFixture.awayName),
  };
}
