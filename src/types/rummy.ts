export const SUITS = ["♠", "♥", "♦", "♣"] as const;
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];
export type MeldType = "set" | "run";
export type SetupStep = "welcome" | "player" | "opponents" | "tableTheme" | "cardBack" | "game";

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

export interface PlayerSetup {
  avatarId: string;
  displayName: string;
}

export interface OpponentSetup {
  id: number;
  avatarId: string;
  displayName: string;
}

export interface TableTheme {
  id: string;
  name: string;
  className: string;
  description: string;
}

export interface CardBackStyle {
  id: string;
  name: string;
  className: string;
  description: string;
}

export interface GameSetupState {
  player: PlayerSetup;
  opponentCount: number;
  opponents: OpponentSetup[];
  tableThemeId: string;
  cardBackId: string;
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

export type DragSource =
  | { type: "stock" }
  | { type: "discard"; discardIndex?: number }
  | { type: "handCard"; card: Card; cardId: string };

export interface DragState {
  source: DragSource;
  isDragging: boolean;
  startX: number;
  startY: number;
}
