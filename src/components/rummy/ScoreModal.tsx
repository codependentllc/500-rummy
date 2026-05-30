import type { GameState } from "@/types/rummy";
import { AvatarImage } from "./AvatarImage";

type Props = {
  game: GameState;
  onNextHand: () => void;
};

export function ScoreModal({ game, onNextHand }: Props) {
  return (
    <div className={`overlay ${game.handOver ? "active" : ""}`}>
      <div className="modal">
        <h2>Hand Complete</h2>
        {game.players.map((player) => (
          <div className="score-row" key={player.id}>
            <div className="score-left"><span className="avatar"><AvatarImage src={player.avatarImage} name={player.avatarName} /></span><b>{player.name}</b></div>
            <span>{player.score}</span>
          </div>
        ))}
        <button className="start modal-action" type="button" onClick={onNextHand}>Next Hand</button>
      </div>
    </div>
  );
}
