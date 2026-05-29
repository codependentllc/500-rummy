import { describe, expect, it } from "vitest";
import { makeDeck, hasDuplicateCards } from "../game/deck";
import { immediatelyUsable } from "../game/discard";
import { canLay, groupHandByMelds, isRun, isSet } from "../game/melds";
import { cardValue, scoreHand } from "../game/scoring";
import { createPlayers, moveCardById, newGame } from "../game/state";
import type { Card, GameState } from "../game/types";

const c = (id: string): Card => {
  const suit = id.slice(-1) as Card["suit"];
  const rank = id.slice(0, -1) as Card["rank"];
  return { id, rank, suit };
};

const scoreState = (overrides: Partial<GameState> = {}): GameState => ({
  players: [
    { id: 0, name: "You", avatar: "", fallback: "Y", isAI: false, hand: [], melds: [], score: 0 },
    { id: 1, name: "Elaine", avatar: "", fallback: "E", isAI: true, hand: [], melds: [], score: 0 },
    { id: 2, name: "Marco", avatar: "", fallback: "M", isAI: true, hand: [], melds: [], score: 0 }
  ],
  stock: [],
  discard: [],
  turn: 0,
  drawn: false,
  selected: [],
  message: "",
  handOver: false,
  scoring: null,
  scoreHistory: [],
  winner: null,
  ...overrides
});

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

  it("scores meld creator points for cards they originally melded", () => {
    const state = scoreState({
      players: [
        { id: 0, name: "You", avatar: "", fallback: "Y", isAI: false, hand: [], melds: [{ id: "m1", ownerId: 0, type: "run", cards: [c("4♥"), c("5♥"), c("6♥")], contributions: [{ playerId: 0, cards: [c("4♥"), c("5♥"), c("6♥")] }] }], score: 0 },
        { id: 1, name: "Elaine", avatar: "", fallback: "E", isAI: true, hand: [], melds: [], score: 0 },
        { id: 2, name: "Marco", avatar: "", fallback: "M", isAI: true, hand: [], melds: [], score: 0 }
      ]
    });

    const scored = scoreHand(state, 0);
    expect(scored.scoring?.find((row) => row.playerId === 0)?.table).toBe(15);
    expect(scored.players[0].score).toBe(15);
  });

  it("scores layoff cards for the player who laid them off", () => {
    const state = scoreState({
      players: [
        { id: 0, name: "You", avatar: "", fallback: "Y", isAI: false, hand: [], melds: [], score: 0 },
        {
          id: 1,
          name: "Elaine",
          avatar: "",
          fallback: "E",
          isAI: true,
          hand: [],
          melds: [{
            id: "m1",
            ownerId: 1,
            type: "run",
            cards: [c("4♥"), c("5♥"), c("6♥"), c("7♥")],
            contributions: [
              { playerId: 1, cards: [c("4♥"), c("5♥"), c("6♥")] },
              { playerId: 0, cards: [c("7♥")] }
            ]
          }],
          score: 0
        },
        { id: 2, name: "Marco", avatar: "", fallback: "M", isAI: true, hand: [], melds: [], score: 0 }
      ]
    });

    const scored = scoreHand(state, 0);
    expect(scored.scoring?.find((row) => row.playerId === 1)?.table).toBe(15);
    expect(scored.scoring?.find((row) => row.playerId === 0)?.table).toBe(5);
  });

  it("scores multiple players laying off onto the same meld", () => {
    const state = scoreState({
      players: [
        { id: 0, name: "You", avatar: "", fallback: "Y", isAI: false, hand: [], melds: [], score: 0 },
        {
          id: 1,
          name: "Elaine",
          avatar: "",
          fallback: "E",
          isAI: true,
          hand: [],
          melds: [{
            id: "m1",
            ownerId: 1,
            type: "run",
            cards: [c("4♥"), c("5♥"), c("6♥"), c("7♥"), c("8♥")],
            contributions: [
              { playerId: 1, cards: [c("4♥"), c("5♥"), c("6♥")] },
              { playerId: 0, cards: [c("7♥")] },
              { playerId: 2, cards: [c("8♥")] }
            ]
          }],
          score: 0
        },
        { id: 2, name: "Marco", avatar: "", fallback: "M", isAI: true, hand: [], melds: [], score: 0 }
      ]
    });

    const scored = scoreHand(state, 0);
    expect(scored.scoring?.find((row) => row.playerId === 1)?.table).toBe(15);
    expect(scored.scoring?.find((row) => row.playerId === 0)?.table).toBe(5);
    expect(scored.scoring?.find((row) => row.playerId === 2)?.table).toBe(5);
  });

  it("keeps round-end hand penalties while scoring layoff ownership", () => {
    const state = scoreState({
      players: [
        { id: 0, name: "You", avatar: "", fallback: "Y", isAI: false, hand: [c("K♠")], melds: [], score: 20 },
        {
          id: 1,
          name: "Elaine",
          avatar: "",
          fallback: "E",
          isAI: true,
          hand: [c("Q♠")],
          melds: [{
            id: "m1",
            ownerId: 1,
            type: "run",
            cards: [c("4♥"), c("5♥"), c("6♥"), c("7♥")],
            contributions: [
              { playerId: 1, cards: [c("4♥"), c("5♥"), c("6♥")] },
              { playerId: 0, cards: [c("7♥")] }
            ]
          }],
          score: 30
        },
        { id: 2, name: "Marco", avatar: "", fallback: "M", isAI: true, hand: [], melds: [], score: 0 }
      ]
    });

    const scored = scoreHand(state, 0);
    expect(scored.scoring?.find((row) => row.playerId === 0)?.net).toBe(-5);
    expect(scored.scoring?.find((row) => row.playerId === 1)?.net).toBe(-25);
    expect(scored.players[0].score).toBe(15);
    expect(scored.players[1].score).toBe(5);
  });

  it("rejects invalid layoffs before they can contribute score", () => {
    const meld = { id: "m1", ownerId: 1, type: "run" as const, cards: [c("4♥"), c("5♥"), c("6♥")], contributions: [{ playerId: 1, cards: [c("4♥"), c("5♥"), c("6♥")] }] };
    expect(canLay(c("9♣"), meld)).toBe(false);

    const state = scoreState({
      players: [
        { id: 0, name: "You", avatar: "", fallback: "Y", isAI: false, hand: [c("9♣")], melds: [], score: 0 },
        { id: 1, name: "Elaine", avatar: "", fallback: "E", isAI: true, hand: [], melds: [meld], score: 0 },
        { id: 2, name: "Marco", avatar: "", fallback: "M", isAI: true, hand: [], melds: [], score: 0 }
      ]
    });

    const scored = scoreHand(state, 1);
    expect(scored.scoring?.find((row) => row.playerId === 0)?.table).toBe(0);
    expect(scored.scoring?.find((row) => row.playerId === 0)?.net).toBe(-5);
  });
});
