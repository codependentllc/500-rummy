import { useState } from "react";
import { motion } from "framer-motion";
import { AVATARS } from "../data/avatars";
import type { PlayerConfig } from "../game/types";
import { ActionButton } from "./ActionButton";
import { AvatarPhoto } from "./AvatarPhoto";
import { BuriedDiscardTutorial } from "./BuriedDiscardTutorial";
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
  const [showTutorial, setShowTutorial] = useState(false);

  function updatePlayer(index: number, patch: Partial<PlayerConfig>) {
    setConfigs((prev) => prev.map((player, i) => (i === index ? { ...player, ...patch } : player)));
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

            <div className="avatar-grid">
              {AVATARS.map((avatar) => (
                <motion.button
                  key={avatar.id}
                  type="button"
                  title={avatar.name}
                  onClick={() => updatePlayer(index, { avatar: avatar.src, fallback: avatar.fallback })}
                  className={player.avatar === avatar.src ? "avatar-choice selected" : "avatar-choice"}
                  whileHover={{ y: -3, scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 480, damping: 28 }}
                >
                  <AvatarPhoto src={avatar.src} alt={avatar.name} fallback={avatar.fallback} size={46} />
                  <small>{avatar.name}</small>
                </motion.button>
              ))}
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
    </div>
  );
}
