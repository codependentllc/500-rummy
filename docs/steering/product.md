# Product Steering

## Current Implementation

500 Rummy is a local, single-device card game built as a mobile-first Next app. The current product supports one human player against 1-3 local computer opponents.

| Area | Current behavior |
| --- | --- |
| Game mode | Local play only. No accounts, matchmaking, multiplayer, or backend. |
| Players | 2-4 total players: one human plus 1-3 AI opponents. |
| Setup | Welcome, player avatar/name, opponent setup, table theme, card back, AI difficulty. |
| Gameplay | Draw from stock or legal discard, meld, lay off, discard, score hands, continue until 500 points. |
| Presentation | Custom avatars, table themes, card backs, responsive card table UI, end-of-hand/game modal. |
| Install/offline | PWA manifest and production service worker for app shell/asset caching. |

Primary implementation references:

- UI orchestration: `src/components/rummy/RummyGame.tsx`
- Gameplay screen: `src/components/rummy/GameScreen.tsx`
- Game state/types: `src/types/rummy.ts`
- Rules and scoring: `src/games/rummy/rules.ts`, `src/games/rummy/engine.ts`
- AI turns: `src/games/rummy/ai.ts`

## Product Principles

- Keep the first screen playable, not a marketing landing page.
- Preserve the "local table" mental model: all game state is visible through the table, hands, discard pile, melds, and score modal.
- Prefer explicit player feedback through button enabled states and `game.message`.
- Treat [game-rules.md](./game-rules.md) as the canonical rule source before changing game behavior.

## Recommended Next Steps

- Update the README to say the app is currently Next-based, not Vite-based.
- Add a short "How to play" surface in the UI only if it improves gameplay comprehension without blocking play.
- Decide whether offline install support is a core product goal; if yes, keep `public/sw.js` and manifest assets covered in validation.
- Consider persistent local settings for player name, avatar, theme, card back, and difficulty. Do not imply cloud save unless a backend exists.

