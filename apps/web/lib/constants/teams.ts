import type { Team } from "@goalaxify/domain";

const TEAM_CATALOG: Record<string, Team> = {
  BRA: { name: "Brazil", code: "BRA", flag: "🇧🇷" },
  MAR: { name: "Morocco", code: "MAR", flag: "🇲🇦" },
  FRA: { name: "France", code: "FRA", flag: "🇫🇷" },
  JPN: { name: "Japan", code: "JPN", flag: "🇯🇵" },
  ARG: { name: "Argentina", code: "ARG", flag: "🇦🇷" },
  NED: { name: "Netherlands", code: "NED", flag: "🇳🇱" },
  GER: { name: "Germany", code: "GER", flag: "🇩🇪" },
  ENG: { name: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  ESP: { name: "Spain", code: "ESP", flag: "🇪🇸" },
  POR: { name: "Portugal", code: "POR", flag: "🇵🇹" },
  USA: { name: "USA", code: "USA", flag: "🇺🇸" },
  MEX: { name: "Mexico", code: "MEX", flag: "🇲🇽" },
  CAN: { name: "Canada", code: "CAN", flag: "🇨🇦" },
};

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

  const match = Object.values(TEAM_CATALOG).find(
    (team) => team.name.toLowerCase() === name.toLowerCase(),
  );

  return match ?? { name, code: name.slice(0, 3).toUpperCase(), flag: "🏳️" };
}
