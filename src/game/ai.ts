import { removeCards } from "./deck";
import { discardPickup, immediatelyUsable } from "./discard";
import { label, meldType, possibleMelds, sortCards } from "./melds";
import { cardValue, scoreHand } from "./scoring";
import type { GameState } from "./types";

const makeId = () => Math.random().toString(36).slice(2);

export function aiTurn(state: GameState): GameState {
  const index = state.turn;
  const players = [...state.players];
  let ai = {
    ...players[index],
    hand: [...players[index].hand],
    melds: [...players[index].melds]
  };

  let stock = [...state.stock];
  let discard = [...state.discard];
  const tableMelds = players.flatMap((player) => player.melds);
  const log: string[] = [];

  let pickupIndex = -1;
  for (let i = discard.length - 1; i >= 0; i -= 1) {
    if (immediatelyUsable(discard[i], ai.hand, tableMelds, discardPickup(discard, i))) {
      pickupIndex = i;
      break;
    }
  }

  if (pickupIndex >= 0) {
    const pickup = discardPickup(discard, pickupIndex);
    discard = discard.slice(0, pickupIndex);
    ai.hand = sortCards([...ai.hand, ...pickup]);
    log.push(`${ai.name} picked discard.`);
  } else if (stock.length) {
    const card = stock.pop();
    if (card) ai.hand = sortCards([...ai.hand, card]);
    log.push(`${ai.name} drew.`);
  }

  let meld = possibleMelds(ai.hand)[0];
  while (meld) {
    const type = meldType(meld);
    if (!type) break;

    ai.hand = removeCards(ai.hand, meld.map((card) => card.id));
    ai.melds = [...ai.melds, { id: makeId(), ownerId: ai.id, type, cards: sortCards(meld), contributions: [{ playerId: ai.id, cards: sortCards(meld) }] }];
    log.push(`${ai.name} melded.`);
    meld = possibleMelds(ai.hand)[0];
  }

  players[index] = ai;
  let next: GameState = { ...state, players, stock, discard };

  if (!ai.hand.length) return scoreHand(next, index);

  const out = [...ai.hand].sort((a, b) => cardValue(a) - cardValue(b))[0];
  ai.hand = removeCards(ai.hand, [out.id]);
  discard = [...discard, out];
  players[index] = ai;
  next = { ...next, players, discard };

  if (!ai.hand.length) return scoreHand(next, index);

  return {
    ...next,
    turn: (index + 1) % players.length,
    message: `${log.join(" ")} ${ai.name} discarded ${label(out)}.`
  };
}
