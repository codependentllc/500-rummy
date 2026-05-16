import { RANKS, SUITS } from "./constants";
import { hasDuplicateCards } from "./deck";
import { points } from "./scoring";
import type { Card, Meld, MeldType, Rank } from "./types";

export function label(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function rankValue(rank: Rank, highAce = false): number {
  if (rank === "A") return highAce ? 14 : 1;
  if (rank === "J") return 11;
  if (rank === "Q") return 12;
  if (rank === "K") return 13;
  return Number(rank);
}

export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) || rankValue(a.rank) - rankValue(b.rank));
}

export function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [first, ...rest] = items;
  return combinations(rest, size - 1).map((group) => [first, ...group]).concat(combinations(rest, size));
}

function uniqueGroups(groups: Card[][]): Card[][] {
  const seen = new Set<string>();
  return groups.filter((group) => {
    const key = group.map((card) => card.id).sort().join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function isSet(cards: Card[]): boolean {
  return cards.length >= 3 && cards.length <= 4 && !hasDuplicateCards(cards) && cards.every((card) => card.rank === cards[0].rank);
}

export function isRun(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  if (hasDuplicateCards(cards)) return false;
  if (!cards.every((card) => card.suit === cards[0].suit)) return false;

  const aceCount = cards.filter((card) => card.rank === "A").length;
  if (aceCount > 1) return false;

  return (aceCount ? [1, 14] : [rankValue(cards.find((card) => card.rank !== "A")?.rank || "A")]).some((aceValue) => {
    const values = cards
      .map((card) => (card.rank === "A" ? aceValue : rankValue(card.rank)))
      .sort((a, b) => a - b);

    return values.every((value, index) => index === 0 || value === values[index - 1] + 1);
  });
}

export function meldType(cards: Card[]): MeldType | null {
  if (isSet(cards)) return "set";
  if (isRun(cards)) return "run";
  return null;
}

export function canLay(card: Card | undefined, meld: Meld | undefined): boolean {
  if (!card || !meld) return false;
  return meld.type === "set" ? isSet([...meld.cards, card]) : isRun([...meld.cards, card]);
}

export function possibleMelds(hand: Card[]): Card[][] {
  const groups: Card[][] = [];

  for (const rank of RANKS) {
    const sameRank = hand.filter((card) => card.rank === rank);
    if (sameRank.length >= 3) groups.push(sameRank.slice(0, 4));
  }

  for (const suit of SUITS) {
    const suited = hand.filter((card) => card.suit === suit);
    for (let size = Math.min(5, suited.length); size >= 3; size -= 1) {
      for (const group of combinations(suited, size)) {
        if (isRun(group)) groups.push(group);
      }
    }
  }

  return uniqueGroups(groups).sort((a, b) => points(b) - points(a));
}

export function nearMelds(hand: Card[]): Card[][] {
  const groups: Card[][] = [];

  for (const rank of RANKS) {
    const sameRank = hand.filter((card) => card.rank === rank);
    if (sameRank.length === 2) groups.push(sameRank);
  }

  for (const suit of SUITS) {
    const suited = sortCards(hand.filter((card) => card.suit === suit));
    for (const pair of combinations(suited, 2)) {
      if (Math.abs(rankValue(pair[0].rank) - rankValue(pair[1].rank)) <= 2) groups.push(pair);
    }
  }

  return uniqueGroups(groups);
}

export function cardHints(hand: Card[]): Record<string, "ready" | "near" | "loose"> {
  const hints: Record<string, "ready" | "near" | "loose"> = {};
  const used = new Set<string>();

  for (const meld of possibleMelds(hand)) {
    const available = meld.filter((card) => !used.has(card.id));
    if (available.length >= 3 && meldType(available)) {
      available.forEach((card) => {
        used.add(card.id);
        hints[card.id] = "ready";
      });
    }
  }

  for (const near of nearMelds(hand)) {
    const available = near.filter((card) => !used.has(card.id));
    if (available.length >= 2) {
      available.forEach((card) => {
        used.add(card.id);
        if (hints[card.id] !== "ready") hints[card.id] = "near";
      });
    }
  }

  for (const card of hand) {
    if (!hints[card.id]) hints[card.id] = "loose";
  }

  return hints;
}

export function groupHandByMelds(hand: Card[]): Card[] {
  const hints = cardHints(hand);
  const ready = hand.filter((card) => hints[card.id] === "ready");
  const near = hand.filter((card) => hints[card.id] === "near");
  const loose = hand.filter((card) => hints[card.id] === "loose");
  return [...sortCards(ready), ...sortCards(near), ...loose];
}
