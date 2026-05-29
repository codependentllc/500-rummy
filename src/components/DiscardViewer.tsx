import { canPickDiscardAt } from "../game/engine";
import type { GameState } from "../game/types";
import { MvpCard } from "./MvpCard";

type Props = {
  state: GameState;
  open: boolean;
  onClose: () => void;
  onPick: (index: number) => void;
};

export function DiscardViewer({ state, open, onClose, onPick }: Props) {
  return (
    <div className={open ? "discard-viewer active" : "discard-viewer"} onClick={(event) => event.currentTarget === event.target && onClose()}>
      <div className="discard-sheet">
        <div className="discard-head">
          <b>Discard Pile</b>
          <button className="new" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="discard-list">
          {state.discard.map((card, index) => {
            const legal = canPickDiscardAt(state, index);
            return (
              <button key={card.id} className={`discard-choice ${legal ? "legal" : "illegal"}`} disabled={!legal} onClick={() => onPick(index)}>
                <MvpCard card={card} />
                <div className="discard-tag">{legal ? "Pick up" : "Locked"}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
