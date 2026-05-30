import type { OpponentSetup, PlayerSetup, SeatConfig } from "@/types/rummy";
import { SeatEditor } from "./SeatEditor";
import { SetupFrame } from "./SetupFrame";

type Props = {
  player: PlayerSetup;
  opponentCount: number;
  opponents: OpponentSetup[];
  onCountChange: (count: number) => void;
  onOpponentChange: (opponent: OpponentSetup) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function OpponentSetupScreen({ player, opponentCount, opponents, onCountChange, onOpponentChange, onBack, onContinue }: Props) {
  return (
    <SetupFrame title="Choose Opponents" subtitle="Set the table with one to three rivals.">
      <div className="setup-card setup-scroll-card">
        <div className="label">Opponents</div>
        <div className="counts">
          {[1, 2, 3].map((count) => <button key={count} className={`count ${count === opponentCount ? "active" : ""}`} type="button" onClick={() => onCountChange(count)}>{count}</button>)}
        </div>
        <div className="seat-grid">
          {opponents.slice(0, opponentCount).map((opponent, index) => {
            const seat: SeatConfig = { avatarId: opponent.avatarId, name: opponent.displayName };
            const excluded = [player.avatarId, ...opponents.filter((candidate) => candidate.id !== opponent.id).map((candidate) => candidate.avatarId)];
            return <SeatEditor key={opponent.id} label={`Opponent ${index + 1}`} seat={seat} excludedAvatarIds={excluded} onChange={(next) => onOpponentChange({ ...opponent, avatarId: next.avatarId, displayName: next.name })} />;
          })}
        </div>
      </div>
      <div className="setup-actions"><button className="setup-back" type="button" onClick={onBack}>Back</button><button className="start" type="button" onClick={onContinue}>Continue</button></div>
    </SetupFrame>
  );
}
