import type { GameState } from "../game/types";
import { ActionButton } from "./ActionButton";

type Props = {
  state: GameState;
  onNextHand: () => void;
  onNewGame: () => void;
  onExit: () => void;
};

export function EndHandModal({ state, onNextHand, onNewGame, onExit }: Props) {
  if (!state.handOver) return null;

  return (
    <div className="modal-backdrop">
      <div className="end-modal">
        <h2>{state.winner ? "🏆 Game Over" : "Hand Complete"}</h2>
        {state.scoring?.map((row) => (
          <div key={row.playerId} className="score-row">
            <b>{row.name}</b>
            <div>Melded +{row.table} · In hand -{row.hand} · Net {row.net}</div>
          </div>
        ))}

        <div className="modal-actions">
          {state.winner ? (
            <ActionButton onClick={onNewGame} style={{ flex: 1, background: "#1a472a", color: "#fff" }}>New Game</ActionButton>
          ) : (
            <ActionButton onClick={onNextHand} style={{ flex: 1, background: "#1a472a", color: "#fff" }}>Next Hand</ActionButton>
          )}
          <ActionButton onClick={onExit} style={{ flex: 1, background: "#eee", color: "#1a472a" }}>Names / Exit</ActionButton>
        </div>
      </div>
    </div>
  );
}
