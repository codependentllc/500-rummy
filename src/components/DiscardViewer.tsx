import { discardPickup, immediatelyUsable } from "../game/discard";
import { label } from "../game/melds";
import type { GameState } from "../game/types";
import { CardView } from "./CardView";

type Props = {
  state: GameState;
  open: boolean;
  disabled: boolean;
  onClose: () => void;
  onPick: (index: number) => void;
};

export function DiscardViewer({ state, open, disabled, onClose, onPick }: Props) {
  const human = state.players[0];
  const tableMelds = state.players.flatMap((player) => player.melds);
  const canDrawDiscard = !disabled && state.turn === 0 && !state.drawn && !state.handOver;

  if (!open) return null;

  return (
    <div className="discard-viewer active" role="dialog" aria-modal="true" aria-label="Discard pile" onClick={onClose}>
      <div className="discard-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="discard-head">
          <b>Discard Pile</b>
          <button type="button" className="discard-close" onClick={onClose}>Close</button>
        </div>

        <div className="discard-list">
          {state.discard.map((card, index) => {
            const pickup = discardPickup(state.discard, index);
            const legal = canDrawDiscard && immediatelyUsable(card, human.hand, tableMelds, pickup);

            return (
              <div
                key={card.id}
                className={legal ? "discard-choice legal" : "discard-choice illegal"}
                role={legal ? "button" : undefined}
                tabIndex={legal ? 0 : undefined}
                onClick={legal ? () => onPick(index) : undefined}
                onKeyDown={legal ? (event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  onPick(index);
                } : undefined}
                aria-label={legal ? `Pick up ${label(card)}` : `${label(card)} is locked`}
              >
                <CardView card={card} disabled />
                <span className="discard-tag">{legal ? `Pick ${pickup.length}` : "Locked"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
