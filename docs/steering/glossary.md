# Glossary

| Term | Meaning in this repo |
| --- | --- |
| AI | Local computer opponent controlled by `src/games/rummy/ai.ts`. |
| Buried discard | A discard card below the top card. Picking it also picks all cards above it. |
| Card | `{ id, rank, suit }` object defined in `src/types/rummy.ts`. |
| Card back | Visual style selected during setup and applied through CSS classes. |
| Deadwood | Cards left in a player's hand at scoring time; their points are subtracted. |
| Discard | Face-up pile in `GameState.discard`. |
| Drawn | Boolean turn flag that means the human has drawn or picked up discard this turn. |
| GameState | Complete in-memory state for the current hand. |
| Hand over | `GameState.handOver`; true after scoring a completed hand. |
| Lay off | Add one card from hand to an existing table meld. |
| Meld | A set or run placed on the table. |
| Run | Three or more same-suit consecutive cards; aces may be low or high. |
| Set | Three or four cards of the same rank. |
| Stock | Face-down draw pile in `GameState.stock`. |
| Table melds | All melds from every player, returned by `tableMelds()`. |
| Theme | Table visual style selected during setup and applied through CSS classes. |
| Turn | Numeric player id in `GameState.turn`; player `0` is the human. |

Related docs:

- [Product](./product.md)
- [Architecture](./architecture.md)
- [Game Rules](./game-rules.md)
- [Testing](./testing.md)

