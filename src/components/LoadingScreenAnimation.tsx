import type { CSSProperties } from "react";

type Props = {
  onClose: () => void;
};

const loadingCards = Array.from({ length: 15 }, (_, index) => index);
const cardPositions = [
  [-92, -62],
  [-46, -62],
  [0, -62],
  [46, -62],
  [92, -62],
  [-92, 0],
  [-92, 62],
  [-46, 62],
  [0, 62],
  [46, 62],
  [92, 62],
  [92, 0],
  [-18, 0],
  [28, 0],
  [0, -18]
];
const sparkles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  x: 12 + ((index * 23) % 76),
  y: 18 + ((index * 19) % 62),
  delay: (index % 9) * 0.18
}));

export function LoadingScreenAnimation({ onClose }: Props) {
  return (
    <div className="loading-screen-overlay" role="dialog" aria-modal="true" aria-label="500 Rummy loading animation">
      <div className="loading-screen-controls">
        <button type="button" onClick={onClose}>Close</button>
      </div>

      <div className="loading-screen-stage">
        <div className="loading-screen-felt" />
        <div className="loading-screen-light" />

        <div className="loading-sparkles" aria-hidden="true">
          {sparkles.map((sparkle) => (
            <i
              key={sparkle.id}
              style={{
                "--sparkle-x": `${sparkle.x}%`,
                "--sparkle-y": `${sparkle.y}%`,
                "--sparkle-delay": `${sparkle.delay}s`
              } as CSSProperties}
            />
          ))}
        </div>

        <div className="loading-card-field" aria-hidden="true">
          {loadingCards.map((card) => (
            <span
              key={card}
              style={{
                "--loading-card": card,
                "--loading-five-x": `${cardPositions[card][0]}px`,
                "--loading-five-y": `${cardPositions[card][1]}px`,
                "--loading-shuffle-y": `${((card % 5) - 2) * 7}px`
              } as CSSProperties}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
