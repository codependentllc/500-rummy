import type { PlayerSetup } from "@/types/rummy";
import { AvatarCarousel } from "./AvatarCarousel";
import { SetupFrame } from "./SetupFrame";

type Props = {
  player: PlayerSetup;
  onChange: (player: PlayerSetup) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function PlayerSetupScreen({ player, onChange, onBack, onContinue }: Props) {
  return (
    <SetupFrame title="Choose Your Player" subtitle="Pick your avatar and table name.">
      <div className="avatar-card-wrap">
        <div className="label">Fictional Players</div>
        <AvatarCarousel selectedId={player.avatarId} onChange={(avatarId) => onChange({ ...player, avatarId })} />
        <div className="name-editor">
          <label htmlFor="playerName">Player Name</label>
          <input id="playerName" maxLength={18} value={player.displayName} onChange={(event) => onChange({ ...player, displayName: event.target.value })} />
        </div>
      </div>
      <div className="setup-actions"><button className="setup-back" type="button" onClick={onBack}>Back</button><button className="start" type="button" onClick={onContinue}>Continue</button></div>
    </SetupFrame>
  );
}
