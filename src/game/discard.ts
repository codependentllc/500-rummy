import { combinations, meldType } from "./melds";
import { canLay } from "./melds";
import type { Card, Meld } from "./types";

export function discardPickup(discard: Card[], index: number): Card[] {
  return discard.slice(index);
}

export function immediatelyUsable(card: Card | undefined, hand: Card[], tableMelds: Meld[], pickupCards: Card[] = []): boolean {
  if (!card) return false;

  const cardsToCheck = pickupCards.length ? pickupCards : [card];
  const availableCards = [...hand, ...cardsToCheck].filter((candidate, index, all) => {
    return all.findIndex((item) => item.id === candidate.id) === index;
  });

  if (tableMelds.some((meld) => canLay(card, meld))) return true;

  for (let size = 3; size <= Math.min(5, availableCards.length); size += 1) {
    const groups = combinations(availableCards, size);
    if (groups.some((group) => group.some((item) => item.id === card.id) && Boolean(meldType(group)))) {
      return true;
    }
  }

  return false;
}
