import { TARGET_SCORE } from "../game/constants";
import type { ScoreHistoryEntry } from "../game/types";
import { AvatarPhoto } from "./AvatarPhoto";

type Props = {
  history: ScoreHistoryEntry[];
};

export function ScoreHistoryTimeline({ history }: Props) {
  if (!history.length) return null;

  const latest = history[history.length - 1];
  const totals = [...latest.rows].sort((a, b) => b.total - a.total);

  return (
    <section className="score-history" aria-label="Game totals">
      <div className="score-history-header">
        <div>
          <span>Game Totals</span>
          <b>Race to {TARGET_SCORE}</b>
        </div>
        <em>After hand {latest.handNumber}</em>
      </div>

      <div className="score-total-list">
        {totals.map((row, index) => {
          const progress = Math.max(0, Math.min(100, (row.total / TARGET_SCORE) * 100));
          return (
            <div key={row.playerId} className="score-total-row">
              <div className="score-total-rank">{index + 1}</div>
              <div className="history-player-name">
                <AvatarPhoto src={row.avatar} alt={row.name} fallback={row.fallback} size={34} />
                <span>{row.name}</span>
              </div>
              <div className="history-score-track" aria-label={`${row.name} total progress to ${TARGET_SCORE}`}>
                <div className="history-score-fill" style={{ width: `${progress}%` }} />
              </div>
              <b>{row.total}</b>
            </div>
          );
        })}
      </div>
    </section>
  );
}
