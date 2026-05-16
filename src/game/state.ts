import { AVATARS } from "../data/avatars";
import { DEAL_COUNT } from "./constants";
import { hasDuplicateCards } from "./deck";
import { makeDeck } from "./deck";
import { sortCards } from "./melds";
import type { GameState, Player, PlayerConfig } from "./types";

export function createPlayers(count: number, configs: PlayerConfig[] = []): Player[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    name: configs[index]?.name?.trim() || (index === 0 ? "You" : `Computer ${index}`),
    avatar: configs[index]?.avatar || AVATARS[index % AVATARS.length].src,
    fallback: configs[index]?.fallback || AVATARS[index % AVATARS.length].fallback,
    isAI: index > 0,
    hand: [],
    melds: [],
    score: 0
  }));
}

export function newGame(count = 2, oldPlayers: Player[] | null = null, configs: PlayerConfig[] = []): GameState {
  const stock = makeDeck();
  const players = oldPlayers ? oldPlayers.map((player) => ({ ...player, hand: [], melds: [] })) : createPlayers(count, configs);

  for (let round = 0; round < DEAL_COUNT; round += 1) {
    for (const player of players) {
      const card = stock.pop();
      if (card) player.hand.push(card);
    }
  }

  const firstDiscard = stock.pop();
  const discard = firstDiscard ? [firstDiscard] : [];

  if (hasDuplicateCards([...players.flatMap((player) => player.hand), ...stock, ...discard])) {
    throw new Error("Duplicate card detected.");
  }

  return {
    players: players.map((player) => ({ ...player, hand: sortCards(player.hand) })),
    stock,
    discard,
    turn: 0,
    drawn: false,
    selected: [],
    message: "Your turn. Draw a card.",
    handOver: false,
    scoring: null,
    winner: null
  };
}

export function moveCardById<T extends { id: string }>(cards: T[], draggedId: string, targetId: string): T[] {
  if (!draggedId || !targetId || draggedId === targetId) return cards;

  const from = cards.findIndex((card) => card.id === draggedId);
  const to = cards.findIndex((card) => card.id === targetId);

  if (from < 0 || to < 0) return cards;

  const copy = [...cards];
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);

  return copy;
}
