import { RANKS, SUITS, type Card, type Meld, type Rank } from "../../types/rummy";

export function cardValue(card: Card) {
  if (card.rank === "Q" && card.suit === "♠") return 40;
  if (card.rank === "A") return 15;
  if (["10", "J", "Q", "K"].includes(card.rank)) return 10;
  return 5;
}

export function points(cards: Card[]) {
  return cards.reduce((sum, card) => sum + cardValue(card), 0);
}

export function rankValue(rank: Rank, aceHigh = false) {
  if (rank === "A") return aceHigh ? 14 : 1;
  if (rank === "J") return 11;
  if (rank === "Q") return 12;
  if (rank === "K") return 13;
  return Number(rank);
}

export function sortCards(cards: Card[]) {
  return sortBySuit(cards);
}

export function sortBySuit(cards: Card[]) {
  return [...cards].sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) || rankValue(a.rank) - rankValue(b.rank));
}

export function sortByRank(cards: Card[]) {
  return [...cards].sort((a, b) => rankValue(a.rank) - rankValue(b.rank) || SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit));
}

export function isSet(cards: Card[]) {
  return cards.length >= 3 && cards.length <= 4 && cards.every((card) => card.rank === cards[0].rank);
}

export function isRun(cards: Card[]) {
  if (cards.length < 3 || !cards.every((card) => card.suit === cards[0].suit)) return false;
  return [1, 14].some((ace) => {
    const values = cards.map((card) => (card.rank === "A" ? ace : rankValue(card.rank))).sort((a, b) => a - b);
    return values.every((value, index) => index === 0 || value === values[index - 1] + 1);
  });
}

export function meldType(cards: Card[]) {
  return isSet(cards) ? "set" : isRun(cards) ? "run" : null;
}

export function canLay(card: Card, meld: Meld) {
  return meld.type === "set" ? isSet([...meld.cards, card]) : isRun([...meld.cards, card]);
}

export function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [first, ...rest] = items;
  return combinations(rest, size - 1).map((group) => [first, ...group]).concat(combinations(rest, size));
}

export function possibleMelds(hand: Card[]) {
  const result: Card[][] = [];
  const seen = new Set<string>();
  const add = (cards: Card[]) => {
    const key = cards.map((card) => card.id).sort().join("|");
    if (!seen.has(key)) {
      seen.add(key);
      result.push(cards);
    }
  };

  RANKS.forEach((rank) => {
    const cards = hand.filter((card) => card.rank === rank);
    if (cards.length >= 3) add(cards.slice(0, 4));
  });
  SUITS.forEach((suit) => {
    const cards = hand.filter((card) => card.suit === suit);
    for (let size = 3; size <= Math.min(5, cards.length); size += 1) {
      combinations(cards, size).forEach((group) => {
        if (isRun(group)) add(sortCards(group));
      });
    }
  });
  return result.sort((a, b) => points(b) - points(a));
}

export function removeCards(cards: Card[], ids: string[]) {
  return cards.filter((card) => !ids.includes(card.id));
}

export function findBestMeldGroups(cards: Card[]) {
  const used = new Set<string>();
  return possibleMelds(cards)
    .sort((left, right) => right.length - left.length || points(right) - points(left))
    .filter((group) => {
      if (group.some((card) => used.has(card.id))) return false;
      group.forEach((card) => used.add(card.id));
      return true;
    });
}

export function groupHandByMelds(cards: Card[]) {
  const groups = findBestMeldGroups(cards);
  const groupedIds = new Set(groups.flatMap((group) => group.map((card) => card.id)));
  return [...groups.flatMap(sortBySuit), ...sortBySuit(cards.filter((card) => !groupedIds.has(card.id)))];
}
