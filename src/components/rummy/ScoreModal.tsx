import type { CSSProperties } from "react";
import type { GameState } from "@/types/rummy";
import { AvatarImage } from "./AvatarImage";

type Props = {
  game: GameState;
  onNextHand: () => void;
  onNewGame: () => void;
};

const CONFETTI = Array.from({ length: 30 }, (_, index) => index);

export function ScoreModal({ game, onNextHand, onNewGame }: Props) {
  const winner = game.players.find((player) => player.id === game.scoreResult?.winnerId);
  const isGameOver = Boolean(game.scoreResult?.isGameOver && winner);

  return (
    <div className={`overlay ${game.handOver ? "active" : ""}`}>
      {isGameOver ? <div className="confetti" aria-hidden="true">{CONFETTI.map((index) => <i key={index} style={{ "--confetti-index": index, left: `${(index * 37) % 100}%`, animationDelay: `${(index % 8) * 80}ms` } as CSSProperties} />)}</div> : null}
      <div className={`modal ${isGameOver ? "game-over-modal" : ""}`}>
        <h2>{isGameOver ? "Game Over" : "Hand Complete"}</h2>
        {winner ? <div className="winner-summary"><span className="winner-avatar"><AvatarImage src={winner.avatarImage} name={winner.avatarName} /></span><strong>{winner.id === 0 ? "You won the game!" : `${winner.name} wins the game!`}</strong><span>{winner.name} · {winner.score} pts</span></div> : null}
        {game.players.map((player) => (
          <div className="score-row" key={player.id}>
            <div className="score-left"><span className="avatar"><AvatarImage src={player.avatarImage} name={player.avatarName} /></span><b>{player.name}</b></div>
            <span>{game.scoreResult ? `${game.scoreResult.handScores[player.id] >= 0 ? "+" : ""}${game.scoreResult.handScores[player.id]} · ` : ""}{player.score}</span>
          </div>
        ))}
        <button className="start modal-action" type="button" onClick={isGameOver ? onNewGame : onNextHand}>{isGameOver ? "New Game" : "Next Hand"}</button>
      </div>
    </div>
  );
}
