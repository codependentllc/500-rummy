import type { CSSProperties, DragEvent, KeyboardEvent, PointerEvent, RefObject } from "react";
import { CardView } from "./CardView";
import type { GameState } from "../game/types";
import { discardPickup, immediatelyUsable } from "../game/discard";

type Props = {
  state: GameState;
  disabled: boolean;
  onDrawStock: () => void;
  onDrawDiscard: (index: number) => void;
  onOpenDiscardViewer: () => void;
  onDiscardSelected: () => void;
  onDropToDiscardPile: (event: DragEvent<HTMLDivElement>) => void;
  onPlayMeld: () => void;
  onDropDiscard: (event: DragEvent<HTMLDivElement>) => void;
  onStockPointerDown?: (event: PointerEvent<HTMLDivElement>) => void;
  discardPileRef?: RefObject<HTMLDivElement | null>;
  dragTarget?: "hand" | "discard" | null;
  allowDrop: (event: DragEvent) => void;
};

export function TableArea({
  state,
  disabled,
  onDrawStock,
  onDrawDiscard,
  onOpenDiscardViewer,
  onDiscardSelected,
  onDropToDiscardPile,
  onPlayMeld,
  onDropDiscard,
  onStockPointerDown,
  discardPileRef,
  dragTarget,
  allowDrop
}: Props) {
  const canDrawStock = !disabled && state.turn === 0 && !state.drawn && !state.handOver;
  const canDrawDiscard = !disabled && state.turn === 0 && !state.drawn && !state.handOver && state.discard.length > 0;
  const canDiscardToPile = !disabled && state.turn === 0 && state.drawn && !state.handOver;
  const human = state.players[0];
  const tableMelds = state.players.flatMap((player) => player.melds);
  const discardClass = [
    "discard-area",
    canDiscardToPile ? "discard-ready" : "",
    canDrawDiscard ? "action-ready" : "",
    dragTarget === "discard" ? "drop-ready" : ""
  ].filter(Boolean).join(" ");

  function handleDiscardKey(event: KeyboardEvent<HTMLDivElement>) {
    if ((!canDiscardToPile && !canDrawDiscard) || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    if (canDiscardToPile) onDiscardSelected();
    else onOpenDiscardViewer();
  }

  function handleDiscardAreaClick() {
    if (canDiscardToPile) {
      onDiscardSelected();
      return;
    }

    if (canDrawDiscard) onOpenDiscardViewer();
  }

  return (
    <>
      <div className="table-area">
        <div className={canDrawStock ? "stock-area action-ready" : "stock-area"}>
          <div
            className="stock-card-target"
            onClick={canDrawStock ? onDrawStock : undefined}
            onPointerDown={canDrawStock ? onStockPointerDown : undefined}
            style={{ cursor: canDrawStock ? "grab" : "default" }}
            aria-label={`Stock pile, ${state.stock.length} cards`}
          >
            {state.stock.length ? (
              <CardView card={{ id: "back", rank: "A", suit: "♠" }} faceDown />
            ) : (
              <div className="empty-stock">Empty</div>
            )}
            <span className="stock-count-badge">{state.stock.length}</span>
          </div>
        </div>

        <div
          ref={discardPileRef}
          className={discardClass}
          role={canDiscardToPile || canDrawDiscard ? "button" : undefined}
          tabIndex={canDiscardToPile || canDrawDiscard ? 0 : undefined}
          aria-label={canDiscardToPile ? "Discard selected card to pile" : "Open discard pile viewer"}
          onClick={handleDiscardAreaClick}
          onKeyDown={handleDiscardKey}
          onDragOver={canDiscardToPile ? allowDrop : undefined}
          onDrop={canDiscardToPile ? onDropToDiscardPile : undefined}
        >
          <div className="discard-row">
            {state.discard.map((card, index) => {
              const topCard = index === state.discard.length - 1;
              const pickup = discardPickup(state.discard, index);
              const legal = canDrawDiscard && immediatelyUsable(card, human.hand, tableMelds, pickup);
              const style = {
                "--discard-depth": index,
                "--discard-rot": `${(index % 5 - 2) * 1.6}deg`
              } as CSSProperties;

              return (
                <div
                  key={card.id}
                  className={[
                    "discard-card-wrap",
                    "discard-history-card",
                    topCard ? "top-discard-card" : "",
                    legal ? "legal-discard-card" : ""
                  ].filter(Boolean).join(" ")}
                  style={style}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (legal) onDrawDiscard(index);
                    else if (canDrawDiscard) onOpenDiscardViewer();
                  }}
                >
                  <CardView
                    card={card}
                    small={!topCard}
                    disabled={!legal}
                    onDragStart={(event) => event.dataTransfer.setData("text/plain", `discard:${index}`)}
                  />
                </div>
              );
            })}
            {!state.discard.length ? <div className="empty-stock">Empty</div> : null}
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
