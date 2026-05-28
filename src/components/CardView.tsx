import type { CSSProperties, DragEventHandler, MouseEventHandler } from "react";
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
  const rankSize = small ? 15 : 21;
  const cardStyle = {
    "--card-rank-size": `${rankSize}px`,
    cursor: disabled ? "default" : "pointer"
  } as CSSProperties;

  if (faceDown) {
    return (
      <div
        className={small ? "card-back-face playing-card-small" : "card-back-face"}
        style={cardStyle}
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
      aria-pressed={selected || undefined}
      aria-label={`${label(card)}, ${cardValue(card)} points${selected ? ", selected" : ""}${hint === "ready" ? ", ready for a meld" : hint === "near" ? ", near a meld" : ""}`}
      title={`${label(card)}: ${cardValue(card)} points`}
      style={cardStyle}
    >
      <div className="card-corner card-corner-top">{card.rank}<span>{card.suit}</span></div>
      <div className="card-center-suit">{card.suit}</div>
      <div className="card-corner card-corner-bottom">{card.rank}<span>{card.suit}</span></div>
      {queenSpades ? <div className="queen-spades-accent">40</div> : null}
    </button>
  );
}
