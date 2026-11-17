# WILDPATCH

## Porting to Devvit

- Move the pure verifier (`lib/engine/verify.ts`), the restoration catalog (`lib/engine/actions.ts`), and the daily scenario definition (`lib/engine/scenario.ts`) behind Devvit server endpoints before production. The answer key currently stays in the client bundle for this prototype only; do not ship it to clients in production.
- `lib/api.ts` is the data boundary. The current mock contract exposes `getDailyScenario()`, `submitSolution(submission)`, `getLeaderboard(period)`, `getReserve()`, and `getProfile()`. Replace these mock implementations with Devvit server endpoint calls while preserving the request/response types in `lib/types.ts`.
- Game state is session-memory only. No local storage, server actions, API routes, or framework-specific data mutations are required by the game components.
- Game art uses local assets under `public/game-assets`; keep the asset base path configurable in `lib/config.ts` when moving the UI into a Devvit WebView.
- The Next.js adapter consists of `app/layout.tsx`, `app/page.tsx`, and thin route entry points for `/gallery`, `/post-preview`, and `/sandbox`. Components and pure engine logic remain under `components/` and `lib/`.
- For a production leaderboard, send submissions to the server for scoring and return only the report. Never expose the scenario ground truth or accept a client-provided score as authoritative.
# wildpatch
