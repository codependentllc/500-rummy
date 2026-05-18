import { useState, type CSSProperties } from "react";

type Props = {
  onClose: () => void;
};

const sparks = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  angle: `${index * 17 - 80}deg`,
  distance: `${86 + (index % 5) * 18}px`,
  delay: `${0.42 + (index % 7) * 0.09}s`
}));

const smoke = Array.from({ length: 7 }, (_, index) => ({
  id: index,
  left: `${18 + index * 10}%`,
  delay: `${index * 0.28}s`,
  scale: `${0.82 + index * 0.08}`
}));

export function QueenSpadesAnimation({ onClose }: Props) {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="queen-special-overlay" role="dialog" aria-modal="true" aria-label="Queen of Spades special card animation">
      <div className="queen-special-controls">
        <button type="button" onClick={() => setReplayKey((key) => key + 1)}>Replay</button>
        <button type="button" onClick={onClose}>Close</button>
      </div>

      <div key={replayKey} className="queen-special-stage">
        <div className="queen-special-table">
          <div className="queen-vignette" />
          <div className="queen-red-aura" />
          <div className="queen-black-aura" />

          <div className="queen-smoke-layer">
            {smoke.map((puff) => (
              <span
                key={puff.id}
                className="queen-smoke"
                style={{ "--smoke-left": puff.left, "--smoke-delay": puff.delay, "--smoke-scale": puff.scale } as CSSProperties}
              />
            ))}
          </div>

          <div className="queen-spark-layer">
            {sparks.map((spark) => (
              <span
                key={spark.id}
                className="queen-spark"
                style={{ "--spark-angle": spark.angle, "--spark-distance": spark.distance, "--spark-delay": spark.delay } as CSSProperties}
              />
            ))}
          </div>

          <div className="queen-card-wrap">
            <div className="queen-premium-card">
              <span>Q</span>
              <b>♠</b>
              <i>Q</i>
              <em>40</em>
            </div>
          </div>

          <div className="queen-special-copy">Queen of Spades — 40 Points</div>
        </div>
      </div>
    </div>
  );
}
