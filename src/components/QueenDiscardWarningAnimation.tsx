import { useState } from "react";

type Props = {
  onClose: () => void;
};

export function QueenDiscardWarningAnimation({ onClose }: Props) {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="queen-warning-overlay" role="dialog" aria-modal="true" aria-label="Queen of Spades discard warning animation">
      <div className="queen-warning-controls">
        <button type="button" onClick={() => setReplayKey((key) => key + 1)}>Replay</button>
        <button type="button" onClick={onClose}>Close</button>
      </div>

      <div key={replayKey} className="queen-warning-stage">
        <div className="queen-warning-table">
          <div className="queen-warning-dim" />

          <div className="queen-warning-discard-area">
            <div className="queen-warning-pile-label">Discard Pile</div>
            <div className="queen-warning-pile">
              <div className="queen-warning-card-back back-one" />
              <div className="queen-warning-card-back back-two" />
              <div className="queen-warning-card">
                <span>Q</span>
                <b>♠</b>
                <i>Q</i>
              </div>
            </div>
          </div>

          <div className="queen-warning-label">High Value Card: 40 Points</div>
        </div>
      </div>
    </div>
  );
}
