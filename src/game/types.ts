export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export type MeldType = "set" | "run";

export type Card = {
  id: string;
  rank: Rank;
  suit: Suit;
};

export type Meld = {
  id: string;
  ownerId: number;
  type: MeldType;
  cards: Card[];
};

export type Player = {
  id: number;
  name: string;
  avatar: string;
  fallback: string;
  isAI: boolean;
  hand: Card[];
  melds: Meld[];
  score: number;
};

export type PlayerConfig = {
  name: string;
  avatar: string;
  fallback: string;
  nameEdited?: boolean;
};

export type ScoreRow = {
  playerId: number;
  name: string;
  avatar: string;
  fallback: string;
  meldedCards: Card[];
  handCards: Card[];
  table: number;
  hand: number;
  net: number;
  total: number;
};

export type ScoreHistoryEntry = {
  handNumber: number;
  rows: ScoreRow[];
};

export type GameState = {
  players: Player[];
  stock: Card[];
  discard: Card[];
  turn: number;
  drawn: boolean;
  selected: string[];
  message: string;
  handOver: boolean;
  scoring: ScoreRow[] | null;
  scoreHistory: ScoreHistoryEntry[];
  winner: Player | null;
};
