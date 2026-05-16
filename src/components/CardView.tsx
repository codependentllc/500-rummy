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
