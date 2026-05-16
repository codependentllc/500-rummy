import { useState } from "react";
import { AVATARS } from "../data/avatars";
import type { PlayerConfig } from "../game/types";
import { ActionButton } from "./ActionButton";
import { AvatarPhoto } from "./AvatarPhoto";
import { CinematicTrailer } from "./CinematicTrailer";

type Props = {
  count: number;
  setCount: (count: number) => void;
  configs: PlayerConfig[];
  setConfigs: React.Dispatch<React.SetStateAction<PlayerConfig[]>>;
  onStart: () => void;
};

export function SetupScreen({ count, setCount, configs, setConfigs, onStart }: Props) {
  const [showTrailer, setShowTrailer] = useState(false);

  function updatePlayer(index: number, patch: Partial<PlayerConfig>) {
    setConfigs((prev) => prev.map((player, i) => (i === index ? { ...player, ...patch } : player)));
  }

  return (
    <div className="setup-page">
      <div className="setup-card">
        <div className="setup-logo">🃏</div>
        <h1>500 Rummy</h1>
        <p>Choose names and fictional photo avatars, then deal.</p>
        <button type="button" className="trailer-launch" onClick={() => setShowTrailer(true)}>
          Watch Trailer
        </button>

        <div className="setup-section">
          <b>Players</b>
          <div className="player-count-row">
            {[2, 3, 4].map((number) => (
              <ActionButton
                key={number}
                onClick={() => setCount(number)}
                style={{
                  flex: 1,
                  background: count === number ? "#1a472a" : "#f2f2f2",
                  color: count === number ? "#fff" : "#1a472a",
                  border: "1px solid #ddd"
                }}
              >
                {number}
              </ActionButton>
            ))}
          </div>
        </div>

        {Array.from({ length: count }, (_, index) => configs[index]).map((player, index) => (
          <div key={index} className="player-config">
            <div className="player-config-main">
              <AvatarPhoto src={player.avatar} alt={player.name || `Player ${index + 1}`} fallback={player.fallback || (index === 0 ? "🧑" : "🤖")} size={54} />
              <input
                value={player.name || ""}
                onChange={(event) => updatePlayer(index, { name: event.target.value })}
                placeholder={index === 0 ? "Your name" : `Computer ${index} name`}
              />
              <span>{index === 0 ? "You" : "CPU"}</span>
            </div>

            <div className="avatar-grid">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  title={avatar.name}
                  onClick={() => updatePlayer(index, { avatar: avatar.src, fallback: avatar.fallback })}
                  className={player.avatar === avatar.src ? "avatar-choice selected" : "avatar-choice"}
                >
                  <AvatarPhoto src={avatar.src} alt={avatar.name} fallback={avatar.fallback} size={46} />
                  <small>{avatar.name}</small>
                </button>
              ))}
            </div>
          </div>
        ))}

        <ActionButton onClick={onStart} style={{ width: "100%", background: "#1a472a", color: "#fff", padding: 14, fontSize: 16, marginTop: 8 }}>
          Deal Cards ♠
        </ActionButton>
      </div>

      {showTrailer ? <CinematicTrailer onClose={() => setShowTrailer(false)} /> : null}
    </div>
  );
}
