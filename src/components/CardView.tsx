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
  const size = small ? { w: 50, h: 70, rank: 15 } : { w: 76, h: 108, rank: 21 };

  if (faceDown) {
    return (
      <div
        className="card-back-face"
        style={{
          width: size.w,
          height: size.h,
          borderRadius: small ? 7 : 9,
          border: "2px solid #fff",
          flexShrink: 0
        }}
      />
    );
  }

  const red = card.suit === "♥" || card.suit === "♦";
  const queenSpades = card.id === "Q♠";
  const cardClasses = [
    "playing-card",
    small ? "playing-card-small" : "",
    red ? "red-card" : "black-card",
    selected ? "selected" : "",
    hint ? `hint-${hint}` : "",
    queenSpades ? "queen-spades-card" : ""
  ].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={cardClasses}
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
        cursor: disabled ? "default" : "pointer",
        flexShrink: 0,
      }}
    >
      <div className="card-corner card-corner-top" style={{ fontSize: size.rank }}>{card.rank}<span>{card.suit}</span></div>
      <div className="card-center-suit" style={{ fontSize: size.rank + 9 }}>{card.suit}</div>
      <div className="card-corner card-corner-bottom" style={{ fontSize: size.rank }}>{card.rank}<span>{card.suit}</span></div>
      {queenSpades ? <div className="queen-spades-accent">40</div> : null}
    </button>
  );
}
