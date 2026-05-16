import { useState, type CSSProperties } from "react";
import { AVATARS } from "../data/avatars";
import { AvatarPhoto } from "./AvatarPhoto";

type Props = {
  onClose: () => void;
};

const dealCards = [
  { label: "7", suit: "♦", x: "-34vw", y: "-22vh", rot: "-16deg" },
  { label: "K", suit: "♣", x: "32vw", y: "-21vh", rot: "14deg" },
  { label: "9", suit: "♥", x: "-35vw", y: "20vh", rot: "11deg" },
  { label: "A", suit: "♣", x: "33vw", y: "19vh", rot: "-13deg" }
];

const runCards = [
  { label: "3", suit: "♠", rot: "-8deg" },
  { label: "4", suit: "♠", rot: "0deg" },
  { label: "5", suit: "♠", rot: "8deg" }
];

export function CinematicTrailer({ onClose }: Props) {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="trailer-overlay" role="dialog" aria-modal="true" aria-label="500 Rummy cinematic trailer">
      <div className="trailer-controls">
        <button type="button" onClick={() => setReplayKey((key) => key + 1)}>Replay</button>
        <button type="button" onClick={onClose}>Close</button>
      </div>

      <div key={replayKey} className="trailer-stage">
        <div className="trailer-camera">
          <div className="trailer-table">
            <div className="trailer-light" />

            <div className="trailer-deck">
              <div className="card-back stacked one" />
              <div className="card-back stacked two" />
              <div className="card-back stacked three" />
            </div>

            <div className="trailer-avatars">
              {AVATARS.slice(0, 4).map((avatar, index) => (
                <div key={avatar.id} className={`trailer-avatar avatar-${index + 1}`}>
                  <AvatarPhoto src={avatar.src} alt={avatar.name} fallback={avatar.fallback} size={58} />
                  <span>{index === 0 ? "You" : avatar.name}</span>
                </div>
              ))}
            </div>

            <div className="trailer-deal-layer">
              {dealCards.map((card, index) => (
                <div
                  key={`${card.label}${card.suit}`}
                  className={`trailer-card deal-card ${card.suit === "♥" || card.suit === "♦" ? "red" : ""}`}
                  style={{
                    "--deal-delay": `${2 + index * 0.22}s`,
                    "--tx": card.x,
                    "--ty": card.y,
                    "--rot": card.rot
                  } as CSSProperties}
                >
                  <span>{card.label}</span>
                  <b>{card.suit}</b>
                </div>
              ))}
            </div>

            <div className="discard-glow">
              <div className="card-back mini" />
              <div className="trailer-card mini red"><span>8</span><b>♥</b></div>
            </div>

            <div className="selection-ring" />

            <div className="run-row">
              {runCards.map((card, index) => (
                <div
                  key={`${card.label}${card.suit}`}
                  className="trailer-card run-card"
                  style={{ "--run-delay": `${7.6 + index * 0.25}s`, "--rot": card.rot } as CSSProperties}
                >
                  <span>{card.label}</span>
                  <b>{card.suit}</b>
                </div>
              ))}
            </div>

            <div className="queen-highlight">
              <div className="trailer-card queen-card">
                <span>Q</span>
                <b>♠</b>
              </div>
              <div className="queen-copy">Queen of Spades: 40 Points</div>
            </div>

            <div className="trailer-title">
              <span>500 Rummy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
