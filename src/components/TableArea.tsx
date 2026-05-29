import type { CSSProperties, DragEvent, KeyboardEvent } from "react";
import { CardView } from "./CardView";
import type { GameState } from "../game/types";
import "./TableArea/TableArea.css";

type Props = {
  state: GameState;
  disabled: boolean;
  onDrawStock: () => void;
  onDrawDiscard: (index: number) => void;
  onDiscardSelected: () => void;
  onDropToDiscardPile: (event: DragEvent<HTMLDivElement>) => void;
  onPlayMeld: () => void;
  onDropDiscard: (event: DragEvent<HTMLDivElement>) => void;
  allowDrop: (event: DragEvent) => void;
};

export function TableArea({ state, disabled, onDrawStock, onDrawDiscard, onDiscardSelected, onDropToDiscardPile, onPlayMeld, onDropDiscard, allowDrop }: Props) {
  const visibleDiscard = state.discard.slice(-7).reverse();
  const canDrawStock = !disabled && state.turn === 0 && !state.drawn && !state.handOver;
  const canDiscardToPile = !disabled && state.turn === 0 && state.drawn && !state.handOver;

  function handleDiscardKey(event: KeyboardEvent<HTMLDivElement>) {
    if (!canDiscardToPile || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onDiscardSelected();
  }

  return (
    <>
      <div className="table-area">
        <div className={canDrawStock ? "stock-area action-ready" : "stock-area"} aria-label={`Stock pile, ${state.stock.length} cards`}>
          <div onClick={canDrawStock ? onDrawStock : undefined} style={{ cursor: canDrawStock ? "pointer" : "default" }} aria-label={canDrawStock ? "Draw from stock" : undefined}>
            {state.stock.length ? (
              <CardView card={{ id: "back", rank: "A", suit: "♠" }} faceDown />
            ) : (
              <div className="empty-stock">Empty</div>
            )}
          </div>
        </div>

        <div
          className={canDiscardToPile ? "discard-area discard-ready" : "discard-area"}
          role={canDiscardToPile ? "button" : undefined}
          tabIndex={canDiscardToPile ? 0 : undefined}
          aria-label={canDiscardToPile ? "Discard selected card to pile" : "Discard pile"}
          onClick={canDiscardToPile ? onDiscardSelected : undefined}
          onKeyDown={handleDiscardKey}
          onDragOver={canDiscardToPile ? allowDrop : undefined}
          onDrop={canDiscardToPile ? onDropToDiscardPile : undefined}
        >
          <div className="discard-row">
            {visibleDiscard.map((card, visibleIndex) => {
              const realIndex = state.discard.length - 1 - visibleIndex;
              return (
                <div key={card.id} className={visibleIndex === 0 ? "discard-card-wrap top-discard-card" : "discard-card-wrap discard-history-card"} style={{ "--discard-depth": visibleIndex } as CSSProperties}>
                  <CardView
                    card={card}
                    small={visibleIndex > 0}
                    disabled={disabled || state.turn !== 0 || state.drawn || state.handOver}
                    onClick={() => onDrawDiscard(realIndex)}
                    onDragStart={(event) => event.dataTransfer.setData("text/plain", `discard:${realIndex}`)}
                  />
                  {visibleIndex === 0 ? <div className="top-label">TOP</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="drop-zones">
        <div onDragOver={allowDrop} onDrop={disabled ? undefined : onPlayMeld} className="drop-zone meld-zone">
          Drop selected cards here to meld
        </div>
        <div onDragOver={allowDrop} onDrop={disabled ? undefined : onDropDiscard} className="drop-zone discard-zone">
          Drop discard cards here to pick up
        </div>
      </div>
    </>
  );
}
