import type { DragEvent } from "react";
import { CardView } from "./CardView";
import type { GameState } from "../game/types";

type Props = {
  state: GameState;
  disabled: boolean;
  onDrawStock: () => void;
  onDrawDiscard: (index: number) => void;
  onPlayMeld: () => void;
  onDropDiscard: (event: DragEvent<HTMLDivElement>) => void;
  allowDrop: (event: DragEvent) => void;
};

export function TableArea({ state, disabled, onDrawStock, onDrawDiscard, onPlayMeld, onDropDiscard, allowDrop }: Props) {
  const visibleDiscard = [...state.discard].reverse();
  const canDrawStock = !disabled && state.turn === 0 && !state.drawn && !state.handOver;

  return (
    <>
      <div className="table-area">
        <div>
          <div className="section-label">STOCK ({state.stock.length})</div>
          <div onClick={canDrawStock ? onDrawStock : undefined} style={{ cursor: canDrawStock ? "pointer" : "default" }}>
            {state.stock.length ? (
              <CardView card={{ id: "back", rank: "A", suit: "♠" }} faceDown />
            ) : (
              <div className="empty-stock">Empty</div>
            )}
          </div>
        </div>

        <div className="discard-area">
          <div className="section-label">DISCARD PILE (top → bottom)</div>
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
