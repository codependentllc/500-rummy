import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AVATARS } from "./data/avatars";
import { aiTurn } from "./game/ai";
import { discardPickup, immediatelyUsable } from "./game/discard";
import { removeCards } from "./game/deck";
import { canLay, cardHints, groupHandByMelds, label, meldType, sortCards } from "./game/melds";
import { points, scoreHand } from "./game/scoring";
import { moveCardById, newGame } from "./game/state";
import type { Card, DragState, GameState, PlayerConfig, TurnPhase } from "./game/types";
import { ActionButton } from "./components/ActionButton";
import { AvatarPhoto } from "./components/AvatarPhoto";
import { CardView } from "./components/CardView";
import { DealSequence } from "./components/DealSequence";
import { DiscardViewer } from "./components/DiscardViewer";
import { DiscardPickupAnimation } from "./components/DiscardPickupAnimation";
import { DrawStockAnimation } from "./components/DrawStockAnimation";
import { EndHandModal } from "./components/EndHandModal";
import { FlyingCards } from "./components/FlyingCards";
import { HandCardRow } from "./components/HandCardRow";
import { MeldDisplay } from "./components/MeldDisplay";
import { ScoreHistoryTimeline } from "./components/ScoreHistoryTimeline";
import { ScorePanel } from "./components/ScorePanel";
import { SetupScreen } from "./components/SetupScreen";
import { TableArea } from "./components/TableArea";
import "./styles.css";
import type { Player } from "./game/types";
import { useViewportCategory } from "./hooks/useViewportCategory";
import { DesktopGameView, MobileGameView, TabletGameView } from "./views/GameViews";
import { movedBeyondThreshold, pointInElement, pointerPoint } from "./utils/pointerDrag";

const defaultConfigs: PlayerConfig[] = [
  { name: "You", avatar: AVATARS[0].src, fallback: AVATARS[0].fallback },
  { name: AVATARS[1].name, avatar: AVATARS[1].src, fallback: AVATARS[1].fallback },
  { name: AVATARS[2].name, avatar: AVATARS[2].src, fallback: AVATARS[2].fallback },
  { name: AVATARS[3].name, avatar: AVATARS[3].src, fallback: AVATARS[3].fallback }
];

export type TableTheme = "classic" | "casino" | "wood" | "luxury" | "neon" | "coffee";
export type CardBackStyle = "red" | "blue" | "gold" | "black" | "green" | "purple" | "wood" | "marble";

export default function App() {
  const viewport = useViewportCategory();
  const [count, setCount] = useState(2);
  const [configs, setConfigs] = useState<PlayerConfig[]>(defaultConfigs);
  const [tableTheme, setTableTheme] = useState<TableTheme>("classic");
  const [cardBack, setCardBack] = useState<CardBackStyle>("red");
  const [started, setStarted] = useState(false);
  const [meldTrayExpanded, setMeldTrayExpanded] = useState(false);
  const [state, setState] = useState<GameState>(() => newGame(2, null, defaultConfigs));
  const [flyingCards, setFlyingCards] = useState<Card[]>([]);
  const [flyingMeldType, setFlyingMeldType] = useState<"set" | "run" | "layoff" | undefined>();
  const [isAnimatingMeld, setIsAnimatingMeld] = useState(false);
  const [isDealing, setIsDealing] = useState(false);
  const [dealKey, setDealKey] = useState(0);
  const [pendingStockCard, setPendingStockCard] = useState<Card | null>(null);
  const [pendingDiscardPickup, setPendingDiscardPickup] = useState<Card[]>([]);
  const [updateReady, setUpdateReady] = useState(false);
  const [discardViewerOpen, setDiscardViewerOpen] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragTarget, setDragTarget] = useState<"hand" | "discard" | null>(null);
  const handDropRef = useRef<HTMLDivElement | null>(null);
  const discardPileRef = useRef<HTMLDivElement | null>(null);

  const human = state.players[0];
  const current = state.players[state.turn];
  const selectedCards = human.hand.filter((card) => state.selected.includes(card.id));
  const tableMelds = state.players.flatMap((player) => player.melds);
  const tableMeldEntries = state.players.flatMap((player) => player.melds.map((meld) => ({ player, meld })));
  const layoffTargetCount = tableMeldEntries.filter(({ meld }) => selectedCards.length === 1 && state.turn === 0 && state.drawn && canLay(selectedCards[0], meld)).length;
  const handHints = useMemo(() => cardHints(human.hand), [human.hand]);
  const turnPhase: TurnPhase = state.handOver ? "handOver" : state.turn !== 0 ? "ai" : state.drawn ? "play" : "draw";
  const draggedCard = dragState?.type === "hand-card" ? human.hand.find((card) => card.id === dragState.cardId) : null;

  useEffect(() => {
    if (!started || !current?.isAI || state.handOver || isAnimatingMeld || isDealing) return;
    const timer = window.setTimeout(() => setState((prev) => aiTurn(prev)), 650);
    return () => window.clearTimeout(timer);
  }, [started, state.turn, state.handOver, current?.isAI, isAnimatingMeld, isDealing]);

  useEffect(() => {
    function handleUpdateReady() {
      setUpdateReady(true);
    }

    window.addEventListener("pwa:update-ready", handleUpdateReady);
    return () => window.removeEventListener("pwa:update-ready", handleUpdateReady);
  }, []);

  useEffect(() => {
    if (!dragState) return;
    const activeDrag = dragState;

    function handlePointerMove(event: PointerEvent) {
      const point = pointerPoint(event);
      const start = { x: activeDrag.startX, y: activeDrag.startY };
      const dragging = activeDrag.dragging || movedBeyondThreshold(start, point);

      setDragState((currentDrag) => {
        if (!currentDrag) return currentDrag;
        return { ...currentDrag, x: point.x, y: point.y, dragging };
      });

      if (!dragging) return;

      if (activeDrag.type === "stock") {
        setDragTarget(pointInElement(handDropRef.current, point) ? "hand" : null);
      } else {
        setDragTarget(pointInElement(discardPileRef.current, point) ? "discard" : null);
      }
    }

    function handlePointerUp(event: PointerEvent) {
      const point = pointerPoint(event);
      const start = { x: activeDrag.startX, y: activeDrag.startY };
      const dragged = activeDrag.dragging || movedBeyondThreshold(start, point);

      if (!dragged) {
        if (activeDrag.type === "hand-card") toggleCard(activeDrag.cardId);
        setDragState(null);
        setDragTarget(null);
        return;
      }

      if (activeDrag.type === "stock" && pointInElement(handDropRef.current, point)) {
        drawStock();
      }

      if (activeDrag.type === "hand-card" && pointInElement(discardPileRef.current, point)) {
        discardCardById(activeDrag.cardId);
      }

      setDragState(null);
      setDragTarget(null);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp, { passive: false });
    window.addEventListener("pointercancel", handlePointerUp, { passive: false });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dragState, human.hand, state.drawn, state.handOver, state.turn, isAnimatingMeld, isDealing]);

  function setMessage(message: string) {
    setState((prev) => ({ ...prev, message }));
  }

  function startConfiguredGame() {
    setFlyingCards([]);
    setFlyingMeldType(undefined);
    setIsAnimatingMeld(false);
    setPendingStockCard(null);
    setPendingDiscardPickup([]);
    setState(newGame(count, null, configs));
    setStarted(true);
    setIsDealing(true);
    setDealKey((key) => key + 1);
  }

  function resetGame(players: Player[] | null = null) {
    setFlyingCards([]);
    setFlyingMeldType(undefined);
    setIsAnimatingMeld(false);
    setPendingStockCard(null);
    setPendingDiscardPickup([]);
    setState((prev) => newGame(count, players, configs, players ? prev.scoreHistory : []));
    setIsDealing(true);
    setDealKey((key) => key + 1);
  }

  function changePlayerCount(number: number) {
    setCount(number);
    setFlyingCards([]);
    setFlyingMeldType(undefined);
    setIsAnimatingMeld(false);
    setPendingStockCard(null);
    setPendingDiscardPickup([]);
    setState(newGame(number, null, configs));
    setIsDealing(true);
    setDealKey((key) => key + 1);
  }

  function returnToSetup() {
    setFlyingCards([]);
    setFlyingMeldType(undefined);
    setIsAnimatingMeld(false);
    setPendingStockCard(null);
    setPendingDiscardPickup([]);
    setIsDealing(false);
    setStarted(false);
  }

  function allowDrop(event: React.DragEvent) {
    event.preventDefault();
  }

  function selectCards(ids: string[]) {
    if (state.turn !== 0 || state.handOver || isAnimatingMeld || isDealing) return;
    setState((prev) => ({ ...prev, selected: ids }));
  }

  function toggleCard(id: string) {
    if (state.turn !== 0 || state.handOver || isAnimatingMeld || isDealing) return;
    setState((prev) => ({
      ...prev,
      selected: prev.selected.includes(id) ? prev.selected.filter((cardId) => cardId !== id) : [...prev.selected, id]
    }));
  }

  function drawStock() {
    if (state.turn !== 0 || state.drawn || state.handOver || isAnimatingMeld || isDealing || pendingStockCard || pendingDiscardPickup.length) return;
    if (!state.stock.length) {
      setMessage("Stock is empty.");
      return;
    }

    setState((prev) => {
      const stock = [...prev.stock];
      const card = stock.pop();
      if (!card) return prev;

      setPendingStockCard(card);
      return { ...prev, stock, message: "Drawing from stock…" };
    });
  }

  function finishDrawStock() {
    if (!pendingStockCard) return;

    setState((prev) => {
      const players = [...prev.players];
      players[0] = { ...players[0], hand: [...players[0].hand, pendingStockCard] };

      return { ...prev, players, drawn: true, message: "Drew from stock." };
    });
    setPendingStockCard(null);
  }

  function drawDiscard(index: number) {
    if (state.turn !== 0 || state.drawn || state.handOver || isAnimatingMeld || isDealing || pendingStockCard || pendingDiscardPickup.length) return;

    const card = state.discard[index];
    const pickupPreview = discardPickup(state.discard, index);

    if (!immediatelyUsable(card, human.hand, tableMelds, pickupPreview)) {
      setMessage(`${label(card)} must be immediately usable in a set, run, or layoff.`);
      return;
    }

    setState((prev) => {
      const pickup = discardPickup(prev.discard, index);
      const discard = prev.discard.slice(0, index);
      setPendingDiscardPickup(pickup);
      return { ...prev, discard, message: `Picking up ${pickup.map(label).join(", ")}…` };
    });
  }

  function openDiscardViewer() {
    if (state.turn !== 0 || state.drawn || state.handOver || !state.discard.length || isAnimatingMeld || isDealing) return;
    setDiscardViewerOpen(true);
  }

  function finishDiscardPickup() {
    if (!pendingDiscardPickup.length) return;

    setState((prev) => {
      const players = [...prev.players];
      players[0] = { ...players[0], hand: [...players[0].hand, ...pendingDiscardPickup] };

      return {
        ...prev,
        players,
        drawn: true,
        message: `Picked up ${pendingDiscardPickup.map(label).join(", ")}.`
      };
    });
    setPendingDiscardPickup([]);
  }

  function finishPlayMeld(type: "set" | "run", cardsToPlay: Card[], idsToRemove: string[]) {
    setState((prev) => {
      const players = [...prev.players];
      const me = { ...players[0] };
      me.hand = removeCards(me.hand, idsToRemove);
      me.melds = [...me.melds, { id: Math.random().toString(36).slice(2), ownerId: me.id, type, cards: sortCards(cardsToPlay), contributions: [{ playerId: me.id, cards: sortCards(cardsToPlay) }] }];
      players[0] = me;

      const next = { ...prev, players, selected: [], message: `Played ${type}.` };
      return me.hand.length ? next : scoreHand(next, 0);
    });

    setFlyingCards([]);
    setFlyingMeldType(undefined);
    setIsAnimatingMeld(false);
  }

  function playMeld() {
    if (isAnimatingMeld || isDealing) return;
    if (!state.drawn) {
      setMessage("Draw first.");
      return;
    }

    const type = meldType(selectedCards);
    if (!type) {
      setMessage("That is not a valid meld.");
      return;
    }

    const cardsToPlay = sortCards(selectedCards);
    const idsToRemove = selectedCards.map((card) => card.id);
    setFlyingCards(cardsToPlay);
    setFlyingMeldType(type);
    setIsAnimatingMeld(true);
    setMessage("Playing meld…");
    window.setTimeout(() => finishPlayMeld(type, cardsToPlay, idsToRemove), 560 + cardsToPlay.length * 45);
  }

  function finishLayoff(card: Card, meldId: string) {
    setState((prev) => {
      const players = prev.players.map((player, index) => ({
        ...player,
        hand: index === 0 ? removeCards(player.hand, [card.id]) : player.hand,
        melds: player.melds.map((meld) => (
          meld.id === meldId
            ? {
                ...meld,
                cards: sortCards([...meld.cards, card]),
                contributions: [
                  ...(meld.contributions?.length ? meld.contributions : [{ playerId: meld.ownerId, cards: meld.cards }]),
                  { playerId: 0, cards: [card] }
                ]
              }
            : meld
        ))
      }));

      const next = { ...prev, players, selected: [], message: `Laid off ${label(card)}.` };
      return players[0].hand.length ? next : scoreHand(next, 0);
    });

    setFlyingCards([]);
    setFlyingMeldType(undefined);
    setIsAnimatingMeld(false);
  }

  function layoff(meldId: string) {
    if (isAnimatingMeld || isDealing) return;
    if (!state.drawn || selectedCards.length !== 1) {
      setMessage("Select one card to lay off.");
      return;
    }

    const card = selectedCards[0];
    const target = tableMelds.find((meld) => meld.id === meldId);

    if (!target || !canLay(card, target)) {
      setMessage("Cannot lay off there.");
      return;
    }

    setFlyingCards([card]);
    setFlyingMeldType("layoff");
    setIsAnimatingMeld(true);
    setMessage(`Laying off ${label(card)}…`);
    window.setTimeout(() => finishLayoff(card, meldId), 560);
  }

  function layoffSelected() {
    if (isAnimatingMeld || isDealing) return;
    if (!state.drawn || selectedCards.length !== 1) {
      setMessage("Select one card to lay off.");
      return;
    }

    const target = tableMelds.find((meld) => canLay(selectedCards[0], meld));
    if (!target) {
      setMessage("No lay off is available for that card.");
      return;
    }

    layoff(target.id);
  }

  function discardSelected() {
    if (isAnimatingMeld || isDealing) return;
    if (!state.drawn || selectedCards.length !== 1) {
      setMessage("Select one card to discard.");
      return;
    }

    const card = selectedCards[0];

    setState((prev) => {
      const players = [...prev.players];
      players[0] = { ...players[0], hand: removeCards(players[0].hand, [card.id]) };
      const next = { ...prev, players, discard: [...prev.discard, card], selected: [], drawn: false };

      return players[0].hand.length
        ? { ...next, turn: (prev.turn + 1) % prev.players.length, message: `${label(card)} discarded. Computer is playing…` }
        : scoreHand(next, 0);
    });
  }

  function discardCardById(cardId: string) {
    if (isAnimatingMeld || isDealing) return;
    if (!state.drawn) {
      setMessage("Draw first.");
      return;
    }

    const card = human.hand.find((handCard) => handCard.id === cardId);
    if (!card) {
      setMessage("Select one card to discard.");
      return;
    }

    setState((prev) => {
      const players = [...prev.players];
      players[0] = { ...players[0], hand: removeCards(players[0].hand, [card.id]) };
      const next = { ...prev, players, discard: [...prev.discard, card], selected: [], drawn: false };

      return players[0].hand.length
        ? { ...next, turn: (prev.turn + 1) % prev.players.length, message: `${label(card)} discarded. Computer is playing…` }
        : scoreHand(next, 0);
    });
  }

  function dragCard(event: React.DragEvent<HTMLButtonElement>, cardId: string) {
    if (isAnimatingMeld || isDealing) return;
    selectCards([cardId]);
    event.dataTransfer.setData("text/plain", `hand:${cardId}`);
  }

  function handleStockPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (turnPhase !== "draw" || isAnimatingMeld || isDealing || pendingStockCard || pendingDiscardPickup.length) return;
    event.preventDefault();
    const point = pointerPoint(event);
    setDragState({
      type: "stock",
      startX: point.x,
      startY: point.y,
      x: point.x,
      y: point.y,
      dragging: false
    });
  }

  function handleHandCardPointerDown(event: React.PointerEvent<HTMLButtonElement>, cardId: string) {
    if (state.turn !== 0 || state.handOver || isAnimatingMeld || isDealing) return;
    event.preventDefault();
    const point = pointerPoint(event);
    setDragState({
      type: "hand-card",
      cardId,
      startX: point.x,
      startY: point.y,
      x: point.x,
      y: point.y,
      dragging: false
    });
  }

  function dropOnHandCard(event: React.DragEvent<HTMLButtonElement>, targetId: string) {
    event.preventDefault();
    if (isAnimatingMeld || isDealing) return;

    const data = event.dataTransfer.getData("text/plain");
    if (!data.startsWith("hand:")) return;

    const draggedId = data.split(":")[1];

    setState((prev) => {
      const players = [...prev.players];
      players[0] = { ...players[0], hand: moveCardById(players[0].hand, draggedId, targetId) };
      return { ...prev, players, message: "Hand reordered." };
    });
  }

  function sortHandByMelds() {
    if (isAnimatingMeld || isDealing) return;
    setState((prev) => {
      const players = [...prev.players];
      players[0] = { ...players[0], hand: groupHandByMelds(players[0].hand) };
      return { ...prev, players, message: "Hand sorted by possible melds." };
    });
  }

  function sortHandBySuit() {
    if (isAnimatingMeld || isDealing) return;
    setState((prev) => {
      const players = [...prev.players];
      players[0] = { ...players[0], hand: sortCards(players[0].hand) };
      return { ...prev, players, message: "Hand sorted by suit." };
    });
  }

  function dropDiscard(event: React.DragEvent<HTMLDivElement>) {
    if (isAnimatingMeld || isDealing) return;
    const data = event.dataTransfer.getData("text/plain");
    if (data.startsWith("discard:")) drawDiscard(Number(data.split(":")[1]));
  }

  function dropToDiscardPile(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (isAnimatingMeld || isDealing) return;

    const data = event.dataTransfer.getData("text/plain");
    if (data.startsWith("hand:")) {
      discardCardById(data.split(":")[1]);
    }
  }

  if (!started) {
    return <SetupScreen count={count} setCount={setCount} configs={configs} setConfigs={setConfigs} tableTheme={tableTheme} setTableTheme={setTableTheme} cardBack={cardBack} setCardBack={setCardBack} onStart={startConfiguredGame} />;
  }

  return (
    <div className={`app-shell table-theme-${tableTheme} card-back-${cardBack}`}>
      <motion.div className="top-bar" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="title"><span>500</span> Rummy</div>
        <div className="header-right">
          <div className="header-score-panel">
            <ScorePanel players={state.players} turn={state.turn} handOver={state.handOver} />
          </div>
          <div className="top-actions">
            <ActionButton disabled={isAnimatingMeld || isDealing} onClick={() => resetGame(null)} style={{ background: "#ffe082", color: "#1a472a", padding: "6px 10px" }}>New</ActionButton>
          </div>
        </div>
      </motion.div>

      <motion.div
        key={state.message}
        className={state.message.match(/must|Cannot|valid/i) ? "message error" : "message"}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <b>Turn: {current.name}</b> — {state.message}
      </motion.div>

      <motion.div
        className={isDealing ? "game-surface dealing-hidden" : "game-surface"}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: isDealing ? 0 : 1, y: 0 }}
        transition={{ duration: 0.36 }}
      >
        {(() => {
          const table = (
            <>
              <section className="table-zone" aria-label="Card table">
                <TableArea
                  state={state}
                  onDrawStock={drawStock}
                  onDrawDiscard={drawDiscard}
                  onOpenDiscardViewer={openDiscardViewer}
                  onDiscardSelected={discardSelected}
                  onDropToDiscardPile={dropToDiscardPile}
                  onPlayMeld={playMeld}
                  onDropDiscard={dropDiscard}
                  onStockPointerDown={handleStockPointerDown}
                  discardPileRef={discardPileRef}
                  dragTarget={dragTarget}
                  allowDrop={allowDrop}
                  disabled={isAnimatingMeld || isDealing}
                />
              </section>

              <FlyingCards cards={flyingCards} type={flyingMeldType} />

              {tableMelds.length ? (
                <div className={meldTrayExpanded ? "table-meld-layer expanded" : "table-meld-layer"}>
                  <button type="button" className="table-meld-toggle" onClick={() => setMeldTrayExpanded((expanded) => !expanded)} aria-expanded={meldTrayExpanded}>
                    <span>Table Melds</span>
                    <small>{tableMelds.length} groups{layoffTargetCount ? ` · ${layoffTargetCount} layoff` : ""}</small>
                  </button>
                  <div className="meld-section">
                    <div className="section-label">TABLE MELDS</div>
                    <div className="meld-grid">
                      {tableMeldEntries.map(({ player, meld }) => (
                        <MeldDisplay
                          key={meld.id}
                          meld={meld}
                          playerName={player.name}
                          canLayoffCard={selectedCards.length === 1 && state.turn === 0 && state.drawn && canLay(selectedCards[0], meld)}
                          onLayoff={layoff}
                          allowDrop={allowDrop}
                          disabled={isAnimatingMeld || isDealing}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          );

          const opponents = (
            <div className={`opponent-seats seats-${state.players.length - 1}`} aria-label="Opponent seats">
              {state.players.slice(1).map((player, index) => (
                <motion.div
                  key={player.id}
                  className={state.turn === player.id ? "ai-row seat-active" : "ai-row"}
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.04, duration: 0.28 }}
                >
                  <div className="ai-label">
                    <AvatarPhoto src={player.avatar} alt={player.name} fallback={player.fallback || "🤖"} size={40} />
                    <span>
                      <b>{player.name}</b>
                      <small>{player.score} pts · {player.hand.length} cards{state.turn === player.id ? " · Turn" : ""}</small>
                    </span>
                  </div>
                  <div className="ai-cards">
                    {player.hand.map((card) => <CardView key={card.id} card={card} faceDown small />)}
                  </div>
                </motion.div>
              ))}
            </div>
          );

          const drawers = (
            <aside className="desktop-drawers" aria-label="Game drawers">
              <details>
                <summary>Score</summary>
                <ScoreHistoryTimeline history={state.scoreHistory} />
              </details>
              <details>
                <summary>Rules</summary>
                <div className="drawer-copy">
                  <b>Turn order</b>
                  <span>Draw, play melds or lay off, then discard.</span>
                </div>
              </details>
              <details>
                <summary>Settings</summary>
                <div className="drawer-copy">
                  <b>{tableTheme} table</b>
                  <span>{cardBack} card backs · {state.players.length} players</span>
                </div>
              </details>
            </aside>
          );

          const player = (
            <section className="player-zone" aria-label="Your hand">
              <motion.div
                className={state.turn === 0 && !state.handOver ? "human-area active" : "human-area"}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.32 }}
              >
                <div className="human-header">
                  <div className="human-name">
                    <AvatarPhoto src={human.avatar} alt={human.name} fallback={human.fallback || "🧑"} size={42} />
                    {human.name} {state.turn === 0 ? `— ${state.drawn ? "Meld/Lay off, then discard" : "Draw a card"}` : ""}
                  </div>
                  <div className="hand-actions">
                    <span data-mobile-label={`${human.score} · ${human.hand.length} cards · ${selectedCards.length} selected`}>{human.score} score · {human.hand.length} cards · {selectedCards.length} selected · {points(selectedCards)} pts</span>
                    <ActionButton className="secondary-action" disabled={state.turn !== 0 || state.handOver || isAnimatingMeld || isDealing} onClick={sortHandByMelds} style={{ padding: "6px 10px", fontSize: 12 }}>Group Melds</ActionButton>
                    <ActionButton className="secondary-action light-action" disabled={state.turn !== 0 || state.handOver || isAnimatingMeld || isDealing} onClick={sortHandBySuit} style={{ padding: "6px 10px", fontSize: 12 }}>Sort Suit</ActionButton>
                  </div>
                </div>

                <div
                  ref={handDropRef}
                  className={dragTarget === "hand" ? "hand-scroll-wrap drop-ready" : "hand-scroll-wrap"}
                  onDragOver={allowDrop}
                  onDrop={dropDiscard}
                >
                  <HandCardRow
                    cards={human.hand}
                    hints={handHints}
                    selectedIds={state.selected}
                    disabled={state.turn !== 0 || state.handOver || isAnimatingMeld || isDealing}
                    onSelect={selectCards}
                    onCardClick={toggleCard}
                    onCardDrag={dragCard}
                    onCardDrop={dropOnHandCard}
                    onCardPointerDown={handleHandCardPointerDown}
                    allowDrop={allowDrop}
                  />
                </div>

                <div className="mobile-turn-actions" aria-label="Turn actions">
                  <ActionButton className="secondary-action draw-action" disabled={turnPhase !== "draw" || isAnimatingMeld || isDealing} onClick={drawStock}>Draw</ActionButton>
                  <ActionButton className="primary-action" disabled={turnPhase !== "play" || selectedCards.length < 3 || isAnimatingMeld || isDealing} onClick={playMeld}>Meld</ActionButton>
                  <ActionButton className="secondary-action layoff-action" disabled={turnPhase !== "play" || selectedCards.length !== 1 || !tableMelds.some((meld) => canLay(selectedCards[0], meld)) || isAnimatingMeld || isDealing} onClick={layoffSelected}>Lay Off</ActionButton>
                  <ActionButton className="danger-action" disabled={turnPhase !== "play" || selectedCards.length !== 1 || isAnimatingMeld || isDealing} onClick={discardSelected}>Discard</ActionButton>
                  {state.turn !== 0 && !state.handOver ? <span className="waiting-turn-pill">Waiting for {current.name}</span> : null}
                </div>

                {state.turn === 0 && state.drawn ? (
                  <div className="turn-actions">
                    <ActionButton className="primary-action" disabled={isAnimatingMeld || isDealing} onClick={playMeld}>Play Meld ({selectedCards.length})</ActionButton>
                    <ActionButton className="danger-action" disabled={isAnimatingMeld || isDealing} onClick={discardSelected}>Discard</ActionButton>
                  </div>
                ) : null}
              </motion.div>
            </section>
          );

          if (viewport === "mobile") return <MobileGameView table={table} opponents={opponents} drawers={drawers} player={player} />;
          if (viewport === "tablet") return <TabletGameView table={table} opponents={opponents} drawers={drawers} player={player} />;
          return <DesktopGameView table={table} opponents={opponents} drawers={drawers} player={player} />;
        })()}
      </motion.div>

      {isDealing ? <DealSequence key={dealKey} playerCount={state.players.length} onComplete={() => setIsDealing(false)} /> : null}
      {pendingStockCard ? <DrawStockAnimation onComplete={finishDrawStock} /> : null}
      {pendingDiscardPickup.length ? <DiscardPickupAnimation cards={pendingDiscardPickup} onComplete={finishDiscardPickup} /> : null}

      <DiscardViewer
        state={state}
        open={discardViewerOpen}
        disabled={isAnimatingMeld || isDealing}
        onClose={() => setDiscardViewerOpen(false)}
        onPick={(index) => {
          drawDiscard(index);
          setDiscardViewerOpen(false);
        }}
      />

      {dragState?.dragging ? (
        <div className="drag-ghost" style={{ left: dragState.x, top: dragState.y }}>
          {dragState.type === "stock" ? <div className="card-back-face drag-card-back" /> : draggedCard ? <CardView card={draggedCard} disabled /> : null}
        </div>
      ) : null}

      <EndHandModal
        state={state}
        onNextHand={() => resetGame(state.players)}
        onNewGame={() => resetGame(null)}
        onExit={returnToSetup}
      />
      {updateReady ? (
        <button className="pwa-update-toast" type="button" onClick={() => window.location.reload()}>
          New version available - reload
        </button>
      ) : null}
    </div>
  );
}
