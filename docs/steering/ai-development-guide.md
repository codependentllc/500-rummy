# AI Development Guide

This guide is for future AI coding agents working in this repository.

## Read First

1. `README.md` for product intent and setup notes.
2. `package.json` for scripts and framework reality.
3. `src/types/rummy.ts` for state and domain types.
4. `docs/steering/game-rules.md` for canonical rule behavior.
5. `src/games/rummy/rules.ts` for card values, sorting, melds, and layoff validation.
6. `src/games/rummy/engine.ts` for deal, human actions, discard pickup, scoring, and game end.
7. `src/games/rummy/ai.ts` for computer-turn behavior.
8. `src/components/rummy/RummyGame.tsx` and `GameScreen.tsx` for UI state flow.
9. `src/games/rummy/*.test.ts` for existing test expectations.

## Rules Not To Change Without Approval

- Card values, especially queen of spades = 40 and ace = 15.
- 7-card deal.
- 500-point game target.
- Discard pickup rule requiring immediate usability.
- Buried discard pickup semantics.
- Ace low/high run handling.
- One human player as player `0`.
- Local-only architecture with no backend/networked gameplay.

## Safe Refactoring Areas

- Extracting test builders for cards, players, and deterministic game states.
- Moving duplicated UI markup into small components when behavior stays unchanged.
- Improving type names or local helper names with no behavior change.
- Adding tests around existing rules.
- Organizing static setup data while preserving ids used by saved or referenced state.

## Risky Areas

- `scoreHand()` and winner selection.
- `canPickDiscardAt()` and `immediatelyUsable()`.
- `isRun()` ace handling.
- AI turn mutation/copy behavior in `runAiTurn()`.
- Pointer drag/drop behavior in `GameScreen`.
- Service worker cache paths and production install behavior.
- CSS changes to card sizing, overlap, and mobile layout.

## Validation

Run the smallest relevant checks first, then broaden:

```bash
npm test
npm run build
```

For UI changes, run the app and manually verify:

```bash
npm run dev
```

Check at least:

- Start a 2-player and 4-player game.
- Draw from stock.
- Open discard viewer and try legal/illegal pickup.
- Meld a set or run.
- Lay off a card.
- Discard to advance turns.
- Let AI complete at least one turn.
- Finish a hand and start the next hand.

## Documentation Rule

If behavior changes, update the matching steering doc in the same change:

- Rules/scoring/turns: [game-rules.md](./game-rules.md)
- Module boundaries/data flow: [architecture.md](./architecture.md)
- UI interaction: [ui-ux.md](./ui-ux.md)
- Tests: [testing.md](./testing.md)

