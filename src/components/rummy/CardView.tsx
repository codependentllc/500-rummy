import type { CSSProperties } from "react";
import type { Card } from "@/types/rummy";

type Props = {
  card: Card;
  small?: boolean;
  preview?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function CardView({ card, small, preview, className = "", style }: Props) {
  return (
    <div className={`card ${small ? "sm" : ""} ${preview ? "preview" : ""} ${["♥", "♦"].includes(card.suit) ? "red" : ""} ${className}`} style={style}>
      <div className="tl">{card.rank}<br />{card.suit}</div>
      <div className="mid">{card.suit}</div>
      <div className="br">{card.rank}<br />{card.suit}</div>
    </div>
  );
}
