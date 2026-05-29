import { aiTurn } from "./ai";
import { discardPickup, immediatelyUsable } from "./discard";
import { removeCards } from "./deck";
import { canLay, label, meldType, sortCards } from "./melds";
import { scoreHand } from "./scoring";
import type { Card, GameState, Meld, Player, PlayerConfig } from "./types";
import { newGame } from "./state";

const makeId = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

export function startNewHand(count: number, players: Player[] | null, configs: PlayerConfig[], state?: GameState): GameState {
  return newGame(count, players, configs, state?.scoreHistory ?? []);
}

export function allTableMelds(state: GameState): Meld[] {
  return state.players.flatMap((player) => player.melds);
}

export function selectedCards(state: GameState): Card[] {
  return state.players[0].hand.filter((card) => state.selected.includes(card.id));
}

export function canHumanAct(state: GameState): boolean {
  return state.turn === 0 && !state.handOver;
}

export function canPickDiscardAt(state: GameState, index: number): boolean {
  return canHumanAct(state) && !state.drawn && immediatelyUsable(state.discard[index], state.players[0].hand, allTableMelds(state), discardPickup(state.discard, index));
}

export function drawFromStock(state: GameState): GameState {
  if (!canHumanAct(state) || state.drawn || !state.stock.length) return state;

  const stock = [...state.stock];
  const card = stock.pop();
  if (!card) return state;

  const players = [...state.players];
  players[0] = { ...players[0], hand: sortCards([...players[0].hand, card]) };

  return {
    ...state,
    stock,
    players,
    drawn: true,
    selected: [],
    message: `Drew ${label(card)}.`
  };
}

export function pickDiscardAt(state: GameState, index: number): GameState {
  if (!canPickDiscardAt(state, index)) {
    return { ...state, message: "That discard must be immediately usable." };
  }

  const pickup = discardPickup(state.discard, index);
  const players = [...state.players];
  players[0] = { ...players[0], hand: sortCards([...players[0].hand, ...pickup]) };

  return {
    ...state,
    players,
    discard: state.discard.slice(0, index),
    drawn: true,
    selected: [],
    message: `Picked up ${pickup.map(label).join(", ")}.`
  };
}

export function toggleSelectedCard(state: GameState, cardId: string): GameState {
  if (!canHumanAct(state)) return state;
  return {
    ...state,
    selected: state.selected.includes(cardId) ? state.selected.filter((id) => id !== cardId) : [...state.selected, cardId]
  };
}

export function selectOnlyCard(state: GameState, cardId: string): GameState {
  if (!canHumanAct(state) || !state.drawn) return state;
  return { ...state, selected: [cardId] };
}

export function playSelectedMeld(state: GameState): GameState {
  if (!canHumanAct(state) || !state.drawn) return state;

  const cards = selectedCards(state);
  const type = meldType(cards);
  if (!type) return { ...state, message: "Invalid meld." };

  const players = [...state.players];
  const human = players[0];
  players[0] = {
    ...human,
    hand: removeCards(human.hand, cards.map((card) => card.id)),
    melds: [
      ...human.melds,
      {
        id: makeId(),
        ownerId: human.id,
        type,
        cards: sortCards(cards),
        contributions: [{ playerId: human.id, cards: sortCards(cards) }]
      }
    ]
  };

  const next = { ...state, players, selected: [], message: `Played a ${type}.` };
  return players[0].hand.length ? next : scoreHand(next, 0);
}

export function layOffToMeld(state: GameState, meldId: string): GameState {
  if (!canHumanAct(state) || !state.drawn) return state;

  const [card] = selectedCards(state);
  if (!card) return state;

  let laidOff = false;
  const players = state.players.map((player) => ({
    ...player,
    hand: player.id === 0 ? removeCards(player.hand, [card.id]) : player.hand,
    melds: player.melds.map((meld) => {
      if (meld.id !== meldId || !canLay(card, meld)) return meld;
      laidOff = true;
      return {
        ...meld,
        cards: sortCards([...meld.cards, card]),
        contributions: [...(meld.contributions ?? [{ playerId: meld.ownerId, cards: meld.cards }]), { playerId: 0, cards: [card] }]
      };
    })
  }));

  if (!laidOff) return state;

  const next = { ...state, players, selected: [], message: `Laid off ${label(card)}.` };
  return players[0].hand.length ? next : scoreHand(next, 0);
}

export function layOffToFirstValidMeld(state: GameState): GameState {
  const [card] = selectedCards(state);
  const target = allTableMelds(state).find((meld) => canLay(card, meld));
  return target ? layOffToMeld(state, target.id) : state;
}

export function discardSelectedCard(state: GameState): GameState {
  if (!canHumanAct(state) || !state.drawn) return state;

  const [card] = selectedCards(state);
  if (!card) return state;

  const players = [...state.players];
  players[0] = { ...players[0], hand: removeCards(players[0].hand, [card.id]) };
  const next = {
    ...state,
    players,
    discard: [...state.discard, card],
    selected: [],
    drawn: false,
    turn: (state.turn + 1) % state.players.length,
    message: `Discarded ${label(card)}.`
  };

  return players[0].hand.length ? next : scoreHand(next, 0);
}

export function runAiTurn(state: GameState): GameState {
  if (state.turn === 0 || state.handOver) return state;
  return aiTurn(state);
}
