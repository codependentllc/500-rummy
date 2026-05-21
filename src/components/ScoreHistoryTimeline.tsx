import { TARGET_SCORE } from "../game/constants";
import type { ScoreHistoryEntry } from "../game/types";
import { AvatarPhoto } from "./AvatarPhoto";

type Props = {
  history: ScoreHistoryEntry[];
};

export function ScoreHistoryTimeline({ history }: Props) {
  if (!history.length) return null;

  const latestHand = history[history.length - 1];

  return (
    <section className="score-history" aria-label="Score history">
      <div className="score-history-header">
        <div>
          <span>Game Total</span>
          <b>Race to {TARGET_SCORE}</b>
        </div>
        <em>After hand {latestHand.handNumber}</em>
      </div>

      <div className="history-player-list compact">
        {latestHand.rows.map((row) => {
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
                <b>{row.total}</b>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
