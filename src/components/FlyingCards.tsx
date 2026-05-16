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
