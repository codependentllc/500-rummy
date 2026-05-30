import { cardValue, canLay, meldType, possibleMelds, removeCards, sortCards } from "./rules";
import { scoreHand, tableMelds } from "./engine";
import type { GameState } from "../../types/rummy";

export function runAiTurn(state: GameState): GameState {
  if (state.turn === 0 || state.handOver) return state;
  const players = state.players.map((player) => ({ ...player, hand: [...player.hand], melds: player.melds.map((meld) => ({ ...meld, cards: [...meld.cards] })) }));
  const stock = [...state.stock];
  const discard = [...state.discard];
  const ai = players[state.turn];
  if (stock.length) ai.hand = sortCards([...ai.hand, stock.pop()!]);
  const bestMeld = possibleMelds(ai.hand)[0];
  if (bestMeld) {
    ai.hand = removeCards(ai.hand, bestMeld.map((card) => card.id));
    ai.melds.push({ id: crypto.randomUUID(), type: meldType(bestMeld)!, cards: sortCards(bestMeld) });
  }
  for (const card of [...ai.hand]) {
    const target = tableMelds({ ...state, players }).find((meld) => canLay(card, meld));
    if (target) {
      ai.hand = removeCards(ai.hand, [card.id]);
      target.cards = sortCards([...target.cards, card]);
    }
  }
  let next = { ...state, players, stock, discard };
  if (!ai.hand.length) return scoreHand(next);
  const outgoing = [...ai.hand].sort((a, b) => cardValue(a) - cardValue(b))[0];
  ai.hand = removeCards(ai.hand, [outgoing.id]);
  next = { ...next, discard: [...discard, outgoing] };
  if (!ai.hand.length) return scoreHand(next);
  return { ...next, turn: (state.turn + 1) % players.length, drawn: false, message: `${ai.name} discarded ${outgoing.rank}${outgoing.suit}.` };
}
