import { RANKS, SUITS } from "./constants";
import type { Card } from "./types";

export function makeDeck(): Card[] {
  const cards = SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      id: `${rank}${suit}`,
      rank,
      suit
    }))
  );

  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

export function hasDuplicateCards(cards: Card[]): boolean {
  return new Set(cards.map((card) => card.id)).size !== cards.length;
}

export function removeCards(cards: Card[], ids: string[]): Card[] {
  return cards.filter((card) => !ids.includes(card.id));
}
