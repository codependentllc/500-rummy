export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export type MeldType = "set" | "run";
export type TurnPhase = "draw" | "play" | "ai" | "handOver";
export type CharacterId = string;
export type CardBackThemeId = string;

export type PlayerProfile = {
  id: string;
  displayName: string;
  characterId: CharacterId;
  cardBackThemeId: CardBackThemeId;
  soundEnabled: boolean;
};

export type CharacterOption = {
  id: CharacterId;
  name: string;
  avatar: string;
  src?: string;
  fallback: string;
  role?: string;
  description?: string;
};

export type GameSettings = {
  playerCount: number;
  cardBackThemeId: CardBackThemeId;
  soundEnabled: boolean;
};

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
  contributions?: MeldContribution[];
};

export type MeldContribution = {
  playerId: number;
  cards: Card[];
};

export type Player = {
  id: number;
  profileId?: string;
  characterId?: CharacterId;
  cardBackThemeId?: CardBackThemeId;
  name: string;
  avatar: string;
  fallback: string;
  isAI: boolean;
  hand: Card[];
  melds: Meld[];
  score: number;
};

export type PlayerConfig = {
  id?: string;
  displayName?: string;
  name: string;
  characterId?: CharacterId;
  avatar: string;
  fallback: string;
  cardBackThemeId?: CardBackThemeId;
  soundEnabled?: boolean;
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

export type DragState =
  | {
      type: "stock";
      startX: number;
      startY: number;
      x: number;
      y: number;
      dragging: boolean;
    }
  | {
      type: "hand-card";
      cardId: string;
      startX: number;
      startY: number;
      x: number;
      y: number;
      dragging: boolean;
    };
