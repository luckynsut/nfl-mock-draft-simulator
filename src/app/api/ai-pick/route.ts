import { NextResponse } from "next/server";
import OpenAI from "openai";
import { fallbackPick } from "@/lib/draft";
import type { Prospect, Team } from "@/types/draft";

type AiPickRequest = {
  team: Team;
  availableProspects: Prospect[];
  previousPicks?: string[];
};

function extractJson(content: string) {
  const cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

export async function POST(req: Request) {
  const body = (await req.json()) as AiPickRequest;
  const { team, availableProspects, previousPicks = [] } = body;

  if (!team || !availableProspects?.length) {
    return NextResponse.json(
      { error: "Team and available prospects are required." },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(fallbackPick(team, availableProspects));
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an NFL draft room assistant. Choose exactly one player from the availableProspects list. Balance board rank, positional value, team needs, and team context. Return JSON only with prospectName and reason.",
        },
        {
          role: "user",
          content: JSON.stringify({
            team,
            availableProspects,
            previousPicks,
            requiredJsonShape: {
              prospectName: "Exact player name from availableProspects",
              reason: "One concise sentence explaining the pick",
            },
          }),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = extractJson(raw) as { prospectName?: string; reason?: string };
    const prospect = availableProspects.find(
      (player) =>
        player.name.toLowerCase() === parsed.prospectName?.toLowerCase(),
    );

    if (!prospect) {
      return NextResponse.json(fallbackPick(team, availableProspects));
    }

    return NextResponse.json({
      prospect,
      reason:
        parsed.reason ??
        `${team.shortName} selected ${prospect.name} for value and positional fit.`,
      source: "llm",
    });
  } catch {
    return NextResponse.json(fallbackPick(team, availableProspects));
  }
}
