#!/usr/bin/env bash
set -e

APP="500-rummy-production"

rm -rf "$APP" "$APP.zip"

mkdir -p "$APP/src/game"
mkdir -p "$APP/src/components"
mkdir -p "$APP/src/data"
mkdir -p "$APP/src/test"
mkdir -p "$APP/public/avatars"

cat > "$APP/package.json" <<'EOF'
{
  "name": "500-rummy-production",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "vitest": "latest",
    "jsdom": "latest"
  }
}
EOF

cat > "$APP/index.html" <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>500 Rummy</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > "$APP/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
EOF

cat > "$APP/vite.config.ts" <<'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom"
  }
});
EOF

cat > "$APP/src/game/types.ts" <<'EOF'
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
};

export type ScoreRow = {
  playerId: number;
  name: string;
  table: number;
  hand: number;
  net: number;
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
  winner: Player | null;
};
EOF

cat > "$APP/src/game/constants.ts" <<'EOF'
import type { Rank, Suit } from "./types";

export const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
export const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export const DEAL_COUNT = 7;
export const TARGET_SCORE = 500;
EOF

cat > "$APP/src/data/avatars.ts" <<'EOF'
export const AVATARS = [
  { id: "marcus", name: "Marcus", src: "/avatars/marcus.jpg", fallback: "👨🏾" },
  { id: "nia", name: "Nia", src: "/avatars/nina.jpg", fallback: "👩🏿" },
  { id: "elias", name: "Elias", src: "/avatars/elias.jpg", fallback: "👨🏽" },
  { id: "sofia", name: "Sofia", src: "/avatars/sofia.jpg", fallback: "👩🏽" },
  { id: "jasper", name: "Jasper", src: "/avatars/jasper.jpg", fallback: "👨🏻" },
  { id: "maya", name: "Maya", src: "/avatars/maya.jpg", fallback: "👩🏽" },
  { id: "leo", name: "Leo", src: "/avatars/leo.jpg", fallback: "👨🏼" }
];
EOF

cat > "$APP/src/game/deck.ts" <<'EOF'
import { RANKS, SUITS } from "./constants";
import type { Card } from "./types";

export function makeDeck(): Card[] {
  const cards = SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      id: `${rank}${suit}`,
      rank,
      suit
    }))
  );

  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

export function hasDuplicateCards(cards: Card[]): boolean {
  return new Set(cards.map((card) => card.id)).size !== cards.length;
}

export function removeCards(cards: Card[], ids: string[]): Card[] {
  return cards.filter((card) => !ids.includes(card.id));
}
EOF

cat > "$APP/src/game/scoring.ts" <<'EOF'
import { TARGET_SCORE } from "./constants";
import type { Card, GameState, Player, ScoreRow } from "./types";

export function cardValue(card: Card): number {
  if (card.rank === "Q" && card.suit === "♠") return 40;
  if (card.rank === "A") return 15;
  if (["10", "J", "Q", "K"].includes(card.rank)) return 10;
  return 5;
}

export function points(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + cardValue(card), 0);
}

export function scoreHand(state: GameState, outPlayerId: number): GameState {
  const scoring: ScoreRow[] = state.players.map((player) => {
    const table = points(player.melds.flatMap((meld) => meld.cards));
    const hand = points(player.hand);
    return {
      playerId: player.id,
      name: player.name,
      table,
      hand,
      net: table - hand
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
    winner,
    handOver: true,
    message: winner ? `${winner.name} wins!` : `${players[outPlayerId].name} went out. Hand scored.`
  };
}
EOF

cat > "$APP/src/game/melds.ts" <<'EOF'
import { RANKS, SUITS } from "./constants";
import { hasDuplicateCards } from "./deck";
import { points } from "./scoring";
import type { Card, Meld, MeldType, Rank } from "./types";

export function label(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function rankValue(rank: Rank, highAce = false): number {
  if (rank === "A") return highAce ? 14 : 1;
  if (rank === "J") return 11;
  if (rank === "Q") return 12;
  if (rank === "K") return 13;
  return Number(rank);
}

export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) || rankValue(a.rank) - rankValue(b.rank));
}

export function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [first, ...rest] = items;
  return combinations(rest, size - 1).map((group) => [first, ...group]).concat(combinations(rest, size));
}

function uniqueGroups(groups: Card[][]): Card[][] {
  const seen = new Set<string>();
  return groups.filter((group) => {
    const key = group.map((card) => card.id).sort().join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function isSet(cards: Card[]): boolean {
  return cards.length >= 3 && cards.length <= 4 && !hasDuplicateCards(cards) && cards.every((card) => card.rank === cards[0].rank);
}

export function isRun(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  if (hasDuplicateCards(cards)) return false;
  if (!cards.every((card) => card.suit === cards[0].suit)) return false;

  const aceCount = cards.filter((card) => card.rank === "A").length;
  if (aceCount > 1) return false;

  return (aceCount ? [1, 14] : [null]).some((aceValue) => {
    const values = cards
      .map((card) => (card.rank === "A" ? aceValue : rankValue(card.rank)))
      .sort((a, b) => a - b);

    return values.every((value, index) => index === 0 || value === values[index - 1] + 1);
  });
}

export function meldType(cards: Card[]): MeldType | null {
  if (isSet(cards)) return "set";
  if (isRun(cards)) return "run";
  return null;
}

export function canLay(card: Card | undefined, meld: Meld | undefined): boolean {
  if (!card || !meld) return false;
  return meld.type === "set" ? isSet([...meld.cards, card]) : isRun([...meld.cards, card]);
}

export function possibleMelds(hand: Card[]): Card[][] {
  const groups: Card[][] = [];

  for (const rank of RANKS) {
    const sameRank = hand.filter((card) => card.rank === rank);
    if (sameRank.length >= 3) groups.push(sameRank.slice(0, 4));
  }

  for (const suit of SUITS) {
    const suited = hand.filter((card) => card.suit === suit);
    for (let size = Math.min(5, suited.length); size >= 3; size -= 1) {
      for (const group of combinations(suited, size)) {
        if (isRun(group)) groups.push(group);
      }
    }
  }

  return uniqueGroups(groups).sort((a, b) => points(b) - points(a));
}

export function nearMelds(hand: Card[]): Card[][] {
  const groups: Card[][] = [];

  for (const rank of RANKS) {
    const sameRank = hand.filter((card) => card.rank === rank);
    if (sameRank.length === 2) groups.push(sameRank);
  }

  for (const suit of SUITS) {
    const suited = sortCards(hand.filter((card) => card.suit === suit));
    for (const pair of combinations(suited, 2)) {
      if (Math.abs(rankValue(pair[0].rank) - rankValue(pair[1].rank)) <= 2) groups.push(pair);
    }
  }

  return uniqueGroups(groups);
}

export function cardHints(hand: Card[]): Record<string, "ready" | "near" | "loose"> {
  const hints: Record<string, "ready" | "near" | "loose"> = {};
  const used = new Set<string>();

  for (const meld of possibleMelds(hand)) {
    const available = meld.filter((card) => !used.has(card.id));
    if (available.length >= 3 && meldType(available)) {
      available.forEach((card) => {
        used.add(card.id);
        hints[card.id] = "ready";
      });
    }
  }

  for (const near of nearMelds(hand)) {
    const available = near.filter((card) => !used.has(card.id));
    if (available.length >= 2) {
      available.forEach((card) => {
        used.add(card.id);
        if (hints[card.id] !== "ready") hints[card.id] = "near";
      });
    }
  }

  for (const card of hand) {
    if (!hints[card.id]) hints[card.id] = "loose";
  }

  return hints;
}

export function groupHandByMelds(hand: Card[]): Card[] {
  const hints = cardHints(hand);
  const ready = hand.filter((card) => hints[card.id] === "ready");
  const near = hand.filter((card) => hints[card.id] === "near");
  const loose = hand.filter((card) => hints[card.id] === "loose");
  return [...sortCards(ready), ...sortCards(near), ...loose];
}
EOF

cat > "$APP/src/game/discard.ts" <<'EOF'
import { combinations, meldType } from "./melds";
import { canLay } from "./melds";
import type { Card, Meld } from "./types";

export function discardPickup(discard: Card[], index: number): Card[] {
  return discard.slice(index);
}

export function immediatelyUsable(card: Card | undefined, hand: Card[], tableMelds: Meld[], pickupCards: Card[] = []): boolean {
  if (!card) return false;

  const availableCards = [...hand, ...pickupCards].filter((candidate, index, all) => {
    return all.findIndex((item) => item.id === candidate.id) === index;
  });

  if (tableMelds.some((meld) => canLay(card, meld))) return true;

  for (let size = 3; size <= Math.min(5, availableCards.length); size += 1) {
    const groups = combinations(availableCards, size);
    if (groups.some((group) => group.some((item) => item.id === card.id) && Boolean(meldType(group)))) {
      return true;
    }
  }

  return false;
}
EOF

cat > "$APP/src/game/state.ts" <<'EOF'
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
EOF

cat > "$APP/src/game/ai.ts" <<'EOF'
import { removeCards } from "./deck";
import { discardPickup, immediatelyUsable } from "./discard";
import { label, meldType, possibleMelds, sortCards } from "./melds";
import { cardValue, scoreHand } from "./scoring";
import type { GameState } from "./types";

const makeId = () => Math.random().toString(36).slice(2);

export function aiTurn(state: GameState): GameState {
  const index = state.turn;
  const players = [...state.players];
  let ai = {
    ...players[index],
    hand: [...players[index].hand],
    melds: [...players[index].melds]
  };

  let stock = [...state.stock];
  let discard = [...state.discard];
  const tableMelds = players.flatMap((player) => player.melds);
  const log: string[] = [];

  let pickupIndex = -1;
  for (let i = discard.length - 1; i >= 0; i -= 1) {
    if (immediatelyUsable(discard[i], ai.hand, tableMelds, discardPickup(discard, i))) {
      pickupIndex = i;
      break;
    }
  }

  if (pickupIndex >= 0) {
    const pickup = discardPickup(discard, pickupIndex);
    discard = discard.slice(0, pickupIndex);
    ai.hand = sortCards([...ai.hand, ...pickup]);
    log.push(`${ai.name} picked discard.`);
  } else if (stock.length) {
    const card = stock.pop();
    if (card) ai.hand = sortCards([...ai.hand, card]);
    log.push(`${ai.name} drew.`);
  }

  let meld = possibleMelds(ai.hand)[0];
  while (meld) {
    const type = meldType(meld);
    if (!type) break;

    ai.hand = removeCards(ai.hand, meld.map((card) => card.id));
    ai.melds = [...ai.melds, { id: makeId(), ownerId: ai.id, type, cards: sortCards(meld) }];
    log.push(`${ai.name} melded.`);
    meld = possibleMelds(ai.hand)[0];
  }

  players[index] = ai;
  let next: GameState = { ...state, players, stock, discard };

  if (!ai.hand.length) return scoreHand(next, index);

  const out = [...ai.hand].sort((a, b) => cardValue(a) - cardValue(b))[0];
  ai.hand = removeCards(ai.hand, [out.id]);
  discard = [...discard, out];
  players[index] = ai;
  next = { ...next, players, discard };

  if (!ai.hand.length) return scoreHand(next, index);

  return {
    ...next,
    turn: (index + 1) % players.length,
    message: `${log.join(" ")} ${ai.name} discarded ${label(out)}.`
  };
}
EOF

cat > "$APP/src/components/ActionButton.tsx" <<'EOF'
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  style?: CSSProperties;
};

export function ActionButton({ children, style, ...props }: Props) {
  return (
    <button
      type="button"
      {...props}
      style={{
        padding: "8px 14px",
        background: "#fff",
        color: "#1a472a",
        border: "none",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 700,
        cursor: props.disabled ? "default" : "pointer",
        fontFamily: "Georgia, serif",
        opacity: props.disabled ? 0.45 : 1,
        ...style
      }}
    >
      {children}
    </button>
  );
}
EOF

cat > "$APP/src/components/AvatarPhoto.tsx" <<'EOF'
import { useState } from "react";

type Props = {
  src?: string;
  alt: string;
  fallback?: string;
  size?: number;
};

export function AvatarPhoto({ src, alt, fallback = "🧑", size = 42 }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed || !String(src).startsWith("/")) {
    return (
      <div
        title={alt}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#e8e8e8",
          color: "#1a472a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.floor(size * 0.52),
          border: "2px solid rgba(255,255,255,0.75)",
          overflow: "hidden",
          flexShrink: 0
        }}
      >
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      title={alt}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: "2px solid rgba(255,255,255,0.75)",
        display: "block",
        flexShrink: 0,
        background: "#e8e8e8"
      }}
    />
  );
}
EOF

cat > "$APP/src/components/CardView.tsx" <<'EOF'
import type { DragEventHandler, MouseEventHandler } from "react";
import { cardValue } from "../game/scoring";
import { label } from "../game/melds";
import type { Card } from "../game/types";

type Props = {
  card: Card;
  selected?: boolean;
  small?: boolean;
  faceDown?: boolean;
  disabled?: boolean;
  hint?: "" | "ready" | "near" | "loose";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onDragStart?: DragEventHandler<HTMLButtonElement>;
  onDragOver?: DragEventHandler<HTMLButtonElement>;
  onDrop?: DragEventHandler<HTMLButtonElement>;
};

export function CardView({
  card,
  selected = false,
  small = false,
  faceDown = false,
  disabled = false,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  hint = ""
}: Props) {
  const size = small ? { w: 38, h: 54, rank: 11 } : { w: 54, h: 76, rank: 14 };

  if (faceDown) {
    return (
      <div
        style={{
          width: size.w,
          height: size.h,
          borderRadius: 6,
          background: "repeating-linear-gradient(45deg,#1a472a,#1a472a 3px,#2d6a4f 3px,#2d6a4f 6px)",
          border: "2px solid #fff",
          flexShrink: 0
        }}
      />
    );
  }

  const red = card.suit === "♥" || card.suit === "♦";
  const queenSpades = card.id === "Q♠";
  const hintBorder = hint === "ready" ? "2.5px solid #9ee493" : hint === "near" ? "2.5px solid #ffe082" : "1.5px solid #ccc";

  return (
    <button
      type="button"
      disabled={disabled}
      draggable={!disabled}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      title={`${label(card)}: ${cardValue(card)} points`}
      style={{
        width: size.w,
        height: size.h,
        borderRadius: 7,
        background: selected ? "#fffbe6" : "#fff",
        border: selected ? "2.5px solid #e6a817" : hintBorder,
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "3px 4px",
        position: "relative",
        flexShrink: 0,
        transform: selected ? "translateY(-8px)" : "none",
        transition: "transform 0.15s, border 0.1s",
        boxShadow: selected ? "0 4px 12px rgba(230,168,23,0.4)" : "0 1px 4px rgba(0,0,0,0.12)"
      }}
    >
      <div style={{ fontSize: size.rank, fontWeight: 800, color: queenSpades ? "#8B0000" : red ? "#cc2200" : "#111", lineHeight: 1 }}>{card.rank}</div>
      <div style={{ fontSize: size.rank + 1, color: queenSpades ? "#8B0000" : red ? "#cc2200" : "#111", textAlign: "center", lineHeight: 1 }}>{card.suit}</div>
      <div style={{ fontSize: size.rank, fontWeight: 800, color: queenSpades ? "#8B0000" : red ? "#cc2200" : "#111", lineHeight: 1, alignSelf: "flex-end", transform: "rotate(180deg)" }}>{card.rank}</div>
      {queenSpades ? <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 7, color: "#8B0000", fontWeight: 900 }}>★40★</div> : null}
    </button>
  );
}
EOF

cat > "$APP/src/components/SetupScreen.tsx" <<'EOF'
import { AVATARS } from "../data/avatars";
import type { PlayerConfig } from "../game/types";
import { ActionButton } from "./ActionButton";
import { AvatarPhoto } from "./AvatarPhoto";

type Props = {
  count: number;
  setCount: (count: number) => void;
  configs: PlayerConfig[];
  setConfigs: React.Dispatch<React.SetStateAction<PlayerConfig[]>>;
  onStart: () => void;
};

export function SetupScreen({ count, setCount, configs, setConfigs, onStart }: Props) {
  function updatePlayer(index: number, patch: Partial<PlayerConfig>) {
    setConfigs((prev) => prev.map((player, i) => (i === index ? { ...player, ...patch } : player)));
  }

  return (
    <div className="setup-page">
      <div className="setup-card">
        <div className="setup-logo">🃏</div>
        <h1>500 Rummy</h1>
        <p>Choose names and fictional photo avatars, then deal.</p>

        <div className="setup-section">
          <b>Players</b>
          <div className="player-count-row">
            {[2, 3, 4].map((number) => (
              <ActionButton
                key={number}
                onClick={() => setCount(number)}
                style={{
                  flex: 1,
                  background: count === number ? "#1a472a" : "#f2f2f2",
                  color: count === number ? "#fff" : "#1a472a",
                  border: "1px solid #ddd"
                }}
              >
                {number}
              </ActionButton>
            ))}
          </div>
        </div>

        {Array.from({ length: count }, (_, index) => configs[index]).map((player, index) => (
          <div key={index} className="player-config">
            <div className="player-config-main">
              <AvatarPhoto src={player.avatar} alt={player.name || `Player ${index + 1}`} fallback={player.fallback || (index === 0 ? "🧑" : "🤖")} size={54} />
              <input
                value={player.name || ""}
                onChange={(event) => updatePlayer(index, { name: event.target.value })}
                placeholder={index === 0 ? "Your name" : `Computer ${index} name`}
              />
              <span>{index === 0 ? "You" : "CPU"}</span>
            </div>

            <div className="avatar-grid">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  title={avatar.name}
                  onClick={() => updatePlayer(index, { avatar: avatar.src, fallback: avatar.fallback })}
                  className={player.avatar === avatar.src ? "avatar-choice selected" : "avatar-choice"}
                >
                  <AvatarPhoto src={avatar.src} alt={avatar.name} fallback={avatar.fallback} size={46} />
                  <small>{avatar.name}</small>
                </button>
              ))}
            </div>
          </div>
        ))}

        <ActionButton onClick={onStart} style={{ width: "100%", background: "#1a472a", color: "#fff", padding: 14, fontSize: 16, marginTop: 8 }}>
          Deal Cards ♠
        </ActionButton>
      </div>
    </div>
  );
}
EOF

cat > "$APP/src/components/ScorePanel.tsx" <<'EOF'
import type { Player } from "../game/types";
import { AvatarPhoto } from "./AvatarPhoto";

type Props = {
  players: Player[];
  turn: number;
  handOver: boolean;
};

export function ScorePanel({ players, turn, handOver }: Props) {
  return (
    <div className="score-panel">
      {players.map((player) => (
        <div key={player.id} className={turn === player.id && !handOver ? "score-card active" : "score-card"}>
          <div className="score-avatar">
            <AvatarPhoto src={player.avatar} alt={player.name} fallback={player.fallback || (player.isAI ? "🤖" : "🧑")} size={42} />
          </div>
          <div className="score-name">{player.name}</div>
          <div className="score-value">{player.score}</div>
          <div className="score-meta">{player.hand.length} cards</div>
        </div>
      ))}
    </div>
  );
}
EOF

cat > "$APP/src/components/TableArea.tsx" <<'EOF'
import type { DragEvent } from "react";
import { CardView } from "./CardView";
import type { GameState } from "../game/types";

type Props = {
  state: GameState;
  disabled: boolean;
  onDrawStock: () => void;
  onDrawDiscard: (index: number) => void;
  onPlayMeld: () => void;
  onDropDiscard: (event: DragEvent<HTMLDivElement>) => void;
  allowDrop: (event: DragEvent) => void;
};

export function TableArea({ state, disabled, onDrawStock, onDrawDiscard, onPlayMeld, onDropDiscard, allowDrop }: Props) {
  const visibleDiscard = [...state.discard].reverse();
  const canDrawStock = !disabled && state.turn === 0 && !state.drawn && !state.handOver;

  return (
    <>
      <div className="table-area">
        <div>
          <div className="section-label">STOCK ({state.stock.length})</div>
          <div onClick={canDrawStock ? onDrawStock : undefined} style={{ cursor: canDrawStock ? "pointer" : "default" }}>
            {state.stock.length ? (
              <CardView card={{ id: "back", rank: "A", suit: "♠" }} faceDown />
            ) : (
              <div className="empty-stock">Empty</div>
            )}
          </div>
        </div>

        <div className="discard-area">
          <div className="section-label">DISCARD PILE (top → bottom)</div>
          <div className="discard-row">
            {visibleDiscard.map((card, visibleIndex) => {
              const realIndex = state.discard.length - 1 - visibleIndex;
              return (
                <div key={card.id} className="discard-card-wrap">
                  <CardView
                    card={card}
                    small={visibleIndex > 0}
                    disabled={disabled || state.turn !== 0 || state.drawn || state.handOver}
                    onClick={() => onDrawDiscard(realIndex)}
                    onDragStart={(event) => event.dataTransfer.setData("text/plain", `discard:${realIndex}`)}
                  />
                  {visibleIndex === 0 ? <div className="top-label">TOP</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="drop-zones">
        <div onDragOver={allowDrop} onDrop={disabled ? undefined : onPlayMeld} className="drop-zone meld-zone">
          Drop selected cards here to meld
        </div>
        <div onDragOver={allowDrop} onDrop={disabled ? undefined : onDropDiscard} className="drop-zone discard-zone">
          Drop discard cards here to pick up
        </div>
      </div>
    </>
  );
}
EOF

cat > "$APP/src/components/HandCardRow.tsx" <<'EOF'
import type { DragEvent } from "react";
import { CardView } from "./CardView";
import { ActionButton } from "./ActionButton";
import type { Card } from "../game/types";

type Props = {
  cards: Card[];
  hints: Record<string, "ready" | "near" | "loose">;
  selectedIds: string[];
  disabled: boolean;
  onSelect: (ids: string[]) => void;
  onCardClick: (id: string) => void;
  onCardDrag: (event: DragEvent<HTMLButtonElement>, id: string) => void;
  onCardDrop: (event: DragEvent<HTMLButtonElement>, id: string) => void;
  allowDrop: (event: DragEvent) => void;
};

export function HandCardRow({ cards, hints, selectedIds, disabled, onSelect, onCardClick, onCardDrag, onCardDrop, allowDrop }: Props) {
  const readyCards = Object.entries(hints)
    .filter(([, kind]) => kind === "ready")
    .map(([id]) => id);

  return (
    <div>
      <div className="hand-helper">
        <span>Drag cards onto other cards to reorder.</span>
        {readyCards.length >= 3 ? (
          <ActionButton disabled={disabled} onClick={() => onSelect(readyCards)} style={{ background: "#ffe082", color: "#1a472a", padding: "5px 10px", fontSize: 11 }}>
            Select Ready Meld
          </ActionButton>
        ) : null}
      </div>

      <div className="hand-row">
        {cards.map((card) => (
          <CardView
            key={card.id}
            card={card}
            selected={selectedIds.includes(card.id)}
            disabled={disabled}
            hint={hints[card.id]}
            onClick={() => onCardClick(card.id)}
            onDragStart={(event) => onCardDrag(event, card.id)}
            onDragOver={allowDrop}
            onDrop={(event) => onCardDrop(event, card.id)}
          />
        ))}
      </div>
    </div>
  );
}
EOF

cat > "$APP/src/components/MeldDisplay.tsx" <<'EOF'
import type { DragEvent } from "react";
import { CardView } from "./CardView";
import type { Meld } from "../game/types";

type Props = {
  meld: Meld;
  playerName: string;
  canLayoffCard: boolean;
  disabled: boolean;
  onLayoff: (meldId: string) => void;
  allowDrop: (event: DragEvent) => void;
};

export function MeldDisplay({ meld, playerName, canLayoffCard, disabled, onLayoff, allowDrop }: Props) {
  return (
    <div
      onDragOver={allowDrop}
      onDrop={disabled ? undefined : () => onLayoff(meld.id)}
      onClick={!disabled && canLayoffCard ? () => onLayoff(meld.id) : undefined}
      className={canLayoffCard ? "meld-display layoff-ready" : "meld-display"}
    >
      <div className="meld-title">{playerName} — {meld.type}</div>
      <div className="meld-cards">
        {meld.cards.map((card) => <CardView key={card.id} card={card} small disabled />)}
      </div>
      {canLayoffCard ? <div className="layoff-label">▶ Lay off here</div> : null}
    </div>
  );
}
EOF

cat > "$APP/src/components/FlyingCards.tsx" <<'EOF'
import { CardView } from "./CardView";
import type { Card } from "../game/types";

type Props = {
  cards: Card[];
};

export function FlyingCards({ cards }: Props) {
  if (!cards.length) return null;

  return (
    <div className="flying-cards">
      {cards.map((card, index) => {
        const style = {
          left: index * 28 - (cards.length - 1) * 14,
          animationDelay: `${index * 45}ms`,
          "--rot": `${(index - (cards.length - 1) / 2) * 8}deg`
        } as React.CSSProperties;

        return (
          <div key={`${card.id}-fly-${index}`} className="flying-card" style={style}>
            <CardView card={card} small />
          </div>
        );
      })}
    </div>
  );
}
EOF

cat > "$APP/src/components/EndHandModal.tsx" <<'EOF'
import type { GameState } from "../game/types";
import { ActionButton } from "./ActionButton";

type Props = {
  state: GameState;
  onNextHand: () => void;
  onNewGame: () => void;
  onExit: () => void;
};

export function EndHandModal({ state, onNextHand, onNewGame, onExit }: Props) {
  if (!state.handOver) return null;

  return (
    <div className="modal-backdrop">
      <div className="end-modal">
        <h2>{state.winner ? "🏆 Game Over" : "Hand Complete"}</h2>
        {state.scoring?.map((row) => (
          <div key={row.playerId} className="score-row">
            <b>{row.name}</b>
            <div>Melded +{row.table} · In hand -{row.hand} · Net {row.net}</div>
          </div>
        ))}

        <div className="modal-actions">
          {state.winner ? (
            <ActionButton onClick={onNewGame} style={{ flex: 1, background: "#1a472a", color: "#fff" }}>New Game</ActionButton>
          ) : (
            <ActionButton onClick={onNextHand} style={{ flex: 1, background: "#1a472a", color: "#fff" }}>Next Hand</ActionButton>
          )}
          <ActionButton onClick={onExit} style={{ flex: 1, background: "#eee", color: "#1a472a" }}>Names / Exit</ActionButton>
        </div>
      </div>
    </div>
  );
}
EOF

cat > "$APP/src/App.tsx" <<'EOF'
import { useEffect, useMemo, useState } from "react";
import { AVATARS } from "./data/avatars";
import { aiTurn } from "./game/ai";
import { discardPickup, immediatelyUsable } from "./game/discard";
import { removeCards } from "./game/deck";
import { canLay, cardHints, groupHandByMelds, label, meldType, sortCards } from "./game/melds";
import { points, scoreHand } from "./game/scoring";
import { moveCardById, newGame } from "./game/state";
import type { Card, GameState, PlayerConfig } from "./game/types";
import { ActionButton } from "./components/ActionButton";
import { AvatarPhoto } from "./components/AvatarPhoto";
import { EndHandModal } from "./components/EndHandModal";
import { FlyingCards } from "./components/FlyingCards";
import { HandCardRow } from "./components/HandCardRow";
import { MeldDisplay } from "./components/MeldDisplay";
import { ScorePanel } from "./components/ScorePanel";
import { SetupScreen } from "./components/SetupScreen";
import { TableArea } from "./components/TableArea";
import "./styles.css";

const defaultConfigs: PlayerConfig[] = [
  { name: "You", avatar: AVATARS[0].src, fallback: AVATARS[0].fallback },
  { name: AVATARS[1].name, avatar: AVATARS[1].src, fallback: AVATARS[1].fallback },
  { name: AVATARS[2].name, avatar: AVATARS[2].src, fallback: AVATARS[2].fallback },
  { name: AVATARS[3].name, avatar: AVATARS[3].src, fallback: AVATARS[3].fallback }
];

export default function App() {
  const [count, setCount] = useState(2);
  const [configs, setConfigs] = useState<PlayerConfig[]>(defaultConfigs);
  const [started, setStarted] = useState(false);
  const [state, setState] = useState<GameState>(() => newGame(2, null, defaultConfigs));
  const [flyingCards, setFlyingCards] = useState<Card[]>([]);
  const [isAnimatingMeld, setIsAnimatingMeld] = useState(false);

  const human = state.players[0];
  const current = state.players[state.turn];
  const selectedCards = human.hand.filter((card) => state.selected.includes(card.id));
  const tableMelds = state.players.flatMap((player) => player.melds);
  const handHints = useMemo(() => cardHints(human.hand), [human.hand]);

  useEffect(() => {
    if (!started || !current?.isAI || state.handOver || isAnimatingMeld) return;
    const timer = window.setTimeout(() => setState((prev) => aiTurn(prev)), 650);
    return () => window.clearTimeout(timer);
  }, [started, state.turn, state.handOver, current?.isAI, isAnimatingMeld]);

  function setMessage(message: string) {
    setState((prev) => ({ ...prev, message }));
  }

  function startConfiguredGame() {
    setFlyingCards([]);
    setIsAnimatingMeld(false);
    setState(newGame(count, null, configs));
    setStarted(true);
  }

  function resetGame(players = null) {
    setFlyingCards([]);
    setIsAnimatingMeld(false);
    setState(newGame(count, players, configs));
  }

  function returnToSetup() {
    setFlyingCards([]);
    setIsAnimatingMeld(false);
    setStarted(false);
  }

  function allowDrop(event: React.DragEvent) {
    event.preventDefault();
  }

  function selectCards(ids: string[]) {
    if (state.turn !== 0 || state.handOver || isAnimatingMeld) return;
    setState((prev) => ({ ...prev, selected: ids }));
  }

  function toggleCard(id: string) {
    if (state.turn !== 0 || state.handOver || isAnimatingMeld) return;
    setState((prev) => ({
      ...prev,
      selected: prev.selected.includes(id) ? prev.selected.filter((cardId) => cardId !== id) : [...prev.selected, id]
    }));
  }

  function drawStock() {
    if (state.turn !== 0 || state.drawn || state.handOver || isAnimatingMeld) return;
    if (!state.stock.length) {
      setMessage("Stock is empty.");
      return;
    }

    setState((prev) => {
      const stock = [...prev.stock];
      const card = stock.pop();
      if (!card) return prev;

      const players = [...prev.players];
      players[0] = { ...players[0], hand: [...players[0].hand, card] };

      return { ...prev, players, stock, drawn: true, message: "Drew from stock." };
    });
  }

  function drawDiscard(index: number) {
    if (state.turn !== 0 || state.drawn || state.handOver || isAnimatingMeld) return;

    const card = state.discard[index];
    const pickupPreview = discardPickup(state.discard, index);

    if (!immediatelyUsable(card, human.hand, tableMelds, pickupPreview)) {
      setMessage(`${label(card)} must be immediately usable in a set, run, or layoff.`);
      return;
    }

    setState((prev) => {
      const pickup = discardPickup(prev.discard, index);
      const discard = prev.discard.slice(0, index);
      const players = [...prev.players];
      players[0] = { ...players[0], hand: [...players[0].hand, ...pickup] };

      return {
        ...prev,
        players,
        discard,
        drawn: true,
        message: `Picked up ${pickup.map(label).join(", ")}.`
      };
    });
  }

  function finishPlayMeld(type: "set" | "run", cardsToPlay: Card[], idsToRemove: string[]) {
    setState((prev) => {
      const players = [...prev.players];
      const me = { ...players[0] };
      me.hand = removeCards(me.hand, idsToRemove);
      me.melds = [...me.melds, { id: Math.random().toString(36).slice(2), ownerId: me.id, type, cards: sortCards(cardsToPlay) }];
      players[0] = me;

      const next = { ...prev, players, selected: [], message: `Played ${type}.` };
      return me.hand.length ? next : scoreHand(next, 0);
    });

    setFlyingCards([]);
    setIsAnimatingMeld(false);
  }

  function playMeld() {
    if (isAnimatingMeld) return;
    if (!state.drawn) {
      setMessage("Draw first.");
      return;
    }

    const type = meldType(selectedCards);
    if (!type) {
      setMessage("That is not a valid meld.");
      return;
    }

    const cardsToPlay = sortCards(selectedCards);
    const idsToRemove = selectedCards.map((card) => card.id);
    setFlyingCards(cardsToPlay);
    setIsAnimatingMeld(true);
    setMessage("Playing meld…");
    window.setTimeout(() => finishPlayMeld(type, cardsToPlay, idsToRemove), 560 + cardsToPlay.length * 45);
  }

  function finishLayoff(card: Card, meldId: string) {
    setState((prev) => {
      const players = prev.players.map((player, index) => ({
        ...player,
        hand: index === 0 ? removeCards(player.hand, [card.id]) : player.hand,
        melds: player.melds.map((meld) => (meld.id === meldId ? { ...meld, cards: sortCards([...meld.cards, card]) } : meld))
      }));

      const next = { ...prev, players, selected: [], message: `Laid off ${label(card)}.` };
      return players[0].hand.length ? next : scoreHand(next, 0);
    });

    setFlyingCards([]);
    setIsAnimatingMeld(false);
  }

  function layoff(meldId: string) {
    if (isAnimatingMeld) return;
    if (!state.drawn || selectedCards.length !== 1) {
      setMessage("Select one card to lay off.");
      return;
    }

    const card = selectedCards[0];
    const target = tableMelds.find((meld) => meld.id === meldId);

    if (!target || !canLay(card, target)) {
      setMessage("Cannot lay off there.");
      return;
    }

    setFlyingCards([card]);
    setIsAnimatingMeld(true);
    setMessage(`Laying off ${label(card)}…`);
    window.setTimeout(() => finishLayoff(card, meldId), 560);
  }

  function discardSelected() {
    if (isAnimatingMeld) return;
    if (!state.drawn || selectedCards.length !== 1) {
      setMessage("Select one card to discard.");
      return;
    }

    const card = selectedCards[0];

    setState((prev) => {
      const players = [...prev.players];
      players[0] = { ...players[0], hand: removeCards(players[0].hand, [card.id]) };
      const next = { ...prev, players, discard: [...prev.discard, card], selected: [], drawn: false };

      return players[0].hand.length
        ? { ...next, turn: (prev.turn + 1) % prev.players.length, message: `${label(card)} discarded. Computer is playing…` }
        : scoreHand(next, 0);
    });
  }

  function dragCard(event: React.DragEvent<HTMLButtonElement>, cardId: string) {
    if (isAnimatingMeld) return;
    selectCards([cardId]);
    event.dataTransfer.setData("text/plain", `hand:${cardId}`);
  }

  function dropOnHandCard(event: React.DragEvent<HTMLButtonElement>, targetId: string) {
    event.preventDefault();
    if (isAnimatingMeld) return;

    const data = event.dataTransfer.getData("text/plain");
    if (!data.startsWith("hand:")) return;

    const draggedId = data.split(":")[1];

    setState((prev) => {
      const players = [...prev.players];
      players[0] = { ...players[0], hand: moveCardById(players[0].hand, draggedId, targetId) };
      return { ...prev, players, message: "Hand reordered." };
    });
  }

  function sortHandByMelds() {
    if (isAnimatingMeld) return;
    setState((prev) => {
      const players = [...prev.players];
      players[0] = { ...players[0], hand: groupHandByMelds(players[0].hand) };
      return { ...prev, players, message: "Hand sorted by possible melds." };
    });
  }

  function sortHandBySuit() {
    if (isAnimatingMeld) return;
    setState((prev) => {
      const players = [...prev.players];
      players[0] = { ...players[0], hand: sortCards(players[0].hand) };
      return { ...prev, players, message: "Hand sorted by suit." };
    });
  }

  function dropDiscard(event: React.DragEvent<HTMLDivElement>) {
    if (isAnimatingMeld) return;
    const data = event.dataTransfer.getData("text/plain");
    if (data.startsWith("discard:")) drawDiscard(Number(data.split(":")[1]));
  }

  if (!started) {
    return <SetupScreen count={count} setCount={setCount} configs={configs} setConfigs={setConfigs} onStart={startConfiguredGame} />;
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        <div className="title">🃏 500 Rummy</div>
        <div className="top-actions">
          {[2, 3, 4].map((number) => (
            <ActionButton key={number} disabled={isAnimatingMeld} onClick={() => { setCount(number); setState(newGame(number, null, configs)); }} style={{ background: count === number ? "#ffe082" : "rgba(255,255,255,0.92)", color: "#1a472a", padding: "6px 10px" }}>
              {number}P
            </ActionButton>
          ))}
          <ActionButton disabled={isAnimatingMeld} onClick={() => resetGame(null)} style={{ background: "#ffe082", color: "#1a472a", padding: "6px 10px" }}>New</ActionButton>
          <ActionButton disabled={isAnimatingMeld} onClick={returnToSetup} style={{ background: "#fff", color: "#1a472a", padding: "6px 10px" }}>Names</ActionButton>
        </div>
      </div>

      <ScorePanel players={state.players} turn={state.turn} handOver={state.handOver} />

      <div className={state.message.match(/must|Cannot|valid/i) ? "message error" : "message"}>
        <b>Turn: {current.name}</b> — {state.message}
      </div>

      <TableArea
        state={state}
        onDrawStock={drawStock}
        onDrawDiscard={drawDiscard}
        onPlayMeld={playMeld}
        onDropDiscard={dropDiscard}
        allowDrop={allowDrop}
        disabled={isAnimatingMeld}
      />

      <FlyingCards cards={flyingCards} />

      {tableMelds.length ? (
        <div className="meld-section">
          <div className="section-label">TABLE MELDS</div>
          <div className="meld-grid">
            {state.players.flatMap((player) => player.melds.map((meld) => ({ player, meld }))).map(({ player, meld }) => (
              <MeldDisplay
                key={meld.id}
                meld={meld}
                playerName={player.name}
                canLayoffCard={selectedCards.length === 1 && state.turn === 0 && state.drawn && canLay(selectedCards[0], meld)}
                onLayoff={layoff}
                allowDrop={allowDrop}
                disabled={isAnimatingMeld}
              />
            ))}
          </div>
        </div>
      ) : null}

      {state.players.slice(1).map((player) => (
        <div key={player.id} className="ai-row">
          <div className="ai-label">
            <AvatarPhoto src={player.avatar} alt={player.name} fallback={player.fallback || "🤖"} size={28} />
            {player.name} — {player.hand.length} cards{state.turn === player.id ? " ← TURN" : ""}
          </div>
          <div className="ai-cards">
            {player.hand.map((card) => <CardView key={card.id} card={card} faceDown small />)}
          </div>
        </div>
      ))}

      <div className={state.turn === 0 && !state.handOver ? "human-area active" : "human-area"}>
        <div className="human-header">
          <div className="human-name">
            <AvatarPhoto src={human.avatar} alt={human.name} fallback={human.fallback || "🧑"} size={30} />
            {human.name} {state.turn === 0 ? `— ${state.drawn ? "Meld/Lay off, then discard" : "Draw a card"}` : ""}
          </div>
          <div className="hand-actions">
            <span>{human.hand.length} cards · {selectedCards.length} selected · {points(selectedCards)} pts</span>
            <ActionButton disabled={state.turn !== 0 || state.handOver || isAnimatingMeld} onClick={sortHandByMelds} style={{ background: "#2d6a4f", color: "#fff", padding: "6px 10px", fontSize: 12 }}>Group Melds</ActionButton>
            <ActionButton disabled={state.turn !== 0 || state.handOver || isAnimatingMeld} onClick={sortHandBySuit} style={{ background: "#fff", color: "#1a472a", padding: "6px 10px", fontSize: 12 }}>Sort Suit</ActionButton>
          </div>
        </div>

        <div onDragOver={allowDrop} onDrop={dropDiscard}>
          <HandCardRow
            cards={human.hand}
            hints={handHints}
            selectedIds={state.selected}
            disabled={state.turn !== 0 || state.handOver || isAnimatingMeld}
            onSelect={selectCards}
            onCardClick={toggleCard}
            onCardDrag={dragCard}
            onCardDrop={dropOnHandCard}
            allowDrop={allowDrop}
          />
        </div>

        {state.turn === 0 && state.drawn ? (
          <div className="turn-actions">
            <ActionButton disabled={isAnimatingMeld} onClick={playMeld} style={{ background: "#2d6a4f", color: "#fff" }}>♣ Meld Selected ({selectedCards.length})</ActionButton>
            <ActionButton disabled={isAnimatingMeld} onClick={discardSelected} style={{ background: "#8B0000", color: "#fff" }}>✕ Discard Selected</ActionButton>
          </div>
        ) : null}
      </div>

      <EndHandModal
        state={state}
        onNextHand={() => resetGame(state.players)}
        onNewGame={() => resetGame(null)}
        onExit={returnToSetup}
      />
    </div>
  );
}
EOF

cat > "$APP/src/main.tsx" <<'EOF'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

cat > "$APP/src/styles.css" <<'EOF'
* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.app-shell {
  min-height: 100vh;
  background: #1a472a;
  background-image: radial-gradient(ellipse at 50% 20%, #2d6a4f 0%, #1a472a 50%, #0f2d18 100%);
  font-family: Georgia, serif;
  color: #fff;
  padding: 12px;
  user-select: none;
}

.top-bar,
.human-header,
.top-actions,
.hand-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.top-bar,
.human-header {
  justify-content: space-between;
}

.title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}

.score-panel {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  flex-wrap: wrap;
}

.score-card {
  flex: 1;
  min-width: 110px;
  background: rgba(0, 0, 0, 0.22);
  border-radius: 10px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.score-card.active {
  background: rgba(255, 255, 255, 0.22);
  border: 2px solid #ffe082;
}

.score-avatar {
  display: flex;
  justify-content: center;
  margin-bottom: 5px;
}

.score-name {
  font-size: 11px;
  opacity: 0.75;
}

.score-value {
  font-size: 20px;
  font-weight: 700;
}

.score-meta {
  font-size: 10px;
  opacity: 0.55;
}

.message {
  background: rgba(0, 0, 0, 0.18);
  border-radius: 12px;
  padding: 8px 12px;
  margin-bottom: 12px;
  color: #ffe082;
  min-height: 34px;
  font-size: 13px;
}

.message.error {
  color: #ffb3b3;
}

.table-area {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.section-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 4px;
}

.discard-area {
  flex: 1;
}

.discard-row,
.ai-cards,
.hand-row,
.meld-cards,
.meld-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: flex-start;
}

.discard-card-wrap {
  position: relative;
}

.top-label {
  position: absolute;
  top: -10px;
  left: 0;
  font-size: 9px;
  color: #ffe082;
}

.empty-stock {
  width: 54px;
  height: 76px;
  border-radius: 7px;
  border: 2px dashed rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.drop-zones {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.drop-zone {
  border-radius: 10px;
  padding: 8px;
  font-size: 12px;
}

.meld-zone {
  border: 1.5px dashed #9ee493;
  color: #d8f3dc;
}

.discard-zone {
  border: 1.5px dashed #ffe082;
  color: #ffe082;
}

.meld-section {
  margin: 12px 0;
}

.meld-grid {
  gap: 8px;
}

.meld-display {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.meld-display.layoff-ready {
  border: 2px dashed #fff;
  cursor: pointer;
  animation: meldGlow 1.2s ease-in-out infinite;
}

.meld-title {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 4px;
}

.layoff-label {
  font-size: 10px;
  color: #ffe082;
  margin-top: 3px;
}

.ai-row {
  margin-bottom: 10px;
}

.ai-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 4px;
}

.human-area {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
}

.human-area.active {
  border: 2px solid #ffe082;
}

.human-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
}

.hand-actions span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.hand-helper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.hand-row {
  align-items: flex-end;
}

.turn-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.setup-page {
  min-height: 100vh;
  background: #1a472a;
  background-image: radial-gradient(ellipse at 50% 30%, #2d6a4f 0%, #1a472a 60%, #0f2d18 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Georgia, serif;
  padding: 24px;
}

.setup-card {
  background: rgba(255, 255, 255, 0.97);
  border-radius: 20px;
  padding: 2rem;
  width: min(680px, 100%);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  color: #1a472a;
}

.setup-logo {
  text-align: center;
  font-size: 44px;
}

.setup-card h1,
.setup-card p {
  text-align: center;
}

.setup-card h1 {
  margin: 0 0 6px;
}

.setup-card p {
  color: #666;
  margin-top: 0;
}

.setup-section {
  margin-bottom: 18px;
}

.player-count-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.player-config {
  border: 1px solid #ddd;
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 12px;
}

.player-config-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.player-config-main input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1.5px solid #ccc;
  font-family: Georgia, serif;
  font-size: 14px;
}

.player-config-main span {
  color: #777;
  font-size: 12px;
}

.avatar-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.avatar-choice {
  border-radius: 12px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  padding: 4px;
  width: 72px;
}

.avatar-choice.selected {
  border: 3px solid #1a472a;
  background: #d8f3dc;
}

.avatar-choice small {
  display: block;
  color: #1a472a;
  margin-top: 4px;
}

.avatar-note {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.end-modal {
  background: #fff;
  color: #333;
  border-radius: 20px;
  padding: 2rem;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.end-modal h2 {
  text-align: center;
  color: #1a472a;
  margin-top: 0;
}

.score-row {
  border: 1.5px solid #ddd;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.flying-cards {
  position: fixed;
  left: 50%;
  bottom: 95px;
  z-index: 50;
  pointer-events: none;
}

.flying-card {
  position: absolute;
  bottom: 0;
  animation: flyToMeld 560ms cubic-bezier(.2, .8, .2, 1) forwards;
}

@keyframes flyToMeld {
  0% {
    transform: translate(-50%, 0) scale(1) rotate(0deg);
    opacity: 1;
  }

  42% {
    transform: translate(-50%, -150px) scale(1.08) rotate(var(--rot));
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -335px) scale(0.72) rotate(var(--rot));
    opacity: 0;
  }
}

@keyframes meldGlow {
  0% {
    box-shadow: 0 0 0 rgba(255, 224, 130, 0);
  }

  50% {
    box-shadow: 0 0 24px rgba(255, 224, 130, 0.65);
  }

  100% {
    box-shadow: 0 0 0 rgba(255, 224, 130, 0);
  }
}

@media (max-width: 640px) {
  .drop-zones {
    grid-template-columns: 1fr;
  }

  .table-area {
    flex-direction: column;
  }

  .avatar-choice {
    width: 64px;
  }
}
EOF

cat > "$APP/src/test/game.test.ts" <<'EOF'
import { describe, expect, it } from "vitest";
import { makeDeck, hasDuplicateCards } from "../game/deck";
import { immediatelyUsable } from "../game/discard";
import { isRun, isSet } from "../game/melds";
import { cardValue } from "../game/scoring";
import { createPlayers, moveCardById, newGame } from "../game/state";
import type { Card } from "../game/types";

const c = (id: string): Card => {
  const suit = id.slice(-1) as Card["suit"];
  const rank = id.slice(0, -1) as Card["rank"];
  return { id, rank, suit };
};

describe("500 Rummy rules", () => {
  it("creates a 52-card deck with no duplicates", () => {
    const deck = makeDeck();
    expect(deck).toHaveLength(52);
    expect(hasDuplicateCards(deck)).toBe(false);
  });

  it("deals seven cards to every player", () => {
    expect(newGame(2).players.every((player) => player.hand.length === 7)).toBe(true);
    expect(newGame(3).players.every((player) => player.hand.length === 7)).toBe(true);
  });

  it("scores custom card values", () => {
    expect(cardValue(c("Q♠"))).toBe(40);
    expect(cardValue(c("A♥"))).toBe(15);
    expect(cardValue(c("K♦"))).toBe(10);
    expect(cardValue(c("9♣"))).toBe(5);
  });

  it("validates sets and runs", () => {
    expect(isSet([c("7♠"), c("7♥"), c("7♦")])).toBe(true);
    expect(isRun([c("4♥"), c("5♥"), c("6♥")])).toBe(true);
    expect(isRun([c("Q♣"), c("K♣"), c("A♣")])).toBe(true);
    expect(isRun([c("Q♣"), c("K♣"), c("A♣"), c("2♣")])).toBe(false);
  });

  it("rejects duplicate physical cards", () => {
    expect(isSet([c("7♠"), c("7♠"), c("7♦")])).toBe(false);
  });

  it("allows discard pickup when it completes a set", () => {
    expect(immediatelyUsable(c("7♣"), [c("7♠"), c("7♥")], [])).toBe(true);
  });

  it("allows discard pickup when it completes a run", () => {
    expect(immediatelyUsable(c("3♠"), [c("4♠"), c("5♠")], [])).toBe(true);
  });

  it("allows buried discard pickup using cards above it", () => {
    expect(immediatelyUsable(c("3♠"), [c("5♠")], [], [c("3♠"), c("4♠")])).toBe(true);
  });

  it("moves a card by drag target", () => {
    const cards = [c("7♠"), c("7♥"), c("7♦")];
    expect(moveCardById(cards, "7♦", "7♠")[0].id).toBe("7♦");
  });

  it("supports custom names and avatars", () => {
    const players = createPlayers(2, [
      { name: "Ava", avatar: "/avatars/amara.jpg", fallback: "👩🏾" },
      { name: "Bot", avatar: "/avatars/marcus.jpg", fallback: "👨🏾" }
    ]);

    expect(players[0].name).toBe("Ava");
    expect(players[0].avatar).toBe("/avatars/amara.jpg");
    expect(players[0].fallback).toBe("👩🏾");
  });
});
EOF

cat > "$APP/README.md" <<'EOF'
# 500 Rummy Production App

A production-ready local 500 Rummy game built with React, TypeScript, and Vite.

## Features

- 2–4 players
- local computer opponents
- 7 cards dealt to every player
- custom 500 Rummy scoring
- Queen of Spades = 40
- Ace = 15
- 10/J/Q/K = 10
- 2–9 = 5
- discard pile pickup rule with buried card pickup
- selected discard can complete a run using cards above it
- drag-to-sort hand
- click-to-select cards
- meld and layoff animation
- fictional avatar photo support with emoji fallback
- end-of-hand scoring modal
- tests for core rules

## Setup

```bash
npm install
npm run dev
