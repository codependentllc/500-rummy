import type { CSSProperties } from "react";
import { TARGET_SCORE } from "../game/constants";
import type { Player } from "../game/types";
import { AvatarPhoto } from "./AvatarPhoto";

type Props = {
  winner: Player;
};

const burstCards = ["A♠", "7♥", "Q♣", "10♦", "K♠", "5♥", "J♣"];
const confetti = Array.from({ length: 34 }, (_, index) => ({
  id: index,
  left: 6 + ((index * 17) % 88),
  delay: (index % 12) * 0.13,
  drift: ((index % 7) - 3) * 11,
  spin: index % 2 ? 240 : -220
}));

export function VictoryCelebration({ winner }: Props) {
  return (
    <div className="victory-celebration" aria-label={`${winner.name} wins`}>
      <div className="victory-table-glow" />

      <div className="victory-card-burst" aria-hidden="true">
        {burstCards.map((card, index) => (
          <span key={`${card}-${index}`} style={{ "--burst-index": index } as CSSProperties}>{card}</span>
        ))}
      </div>

      <div className="victory-confetti" aria-hidden="true">
        {confetti.map((piece) => (
          <i
            key={piece.id}
            style={{
              "--confetti-left": `${piece.left}%`,
              "--confetti-delay": `${piece.delay}s`,
              "--confetti-drift": `${piece.drift}px`,
              "--confetti-spin": `${piece.spin}deg`
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="victory-avatar-wrap">
        <AvatarPhoto src={winner.avatar} alt={winner.name} fallback={winner.fallback} size={74} />
      </div>

      <div className="victory-copy">
        <span>Winner!</span>
        <b>First to {TARGET_SCORE}</b>
      </div>
    </div>
  );
}
