# Loom Walkthrough Script

Hi, I am [Your Name], and this is my NFL Mock Draft Simulator for the Full Stack AI Engineer assignment.

The assignment asked for a single-page simulator where the user controls one team and AI controls the remaining teams. I built this using Next.js, TypeScript, Tailwind, and a server-side API route for the LLM call.

First, the user chooses one of the seven teams. After starting the draft, the app runs four rounds with the same pick order each round. The interface shows the current team on the clock, the available Big Board, team needs, pick history, and the user's draft class.

When it is the user's turn, the draft buttons become active. When it is an AI team's turn, the frontend waits briefly and then calls the backend route at `/api/ai-pick`.

The backend receives the current team, the available prospects, and previous picks. It sends that context to the LLM and asks for one player plus a short reason. The API key stays on the server, so no secret is exposed to the browser.

I also added fallback logic. If the LLM call fails, or if the model returns a player who is not available, the backend uses deterministic scoring. That scoring considers board rank, team needs, and premium positions like quarterback, tackle, edge, receiver, and cornerback. This keeps the simulator usable even if the AI provider has a problem.

Most of the draft state lives in the main simulator page because this is a single-session workflow. The backend owns only the AI decision. This keeps the frontend responsive while still satisfying the backend requirement.

With more time, I would add a parser for the official EssentiallySports Big Board file, draft grades, team-specific AI personalities, trade logic, and saved mock drafts.

Thank you for reviewing my assignment.
