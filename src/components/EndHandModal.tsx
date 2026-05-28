import { useEffect, useState } from "react";
import { label } from "../game/melds";
import { cardValue } from "../game/scoring";
import type { Card, GameState } from "../game/types";
import { ActionButton } from "./ActionButton";
import { AvatarPhoto } from "./AvatarPhoto";
import { CardView } from "./CardView";
import { VictoryCelebration } from "./VictoryCelebration";

type Props = {
  state: GameState;
  onNextHand: () => void;
  onNewGame: () => void;
  onExit: () => void;
};

function AnimatedScore({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 820;
    const from = 0;
    const to = value;
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    }

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return <span>{prefix}{display}</span>;
}

function CardStrip({ cards, emptyLabel }: { cards: Card[]; emptyLabel: string }) {
  if (!cards.length) return <div className="score-empty-cards">{emptyLabel}</div>;

  return (
    <div className="score-card-row">
      {cards.map((card) => (
        <div key={card.id} className={card.rank === "Q" && card.suit === "♠" ? "score-card-wrap queen-spades-score" : "score-card-wrap"}>
          <CardView card={card} small disabled />
          {card.rank === "Q" && card.suit === "♠" ? <span>40 pts</span> : null}
        </div>
      ))}
    </div>
  );
}

function ScoreProgress({ total }: { total: number }) {
  const progress = Math.min(Math.max(total / 500, 0), 1);

  return (
    <div className="score-progress" aria-label={`${total} points toward 500`}>
      <span style={{ width: `${progress * 100}%` }} />
    </div>
  );
}

export function EndHandModal({ state, onNextHand, onNewGame, onExit }: Props) {
  if (!state.handOver) return null;

  const scoring = state.scoring ?? [];
  const queenRows = scoring.filter((row) => [...row.meldedCards, ...row.handCards].some((card) => card.rank === "Q" && card.suit === "♠"));

  return (
    <div className="modal-backdrop">
      <div
        className={state.winner ? "end-modal scoring-modal winner-modal" : "end-modal scoring-modal"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="end-hand-title"
      >
        <div className="score-modal-header">
          <span>{state.winner ? "Game Over" : "Hand Complete"}</span>
          <h2 id="end-hand-title">{state.winner ? `${state.winner.name} Wins` : "End of Hand Scoring"}</h2>
          {queenRows.length ? <p>Queen of Spades counted as 40 points.</p> : <p>Melds add points. Cards left in hand subtract points.</p>}
        </div>

        {state.winner ? <VictoryCelebration winner={state.winner} /> : null}

        {state.winner ? (
          <div className="winner-standings" aria-label="Final standings">
            {scoring
              .slice()
              .sort((a, b) => b.total - a.total)
              .map((row, index) => (
                <div key={row.playerId} className={row.playerId === state.winner?.id ? "winner-standing-row champion" : "winner-standing-row"}>
                  <div className="winner-rank">{index + 1}</div>
                  <AvatarPhoto src={row.avatar} alt={row.name} fallback={row.fallback} size={38} />
                  <b>{row.name}</b>
                  <span><AnimatedScore value={row.total} /></span>
                </div>
              ))}
          </div>
        ) : (
          <div className="score-breakdown-list">
            {scoring.map((row) => {
              const hasQueen = [...row.meldedCards, ...row.handCards].some((card) => card.rank === "Q" && card.suit === "♠");
              return (
                <div key={row.playerId} className={hasQueen ? "score-row detailed queen-present" : "score-row detailed"}>
                  <div className="score-row-header">
                    <div className="score-player-title">
                      <AvatarPhoto src={row.avatar} alt={row.name} fallback={row.fallback} size={46} />
                      <div>
                        <b>{row.name}</b>
                        <span>Total: <AnimatedScore value={row.total} /></span>
                        <ScoreProgress total={row.total} />
                      </div>
                    </div>
                    <div className={row.net >= 0 ? "score-net positive" : "score-net negative"}>
                      <small>Net</small>
                      <AnimatedScore value={row.net} prefix={row.net > 0 ? "+" : ""} />
                    </div>
                  </div>

                  <div className="score-breakdown">
                    <div className="score-points positive">
                      <span>Melded</span>
                      <b><AnimatedScore value={row.table} prefix="+" /></b>
                    </div>
                    <div className="score-points negative">
                      <span>In Hand</span>
                      <b><AnimatedScore value={row.hand} prefix="-" /></b>
                    </div>
                  </div>

                  <div className="score-card-groups">
                    <div>
                      <div className="score-group-label">Cards Melded</div>
                      <CardStrip cards={row.meldedCards} emptyLabel="No melded cards" />
                    </div>
                    <div>
                      <div className="score-group-label">Cards Remaining</div>
                      <CardStrip cards={row.handCards} emptyLabel="Hand empty" />
                    </div>
                  </div>

                  {hasQueen ? (
                    <div className="queen-score-note">
                      Q♠ highlighted at {cardValue({ id: "Q♠", rank: "Q", suit: "♠" })} points.
                      {[...row.meldedCards, ...row.handCards].some((card) => card.rank === "Q" && card.suit === "♠") ? ` Found in ${row.name}'s cards: ${[...row.meldedCards, ...row.handCards].filter((card) => card.rank === "Q" && card.suit === "♠").map(label).join(", ")}.` : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        <div className="modal-actions">
          {state.winner ? (
            <ActionButton onClick={onNewGame} style={{ flex: 1, background: "#1a472a", color: "#fff" }}>New Game</ActionButton>
          ) : (
            <ActionButton onClick={onNextHand} style={{ flex: 1, background: "#1a472a", color: "#fff" }}>Next Hand</ActionButton>
          )}
          {!state.winner ? <ActionButton onClick={onNewGame} style={{ flex: 1, background: "#ffe082", color: "#1a472a" }}>New Game</ActionButton> : null}
          <ActionButton onClick={onExit} style={{ flex: 1, background: "#eee", color: "#1a472a" }}>Change Players</ActionButton>
        </div>
      </div>
    </div>
  );
}
