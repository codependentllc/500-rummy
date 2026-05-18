import { useState } from "react";
import { motion } from "framer-motion";
import { AVATARS } from "../data/avatars";
import type { PlayerConfig } from "../game/types";
import { ActionButton } from "./ActionButton";
import { AvatarPhoto } from "./AvatarPhoto";
import { BuriedDiscardTutorial } from "./BuriedDiscardTutorial";
import { CinematicTrailer } from "./CinematicTrailer";
import { LayOffAnimation } from "./LayOffAnimation";
import { QueenSpadesAnimation } from "./QueenSpadesAnimation";

type Props = {
  count: number;
  setCount: (count: number) => void;
  configs: PlayerConfig[];
  setConfigs: React.Dispatch<React.SetStateAction<PlayerConfig[]>>;
  onStart: () => void;
};

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function avatarWindow(selectedIndex: number) {
  const offsets = AVATARS.length > 4 ? [-2, -1, 0, 1, 2] : AVATARS.map((_, index) => index - selectedIndex);
  const seen = new Set<string>();

  return offsets
    .map((offset) => {
      const index = wrapIndex(selectedIndex + offset, AVATARS.length);
      return { avatar: AVATARS[index], offset };
    })
    .filter(({ avatar }) => {
      if (seen.has(avatar.id)) return false;
      seen.add(avatar.id);
      return true;
    });
}

export function SetupScreen({ count, setCount, configs, setConfigs, onStart }: Props) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLayoff, setShowLayoff] = useState(false);
  const [showQueenSpades, setShowQueenSpades] = useState(false);

  function updatePlayer(index: number, patch: Partial<PlayerConfig>) {
    setConfigs((prev) => prev.map((player, i) => (i === index ? { ...player, ...patch } : player)));
  }

  function selectAvatar(playerIndex: number, avatarIndex: number) {
    const avatar = AVATARS[wrapIndex(avatarIndex, AVATARS.length)];
    updatePlayer(playerIndex, { avatar: avatar.src, fallback: avatar.fallback });
  }

  function moveAvatar(playerIndex: number, direction: -1 | 1) {
    const currentAvatar = configs[playerIndex]?.avatar;
    const currentIndex = Math.max(0, AVATARS.findIndex((avatar) => avatar.src === currentAvatar));
    selectAvatar(playerIndex, currentIndex + direction);
  }

  return (
    <div className="setup-page">
      <motion.div
        className="setup-card"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div className="setup-logo" initial={{ scale: 0.85, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 18 }}>🃏</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.42 }}>500 Rummy</motion.h1>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.38 }}>Choose names and fictional photo avatars, then deal.</motion.p>
        <motion.div className="setup-utility-actions" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.26 } } }}>
          <motion.button variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" className="trailer-launch" onClick={() => setShowTrailer(true)}>
            Watch Trailer
          </motion.button>
          <motion.button variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" className="trailer-launch tutorial-launch" onClick={() => setShowTutorial(true)}>
            Discard Rule
          </motion.button>
          <motion.button variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" className="trailer-launch layoff-launch" onClick={() => setShowLayoff(true)}>
            Lay Off
          </motion.button>
          <motion.button variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" className="trailer-launch queen-launch" onClick={() => setShowQueenSpades(true)}>
            Q♠ Moment
          </motion.button>
        </motion.div>

        <motion.div className="setup-section" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.35 }}>
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
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.42 } } }}>
        {Array.from({ length: count }, (_, index) => configs[index]).map((player, index) => (
          <motion.div key={index} className="player-config" variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -2, borderColor: "rgba(255, 224, 130, 0.42)" }} transition={{ duration: 0.25 }}>
            <div className="player-config-main">
              <AvatarPhoto src={player.avatar} alt={player.name || `Player ${index + 1}`} fallback={player.fallback || (index === 0 ? "🧑" : "🤖")} size={54} />
              <input
                value={player.name || ""}
                onChange={(event) => updatePlayer(index, { name: event.target.value })}
                placeholder={index === 0 ? "Your name" : `Computer ${index} name`}
              />
              <span>{index === 0 ? "You" : "CPU"}</span>
            </div>

            <div className="avatar-carousel" aria-label={`${player.name || `Player ${index + 1}`} avatar carousel`}>
              <button type="button" className="avatar-carousel-nav" aria-label="Previous avatar" onClick={() => moveAvatar(index, -1)}>
                ‹
              </button>
              <div className="avatar-carousel-track">
              {avatarWindow(Math.max(0, AVATARS.findIndex((avatar) => avatar.src === player.avatar))).map(({ avatar, offset }) => (
                <motion.button
                  key={avatar.id}
                  type="button"
                  title={avatar.name}
                  aria-label={`Choose ${avatar.name}`}
                  onClick={() => selectAvatar(index, AVATARS.findIndex((item) => item.id === avatar.id))}
                  className={player.avatar === avatar.src ? "avatar-choice selected" : "avatar-choice"}
                  data-offset={offset}
                  whileHover={{ y: -3, scale: offset === 0 ? 1.04 : 1.02 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 480, damping: 28 }}
                >
                  <AvatarPhoto src={avatar.src} alt={avatar.name} fallback={avatar.fallback} size={46} />
                  <small>{avatar.name}</small>
                </motion.button>
              ))}
              </div>
              <button type="button" className="avatar-carousel-nav" aria-label="Next avatar" onClick={() => moveAvatar(index, 1)}>
                ›
              </button>
            </div>
          </motion.div>
        ))}
        </motion.div>

        <ActionButton onClick={onStart} style={{ width: "100%", background: "#1a472a", color: "#fff", padding: 14, fontSize: 16, marginTop: 8 }}>
          Deal Cards ♠
        </ActionButton>
      </motion.div>

      {showTrailer ? <CinematicTrailer onClose={() => setShowTrailer(false)} /> : null}
      {showTutorial ? <BuriedDiscardTutorial onClose={() => setShowTutorial(false)} /> : null}
      {showLayoff ? <LayOffAnimation onClose={() => setShowLayoff(false)} /> : null}
      {showQueenSpades ? <QueenSpadesAnimation onClose={() => setShowQueenSpades(false)} /> : null}
    </div>
  );
}
