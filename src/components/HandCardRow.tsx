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
