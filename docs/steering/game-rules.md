# 500 Rummy Rules Steering

This document is the canonical rule reference for this repository. Update it with code and tests whenever rule behavior changes.

## Current Implementation

| Rule area | Implemented behavior |
| --- | --- |
| Deck | One standard 52-card deck from suits spades, hearts, diamonds, clubs and ranks A through K. |
| Deal | 7 cards to every player. One card starts the discard pile. Remaining cards form stock. |
| Players | 2-4 total players through setup: one human plus 1-3 AI opponents. |
| Turn structure | Human must draw once, may meld/lay off, then discard one card. AI performs draw, optional meld, optional layoff, discard. |
| Game target | First scoring check with any player at 500 or more ends the game; highest eligible score wins. |

## Card Values

Implemented in `cardValue()`:

| Card | Points |
| --- | ---: |
| Queen of spades | 40 |
| Ace | 15 |
| 10, J, Q, K | 10 |
| 2-9 | 5 |

## Melds

Implemented in `isSet()`, `isRun()`, and `meldType()`:

- A set is 3-4 cards of the same rank.
- A run is 3 or more cards of the same suit in consecutive rank order.
- Aces can be low (`A-2-3`) or high (`Q-K-A`).
- Runs are validated by card rank values, not by display order.
- `possibleMelds()` currently considers run candidates up to 5 cards long when suggesting meld groups.

## Laying Off

Implemented in `canLay()` and `layOff()`:

- A card can be laid off on a set if adding it still forms a valid set.
- A card can be laid off on a run if adding it still forms a valid run.
- The human can lay off one selected card at a time.
- AI may lay off cards depending on difficulty behavior.

## Discard Pickup

Implemented in `canPickDiscardAt()` and `pickupDiscardAt()`:

- The human may pick from discard only before drawing.
- The selected discard card must be immediately usable.
- "Immediately usable" means the selected card can be laid off on an existing table meld, or can participate in a new meld using the player's hand plus the picked-up discard segment.
- Buried discard pickup is implemented: picking a card at index `n` takes that card and every discard above it.
- Cards below the selected discard remain in the discard pile.
- Invalid discard pickup leaves state unchanged except for the message: `That discard must be immediately usable.`

## Scoring

Implemented in `scoreHand()`:

- Each player's hand score is: points in that player's table melds minus points remaining in that player's hand.
- Hand score is added to the player's accumulated total.
- A hand ends when a player has no cards after melding, laying off, or discarding.
- `scoreResult` stores per-hand scores, total scores, winner id if any, and game-over status.

## AI Difficulty

Implemented in `ai.ts`:

- Easy and normal discard the lowest-value card.
- Hard tries to keep connected cards and avoid discarding cards likely to help the human.
- Hard may draw the top discard if it is immediately usable.
- AI lays off on most difficulties; easy lays off less consistently via a stock-length heuristic.

## Known Rule Gaps

These are not currently implemented or not clearly modeled:

- No explicit stock exhaustion reshuffle behavior.
- No forced discard requirement after going out by meld/layoff.
- No configurable house rules.
- No jokers or wildcards.
- No multi-deck support.
- No server-authoritative validation.

## Recommended Next Steps

- Add tests for buried discard pickup where selected cards above the target complete a run.
- Add tests for ace edge cases, including invalid wraparound runs such as `K-A-2`.
- Decide and document stock exhaustion behavior.
- Decide whether `possibleMelds()` should find runs longer than 5 cards.
- Add turn-flow tests that prove invalid actions are blocked for the human and AI.

