import type { Team } from "@goalaxify/domain";

/**
 * FIFA World Cup 2026 — all 48 qualified nations.
 * Source: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/world-cup-2026-who-has-qualified
 */
const TEAM_CATALOG: Record<string, Team> = {
  // Hosts (CONCACAF)
  CAN: { name: "Canada", code: "CAN", flag: "🇨🇦" },
  MEX: { name: "Mexico", code: "MEX", flag: "🇲🇽" },
  USA: { name: "USA", code: "USA", flag: "🇺🇸" },

  // AFC (9)
  AUS: { name: "Australia", code: "AUS", flag: "🇦🇺" },
  IRQ: { name: "Iraq", code: "IRQ", flag: "🇮🇶" },
  IRN: { name: "IR Iran", code: "IRN", flag: "🇮🇷" },
  JPN: { name: "Japan", code: "JPN", flag: "🇯🇵" },
  JOR: { name: "Jordan", code: "JOR", flag: "🇯🇴" },
  KOR: { name: "Korea Republic", code: "KOR", flag: "🇰🇷" },
  QAT: { name: "Qatar", code: "QAT", flag: "🇶🇦" },
  KSA: { name: "Saudi Arabia", code: "KSA", flag: "🇸🇦" },
  UZB: { name: "Uzbekistan", code: "UZB", flag: "🇺🇿" },

  // CAF (10)
  ALG: { name: "Algeria", code: "ALG", flag: "🇩🇿" },
  CPV: { name: "Cabo Verde", code: "CPV", flag: "🇨🇻" },
  COD: { name: "Congo DR", code: "COD", flag: "🇨🇩" },
  CIV: { name: "Côte d'Ivoire", code: "CIV", flag: "🇨🇮" },
  EGY: { name: "Egypt", code: "EGY", flag: "🇪🇬" },
  GHA: { name: "Ghana", code: "GHA", flag: "🇬🇭" },
  MAR: { name: "Morocco", code: "MAR", flag: "🇲🇦" },
  SEN: { name: "Senegal", code: "SEN", flag: "🇸🇳" },
  RSA: { name: "South Africa", code: "RSA", flag: "🇿🇦" },
  TUN: { name: "Tunisia", code: "TUN", flag: "🇹🇳" },

  // CONCACAF (3)
  CUW: { name: "Curaçao", code: "CUW", flag: "🇨🇼" },
  HAI: { name: "Haiti", code: "HAI", flag: "🇭🇹" },
  PAN: { name: "Panama", code: "PAN", flag: "🇵🇦" },

  // CONMEBOL (6)
  ARG: { name: "Argentina", code: "ARG", flag: "🇦🇷" },
  BRA: { name: "Brazil", code: "BRA", flag: "🇧🇷" },
  COL: { name: "Colombia", code: "COL", flag: "🇨🇴" },
  ECU: { name: "Ecuador", code: "ECU", flag: "🇪🇨" },
  PAR: { name: "Paraguay", code: "PAR", flag: "🇵🇾" },
  URU: { name: "Uruguay", code: "URU", flag: "🇺🇾" },

  // OFC (1)
  NZL: { name: "New Zealand", code: "NZL", flag: "🇳🇿" },

  // UEFA (16)
  AUT: { name: "Austria", code: "AUT", flag: "🇦🇹" },
  BEL: { name: "Belgium", code: "BEL", flag: "🇧🇪" },
  BIH: { name: "Bosnia and Herzegovina", code: "BIH", flag: "🇧🇦" },
  CRO: { name: "Croatia", code: "CRO", flag: "🇭🇷" },
  CZE: { name: "Czechia", code: "CZE", flag: "🇨🇿" },
  ENG: { name: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  FRA: { name: "France", code: "FRA", flag: "🇫🇷" },
  GER: { name: "Germany", code: "GER", flag: "🇩🇪" },
  NED: { name: "Netherlands", code: "NED", flag: "🇳🇱" },
  NOR: { name: "Norway", code: "NOR", flag: "🇳🇴" },
  POR: { name: "Portugal", code: "POR", flag: "🇵🇹" },
  SCO: { name: "Scotland", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  ESP: { name: "Spain", code: "ESP", flag: "🇪🇸" },
  SWE: { name: "Sweden", code: "SWE", flag: "🇸🇪" },
  SUI: { name: "Switzerland", code: "SUI", flag: "🇨🇭" },
  TUR: { name: "Türkiye", code: "TUR", flag: "🇹🇷" },
};

/** Common display-name aliases → FIFA code */
const NAME_ALIASES: Record<string, string> = {
  "united states": "USA",
  "us": "USA",
  "u.s.": "USA",
  "u.s.a.": "USA",
  "south korea": "KOR",
  "korea": "KOR",
  "iran": "IRN",
  "ivory coast": "CIV",
  "cote d'ivoire": "CIV",
  "dr congo": "COD",
  "democratic republic of the congo": "COD",
  "congo dr": "COD",
  "cape verde": "CPV",
  "curacao": "CUW",
  "curaçao": "CUW",
  "turkey": "TUR",
  "türkiye": "TUR",
  "czech republic": "CZE",
  "czechia": "CZE",
  "holland": "NED",
  "bosnia": "BIH",
  "bosnia and herzegovina": "BIH",
  "saudi arabia": "KSA",
  "new zealand": "NZL",
  "south africa": "RSA",
};

export const WORLD_CUP_2026_TEAMS: Team[] = Object.values(TEAM_CATALOG);

export const WORLD_CUP_2026_TEAM_COUNT = WORLD_CUP_2026_TEAMS.length;

export function teamFromCode(code: string): Team {
  const normalized = code.toUpperCase();
  return (
    TEAM_CATALOG[normalized] ?? {
      name: normalized,
      code: normalized,
      flag: "🏳️",
    }
  );
}

export function teamFromName(name: string, code?: string): Team {
  if (code) return teamFromCode(code);

  const alias = NAME_ALIASES[name.toLowerCase()];
  if (alias) return teamFromCode(alias);

  const match = Object.values(TEAM_CATALOG).find(
    (team) => team.name.toLowerCase() === name.toLowerCase(),
  );

  return match ?? { name, code: name.slice(0, 3).toUpperCase(), flag: "🏳️" };
}

export function isWorldCupTeam(code: string): boolean {
  return code.toUpperCase() in TEAM_CATALOG;
}
