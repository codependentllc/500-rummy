export const SUITS = ["♠", "♥", "♦", "♣"] as const;
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];
export type MeldType = "set" | "run";
export type ScreenState = "welcome" | "setup" | "game";

export interface AvatarOption {
  id: string;
  name: string;
  role: string;
  image: string;
  color: string;
}

export interface SeatConfig {
  name: string;
  avatarId: string;
}

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

export interface Meld {
  id: string;
  type: MeldType;
  cards: Card[];
}

export interface Player {
  id: number;
  name: string;
  avatarId: string;
  avatarName: string;
  avatarImage: string;
  avatarColor: string;
  score: number;
  hand: Card[];
  melds: Meld[];
  isAI: boolean;
}

export interface GameState {
  stock: Card[];
  discard: Card[];
  players: Player[];
  turn: number;
  drawn: boolean;
  selected: string[];
  message: string;
  handOver: boolean;
}

export type ScoreRow = Pick<Player, "id" | "name" | "avatarName" | "avatarImage" | "score">;

export type DragState =
  | { type: "stock"; startX: number; startY: number; dragging: boolean }
  | { type: "card"; card: Card; startX: number; startY: number; dragging: boolean };
