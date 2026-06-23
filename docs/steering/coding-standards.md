# Coding Standards Steering

## Current Implementation

The codebase uses TypeScript, React, Next, and Vitest with strict TypeScript enabled.

| Convention | Current pattern |
| --- | --- |
| Components | PascalCase files and named exports in `src/components/rummy`. |
| Types | Shared interfaces/types in `src/types/rummy.ts`. |
| Game logic | Named pure or mostly-pure functions in `src/games/rummy`. |
| Imports | `@/*` path alias for `src/*`; relative imports inside game logic tests. |
| Styling | Global CSS in `src/styles/rummy.css`; class names are string-based. |
| Tests | `*.test.ts` colocated with game modules. |

## Preferred Patterns

- Put rule and scoring behavior in `src/games/rummy/rules.ts` or `engine.ts`, not inside React components.
- Keep AI heuristics in `src/games/rummy/ai.ts`.
- Use shared types from `src/types/rummy.ts` for cards, players, melds, and game state.
- Return new `GameState` objects from engine/AI functions rather than mutating React state directly.
- Add focused unit tests next to game logic changes.
- Keep setup constants data-driven in `src/data`.
- Keep UI state local to the component when it is purely presentational or transient.

## Naming Guidance

| Thing | Pattern | Examples |
| --- | --- | --- |
| Components | PascalCase | `GameScreen`, `ScoreModal` |
| Types/interfaces | PascalCase | `GameState`, `Card`, `Meld` |
| Functions | camelCase verbs | `drawStock`, `pickupDiscardAt`, `scoreHand` |
| Constants | UPPER_SNAKE for global constants | `WINNING_SCORE`, `RANKS`, `SUITS` |
| CSS classes | Existing kebab/lowercase style | `hand-panel`, `discard-viewer` |

## Anti-Patterns

- Do not add a second source of truth for card values, meld validation, or discard pickup legality.
- Do not place browser storage or network calls inside low-level rule helpers.
- Do not add implemented-feature claims to README or docs without matching source and tests.
- Do not rely on generated `dist`, `.next`, or `node_modules` content as source of truth.
- Do not change [game-rules.md](./game-rules.md) behavior without updating tests and code together.

## Recommended Next Steps

- Add lint/format scripts if the repo wants automated style enforcement.
- Consider splitting very large UI/CSS areas only when a feature requires it; avoid broad cosmetic rewrites.
- Make deck creation injectable for deterministic tests before adding complex turn scenarios.

