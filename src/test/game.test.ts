import { describe, expect, it } from "vitest";
import { makeDeck, hasDuplicateCards } from "../game/deck";
import { immediatelyUsable } from "../game/discard";
import { groupHandByMelds, isRun, isSet } from "../game/melds";
import { cardValue } from "../game/scoring";
import { createPlayers, moveCardById, newGame } from "../game/state";
import type { Card } from "../game/types";

const c = (id: string): Card => {
  const suit = id.slice(-1) as Card["suit"];
  const rank = id.slice(0, -1) as Card["rank"];
  return { id, rank, suit };
};

describe("500 Rummy rules", () => {
  it("creates a 52-card deck with no duplicates", () => {
    const deck = makeDeck();
    expect(deck).toHaveLength(52);
    expect(hasDuplicateCards(deck)).toBe(false);
  });

  it("deals seven cards to every player", () => {
    expect(newGame(2).players.every((player) => player.hand.length === 7)).toBe(true);
    expect(newGame(3).players.every((player) => player.hand.length === 7)).toBe(true);
  });

  it("scores custom card values", () => {
    expect(cardValue(c("Q♠"))).toBe(40);
    expect(cardValue(c("A♥"))).toBe(15);
    expect(cardValue(c("K♦"))).toBe(10);
    expect(cardValue(c("9♣"))).toBe(5);
  });

  it("validates sets and runs", () => {
    expect(isSet([c("7♠"), c("7♥"), c("7♦")])).toBe(true);
    expect(isRun([c("4♥"), c("5♥"), c("6♥")])).toBe(true);
    expect(isRun([c("Q♣"), c("K♣"), c("A♣")])).toBe(true);
    expect(isRun([c("Q♣"), c("K♣"), c("A♣"), c("2♣")])).toBe(false);
  });

  it("rejects duplicate physical cards", () => {
    expect(isSet([c("7♠"), c("7♠"), c("7♦")])).toBe(false);
  });

  it("allows discard pickup when it completes a set", () => {
    expect(immediatelyUsable(c("7♣"), [c("7♠"), c("7♥")], [])).toBe(true);
  });

  it("allows discard pickup when it completes a run", () => {
    expect(immediatelyUsable(c("3♠"), [c("4♠"), c("5♠")], [])).toBe(true);
  });

  it("allows buried discard pickup using cards above it", () => {
    expect(immediatelyUsable(c("3♠"), [c("5♠")], [], [c("3♠"), c("4♠")])).toBe(true);
  });

  it("moves a card by drag target", () => {
    const cards = [c("7♠"), c("7♥"), c("7♦")];
    expect(moveCardById(cards, "7♦", "7♠")[0].id).toBe("7♦");
  });

  it("supports custom names and avatars", () => {
    const players = createPlayers(2, [
      { name: "Ava", avatar: "/avatars/ava.png", fallback: "👩🏾" },
      { name: "Bot", avatar: "/avatars/marcus.png", fallback: "👨🏾" }
    ]);

    expect(players[0].name).toBe("Ava");
    expect(players[0].avatar).toBe("/avatars/ava.png");
    expect(players[0].fallback).toBe("👩🏾");
  });

  it("groups completed melds together before loose cards", () => {
    const grouped = groupHandByMelds([
      c("9♣"),
      c("7♥"),
      c("4♠"),
      c("7♦"),
      c("5♠"),
      c("7♠"),
      c("3♠")
    ]);

    const ids = grouped.map((card) => card.id);
    expect(ids.slice(0, 3)).toEqual(["7♠", "7♥", "7♦"]);
    expect(ids.slice(3, 6)).toEqual(["3♠", "4♠", "5♠"]);
    expect(ids[6]).toBe("9♣");
  });
});
