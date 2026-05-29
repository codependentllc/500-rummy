import { AVATARS } from "../data/avatars";
import { DEAL_COUNT } from "./constants";
import { hasDuplicateCards } from "./deck";
import { makeDeck } from "./deck";
import { sortCards } from "./melds";
import type { GameState, Player, PlayerConfig, ScoreHistoryEntry } from "./types";

function avatarForConfig(config: PlayerConfig | undefined, index: number, usedIds: Set<string>) {
  if (config?.avatarProfile) {
    usedIds.add(config.avatarProfile.id);
    return config.avatarProfile;
  }

  const configured = AVATARS.find((avatar) => avatar.id === config?.avatarId);
  if (configured) {
    usedIds.add(configured.id);
    return configured;
  }

  const available = AVATARS.filter((avatar) => !usedIds.has(avatar.id));
  const pool = available.length ? available : AVATARS;
  const avatar = pool[index > 0 ? Math.floor(Math.random() * pool.length) : index % pool.length];
  usedIds.add(avatar.id);
  return avatar;
}

export function createPlayers(count: number, configs: PlayerConfig[] = []): Player[] {
  const usedAvatarIds = new Set<string>();

  return Array.from({ length: count }, (_, index) => {
    const config = configs[index];
    const avatar = avatarForConfig(config, index, usedAvatarIds);

    return {
      id: index,
      avatarId: avatar.id,
      avatarName: avatar.name,
      avatarBio: avatar.bio,
      avatarProfile: avatar,
      name: config?.name?.trim() || (index === 0 ? "You" : avatar.name),
      avatar: config?.avatar || "",
      fallback: config?.fallback || avatar.image,
      isAI: index > 0,
      hand: [],
      melds: [],
      score: 0
    };
  });
}

export function newGame(count = 2, oldPlayers: Player[] | null = null, configs: PlayerConfig[] = [], scoreHistory: ScoreHistoryEntry[] = []): GameState {
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
    scoreHistory,
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
