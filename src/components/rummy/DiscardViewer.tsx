import { canPickDiscardAt } from "@/games/rummy/engine";
import type { GameState } from "@/types/rummy";
import { CardView } from "./CardView";

type Props = {
  game: GameState;
  open: boolean;
  onClose: () => void;
  onPick: (index: number) => void;
};

export function DiscardViewer({ game, open, onClose, onPick }: Props) {
  return (
    <div className={`discard-viewer ${open ? "active" : ""}`} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="discard-sheet">
        <div className="discard-head"><b>Discard Pile</b><button className="new" type="button" onClick={onClose}>Close</button></div>
        <div className="discard-list">
          {game.discard.map((card, index) => {
            const legal = canPickDiscardAt(game, index);
            return (
              <button key={card.id} className={`discard-choice ${legal ? "legal" : "illegal"}`} type="button" disabled={!legal} onClick={() => onPick(index)}>
                <CardView card={card} />
                <span className="discard-tag">{legal ? "Pick up" : "Locked"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
