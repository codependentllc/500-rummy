import type { CSSProperties } from "react";
import type { Card } from "../game/types";

type Props = {
  card: Card;
  small?: boolean;
  preview?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function MvpCard({ card, small = false, preview = false, className = "", style }: Props) {
  const red = card.suit === "♥" || card.suit === "♦";
  return (
    <div className={["card", red ? "red" : "", small ? "sm" : "", preview ? "preview" : "", className].filter(Boolean).join(" ")} style={style}>
      <div className="tl">
        {card.rank}
        <br />
        {card.suit}
      </div>
      <div className="mid">{card.suit}</div>
      <div className="br">
        {card.rank}
        <br />
        {card.suit}
      </div>
    </div>
  );
}
