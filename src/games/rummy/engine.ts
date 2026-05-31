import { AVATARS } from "../../data/avatars";
import { canLay, combinations, meldType, points, removeCards, sortCards } from "./rules";
import { RANKS, SUITS, type AvatarOption, type Card, type ComputerDifficulty, type GameState, type Meld, type Player, type SeatConfig } from "../../types/rummy";

export const WINNING_SCORE = 500;

function makeDeck() {
  const deck = SUITS.flatMap((suit) => RANKS.map((rank) => ({ id: `${rank}${suit}${crypto.randomUUID()}`, rank, suit })));
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[swap]] = [deck[swap], deck[index]];
  }
  return deck;
}

function playerFromAvatar(id: number, avatar: AvatarOption, name: string, score = 0): Player {
  return { id, name, avatarId: avatar.id, avatarName: avatar.name, avatarImage: avatar.image, avatarColor: avatar.color, score, hand: [], melds: [], isAI: id > 0 };
}

export function createGame(playerCount: number, seats: SeatConfig[], scores: number[] = [], difficulty: ComputerDifficulty = "normal"): GameState {
  const stock = makeDeck();
  const players = Array.from({ length: playerCount }, (_, index) => {
    const config = seats[index];
    const avatar = AVATARS.find((option) => option.id === config?.avatarId) ?? AVATARS[index % AVATARS.length];
    return playerFromAvatar(index, avatar, config?.name.trim() || avatar.name, scores[index] ?? 0);
  });
  for (let round = 0; round < 7; round += 1) players.forEach((player) => player.hand.push(stock.pop()!));
  players.forEach((player) => (player.hand = sortCards(player.hand)));
  return { stock, discard: [stock.pop()!], players, turn: 0, drawn: false, selected: [], message: "Drag stock to your hand or tap the discard pile.", handOver: false, difficulty };
}

export function tableMelds(state: GameState) {
  return state.players.flatMap((player) => player.melds);
}

export function selectedCards(state: GameState) {
  return state.players[0].hand.filter((card) => state.selected.includes(card.id));
}

export function toggleSelected(state: GameState, id: string): GameState {
  if (state.turn !== 0 || state.handOver) return state;
  return { ...state, selected: state.selected.includes(id) ? state.selected.filter((selected) => selected !== id) : [...state.selected, id] };
}

export function selectOnly(state: GameState, id: string): GameState {
  return { ...state, selected: [id] };
}

export function drawStock(state: GameState): GameState {
  if (state.turn !== 0 || state.drawn || !state.stock.length || state.handOver) return state;
  const stock = [...state.stock];
  const card = stock.pop()!;
  const players = state.players.map((player, index) => (index === 0 ? { ...player, hand: sortCards([...player.hand, card]) } : player));
  return { ...state, stock, players, drawn: true, message: "Drew from stock." };
}

export function immediatelyUsable(card: Card, hand: Card[], melds: Meld[], pickup: Card[] = []) {
  const allCards = [...hand, ...pickup];
  if (melds.some((meld) => canLay(card, meld))) return true;
  for (let size = 3; size <= Math.min(5, allCards.length); size += 1) {
    if (combinations(allCards, size).some((group) => group.some((candidate) => candidate.id === card.id) && meldType(group))) return true;
  }
  return false;
}

export function canPickDiscardAt(state: GameState, index: number) {
  const card = state.discard[index];
  return Boolean(card) && state.turn === 0 && !state.drawn && !state.handOver && immediatelyUsable(card, state.players[0].hand, tableMelds(state), state.discard.slice(index));
}

export function pickupDiscardAt(state: GameState, index: number): GameState {
  if (!canPickDiscardAt(state, index)) return { ...state, message: "That discard must be immediately usable." };
  const pickup = state.discard.slice(index);
  const discard = state.discard.slice(0, index);
  const players = state.players.map((player, playerIndex) => (playerIndex === 0 ? { ...player, hand: sortCards([...player.hand, ...pickup]) } : player));
  return { ...state, discard, players, drawn: true, selected: [], message: "Picked up discard." };
}

export function getGameWinner(players: Player[]) {
  return players.filter((player) => player.score >= WINNING_SCORE).sort((left, right) => right.score - left.score)[0] ?? null;
}

export function scoreHand(state: GameState): GameState {
  const handScores = Object.fromEntries(state.players.map((player) => [player.id, points(player.melds.flatMap((meld) => meld.cards)) - points(player.hand)]));
  const players = state.players.map((player) => ({ ...player, score: player.score + handScores[player.id] }));
  const winner = getGameWinner(players);
  const totalScores = Object.fromEntries(players.map((player) => [player.id, player.score]));
  return { ...state, players, handOver: true, scoreResult: { handScores, totalScores, winnerId: winner?.id, isGameOver: Boolean(winner) } };
}

export function playSelectedMeld(state: GameState): GameState {
  const cards = selectedCards(state);
  const type = meldType(cards);
  if (!type) return { ...state, message: "Invalid meld." };
  const players: Player[] = state.players.map((player, index) =>
    index === 0 ? { ...player, hand: removeCards(player.hand, cards.map((card) => card.id)), melds: [...player.melds, { id: crypto.randomUUID(), type, cards: sortCards(cards) }] } : player
  );
  const next = { ...state, players, selected: [], message: `Played a ${type}.` };
  return players[0].hand.length ? next : scoreHand(next);
}

export function layOff(state: GameState, meldId: string): GameState {
  const card = selectedCards(state)[0];
  const target = tableMelds(state).find((meld) => meld.id === meldId);
  if (!card || !target || !canLay(card, target)) return state;
  const players = state.players.map((player, index) => ({
    ...player,
    hand: index === 0 ? removeCards(player.hand, [card.id]) : player.hand,
    melds: player.melds.map((meld) => (meld.id === meldId ? { ...meld, cards: sortCards([...meld.cards, card]) } : meld))
  }));
  const next = { ...state, players, selected: [], message: `Laid off ${card.rank}${card.suit}.` };
  return players[0].hand.length ? next : scoreHand(next);
}

export function layBest(state: GameState) {
  const card = selectedCards(state)[0];
  const target = tableMelds(state).find((meld) => card && canLay(card, meld));
  return target ? layOff(state, target.id) : state;
}

export function discardSelected(state: GameState): GameState {
  const card = selectedCards(state)[0];
  if (!card) return state;
  const players = state.players.map((player, index) => (index === 0 ? { ...player, hand: removeCards(player.hand, [card.id]) } : player));
  const next = { ...state, players, discard: [...state.discard, card], selected: [], drawn: false };
  if (!players[0].hand.length) return scoreHand(next);
  return { ...next, turn: (state.turn + 1) % state.players.length, message: `Discarded ${card.rank}${card.suit}.` };
}
