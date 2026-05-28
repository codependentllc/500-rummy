import type { DragEvent, KeyboardEvent } from "react";
import { CardView } from "./CardView";
import type { GameState } from "../game/types";

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
  const visibleDiscard = [...state.discard].reverse();
  const canDrawStock = !disabled && state.turn === 0 && !state.drawn && !state.handOver;
  const canPickDiscard = !disabled && state.turn === 0 && !state.drawn && !state.handOver && state.discard.length > 0;
  const canDiscardToPile = !disabled && state.turn === 0 && state.drawn && !state.handOver;
  const canUseDropZones = !disabled && state.turn === 0 && !state.handOver;

  function handleDiscardKey(event: KeyboardEvent<HTMLDivElement>) {
    if (!canDiscardToPile || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onDiscardSelected();
  }

  return (
    <>
      <div className={canDrawStock ? "table-area table-awaiting-draw" : canDiscardToPile ? "table-area table-awaiting-discard" : "table-area"}>
        <div className={canDrawStock ? "stock-area action-ready" : "stock-area"}>
          <div className="section-label">{canDrawStock ? "DRAW FROM STOCK" : `STOCK (${state.stock.length})`}</div>
          <div
            role={canDrawStock ? "button" : undefined}
            tabIndex={canDrawStock ? 0 : undefined}
            aria-label={canDrawStock ? "Draw from stock pile" : undefined}
            onClick={canDrawStock ? onDrawStock : undefined}
            onKeyDown={(event) => {
              if (!canDrawStock || (event.key !== "Enter" && event.key !== " ")) return;
              event.preventDefault();
              onDrawStock();
            }}
            style={{ cursor: canDrawStock ? "pointer" : "default" }}
          >
            {state.stock.length ? (
              <CardView card={{ id: "back", rank: "A", suit: "♠" }} faceDown />
            ) : (
              <div className="empty-stock">Empty</div>
            )}
          </div>
          {canDrawStock ? <div className="pile-action-hint">Tap to draw</div> : null}
        </div>

        <div
          className={canDiscardToPile ? "discard-area discard-ready" : "discard-area"}
          role={canDiscardToPile ? "button" : undefined}
          tabIndex={canDiscardToPile ? 0 : undefined}
          aria-label={canDiscardToPile ? "Discard selected card to pile" : undefined}
          onClick={canDiscardToPile ? onDiscardSelected : undefined}
          onKeyDown={handleDiscardKey}
          onDragOver={canDiscardToPile ? allowDrop : undefined}
          onDrop={canDiscardToPile ? onDropToDiscardPile : undefined}
        >
          <div className="section-label">{canDiscardToPile ? "DISCARD SELECTED CARD" : canPickDiscard ? "PICK FROM DISCARD" : "DISCARD PILE"}</div>
          <div className="discard-row">
            {visibleDiscard.map((card, visibleIndex) => {
              const realIndex = state.discard.length - 1 - visibleIndex;
              return (
                <div key={card.id} className="discard-card-wrap">
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
          {canDiscardToPile ? <div className="pile-action-hint">Tap or drop selected card</div> : canPickDiscard ? <div className="pile-action-hint">Tap a discard to pick up</div> : null}
        </div>
      </div>

      <div className={canUseDropZones ? "drop-zones drop-zones-active" : "drop-zones"}>
        <div onDragOver={allowDrop} onDrop={canUseDropZones ? onPlayMeld : undefined} className="drop-zone meld-zone" aria-label="Drop selected cards here to play a meld">
          Meld Drop
        </div>
        <div onDragOver={allowDrop} onDrop={canUseDropZones ? onDropDiscard : undefined} className="drop-zone discard-zone" aria-label="Drop a discard card here to pick up from the pile">
          Pick Discard
        </div>
      </div>
    </>
  );
}
