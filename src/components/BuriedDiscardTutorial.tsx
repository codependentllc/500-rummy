import { CardView } from "./CardView";
import type { Card } from "../game/types";

type Props = {
  onClose: () => void;
};

const discardCards: Card[] = [
  { id: "5♣", rank: "5", suit: "♣" },
  { id: "9♦", rank: "9", suit: "♦" },
  { id: "Q♠", rank: "Q", suit: "♠" },
  { id: "3♥", rank: "3", suit: "♥" }
];

export function BuriedDiscardTutorial({ onClose }: Props) {
  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Buried discard rule tutorial">
      <div className="tutorial-controls">
        <button type="button" onClick={onClose}>Close</button>
      </div>

      <div className="tutorial-card">
        <div className="tutorial-eyebrow">Discard Rule</div>
        <h2>Buried Discard Pickup</h2>
        <p>Pick a buried card? Take it and every card above it.</p>

        <div className="tutorial-table">
          <div className="tutorial-stack-label bottom-label">Bottom</div>
          <div className="tutorial-stack-label top-label-tutorial">Top</div>

          <div className="tutorial-discard-stack">
            {discardCards.map((card, index) => (
              <div key={card.id} className={`tutorial-discard-card tutorial-card-${index + 1}`}>
                <CardView card={card} small={false} />
              </div>
            ))}
          </div>

          <div className="tutorial-selection-ring selected-q" />
          <div className="tutorial-selection-ring selected-above" />
          <div className="tutorial-arrow arrow-selected">Selected card</div>
          <div className="tutorial-arrow arrow-above">Also take above</div>

          <div className="tutorial-hand-zone">
            <span>Player hand</span>
          </div>
        </div>
      </div>
    </div>
  );
}
