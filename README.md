# WILDPATCH

## Porting to Devvit

- Keep the pure verifier (`lib/engine/verify.ts`), restoration catalog (`lib/engine/actions.ts`), and daily challenge selection (`lib/engine/scenario.ts`) behind trusted server endpoints in the Devvit build. Private scenario answer keys live in `lib/engine/scenario-private.ts` and must never be sent to clients.
- `lib/api.ts` provides the daily challenge and game data; `lib/submit-solution.ts` submits a scenario-bound plan to `/api/verify`. Keep response types in `lib/types.ts` aligned when replacing the Next.js adapter with Devvit endpoints.
- Game interaction state is session-memory only. Verified best scores are persisted server-side in Neon; profile, reserve, parcel, and leaderboard screens still use mock data.
- Game art uses local assets under `public/game-assets`; keep the asset base path configurable in `lib/config.ts` when moving the UI into a Devvit WebView.
- The Next.js adapter consists of `app/layout.tsx`, `app/page.tsx`, and thin route entry points for `/gallery`, `/post-preview`, and `/sandbox`. Components and pure engine logic remain under `components/` and `lib/`.
- For a production leaderboard, send submissions to the server for scoring and return only the report. Never expose the scenario ground truth or accept a client-provided score as authoritative.
# wildpatch
