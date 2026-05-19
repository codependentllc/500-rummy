import { useState, type CSSProperties } from "react";

type Props = {
  onClose: () => void;
};

const runCards = [
  { rank: "4", suit: "♥", tilt: "-5deg" },
  { rank: "5", suit: "♥", tilt: "0deg" },
  { rank: "6", suit: "♥", tilt: "5deg" }
];

function DemoCard({ rank, suit, className = "", style }: { rank: string; suit: string; className?: string; style?: CSSProperties }) {
  return (
    <div className={`layoff-card ${className}`} style={style}>
      <span>{rank}</span>
      <b>{suit}</b>
      <em>{rank}</em>
    </div>
  );
}

export function LayOffAnimation({ onClose }: Props) {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="layoff-overlay" role="dialog" aria-modal="true" aria-label="Lay off animation">
      <div className="layoff-controls">
        <button type="button" onClick={() => setReplayKey((key) => key + 1)}>Replay</button>
        <button type="button" onClick={onClose}>Close</button>
      </div>

      <div key={replayKey} className="layoff-stage">
        <div className="layoff-table">
          <div className="layoff-spotlight" />
          <div className="layoff-label">Lay Off</div>

          <div className="layoff-meld-area" aria-label="Existing run 4 hearts 5 hearts 6 hearts">
            <div className="layoff-meld-title">Existing Run</div>
            <div className="layoff-run">
              {runCards.map((card) => (
                <DemoCard
                  key={`${card.rank}${card.suit}`}
                  rank={card.rank}
                  suit={card.suit}
                  style={{ "--tilt": card.tilt } as CSSProperties}
                />
              ))}
              <div className="layoff-target-slot" />
            </div>
          </div>

          <div className="layoff-hand" aria-label="Player hand">
            <div className="layoff-hand-shadow" />
            <DemoCard rank="9" suit="♣" className="hand-card muted card-a" />
            <DemoCard rank="Q" suit="♦" className="hand-card muted card-b" />
            <DemoCard rank="7" suit="♥" className="hand-card layoff-flying-card" />
            <DemoCard rank="2" suit="♠" className="hand-card muted card-c" />
            <DemoCard rank="K" suit="♣" className="hand-card muted card-d" />
          </div>

          <div className="layoff-final-card">
            <DemoCard rank="7" suit="♥" />
          </div>

          <div className="layoff-trail" />
        </div>
      </div>
    </div>
  );
}
