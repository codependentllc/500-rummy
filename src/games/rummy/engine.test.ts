import { describe, expect, it } from "vitest";
import { createGame, drawStock, getGameWinner, pickupDiscardAt, scoreHand } from "./engine";

describe("500 Rummy setup", () => {
  it("uses customized avatars and names for human and CPU seats", () => {
    const game = createGame(2, [
      { avatarId: "ava-03", name: "Casey" },
      { avatarId: "ava-12", name: "Dealer Dee" }
    ]);

    expect(game.players[0]).toMatchObject({ name: "Casey", avatarId: "ava-03", isAI: false });
    expect(game.players[1]).toMatchObject({ name: "Dealer Dee", avatarId: "ava-12", isAI: true });
    expect(game.players[0].hand).toHaveLength(7);
    expect(game.players[1].hand).toHaveLength(7);
  });

  it("stores the selected computer difficulty in each dealt hand", () => {
    const game = createGame(2, [
      { avatarId: "ava-01", name: "You" },
      { avatarId: "ava-02", name: "Cal" }
    ], [], "hard");

    expect(game.difficulty).toBe("hard");
  });
});

describe("500 Rummy draw actions", () => {
  it("draws one stock card and uses the shortcut banner message", () => {
    const game = createGame(2, [
      { avatarId: "ava-01", name: "You" },
      { avatarId: "ava-02", name: "Cal" }
    ]);
    const next = drawStock(game);

    expect(next.stock).toHaveLength(game.stock.length - 1);
    expect(next.players[0].hand).toHaveLength(game.players[0].hand.length + 1);
    expect(next.message).toBe("Drew from stock.");
  });

  it("blocks an immediately unusable discard pickup", () => {
    const game = createGame(2, [
      { avatarId: "ava-01", name: "You" },
      { avatarId: "ava-02", name: "Cal" }
    ]);
    const state = {
      ...game,
      discard: [{ id: "king-clubs", rank: "K" as const, suit: "♣" as const }],
      players: game.players.map((player, index) => index === 0 ? { ...player, hand: [{ id: "two-spades", rank: "2" as const, suit: "♠" as const }, { id: "four-hearts", rank: "4" as const, suit: "♥" as const }], melds: [] } : player)
    };
    const next = pickupDiscardAt(state, 0);

    expect(next.discard).toEqual(state.discard);
    expect(next.players[0].hand).toEqual(state.players[0].hand);
    expect(next.message).toBe("That discard must be immediately usable.");
  });
});

describe("500 Rummy scoring", () => {
  it("preserves accumulated scores when dealing the next hand", () => {
    const nextHand = createGame(2, [
      { avatarId: "ava-01", name: "You" },
      { avatarId: "ava-02", name: "Cal" }
    ], [125, 210]);

    expect(nextHand.players.map((player) => player.score)).toEqual([125, 210]);
  });

  it("adds each hand result to the existing player totals", () => {
    const game = createGame(2, [
      { avatarId: "ava-01", name: "You" },
      { avatarId: "ava-02", name: "Cal" }
    ], [120, 90]);
    const scored = scoreHand({
      ...game,
      players: [
        { ...game.players[0], hand: [], melds: [{ id: "human-set", type: "set", cards: [{ id: "ace-spades", rank: "A", suit: "♠" }, { id: "ace-hearts", rank: "A", suit: "♥" }, { id: "ace-diamonds", rank: "A", suit: "♦" }] }] },
        { ...game.players[1], hand: [{ id: "king-clubs", rank: "K", suit: "♣" }], melds: [] }
      ]
    });

    expect(scored.scoreResult?.handScores).toEqual({ 0: 45, 1: -10 });
    expect(scored.scoreResult?.totalScores).toEqual({ 0: 165, 1: 80 });
    expect(scored.players.map((player) => player.score)).toEqual([165, 80]);
    expect(scored.scoreResult?.isGameOver).toBe(false);
  });

  it("ends the game with the highest eligible player at 500 or more", () => {
    const game = createGame(2, [
      { avatarId: "ava-01", name: "You" },
      { avatarId: "ava-02", name: "Cal" }
    ], [490, 510]);
    const scored = scoreHand({
      ...game,
      players: [
        { ...game.players[0], hand: [], melds: [{ id: "human-set", type: "set", cards: [{ id: "ace-spades", rank: "A", suit: "♠" }, { id: "ace-hearts", rank: "A", suit: "♥" }, { id: "ace-diamonds", rank: "A", suit: "♦" }] }] },
        { ...game.players[1], hand: [], melds: [] }
      ]
    });

    expect(scored.scoreResult).toMatchObject({ winnerId: 0, isGameOver: true });
    expect(getGameWinner(scored.players)?.name).toBe("You");
  });
});
