import { useEffect } from "react";

type Props = {
  onComplete: () => void;
};

export function DrawStockAnimation({ onComplete }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 760);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="draw-stock-animation" aria-label="Drawing from stock">
      <div className="draw-stock-glow" />
      <div className="draw-stock-card">
        <div className="draw-stock-card-face" />
      </div>
      <div className="draw-sound-cue cue-1" />
      <div className="draw-sound-cue cue-2" />
    </div>
  );
}
