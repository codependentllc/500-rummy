import type { Player } from "../game/types";
import { AvatarPhoto } from "./AvatarPhoto";

type Props = {
  players: Player[];
  turn: number;
  handOver: boolean;
};

export function ScorePanel({ players, turn, handOver }: Props) {
  return (
    <div className="score-panel">
      {players.map((player) => (
        <div key={player.id} className={turn === player.id && !handOver ? "score-card active" : "score-card"}>
          <div className="score-avatar">
            <AvatarPhoto src={player.avatar} alt={player.name} fallback={player.fallback || (player.isAI ? "🤖" : "🧑")} size={42} />
          </div>
          <div className="score-name">{player.name}</div>
          <div className="score-value">{player.score}</div>
          <div className="score-meta">{player.hand.length} cards</div>
        </div>
      ))}
    </div>
  );
}
