import { useState, type TouchEvent } from "react";
import { motion } from "framer-motion";
import { AVATARS } from "../data/avatars";
import type { CardBackStyle, TableTheme } from "../App";
import type { PlayerConfig } from "../game/types";
import { ActionButton } from "./ActionButton";
import { AvatarPhoto } from "./AvatarPhoto";
import { BuriedDiscardTutorial } from "./BuriedDiscardTutorial";
import { CinematicTrailer } from "./CinematicTrailer";
import { LayOffAnimation } from "./LayOffAnimation";
import { LoadingScreenAnimation } from "./LoadingScreenAnimation";
import { MenuLoopBackground } from "./MenuLoopBackground";
import { MobileGameplayPreview } from "./MobileGameplayPreview";
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
  return [-1, 0, 1].map((offset) => {
    const index = wrapIndex(selectedIndex + offset, CARD_BACKS.length);
    return { back: CARD_BACKS[index], offset };
  });
}

const PLAYER_COUNTS = [2, 3, 4];

function playerCountWindow(selectedCount: number) {
  const selectedIndex = Math.max(0, PLAYER_COUNTS.findIndex((playerCount) => playerCount === selectedCount));
  return [-1, 0, 1].map((offset) => {
    const index = wrapIndex(selectedIndex + offset, PLAYER_COUNTS.length);
    return { playerCount: PLAYER_COUNTS[index], offset };
  });
}

export function SetupScreen({ count, setCount, configs, setConfigs, tableTheme, setTableTheme, cardBack, setCardBack, onStart }: Props) {
  const [actionMenu, setActionMenu] = useState<"lobby" | "instructions" | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLayoff, setShowLayoff] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showLobby, setShowLobby] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [showQueenWarning, setShowQueenWarning] = useState(false);
  const [showQueenSpades, setShowQueenSpades] = useState(false);
  const [swipeStart, setSwipeStart] = useState<number | null>(null);

  function updatePlayer(index: number, patch: Partial<PlayerConfig>) {
    setConfigs((prev) => prev.map((player, i) => (i === index ? { ...player, ...patch } : player)));
  }

  function isAutoName(playerIndex: number, name: string | undefined) {
    if (!name) return true;
    if (name === `Computer ${playerIndex}` || name === `Player ${playerIndex + 1}` || name === "You") return true;
    return AVATARS.some((avatar) => avatar.name === name);
  }

  function selectAvatar(playerIndex: number, avatarIndex: number) {
    const avatar = AVATARS[wrapIndex(avatarIndex, AVATARS.length)];
    const player = configs[playerIndex];
    updatePlayer(playerIndex, {
      avatar: avatar.src,
      fallback: avatar.fallback,
      ...(!player?.nameEdited && isAutoName(playerIndex, player?.name) ? { name: avatar.name } : {})
    });
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

  function movePlayerCount(direction: -1 | 1) {
    const activePlayerIndex = Math.max(0, PLAYER_COUNTS.findIndex((playerCount) => playerCount === count));
    setCount(PLAYER_COUNTS[wrapIndex(activePlayerIndex + direction, PLAYER_COUNTS.length)]);
  }

  function finishSwipe(event: TouchEvent, onPrevious: () => void, onNext: () => void) {
    if (swipeStart === null) return;
    const swipeEnd = event.changedTouches[0]?.clientX ?? swipeStart;
    const delta = swipeEnd - swipeStart;
    setSwipeStart(null);

    if (Math.abs(delta) < 34) return;
    if (delta > 0) onPrevious();
    else onNext();
  }

  return (
    <div className={`setup-page table-theme-${tableTheme} card-back-${cardBack}`}>
      <MenuLoopBackground />
      <motion.div
        className="setup-card"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="welcome-mobile-nav">
          <button type="button" className="welcome-menu-button" aria-label="Open setup menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>
            ☰
          </button>
          <strong>500 Rummy</strong>
          <button type="button" className="welcome-deal-button" onClick={onStart}>
            Deal
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="welcome-mobile-menu" aria-label="Setup menu">
            <button type="button" onClick={() => { setShowTrailer(true); setMobileMenuOpen(false); }}>Trailer</button>
            <button type="button" onClick={() => { setShowLobby(true); setMobileMenuOpen(false); }}>Lobby</button>
            <button type="button" onClick={() => { setShowTutorial(true); setMobileMenuOpen(false); }}>Instructions</button>
            <button type="button" onClick={() => setMobileMenuOpen(false)}>Settings</button>
            <button type="button" onClick={() => setMobileMenuOpen(false)}>About</button>
          </div>
        ) : null}

        <motion.div className="setup-logo" initial={{ scale: 0.85, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 18 }}>🃏</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.42 }}>500 Rummy</motion.h1>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.38 }}>Choose names and fictional photo avatars, then deal.</motion.p>
        <motion.div className="setup-action-panel" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.26 } } }}>
          <div className="setup-utility-actions">
            <motion.button variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} type="button" className="setup-action-primary trailer-launch" onClick={() => { setActionMenu(null); setShowTrailer(true); }}>
              <span>Trailer</span>
            </motion.button>

            <motion.button
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className={actionMenu === "lobby" ? "setup-action-primary lobby-launch active" : "setup-action-primary lobby-launch"}
              aria-expanded={actionMenu === "lobby"}
              onClick={() => setActionMenu((menu) => (menu === "lobby" ? null : "lobby"))}
            >
              <span>Lobby</span>
            </motion.button>

            <motion.button
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className={actionMenu === "instructions" ? "setup-action-primary tutorial-launch active" : "setup-action-primary tutorial-launch"}
              aria-expanded={actionMenu === "instructions"}
              onClick={() => setActionMenu((menu) => (menu === "instructions" ? null : "instructions"))}
            >
              <span>Instructions</span>
            </motion.button>
          </div>
          {actionMenu ? (
            <motion.div
              key={actionMenu}
              className="setup-action-submenu"
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
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
                <button type="button" className="setup-subaction mobile-preview-launch" onClick={() => { setShowMobilePreview(true); setActionMenu(null); }}>
                  Mobile View
                </button>
                <button type="button" className="setup-subaction loading-launch" onClick={() => { setShowLoadingScreen(true); setActionMenu(null); }}>
                  Loading
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
        </motion.div>

        <div className="setup-modal-grid">
          <div className="setup-count-row">
            <motion.div className="setup-section" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.35 }}>
              <b>Players</b>
              <div className="selection-carousel player-count-carousel" aria-label="Player count selection">
                <button type="button" className="selection-carousel-nav" aria-label="Previous player count" onClick={() => movePlayerCount(-1)}>
                  ‹
                </button>
                <div
                  className="player-count-track"
                  onTouchStart={(event) => setSwipeStart(event.changedTouches[0]?.clientX ?? null)}
                  onTouchEnd={(event) => finishSwipe(event, () => movePlayerCount(-1), () => movePlayerCount(1))}
                >
                  {playerCountWindow(count).map(({ playerCount, offset }) => (
                    <motion.button
                      key={`${playerCount}-${offset}`}
                      type="button"
                      className={playerCount === count ? "selection-carousel-card player-count-card selected" : "selection-carousel-card player-count-card"}
                      data-offset={offset}
                      onClick={() => setCount(playerCount)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.985 }}
                    >
                      <strong>{playerCount}</strong>
                      <span>{playerCount} Players</span>
                    </motion.button>
                  ))}
                </div>
                <button type="button" className="selection-carousel-nav" aria-label="Next player count" onClick={() => movePlayerCount(1)}>
                  ›
                </button>
              </div>
            </motion.div>
          </div>

          <div className="setup-customization-row">
            <motion.div className="setup-section table-theme-section" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.35 }}>
              <b>Table Theme</b>
              <div className="selection-carousel table-theme-carousel" aria-label="Table theme selection">
                <button type="button" className="selection-carousel-nav" aria-label="Previous table theme" onClick={() => moveTableTheme(-1)}>
                  ‹
                </button>
                <div
                  className="theme-carousel-track"
                  onTouchStart={(event) => setSwipeStart(event.changedTouches[0]?.clientX ?? null)}
                  onTouchEnd={(event) => finishSwipe(event, () => moveTableTheme(-1), () => moveTableTheme(1))}
                >
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
                <div
                  className="card-back-carousel-track"
                  onTouchStart={(event) => setSwipeStart(event.changedTouches[0]?.clientX ?? null)}
                  onTouchEnd={(event) => finishSwipe(event, () => moveCardBack(-1), () => moveCardBack(1))}
                >
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
          </div>

          <div className="setup-players-row">
            <motion.div className="player-config-list" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.42 } } }}>
            {Array.from({ length: count }, (_, index) => configs[index]).map((player, index) => (
              <motion.div key={index} className="player-config" variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -2, borderColor: "rgba(255, 224, 130, 0.42)" }} transition={{ duration: 0.25 }}>
                <div className="player-config-heading">
                  <span>{index === 0 ? "You" : `CPU ${index}`}</span>
                  <b>{player.name || `Player ${index + 1}`}</b>
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
                      title={`${avatar.name} - ${avatar.role}`}
                      aria-label={`Choose ${avatar.name}, ${avatar.role}`}
                      onClick={() => selectAvatar(index, AVATARS.findIndex((item) => item.id === avatar.id))}
                      className={player.avatar === avatar.src ? "avatar-choice selected" : "avatar-choice"}
                      data-offset={offset}
                      whileHover={{ y: -3, scale: offset === 0 ? 1.04 : 1.02 }}
                      whileTap={{ scale: 0.94 }}
                      transition={{ type: "spring", stiffness: 480, damping: 28 }}
                    >
                      <AvatarPhoto src={avatar.src} alt={avatar.name} fallback={avatar.fallback} size={46} />
                      <small>
                        <b>{avatar.name}</b>
                        <em>{avatar.role}</em>
                      </small>
                    </motion.button>
                  ))}
                  </div>
                  <button type="button" className="avatar-carousel-nav" aria-label="Next avatar" onClick={() => moveAvatar(index, 1)}>
                    ›
                  </button>
                </div>

                <div className="player-config-main">
                  <input
                    value={player.name || ""}
                    onChange={(event) => updatePlayer(index, { name: event.target.value, nameEdited: true })}
                    placeholder={index === 0 ? "Your name" : `Computer ${index} name`}
                  />
                </div>
              </motion.div>
            ))}
            </motion.div>

            <ActionButton
              onClick={onStart}
              style={{
                width: "min(100%, 360px)",
                display: "block",
                margin: "0 auto",
                minHeight: 52,
                background: "linear-gradient(135deg, #fff7d1 0%, #d8a941 28%, #1f6f48 72%, #123b24 100%)",
                color: "#fff8dc",
                padding: 13,
                fontSize: 16,
                border: "1px solid rgba(255, 224, 130, 0.58)",
                borderRadius: 15,
                boxShadow: "0 18px 34px rgba(0, 0, 0, 0.26), 0 0 24px rgba(255, 224, 130, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.34)",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.46)",
                letterSpacing: 0.3
              }}
            >
              Deal Cards ♠
            </ActionButton>
          </div>
        </div>
      </motion.div>

      {showTrailer ? <CinematicTrailer onClose={() => setShowTrailer(false)} /> : null}
      {showLobby ? <OnlineLobbyScreen players={configs} count={count} onClose={() => setShowLobby(false)} onPlayComputer={onStart} /> : null}
      {showMobilePreview ? <MobileGameplayPreview onClose={() => setShowMobilePreview(false)} /> : null}
      {showLoadingScreen ? <LoadingScreenAnimation onClose={() => setShowLoadingScreen(false)} /> : null}
      {showWaitingRoom ? <WaitingRoomAnimation onClose={() => setShowWaitingRoom(false)} /> : null}
      {showTutorial ? <BuriedDiscardTutorial onClose={() => setShowTutorial(false)} /> : null}
      {showLayoff ? <LayOffAnimation onClose={() => setShowLayoff(false)} /> : null}
      {showQueenWarning ? <QueenDiscardWarningAnimation onClose={() => setShowQueenWarning(false)} /> : null}
      {showQueenSpades ? <QueenSpadesAnimation onClose={() => setShowQueenSpades(false)} /> : null}
    </div>
  );
}
