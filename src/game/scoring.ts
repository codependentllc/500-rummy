import { TARGET_SCORE } from "./constants";
import type { Card, GameState, Meld, Player, ScoreRow } from "./types";

export function cardValue(card: Card): number {
  if (card.rank === "Q" && card.suit === "♠") return 40;
  if (card.rank === "A") return 15;
  if (["10", "J", "Q", "K"].includes(card.rank)) return 10;
  return 5;
}

export function points(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + cardValue(card), 0);
}

function meldContributions(meld: Meld): Array<{ playerId: number; cards: Card[] }> {
  return meld.contributions?.length ? meld.contributions : [{ playerId: meld.ownerId, cards: meld.cards }];
}

export function meldedCardsForPlayer(state: GameState, playerId: number): Card[] {
  return state.players
    .flatMap((player) => player.melds)
    .flatMap((meld) => meldContributions(meld))
    .filter((contribution) => contribution.playerId === playerId)
    .flatMap((contribution) => contribution.cards);
}

export function scoreHand(state: GameState, outPlayerId: number): GameState {
  const scoring: ScoreRow[] = state.players.map((player) => {
    const meldedCards = meldedCardsForPlayer(state, player.id);
    const table = points(meldedCards);
    const hand = points(player.hand);
    return {
      playerId: player.id,
      name: player.name,
      avatar: player.avatar,
      fallback: player.fallback,
      meldedCards,
      handCards: player.hand,
      table,
      hand,
      net: table - hand,
      total: player.score + table - hand
    };
  });

  const players = state.players.map((player) => {
    const row = scoring.find((score) => score.playerId === player.id);
    return {
      ...player,
      score: player.score + (row?.net ?? 0)
    };
  });

  const winner =
    players
      .filter((player) => player.score >= TARGET_SCORE)
      .sort((a: Player, b: Player) => b.score - a.score || (a.id === outPlayerId ? -1 : 1))[0] ?? null;

  return {
    ...state,
    players,
    scoring,
    scoreHistory: [...state.scoreHistory, { handNumber: state.scoreHistory.length + 1, rows: scoring }],
    winner,
    handOver: true,
    message: winner ? `${winner.name} wins!` : `${players[outPlayerId].name} went out. Hand scored.`
  };
}
