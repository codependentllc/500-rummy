import { describe, expect, it } from "vitest";
import { canLay, cardValue, combinations, findBestMeldGroups, groupHandByMelds, isRun, isSet, meldType, points, removeCards, sortByRank, sortCards } from "./rules";
import type { Card, Rank, Suit } from "../../types/rummy";

const card = (rank: Rank, suit: Suit): Card => ({ id: `${rank}${suit}`, rank, suit });

describe("500 Rummy rules", () => {
  it("scores cards including queen of spades", () => {
    expect(cardValue(card("Q", "♠"))).toBe(40);
    expect(points([card("A", "♥"), card("K", "♣"), card("4", "♦")])).toBe(30);
  });

  it("recognizes sets and runs with ace low or high", () => {
    expect(isSet([card("7", "♠"), card("7", "♥"), card("7", "♦")])).toBe(true);
    expect(isRun([card("A", "♣"), card("2", "♣"), card("3", "♣")])).toBe(true);
    expect(isRun([card("Q", "♣"), card("K", "♣"), card("A", "♣")])).toBe(true);
  });

  it("recognizes meld types and layoff targets", () => {
    const cards = [card("4", "♥"), card("5", "♥"), card("6", "♥")];
    expect(meldType(cards)).toBe("run");
    expect(canLay(card("7", "♥"), { id: "m1", type: "run", cards })).toBe(true);
  });

  it("creates combinations, sorts, and removes cards", () => {
    const cards = [card("K", "♠"), card("2", "♠"), card("A", "♠")];
    expect(combinations(cards, 2)).toHaveLength(3);
    expect(sortCards(cards).map((item) => item.rank)).toEqual(["A", "2", "K"]);
    expect(removeCards(cards, [cards[1].id])).toEqual([cards[0], cards[2]]);
  });

  it("sorts by rank and groups the strongest non-overlapping melds without removing cards", () => {
    const cards = [
      card("7", "♠"), card("7", "♥"), card("7", "♦"),
      card("3", "♣"), card("4", "♣"), card("5", "♣"), card("6", "♣"),
      card("K", "♠")
    ];

    expect(sortByRank([card("K", "♠"), card("2", "♣"), card("2", "♥")]).map((item) => item.id)).toEqual(["2♥", "2♣", "K♠"]);
    expect(findBestMeldGroups(cards).map((group) => group.length)).toEqual([4, 3]);
    expect(groupHandByMelds(cards)).toHaveLength(cards.length);
    expect(new Set(groupHandByMelds(cards).map((item) => item.id))).toEqual(new Set(cards.map((item) => item.id)));
  });
});
