import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AVATARS } from "./data/avatars";
import { allTableMelds, canHumanAct, discardSelectedCard, drawFromStock, layOffToFirstValidMeld, layOffToMeld, pickDiscardAt, playSelectedMeld, runAiTurn, selectedCards, startNewHand, toggleSelectedCard, selectOnlyCard } from "./game/engine";
import { canLay, meldType, sortCards } from "./game/melds";
import { points } from "./game/scoring";
import type { Card, GameState, PlayerConfig } from "./game/types";
import { newGame } from "./game/state";
import { DiscardViewer } from "./components/DiscardViewer";
import { MvpCard } from "./components/MvpCard";
import { movedBeyondThreshold, pointInElement, pointerPoint, type Point } from "./utils/pointerDrag";
import "./styles.css";

const defaultConfigs: PlayerConfig[] = [
  { name: "You", avatar: AVATARS[0].src, fallback: "Y" },
  { name: "Marcus", avatar: AVATARS[1].src, fallback: "M" },
  { name: "Sofia", avatar: AVATARS[2].src, fallback: "S" },
  { name: "Leo", avatar: AVATARS[3].src, fallback: "L" }
];

type DragState =
  | { type: "stock"; start: Point; dragging: boolean }
  | { type: "card"; card: Card; start: Point; dragging: boolean };

type GhostState =
  | { type: "stock"; point: Point }
  | { type: "card"; card: Card; point: Point };

export type TableTheme = "classic" | "casino" | "wood" | "luxury" | "neon" | "coffee";
export type CardBackStyle = "red" | "blue" | "gold" | "black" | "green" | "purple" | "wood" | "marble";

export default function App() {
  const [playerCount, setPlayerCount] = useState(2);
  const [started, setStarted] = useState(false);
  const [state, setState] = useState<GameState>(() => newGame(2, null, defaultConfigs));
  const [discardOpen, setDiscardOpen] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [ghost, setGhost] = useState<GhostState | null>(null);
  const [dropTarget, setDropTarget] = useState<"hand" | "discard" | null>(null);
  const handRef = useRef<HTMLDivElement | null>(null);
  const discardPileRef = useRef<HTMLButtonElement | null>(null);
  const discardPreviewRef = useRef<HTMLDivElement | null>(null);
  const aiBusy = useRef(false);

  const human = state.players[0];
  const currentPlayer = state.players[state.turn];
  const selected = selectedCards(state);
  const melds = useMemo(() => allTableMelds(state), [state.players]);
  const humanTurn = canHumanAct(state);
  const canDraw = humanTurn && !state.drawn;
  const canMeld = humanTurn && state.drawn && selected.length >= 3 && Boolean(meldType(selected));
  const canLayOff = humanTurn && state.drawn && selected.length === 1 && melds.some((meld) => canLay(selected[0], meld));
  const canDiscard = humanTurn && state.drawn && selected.length === 1;

  useEffect(() => {
    if (!started || !currentPlayer?.isAI || state.handOver || aiBusy.current) return;
    aiBusy.current = true;
    const timer = window.setTimeout(() => {
      setState((previous) => runAiTurn(previous));
      aiBusy.current = false;
    }, 650);
    return () => {
      window.clearTimeout(timer);
      aiBusy.current = false;
    };
  }, [currentPlayer?.isAI, started, state.handOver, state.turn]);

  useEffect(() => {
    const preview = discardPreviewRef.current;
    if (preview) preview.scrollLeft = preview.scrollWidth;
  }, [state.discard]);

  useEffect(() => {
    if (!dragState) return;

    function handlePointerMove(event: PointerEvent) {
      const point = pointerPoint(event);

      setDragState((current) => {
        if (!current) return current;
        if (!current.dragging && !movedBeyondThreshold(current.start, point)) return current;

        if (current.type === "card" && !state.drawn) return current;

        const next = { ...current, dragging: true } as DragState;
        setGhost(current.type === "stock" ? { type: "stock", point } : { type: "card", card: current.card, point });

        if (current.type === "stock") {
          setDropTarget(pointInElement(handRef.current, point) ? "hand" : null);
        } else {
          setState((previous) => selectOnlyCard(previous, current.card.id));
          setDropTarget(pointInElement(discardPileRef.current, point) ? "discard" : null);
        }

        return next;
      });
    }

    function handlePointerUp(event: PointerEvent) {
      const point = pointerPoint(event);
      const current = dragState;
      if (!current) return;

      if (!current.dragging) {
        if (current.type === "card") setState((previous) => toggleSelectedCard(previous, current.card.id));
      } else if (current.type === "stock" && pointInElement(handRef.current, point)) {
        setState((previous) => drawFromStock(previous));
      } else if (current.type === "card" && pointInElement(discardPileRef.current, point)) {
        setState((previous) => discardSelectedCard(previous));
      }

      setDragState(null);
      setGhost(null);
      setDropTarget(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    window.addEventListener("pointercancel", handlePointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dragState, state.drawn]);

  function startGame() {
    setState(startNewHand(playerCount, null, defaultConfigs));
    setStarted(true);
    setDiscardOpen(false);
  }

  function returnToSetup() {
    setStarted(false);
    setDiscardOpen(false);
    setDragState(null);
    setGhost(null);
  }

  function nextHand() {
    setState((previous) => startNewHand(playerCount, previous.players, defaultConfigs, previous));
    setDiscardOpen(false);
  }

  function handleDiscardPileClick() {
    if (humanTurn && !state.drawn && state.discard.length) {
      setDiscardOpen(true);
    }
  }

  function pickDiscard(index: number) {
    setState((previous) => pickDiscardAt(previous, index));
    setDiscardOpen(false);
  }

  function playerInitial(config: { fallback?: string; name: string }) {
    return (config.fallback || config.name.slice(0, 1)).toUpperCase();
  }

  return (
    <div id="app">
      {!started ? (
        <section id="setup" className="screen active">
          <div>
            <h1>
              500
              <br />
              Rummy
            </h1>
            <p className="setup-subtitle">Mobile-first MVP</p>
          </div>
          <div className="setup-card">
            <div className="label">Players</div>
            <div className="counts">
              {[2, 3, 4].map((count) => (
                <button key={count} className={playerCount === count ? "count active" : "count"} onClick={() => setPlayerCount(count)}>
                  {count}
                </button>
              ))}
            </div>
            <button className="start" onClick={startGame}>
              Deal Cards
            </button>
          </div>
        </section>
      ) : (
        <section id="game" className="screen active">
          <header className="top">
            <div className="top-row">
              <div className="title">500 Rummy</div>
              <button className="new" onClick={returnToSetup}>
                New
              </button>
            </div>
            <div className="players">
              {state.players.map((player) => (
                <div key={player.id} className={state.turn === player.id && !state.handOver ? "player active" : "player"}>
                  <div className="avatar">{playerInitial(player)}</div>
                  <div>
                    <div className="pname">{player.name}</div>
                    <div className="pscore">
                      {player.score} pts · {player.hand.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </header>

          <div className="banner">
            <b>{currentPlayer?.name}</b> — {state.message}
          </div>

          <main className="table">
            <div className="piles">
              <button
                className={`pile ${canDraw ? "action" : ""}`}
                onPointerDown={(event) => canDraw && setDragState({ type: "stock", start: pointerPoint(event), dragging: false })}
                onClick={() => canDraw && setState((previous) => drawFromStock(previous))}
              >
                <div className="back" />
                <div className="stock-count">{state.stock.length}</div>
                <div className="hint">Drag to hand</div>
              </button>
              <button
                ref={discardPileRef}
                className={`pile ${dropTarget === "discard" ? "drop-ready" : canDraw ? "action" : ""}`}
                onClick={handleDiscardPileClick}
                aria-label="Discard pile"
              >
                <div ref={discardPreviewRef} className="discard-preview">
                  {state.discard.map((card, index) => (
                    <MvpCard key={card.id} card={card} preview className="discard-preview-card" style={{ "--rot": `${((index % 5) - 2) * 1.6}deg`, zIndex: index } as CSSProperties} />
                  ))}
                </div>
                <div className="hint">{state.drawn ? "Drag card here" : "Tap to view all"}</div>
              </button>
            </div>

            <section className="melds-wrap">
              <div className="meld-head">
                <span>Table Melds</span>
                <span>
                  {melds.length} group{melds.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="melds">
                {!melds.length ? <div className="empty">Played melds appear here</div> : null}
                {state.players.map((player) =>
                  player.melds.map((meld) => {
                    const can = humanTurn && state.drawn && selected.length === 1 && canLay(selected[0], meld);
                    return (
                      <button key={meld.id} className={`meld ${can ? "can" : ""}`} disabled={!can} onClick={() => setState((previous) => layOffToMeld(previous, meld.id))}>
                        <div className="owner">
                          {player.name} · {meld.type}
                        </div>
                        <div className="meld-cards">
                          {meld.cards.map((card, index) => (
                            <MvpCard key={card.id} card={card} small className="meld-card" style={{ "--meldRot": `${((index % 5) - 2) * 1.8}deg`, zIndex: index } as CSSProperties} />
                          ))}
                        </div>
                        <div className="meld-points">{points(meld.cards)} pts</div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>
          </main>

          <section className="hand-panel">
            <div className="hand-head">
              <span>{humanTurn ? (state.drawn ? "Your Hand — meld, lay off, or drag to discard" : "Your Hand — draw first") : "Your Hand"}</span>
              <span>
                {points(human.hand)} pts · {human.hand.length} cards{state.selected.length ? ` · ${state.selected.length} selected` : ""}
              </span>
            </div>
            <div ref={handRef} className={`hand ${dropTarget === "hand" ? "drop-ready" : ""}`}>
              {sortCards(human.hand).map((card) => (
                <div key={card.id} className={`hand-card ${state.selected.includes(card.id) ? "selected" : ""}`} onPointerDown={(event) => setDragState({ type: "card", card, start: pointerPoint(event), dragging: false })}>
                  <MvpCard card={card} />
                </div>
              ))}
            </div>
            <div className="actions">
              <button className="action draw" disabled={!canDraw} onClick={() => setState((previous) => drawFromStock(previous))}>
                Draw
              </button>
              <button className="action meld-btn" disabled={!canMeld} onClick={() => setState((previous) => playSelectedMeld(previous))}>
                Meld
              </button>
              <button className="action lay" disabled={!canLayOff} onClick={() => setState((previous) => layOffToFirstValidMeld(previous))}>
                Lay Off
              </button>
              <button className="action discard" disabled={!canDiscard} onClick={() => setState((previous) => discardSelectedCard(previous))}>
                Discard
              </button>
            </div>
          </section>

          <DiscardViewer state={state} open={discardOpen} onClose={() => setDiscardOpen(false)} onPick={pickDiscard} />

          <div className={state.handOver ? "overlay active" : "overlay"}>
            <div className="modal">
              <h2>{state.winner ? `${state.winner.name} Wins` : "Hand Complete"}</h2>
              {(state.scoring ?? []).map((row) => (
                <div key={row.playerId} className="score-row">
                  <b>{row.name}</b>
                  <span>
                    {row.net >= 0 ? "+" : ""}
                    {row.net} · {row.total}
                  </span>
                </div>
              ))}
              <button className="start modal-action" onClick={state.winner ? startGame : nextHand}>
                {state.winner ? "New Game" : "Next Hand"}
              </button>
            </div>
          </div>

          {ghost ? (
            <div className="drag-ghost" style={{ left: ghost.point.x, top: ghost.point.y }}>
              {ghost.type === "stock" ? <div className="back" /> : <MvpCard card={ghost.card} />}
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
