
## Project Summary

I built a single-page AI-powered NFL Mock Draft Simulator using Next.js, TypeScript, Tailwind CSS, and a server-side LLM API route.

The user controls one NFL team through a four-round draft, while AI controls the remaining teams. The AI considers available prospects, team needs, board value, team context, and previous picks. If the LLM call fails, the app falls back to deterministic scoring logic so the simulator remains reliable.

## Notes

The project includes:

- frontend simulator
- backend LLM route
- team data from the assignment
- top-30 prospect board data source
- fallback AI logic
- README setup instructions
- Loom walkthrough script
