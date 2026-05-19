import type { CSSProperties } from "react";
import { CardView } from "./CardView";
import type { Card, MeldType } from "../game/types";
import { label } from "../game/melds";

type Props = {
  cards: Card[];
  type?: MeldType | "layoff";
};

export function FlyingCards({ cards, type }: Props) {
  if (!cards.length) return null;

  return (
    <div className={type === "run" ? "flying-cards run-flight" : "flying-cards"}>
      {type === "run" ? <div className="run-flight-label">Run: {cards.map(label).join(" ")}</div> : null}
      {cards.map((card, index) => {
        const style = {
          left: index * 28 - (cards.length - 1) * 14,
          animationDelay: `${index * 45}ms`,
          "--rot": `${(index - (cards.length - 1) / 2) * 8}deg`
        } as CSSProperties;

        return (
          <div key={`${card.id}-fly-${index}`} className="flying-card" style={style}>
            <CardView card={card} small />
          </div>
        );
      })}
    </div>
  );
}
