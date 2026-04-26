import type { Team } from "@/types/draft";

export const teams: Team[] = [
  {
    pick: 1,
    id: "raiders",
    name: "Las Vegas Raiders",
    shortName: "Raiders",
    needs: ["QB", "CB", "OL"],
    context:
      "No long-term QB after Geno Smith trade failed. Secondary leaks. O-line needs rebuilding.",
  },
  {
    pick: 2,
    id: "jets",
    name: "New York Jets",
    shortName: "Jets",
    needs: ["OL", "WR", "QB"],
    context:
      "Full roster reset after trade deadline teardown. O-line is the foundation to rebuild.",
  },
  {
    pick: 3,
    id: "cardinals",
    name: "Arizona Cardinals",
    shortName: "Cardinals",
    needs: ["QB", "OL", "WR"],
    context:
      "Kyler Murray's future uncertain after 3-14 season. Offense needs major upgrades.",
  },
  {
    pick: 4,
    id: "titans",
    name: "Tennessee Titans",
    shortName: "Titans",
    needs: ["OL", "WR", "EDGE"],
    context:
      "Must protect and support 2025 #1 pick Cam Ward. Need weapons and pass rush.",
  },
  {
    pick: 5,
    id: "giants",
    name: "New York Giants",
    shortName: "Giants",
    needs: ["WR", "EDGE", "OL"],
    context:
      "Need playmakers around QB Jaxon Dart. Pass rush was inconsistent.",
  },
  {
    pick: 6,
    id: "browns",
    name: "Cleveland Browns",
    shortName: "Browns",
    needs: ["EDGE", "WR", "CB"],
    context:
      "Fewest receiving yards in the NFL in 2025. Need pass rush help.",
  },
  {
    pick: 7,
    id: "commanders",
    name: "Washington Commanders",
    shortName: "Commanders",
    needs: ["EDGE", "CB", "LB"],
    context:
      "Oldest roster in NFL. Defense needs youth and speed everywhere.",
  },
];
