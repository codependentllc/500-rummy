"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { canLay, meldType, points, sortCards } from "@/games/rummy/rules";
import { canPickDiscardAt, discardSelected, drawStock, layBest, layOff, pickupDiscardAt, playSelectedMeld, selectOnly, selectedCards, tableMelds, toggleSelected } from "@/games/rummy/engine";
import type { Card, DragSource, DragState, GameState } from "@/types/rummy";
import { AvatarImage } from "./AvatarImage";
import { BrandHeader } from "./BrandHeader";
import { CardView } from "./CardView";
import { DiscardViewer } from "./DiscardViewer";
import { ScoreModal } from "./ScoreModal";

type Props = {
  game: GameState;
  tableThemeClass: string;
  cardBackClass: string;
  setGame: (update: (game: GameState) => GameState) => void;
  onNewGame: () => void;
  onNextHand: () => void;
};

type Ghost = { type: "stock"; x: number; y: number } | { type: "card"; card: Card; x: number; y: number };

function isOver(element: HTMLElement | null, x: number, y: number) {
  if (!element) return false;
  const box = element.getBoundingClientRect();
  return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
}

export function GameScreen({ game, tableThemeClass, cardBackClass, setGame, onNewGame, onNextHand }: Props) {
  const [discardOpen, setDiscardOpen] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [dropTarget, setDropTarget] = useState<"hand" | "discard" | null>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const discardRef = useRef<HTMLButtonElement>(null);
  const discardPreviewRef = useRef<HTMLDivElement>(null);
  const suppressDiscardClick = useRef(false);
  const selected = selectedCards(game);
  const melds = useMemo(() => tableMelds(game), [game]);
  const human = game.players[0];
  const isHumanTurn = game.turn === 0 && !game.handOver;
  const canDraw = isHumanTurn && !game.drawn;
  const canMeld = isHumanTurn && game.drawn && selected.length >= 3 && Boolean(meldType(selected));
  const canLayOff = isHumanTurn && game.drawn && selected.length === 1 && melds.some((meld) => canLay(selected[0], meld));
  const canDiscard = isHumanTurn && game.drawn && selected.length === 1;

  useEffect(() => {
    if (discardPreviewRef.current) discardPreviewRef.current.scrollLeft = discardPreviewRef.current.scrollWidth;
  }, [game.discard]);

  useEffect(() => {
    if (!drag) return;
    const onMove = (event: PointerEvent) => {
      const moved = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 8;
      if (!drag.isDragging && !moved) return;
      if (drag.source.type === "handCard" && !game.drawn) return;
      setDrag((current) => current ? { ...current, isDragging: true } : current);
      if (drag.source.type === "stock") {
        setGhost({ type: "stock", x: event.clientX, y: event.clientY });
        setDropTarget(isOver(handRef.current, event.clientX, event.clientY) ? "hand" : null);
      } else if (drag.source.type === "discard") {
        const topDiscard = game.discard.at(-1);
        if (topDiscard) setGhost({ type: "card", card: topDiscard, x: event.clientX, y: event.clientY });
        setDropTarget(isOver(handRef.current, event.clientX, event.clientY) ? "hand" : null);
      } else {
        const cardId = drag.source.cardId;
        setGame((current) => selectOnly(current, cardId));
        setGhost({ type: "card", card: drag.source.card, x: event.clientX, y: event.clientY });
        setDropTarget(isOver(discardRef.current, event.clientX, event.clientY) ? "discard" : null);
      }
    };
    const onEnd = (event: PointerEvent) => {
      if (!drag.isDragging) {
        if (drag.source.type === "handCard") {
          const cardId = drag.source.cardId;
          setGame((current) => toggleSelected(current, cardId));
        }
      } else if (drag.source.type === "stock" && isOver(handRef.current, event.clientX, event.clientY)) {
        setGame(drawStock);
      } else if (drag.source.type === "discard") {
        suppressDiscardClick.current = true;
        if (isOver(handRef.current, event.clientX, event.clientY)) {
          const topIndex = game.discard.length - 1;
          if (canPickDiscardAt(game, topIndex)) {
            setGame((current) => pickupDiscardAt(current, current.discard.length - 1));
          } else if (game.discard.some((_, index) => canPickDiscardAt(game, index))) {
            setDiscardOpen(true);
          } else {
            setGame((current) => ({ ...current, message: "That discard must be immediately usable." }));
          }
        }
      } else if (drag.source.type === "handCard" && isOver(discardRef.current, event.clientX, event.clientY)) {
        setGame(discardSelected);
      }
      setDrag(null);
      setGhost(null);
      setDropTarget(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd, { once: true });
    window.addEventListener("pointercancel", onEnd, { once: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };
  }, [drag, game.drawn, setGame]);

  const startDrag = (source: DragSource, event: ReactPointerEvent) => {
    if ((source.type === "stock" || source.type === "discard") && !canDraw) return;
    if (source.type === "handCard" && !isHumanTurn) return;
    setDrag({ source, startX: event.clientX, startY: event.clientY, isDragging: false });
  };

  return (
    <section id="game" className={`screen active ${tableThemeClass} ${cardBackClass}`}>
      <header className="top">
        <div className="top-row"><BrandHeader compact /><button className="new" type="button" onClick={onNewGame}>New</button></div>
        <div className="players">
          {game.players.map((player) => (
            <div key={player.id} className={`player ${game.turn === player.id && !game.handOver ? "active" : ""}`}>
              <span className="avatar"><AvatarImage src={player.avatarImage} name={player.avatarName} /></span>
              <div><div className="pname">{player.name}</div><div className="pscore">{player.score} pts · {player.hand.length}</div></div>
            </div>
          ))}
        </div>
      </header>

      <div className="banner"><b>{game.players[game.turn].name}</b> — {game.message}</div>

      <main className="table">
        <div className="piles">
          <button className={`pile ${canDraw ? "action" : ""}`} type="button" onPointerDown={(event) => startDrag({ type: "stock" }, event)}>
            <div className="label">Stock</div><div className="back" /><div className="stock-count">{game.stock.length}</div><div className="hint">Drag to hand</div>
          </button>
          <button ref={discardRef} className={`pile ${dropTarget === "discard" ? "drop-ready" : canDraw ? "action" : ""}`} type="button" onPointerDown={(event) => startDrag({ type: "discard" }, event)} onClick={() => { if (suppressDiscardClick.current) { suppressDiscardClick.current = false; return; } if (canDraw && game.discard.length) setDiscardOpen(true); }}>
            <div className="label">Discard</div>
            <div ref={discardPreviewRef} className="discard-preview">
              {game.discard.map((card, index) => <CardView key={card.id} card={card} preview style={{ "--rot": `${(index % 5 - 2) * 1.6}deg`, zIndex: index } as CSSProperties} />)}
            </div>
            <div className="hint">{game.drawn ? "Drag card here" : "Tap to view all"}</div>
          </button>
        </div>

        <section className="melds-wrap">
          <div className="meld-head"><span>Table Melds</span><span>{melds.length} group{melds.length === 1 ? "" : "s"}</span></div>
          <div className="melds">
            {!melds.length ? <div className="empty">Played melds appear here</div> : null}
            {game.players.flatMap((player) => player.melds.map((meld) => {
              const can = isHumanTurn && game.drawn && selected.length === 1 && canLay(selected[0], meld);
              return (
                <button key={meld.id} className={`meld ${can ? "can" : ""}`} type="button" disabled={!can} onClick={() => setGame((current) => layOff(current, meld.id))}>
                  <div className="owner">{player.name} · {meld.type}</div>
                  <div className="meld-cards">{meld.cards.map((card, index) => <CardView key={card.id} card={card} small style={{ "--meldRot": `${(index % 5 - 2) * 1.8}deg`, zIndex: index } as CSSProperties} />)}</div>
                  <div className="meld-points">{points(meld.cards)} pts</div>
                </button>
              );
            }))}
          </div>
        </section>
      </main>

      <section className="hand-panel">
        <div className="hand-head">
          <span>{isHumanTurn ? game.drawn ? "Your Hand — meld, lay off, or drag to discard" : "Your Hand — draw first" : "Your Hand"}</span>
          <span>{points(human.hand)} pts · {human.hand.length} cards{game.selected.length ? ` · ${game.selected.length} selected` : ""}</span>
        </div>
        <div ref={handRef} className={`hand ${dropTarget === "hand" ? "drop-ready" : ""}`}>
          {sortCards(human.hand).map((card) => <div key={card.id} className={`hand-card ${game.selected.includes(card.id) ? "selected" : ""}`} onPointerDown={(event) => startDrag({ type: "handCard", card, cardId: card.id }, event)}><CardView card={card} /></div>)}
        </div>
        <div className="actions">
          <button className="action draw" type="button" disabled={!canDraw} onClick={() => setGame(drawStock)}>Draw</button>
          <button className="action meld-btn" type="button" disabled={!canMeld} onClick={() => setGame(playSelectedMeld)}>Meld</button>
          <button className="action lay" type="button" disabled={!canLayOff} onClick={() => setGame(layBest)}>Lay Off</button>
          <button className="action discard" type="button" disabled={!canDiscard} onClick={() => setGame(discardSelected)}>Discard</button>
        </div>
      </section>

      <DiscardViewer game={game} open={discardOpen} onClose={() => setDiscardOpen(false)} onPick={(index) => { setGame((current) => pickupDiscardAt(current, index)); setDiscardOpen(false); }} />
      <ScoreModal game={game} onNextHand={onNextHand} />
      {ghost ? <div className="drag-ghost" style={{ left: ghost.x, top: ghost.y }}>{ghost.type === "stock" ? <div className="back" /> : <CardView card={ghost.card} />}</div> : null}
    </section>
  );
}
