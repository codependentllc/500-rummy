import { AvatarCarousel } from "./AvatarCarousel";
import { BrandHeader } from "./BrandHeader";

type Props = {
  avatarId: string;
  playerName: string;
  onAvatarChange: (id: string) => void;
  onNameChange: (name: string) => void;
  onContinue: () => void;
};

export function WelcomeScreen({ avatarId, playerName, onAvatarChange, onNameChange, onContinue }: Props) {
  return (
    <section id="welcome" className="screen active">
      <BrandHeader />
      <div><h1>500 Rummy</h1><p className="sub">Choose your avatar</p></div>
      <div className="avatar-card-wrap">
        <div className="label">Fictional Players</div>
        <AvatarCarousel selectedId={avatarId} onChange={onAvatarChange} />
        <div className="name-editor">
          <label htmlFor="playerName">Player Name</label>
          <input id="playerName" maxLength={18} value={playerName} onChange={(event) => onNameChange(event.target.value)} />
        </div>
      </div>
      <button className="start" type="button" onClick={onContinue}>Continue</button>
    </section>
  );
}
