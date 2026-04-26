import type { Prospect, Team } from "@/types/draft";

export const TOTAL_ROUNDS = 4;

export function positionFitsNeed(position: string, needs: string[]) {
  if (needs.includes(position)) return true;
  if ((position === "OT" || position === "OG") && needs.includes("OL")) return true;
  return false;
}

export function scoreProspectForTeam(prospect: Prospect, team: Team) {
  const boardValue = 100 - prospect.rank;
  const primaryNeedBonus = positionFitsNeed(prospect.position, team.needs) ? 40 : 0;
  const premiumPositionBonus = ["QB", "OT", "EDGE", "WR", "CB"].includes(
    prospect.position,
  )
    ? 8
    : 0;

  return boardValue + primaryNeedBonus + premiumPositionBonus;
}

export function fallbackPick(team: Team, availableProspects: Prospect[]) {
  const [best] = [...availableProspects].sort(
    (a, b) => scoreProspectForTeam(b, team) - scoreProspectForTeam(a, team),
  );

  return {
    prospect: best,
    reason: `${team.shortName} select ${best.name} because ${best.position} gives them the best mix of board value and roster need.`,
    source: "fallback" as const,
  };
}

export function getRoundAndPick(pickIndex: number, teamsCount: number) {
  return {
    overall: pickIndex + 1,
    round: Math.floor(pickIndex / teamsCount) + 1,
    pickInRound: (pickIndex % teamsCount) + 1,
  };
}
