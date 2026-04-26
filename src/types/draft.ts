export type Position =
  | "QB"
  | "WR"
  | "OT"
  | "OG"
  | "OL"
  | "EDGE"
  | "CB"
  | "DT"
  | "S"
  | "LB"
  | "TE"
  | "RB";

export type Prospect = {
  rank: number;
  name: string;
  position: Position;
  school: string;
  summary: string;
};

export type Team = {
  pick: number;
  id: string;
  name: string;
  shortName: string;
  needs: Position[];
  context: string;
};

export type DraftPick = {
  overall: number;
  round: number;
  pickInRound: number;
  teamId: string;
  teamName: string;
  prospect: Prospect;
  reason: string;
  controlledByUser: boolean;
};

export type AiPickResponse = {
  prospect: Prospect;
  reason: string;
  source: "llm" | "fallback";
};
