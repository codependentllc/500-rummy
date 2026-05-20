import { useEffect } from "react";
import type { CSSProperties } from "react";
import { DEAL_COUNT } from "../game/constants";
import { playSound } from "../utils/audio";

type Props = {
  playerCount: number;
  onComplete: () => void;
};

const positions = [
  { x: -6, y: 34, rot: -4 },
  { x: -34, y: -24, rot: -12 },
  { x: 34, y: -24, rot: 12 },
  { x: 36, y: 16, rot: 7 }
];

export function DealSequence({ playerCount, onComplete }: Props) {
  const cards = Array.from({ length: playerCount * DEAL_COUNT }, (_, index) => {
    const playerIndex = index % playerCount;
    const round = Math.floor(index / playerCount);
    const position = positions[playerIndex];
    const handOffset = (round - (DEAL_COUNT - 1) / 2) * 2.7;
    const tx = position.x + handOffset;
    const ty = position.y + Math.abs(handOffset) * 0.2;

    return {
      id: index,
      tx,
      ty,
      mx: tx * 0.48,
      my: ty * 0.46 - 12,
      rot: position.rot + (round - 3) * 2,
      delay: index * 82
    };
  });

  useEffect(() => {
    playSound("/sounds/shuffle-square-deal-sequence.wav", 0.62);
    const lastDelay = cards[cards.length - 1]?.delay || 0;
    const timer = window.setTimeout(onComplete, lastDelay + 760);
    return () => window.clearTimeout(timer);
  }, [cards, onComplete]);

  return (
    <div className="deal-sequence" aria-label="Dealing cards">
      <div className="deal-table-light" />
      <div className="deal-center-deck">
        <div className="deal-deck-card card-1" />
        <div className="deal-deck-card card-2" />
        <div className="deal-deck-card card-3" />
      </div>

      <div className="deal-player-target target-1">You</div>
      <div className="deal-player-target target-2">CPU</div>
      {playerCount >= 3 ? <div className="deal-player-target target-3">CPU</div> : null}
      {playerCount >= 4 ? <div className="deal-player-target target-4">CPU</div> : null}

      {cards.map((card) => (
        <div
          key={card.id}
          className="deal-fly-card"
          style={{
            "--tx": `${card.tx}vw`,
            "--ty": `${card.ty}vh`,
            "--mx": `${card.mx}vw`,
            "--my": `${card.my}vh`,
            "--rot": `${card.rot}deg`,
            animationDelay: `${card.delay}ms`
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
