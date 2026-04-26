# NFL Mock Draft Simulator

AI-powered single-page NFL Mock Draft Simulator built for the Full Stack AI Engineer take-home assignment.

The user controls one of the top seven 2026 NFL Draft teams. The remaining six teams are controlled by AI. The simulator runs four rounds, keeps the same draft order each round, shows available prospects, tracks every pick, and gives a final team-by-team recap.

## Live Features

- 4-round draft with 7 teams and 28 total picks
- User chooses one franchise before the draft begins
- AI controls all other teams
- Server-side LLM integration through a Next.js API route
- Fallback draft engine when the LLM is unavailable or returns invalid output
- Team needs influence AI decisions
- Pick history, current clock status, available board, and final recap
- Responsive single-page interface

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- OpenAI API
- Server-side API route for secure LLM calls

## Setup

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env.local
```

Add your API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Run the app:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

The app also works without an API key because it includes deterministic fallback AI logic.

## Architecture

The simulator is a single-session draft flow, so the main draft state lives in `src/app/page.tsx`:

- selected user team
- current pick index
- available prospects
- completed picks
- AI thinking state
- final recap data

The AI decision is handled by `src/app/api/ai-pick/route.ts`. The frontend sends the current team, available prospects, and previous picks to the backend. The backend calls the LLM and returns one selected prospect plus a short reason.

The API key is never exposed to the browser because the LLM call happens only on the server.

## AI Strategy

The LLM is instructed to balance:

- team needs
- player rank
- positional value
- team context
- previous draft picks

If the LLM fails, times out, or returns a player who is not available, the backend uses `fallbackPick` from `src/lib/draft.ts`.

The fallback scorer rewards:

- higher-ranked prospects
- players who match team needs
- premium positions like QB, OT, EDGE, WR, and CB

This makes the product reliable even when the LLM provider has an issue.

## Data

Team data is implemented from the assignment PDF in `src/data/teams.ts`.

Prospect data is implemented as a top-30 Big Board-style source in `src/data/prospects.ts`. If the official EssentiallySports Big Board file is provided separately, this file can be regenerated from that parsed source without changing the simulator or AI flow.

## Important Files

```txt
src/app/page.tsx              Main simulator UI and draft orchestration
src/app/api/ai-pick/route.ts  Server-side LLM route
src/data/teams.ts             Team order, needs, and context
src/data/prospects.ts         Top-30 prospect board
src/lib/draft.ts              Draft helper and fallback AI scoring
src/types/draft.ts            Shared TypeScript types
```

## What I Would Improve With More Time

- Parse the official EssentiallySports Big Board attachment directly
- Add draft grades after the final recap
- Add team-specific draft personalities
- Add trade-up and trade-down logic
- Persist completed mock drafts
- Add tests for draft sequencing and fallback AI scoring

## Loom Walkthrough

Loom link: `ADD_LOOM_LINK_HERE`

