import { useEffect } from "react";
import type { CSSProperties } from "react";
import type { Card } from "../game/types";
import { CardView } from "./CardView";

type Props = {
  cards: Card[];
  onComplete: () => void;
};

export function DiscardPickupAnimation({ cards, onComplete }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 920);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  if (!cards.length) return null;

  return (
    <div className="discard-pickup-animation" aria-label="Picking up discard pile cards">
      <div className="discard-pickup-label">Must take all cards above.</div>
      <div className="discard-pickup-packet">
        {cards.map((card, index) => (
          <div
            key={`${card.id}-pickup-${index}`}
            className="discard-pickup-card"
            style={{
              "--pickup-index": index,
              "--start-x": `${index * 22}px`,
              "--start-y": `${index * 5}px`,
              "--rot": `${(index - (cards.length - 1) / 2) * 4}deg`
            } as CSSProperties}
          >
            <CardView card={card} small={index > 0} />
          </div>
        ))}
      </div>
      <div className="discard-pickup-glow" />
    </div>
  );
}
