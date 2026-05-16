import type { DragEvent } from "react";
import { CardView } from "./CardView";
import type { Meld } from "../game/types";

type Props = {
  meld: Meld;
  playerName: string;
  canLayoffCard: boolean;
  disabled: boolean;
  onLayoff: (meldId: string) => void;
  allowDrop: (event: DragEvent) => void;
};

export function MeldDisplay({ meld, playerName, canLayoffCard, disabled, onLayoff, allowDrop }: Props) {
  return (
    <div
      onDragOver={allowDrop}
      onDrop={disabled ? undefined : () => onLayoff(meld.id)}
      onClick={!disabled && canLayoffCard ? () => onLayoff(meld.id) : undefined}
      className={canLayoffCard ? "meld-display layoff-ready" : "meld-display"}
    >
      <div className="meld-title">{playerName} — {meld.type}</div>
      <div className="meld-cards">
        {meld.cards.map((card) => <CardView key={card.id} card={card} small disabled />)}
      </div>
      {canLayoffCard ? <div className="layoff-label">▶ Lay off here</div> : null}
    </div>
  );
}
