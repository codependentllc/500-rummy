import { useState } from "react";
import { motion } from "framer-motion";
import { AVATARS } from "../data/avatars";
import type { CardBackStyle, TableTheme } from "../App";
import type { PlayerConfig } from "../game/types";
import { ActionButton } from "./ActionButton";
import { AvatarPhoto } from "./AvatarPhoto";
import { BuriedDiscardTutorial } from "./BuriedDiscardTutorial";
import { CinematicTrailer } from "./CinematicTrailer";
import { LayOffAnimation } from "./LayOffAnimation";
import { OnlineLobbyScreen } from "./OnlineLobbyScreen";
import { QueenDiscardWarningAnimation } from "./QueenDiscardWarningAnimation";
import { QueenSpadesAnimation } from "./QueenSpadesAnimation";
import { WaitingRoomAnimation } from "./WaitingRoomAnimation";

type Props = {
  count: number;
  setCount: (count: number) => void;
  configs: PlayerConfig[];
  setConfigs: React.Dispatch<React.SetStateAction<PlayerConfig[]>>;
  tableTheme: TableTheme;
  setTableTheme: (theme: TableTheme) => void;
  cardBack: CardBackStyle;
  setCardBack: (cardBack: CardBackStyle) => void;
  onStart: () => void;
};

const TABLE_THEMES: Array<{ id: TableTheme; name: string; detail: string }> = [
  { id: "classic", name: "Classic Green Felt", detail: "Traditional card room" },
  { id: "casino", name: "Dark Casino", detail: "Moody velvet lighting" },
  { id: "wood", name: "Warm Wood Table", detail: "Polished walnut surface" },
  { id: "luxury", name: "Black-and-Gold Luxury", detail: "High-roller finish" },
  { id: "neon", name: "Neon Arcade", detail: "Modern electric glow" },
  { id: "coffee", name: "Cozy Coffee Shop", detail: "Soft tabletop ambience" }
];

const CARD_BACKS: Array<{ id: CardBackStyle; name: string }> = [
  { id: "red", name: "Classic Red" },
  { id: "blue", name: "Classic Blue" },
  { id: "gold", name: "Gold Pattern" },
  { id: "black", name: "Black Luxury" },
  { id: "green", name: "Green Felt" },
  { id: "purple", name: "Neon Purple" },
  { id: "wood", name: "Wood Grain" },
  { id: "marble", name: "Marble" }
];

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

function themeWindow(selectedIndex: number) {
  return [-1, 0, 1].map((offset) => {
    const index = wrapIndex(selectedIndex + offset, TABLE_THEMES.length);
    return { theme: TABLE_THEMES[index], offset };
  });
}

function cardBackWindow(selectedIndex: number) {
  return [-1, 0, 1, 2].map((offset) => {
    const index = wrapIndex(selectedIndex + offset, CARD_BACKS.length);
    return { back: CARD_BACKS[index], offset };
  });
}

export function SetupScreen({ count, setCount, configs, setConfigs, tableTheme, setTableTheme, cardBack, setCardBack, onStart }: Props) {
  const [actionMenu, setActionMenu] = useState<"lobby" | "instructions" | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLayoff, setShowLayoff] = useState(false);
  const [showLobby, setShowLobby] = useState(false);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [showQueenWarning, setShowQueenWarning] = useState(false);
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

  const activeThemeIndex = Math.max(0, TABLE_THEMES.findIndex((theme) => theme.id === tableTheme));
  const activeCardBackIndex = Math.max(0, CARD_BACKS.findIndex((back) => back.id === cardBack));

  function moveTableTheme(direction: -1 | 1) {
    setTableTheme(TABLE_THEMES[wrapIndex(activeThemeIndex + direction, TABLE_THEMES.length)].id);
  }

  function moveCardBack(direction: -1 | 1) {
    setCardBack(CARD_BACKS[wrapIndex(activeCardBackIndex + direction, CARD_BACKS.length)].id);
  }

  return (
    <div className={`setup-page table-theme-${tableTheme} card-back-${cardBack}`}>
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
          <motion.button variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" className="setup-action-primary trailer-launch" onClick={() => setShowTrailer(true)}>
            Trailer
          </motion.button>

          <motion.button
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            className={actionMenu === "lobby" ? "setup-action-primary lobby-launch active" : "setup-action-primary lobby-launch"}
            onClick={() => setActionMenu((menu) => (menu === "lobby" ? null : "lobby"))}
          >
            Lobby
          </motion.button>

          <motion.button
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            className={actionMenu === "instructions" ? "setup-action-primary tutorial-launch active" : "setup-action-primary tutorial-launch"}
            onClick={() => setActionMenu((menu) => (menu === "instructions" ? null : "instructions"))}
          >
            Instructions
          </motion.button>
        </motion.div>
        {actionMenu ? (
          <motion.div
            key={actionMenu}
            className="setup-action-submenu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            {actionMenu === "lobby" ? (
              <>
                <button type="button" className="setup-subaction lobby-launch" onClick={() => { setShowLobby(true); setActionMenu(null); }}>
                  Multiplayer Lobby
                </button>
                <button type="button" className="setup-subaction waiting-launch" onClick={() => { setShowWaitingRoom(true); setActionMenu(null); }}>
                  Waiting Room
                </button>
              </>
            ) : (
              <>
                <button type="button" className="setup-subaction tutorial-launch" onClick={() => { setShowTutorial(true); setActionMenu(null); }}>
                  Discard Rule
                </button>
                <button type="button" className="setup-subaction layoff-launch" onClick={() => { setShowLayoff(true); setActionMenu(null); }}>
                  Lay Off
                </button>
                <button type="button" className="setup-subaction queen-launch" onClick={() => { setShowQueenSpades(true); setActionMenu(null); }}>
                  Q♠ Moment
                </button>
                <button type="button" className="setup-subaction queen-warning-launch" onClick={() => { setShowQueenWarning(true); setActionMenu(null); }}>
                  Q♠ Warning
                </button>
              </>
            )}
          </motion.div>
        ) : null}

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

        <motion.div className="setup-section table-theme-section" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.35 }}>
          <b>Table Theme</b>
          <div className="selection-carousel table-theme-carousel" aria-label="Table theme selection">
            <button type="button" className="selection-carousel-nav" aria-label="Previous table theme" onClick={() => moveTableTheme(-1)}>
              ‹
            </button>
            <div className="theme-carousel-track">
              {themeWindow(activeThemeIndex).map(({ theme, offset }) => (
                <motion.button
                  key={`${theme.id}-${offset}`}
                  type="button"
                  className={theme.id === tableTheme ? `selection-carousel-card table-theme-tile ${theme.id} selected` : `selection-carousel-card table-theme-tile ${theme.id}`}
                  data-offset={offset}
                  onClick={() => setTableTheme(theme.id)}
                  initial={{ opacity: 0, x: offset * 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.24 }}
                  whileHover={{ y: -2, scale: offset === 0 ? 1.01 : 1.005 }}
                  whileTap={{ scale: 0.985 }}
                >
                  <span className="theme-table-preview">
                    <i className="theme-card card-one">A♠</i>
                    <i className="theme-card card-two">7♥</i>
                    <i className="theme-card card-three">Q♣</i>
                  </span>
                  <span className="theme-tile-copy">
                    <strong>{theme.name}</strong>
                    <small>{theme.detail}</small>
                  </span>
                </motion.button>
              ))}
            </div>
            <button type="button" className="selection-carousel-nav" aria-label="Next table theme" onClick={() => moveTableTheme(1)}>
              ›
            </button>
          </div>
          <div className="selection-dots" aria-label="Choose table theme">
            {TABLE_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className={theme.id === tableTheme ? "selection-dot selected" : "selection-dot"}
                aria-label={`Choose ${theme.name}`}
                onClick={() => setTableTheme(theme.id)}
              />
            ))}
          </div>
        </motion.div>

        <motion.div className="setup-section card-back-section" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.35 }}>
          <b>Card Backs</b>
          <div className="selection-carousel card-back-carousel" aria-label="Card back selection">
            <button type="button" className="selection-carousel-nav" aria-label="Previous card back" onClick={() => moveCardBack(-1)}>
              ‹
            </button>
            <div className="card-back-carousel-track">
              {cardBackWindow(activeCardBackIndex).map(({ back, offset }) => (
                <motion.button
                  key={`${back.id}-${offset}`}
                  type="button"
                  className={back.id === cardBack ? `selection-carousel-card card-back-tile card-back-${back.id} selected` : `selection-carousel-card card-back-tile card-back-${back.id}`}
                  data-offset={offset}
                  onClick={() => setCardBack(back.id)}
                  initial={{ opacity: 0, x: offset * 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.24 }}
                  whileHover={{ y: -2, scale: offset === 0 ? 1.01 : 1.005 }}
                  whileTap={{ scale: 0.985 }}
                >
                  <span className="card-back-preview card-back-face" />
                  <strong>{back.name}</strong>
                </motion.button>
              ))}
            </div>
            <button type="button" className="selection-carousel-nav" aria-label="Next card back" onClick={() => moveCardBack(1)}>
              ›
            </button>
          </div>
          <div className="selection-dots" aria-label="Choose card back">
            {CARD_BACKS.map((back) => (
              <button
                key={back.id}
                type="button"
                className={back.id === cardBack ? "selection-dot selected" : "selection-dot"}
                aria-label={`Choose ${back.name}`}
                onClick={() => setCardBack(back.id)}
              />
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
      {showLobby ? <OnlineLobbyScreen players={configs} count={count} onClose={() => setShowLobby(false)} onPlayComputer={onStart} /> : null}
      {showWaitingRoom ? <WaitingRoomAnimation onClose={() => setShowWaitingRoom(false)} /> : null}
      {showTutorial ? <BuriedDiscardTutorial onClose={() => setShowTutorial(false)} /> : null}
      {showLayoff ? <LayOffAnimation onClose={() => setShowLayoff(false)} /> : null}
      {showQueenWarning ? <QueenDiscardWarningAnimation onClose={() => setShowQueenWarning(false)} /> : null}
      {showQueenSpades ? <QueenSpadesAnimation onClose={() => setShowQueenSpades(false)} /> : null}
    </div>
  );
}
