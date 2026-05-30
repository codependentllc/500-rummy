import { describe, expect, it } from "vitest";
import { createGame } from "./engine";

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
});
