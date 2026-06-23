# Testing Steering

## Current Implementation

Tests use Vitest and are located under `src/games/rummy`.

Run:

```bash
npm test
```

| File | Coverage today |
| --- | --- |
| `src/games/rummy/rules.test.ts` | Card values, set/run detection, ace low/high, layoff target, combinations, sorting, removal, best meld grouping. |
| `src/games/rummy/engine.test.ts` | Customized seats, difficulty storage, stock draw, blocked unusable discard pickup, score carryover, hand scoring, 500-point game winner. |
| `src/games/rummy/ai.test.ts` | Easy/normal discard lowest value, hard keeps connected cards and avoids helping human. |

## Validation Commands

| Change type | Minimum validation |
| --- | --- |
| Rules/engine/AI | `npm test` |
| Type or app wiring | `npm run build` |
| UI layout/interaction | `npm run dev` and manual browser check |
| PWA/service worker | Production build and production-mode browser check |

## High-Value Tests To Add

### Card and Deck Logic

- Deal creates unique cards and expected stock/discard counts for 2, 3, and 4 players.
- Shuffle/deal behavior can be tested deterministically through an injectable deck.
- Stock exhaustion behavior once a rule is chosen.

### Meld Validation

- Invalid wraparound runs such as `K-A-2`.
- Runs with duplicate ranks in same suit are rejected.
- Sets reject 5 cards of the same rank.
- Longer-than-5 runs if the product intends to support them in suggestions.

### Discard Pickup

- Buried discard pickup takes the selected card and all cards above it.
- A selected buried discard can become valid using cards above it.
- Pickup is blocked after drawing.
- Pickup is blocked on AI turns and after hand over.

### Scoring

- Negative hand scores from deadwood are applied correctly.
- Queen of spades scoring in melds and remaining hand cards.
- Ties or multiple players over 500, if a tie-break rule is desired.

### Turn Flow and Round End

- Human cannot meld, lay off, or discard before drawing.
- Human turn advances after discard.
- Hand ends when a player empties their hand via meld, layoff, or discard.
- AI turns advance through all opponents and return to player `0`.

## Recommended Next Steps

- Add deterministic state builders for tests instead of depending on random `createGame()` output.
- Add a small set of React interaction tests only after game logic is well covered.
- Keep [game-rules.md](./game-rules.md) and tests synchronized for every rule change.

