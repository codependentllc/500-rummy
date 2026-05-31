import { cardValue, canLay, meldType, possibleMelds, rankValue, removeCards, sortCards } from "./rules";
import { immediatelyUsable, scoreHand, tableMelds } from "./engine";
import type { Card, ComputerDifficulty, GameState } from "../../types/rummy";

function connectionScore(card: Card, hand: Card[]) {
  return hand.reduce((score, candidate) => {
    if (candidate.id === card.id) return score;
    if (candidate.rank === card.rank) return score + 3;
    if (candidate.suit !== card.suit) return score;
    const distance = Math.abs(rankValue(candidate.rank) - rankValue(card.rank));
    return score + (distance === 1 ? 3 : distance === 2 ? 1 : 0);
  }, 0);
}

function humanHelpScore(card: Card, humanHand: Card[]) {
  return connectionScore(card, humanHand);
}

export function chooseAiDiscard(hand: Card[], difficulty: ComputerDifficulty, humanHand: Card[] = []) {
  if (difficulty !== "hard") return [...hand].sort((left, right) => cardValue(left) - cardValue(right))[0];
  return [...hand].sort((left, right) => {
    const leftPriority = cardValue(left) - connectionScore(left, hand) * 4 - humanHelpScore(left, humanHand) * 5;
    const rightPriority = cardValue(right) - connectionScore(right, hand) * 4 - humanHelpScore(right, humanHand) * 5;
    return rightPriority - leftPriority;
  })[0];
}

function drawForAi(state: GameState, hand: Card[], stock: Card[], discard: Card[]) {
  if (state.difficulty === "hard") {
    const topDiscard = discard.at(-1);
    if (topDiscard && immediatelyUsable(topDiscard, hand, tableMelds(state), [topDiscard])) {
      discard.pop();
      return sortCards([...hand, topDiscard]);
    }
  }
  return stock.length ? sortCards([...hand, stock.pop()!]) : hand;
}

function shouldLayOff(difficulty: ComputerDifficulty, stockLength: number) {
  return difficulty !== "easy" || stockLength % 4 === 0;
}

export function runAiTurn(state: GameState): GameState {
  if (state.turn === 0 || state.handOver) return state;
  const players = state.players.map((player) => ({ ...player, hand: [...player.hand], melds: player.melds.map((meld) => ({ ...meld, cards: [...meld.cards] })) }));
  const stock = [...state.stock];
  const discard = [...state.discard];
  const ai = players[state.turn];
  ai.hand = drawForAi(state, ai.hand, stock, discard);
  const bestMeld = possibleMelds(ai.hand)[0];
  if (bestMeld) {
    ai.hand = removeCards(ai.hand, bestMeld.map((card) => card.id));
    ai.melds.push({ id: crypto.randomUUID(), type: meldType(bestMeld)!, cards: sortCards(bestMeld) });
  }
  for (const card of shouldLayOff(state.difficulty, stock.length) ? [...ai.hand] : []) {
    const target = tableMelds({ ...state, players }).find((meld) => canLay(card, meld));
    if (target) {
      ai.hand = removeCards(ai.hand, [card.id]);
      target.cards = sortCards([...target.cards, card]);
    }
  }
  let next = { ...state, players, stock, discard };
  if (!ai.hand.length) return scoreHand(next);
  const outgoing = chooseAiDiscard(ai.hand, state.difficulty, players[0].hand);
  ai.hand = removeCards(ai.hand, [outgoing.id]);
  next = { ...next, discard: [...discard, outgoing] };
  if (!ai.hand.length) return scoreHand(next);
  return { ...next, turn: (state.turn + 1) % players.length, drawn: false, message: `${ai.name} discarded ${outgoing.rank}${outgoing.suit}.` };
}
