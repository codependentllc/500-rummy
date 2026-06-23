# Architecture Steering

## Current Implementation

The repository is a single Next app with colocated game logic, React components, shared types, static assets, and Vitest tests.

| Layer | Location | Responsibility |
| --- | --- | --- |
| App shell | `src/app` | Next metadata, manifest route, root page, global CSS import. |
| UI components | `src/components/rummy` | Setup flow, game table, card rendering, discard viewer, score modal, service worker registration. |
| Game rules | `src/games/rummy/rules.ts` | Card values, sorting, meld detection, layoff validation, possible meld grouping. |
| Game engine | `src/games/rummy/engine.ts` | Deck creation, deal, human actions, discard pickup legality, scoring, hand/game end. |
| AI | `src/games/rummy/ai.ts` | Computer draw, meld, layoff, discard heuristics by difficulty. |
| Shared types | `src/types/rummy.ts` | Cards, players, melds, setup state, game state, drag state. |
| Static data | `src/data` | Avatar options, table themes, card back styles. |
| Static assets | `public` | Avatars, icons, art, backgrounds, sounds, service worker. |
| Tests | `src/games/rummy/*.test.ts` | Unit coverage for rules, engine, and AI heuristics. |

## Data Flow

1. `src/app/page.tsx` renders `RummyGame` and `RegisterServiceWorker`.
2. `RummyGame` owns setup state, current screen, and `GameState | null`.
3. Setup screens mutate `GameSetupState`.
4. `startGame()` converts setup choices into `SeatConfig[]` and calls `createGame()`.
5. `GameScreen` renders the table from `GameState` and sends state update functions back through `setGame`.
6. Human actions call engine functions such as `drawStock`, `pickupDiscardAt`, `playSelectedMeld`, `layOff`, and `discardSelected`.
7. A `useEffect` in `RummyGame` runs `runAiTurn()` after a short delay when `game.turn !== 0`.
8. `scoreHand()` marks `handOver`, populates `scoreResult`, and triggers `ScoreModal`.

## State Management

Current state is React local state only:

- `RummyGame` owns setup and game state.
- `GameScreen` owns transient UI state for discard sheet visibility, drag state, ghost card, drop target, and hand sort order.
- There is no Redux, context store, database, or server-authoritative state.
- There is no localStorage/sessionStorage persistence in the current source.

Most game updates return new state objects, but some nested structures are shallow-copied and then mutated, especially in AI layoff handling. Be careful when changing object identity assumptions.

## Boundaries

| Boundary | Current status |
| --- | --- |
| UI vs rules | UI should call exported functions from `rules.ts`/`engine.ts`; rule decisions should not be duplicated in components. |
| AI vs engine | `ai.ts` consumes rule/engine helpers and returns a new `GameState` for AI turns. |
| Persistence | No gameplay persistence. Production service worker only caches shell/assets. |
| Networking | None. No fetch/WebSocket/API route for game state. |
| Backend | None. The app is client-side gameplay hosted by Next. |

## Recommended Next Steps

- Keep new rule logic in `src/games/rummy` and cover it with Vitest before wiring UI.
- Extract deterministic deck/shuffle injection if tests need reliable turn-flow scenarios.
- If persistence is added, define a separate storage adapter instead of embedding localStorage calls in rule or engine functions.
- If multiplayer is added, introduce a server-authoritative engine boundary before adding network UI.

