import type { CSSProperties } from "react";
import { TARGET_SCORE } from "../game/constants";
import type { ScoreHistoryEntry } from "../game/types";
import { AvatarPhoto } from "./AvatarPhoto";

type Props = {
  history: ScoreHistoryEntry[];
};

export function ScoreHistoryTimeline({ history }: Props) {
  if (!history.length) return null;

  const recentHands = history.slice(-5).reverse();

  return (
    <section className="score-history" aria-label="Score history">
      <div className="score-history-header">
        <div>
          <span>Score History</span>
          <b>Latest Hands</b>
        </div>
        <em>{history.length} hand{history.length === 1 ? "" : "s"}</em>
      </div>

      <div className="score-history-list">
        {recentHands.map((hand, index) => (
          <div key={hand.handNumber} className="score-history-hand" style={{ "--history-delay": `${index * 70}ms` } as CSSProperties}>
            <div className="history-hand-marker">
              <span>{hand.handNumber}</span>
            </div>
            <div className="history-hand-card">
              <div className="history-hand-title">Hand {hand.handNumber}</div>
              <div className="history-player-list">
                {hand.rows.map((row) => {
                  const progress = Math.max(0, Math.min(100, (row.total / TARGET_SCORE) * 100));
                  return (
                    <div key={row.playerId} className="history-player-row">
                      <div className="history-player-name">
                        <AvatarPhoto src={row.avatar} alt={row.name} fallback={row.fallback} size={30} />
                        <span>{row.name}</span>
                      </div>
                      <div className="history-score-track" aria-label={`${row.name} progress to ${TARGET_SCORE}`}>
                        <div className="history-score-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="history-delta-total">
                        <span className={row.net >= 0 ? "history-delta positive" : "history-delta negative"}>
                          {row.net >= 0 ? "+" : ""}{row.net}
                        </span>
                        <b>{row.total}</b>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
