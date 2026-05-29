import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AVATARS } from "../data/avatars";
import type { CardBackStyle, TableTheme } from "../App";
import type { GameSettings, PlayerConfig, PlayerProfile } from "../game/types";
import { ActionButton } from "./ActionButton";
import { AvatarPhoto } from "./AvatarPhoto";
import { MenuLoopBackground } from "./MenuLoopBackground";

type SetupStep = "welcome" | "character" | "instructions";

type Props = {
  count: number;
  setCount: (count: number) => void;
  configs: PlayerConfig[];
  setConfigs: React.Dispatch<React.SetStateAction<PlayerConfig[]>>;
  tableTheme: TableTheme;
  setTableTheme: (theme: TableTheme) => void;
  cardBack: CardBackStyle;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playerProfile: PlayerProfile;
  gameSettings: GameSettings;
  onStart: () => void;
};

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function characterAt(index: number) {
  return AVATARS[wrapIndex(index, AVATARS.length)];
}

export function SetupScreen({
  count,
  setCount,
  configs,
  setConfigs,
  tableTheme,
  setTableTheme,
  cardBack,
  soundEnabled,
  setSoundEnabled,
  playerProfile,
  gameSettings,
  onStart
}: Props) {
  const [step, setStep] = useState<SetupStep>("welcome");
  const selectedCharacterIndex = useMemo(() => {
    const index = AVATARS.findIndex((character) => character.id === playerProfile.characterId);
    return index >= 0 ? index : 0;
  }, [playerProfile.characterId]);
  const selectedCharacter = characterAt(selectedCharacterIndex);

  function updateHumanProfile(patch: Partial<PlayerConfig>) {
    setConfigs((prev) => prev.map((player, index) => {
      if (index !== 0) return player;
      const name = patch.name ?? patch.displayName ?? player.name;
      return {
        ...player,
        ...patch,
        id: player.id || playerProfile.id,
        name,
        displayName: patch.displayName ?? name
      };
    }));
  }

  function selectCharacter(index: number) {
    const character = characterAt(index);
    updateHumanProfile({
      characterId: character.id,
      avatar: character.avatar,
      fallback: character.fallback,
      name: configs[0]?.name || character.name,
      displayName: configs[0]?.displayName || configs[0]?.name || character.name
    });
  }

  function moveCharacter(direction: -1 | 1) {
    selectCharacter(selectedCharacterIndex + direction);
  }

  function updatePlayerCount(nextCount: number) {
    setCount(nextCount);
    setConfigs((prev) => prev.map((player, index) => ({
      ...player,
      cardBackThemeId: cardBack,
      soundEnabled,
      displayName: player.displayName || player.name || (index === 0 ? "You" : `CPU ${index}`)
    })));
  }

  function updateSound(enabled: boolean) {
    setSoundEnabled(enabled);
    setConfigs((prev) => prev.map((player) => ({ ...player, soundEnabled: enabled })));
  }

  function startGame() {
    setTableTheme("classic");
    setConfigs((prev) => prev.map((player, index) => ({
      ...player,
      cardBackThemeId: cardBack,
      soundEnabled,
      displayName: player.displayName || player.name || (index === 0 ? "You" : `CPU ${index}`),
      characterId: player.characterId || AVATARS[index % AVATARS.length].id,
      avatar: player.avatar || AVATARS[index % AVATARS.length].avatar,
      fallback: player.fallback || AVATARS[index % AVATARS.length].fallback
    })));
    onStart();
  }

  return (
    <div className={`setup-page mvp-setup table-theme-${tableTheme} card-back-${cardBack}`}>
      <MenuLoopBackground />
      <motion.div
        className="setup-card mvp-setup-card"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mvp-setup-top">
          <div>
            <div className="setup-logo">🃏</div>
            <h1>500 Rummy</h1>
            <p>Pick your character, review the rules, then deal.</p>
          </div>
          <button type="button" className="mvp-sound-toggle" onClick={() => updateSound(!soundEnabled)}>
            {soundEnabled ? "Sound On" : "Muted"}
          </button>
        </div>

        <nav className="mvp-flow-tabs" aria-label="Setup flow">
          {(["welcome", "character", "instructions"] as SetupStep[]).map((item) => (
            <button key={item} type="button" className={step === item ? "active" : ""} onClick={() => setStep(item)}>
              {item === "welcome" ? "Welcome" : item === "character" ? "Character" : "Instructions"}
            </button>
          ))}
        </nav>

        {step === "welcome" ? (
          <section className="mvp-setup-panel">
            <b>Players</b>
            <div className="player-count-row">
              {[2, 3, 4].map((number) => (
                <ActionButton
                  key={number}
                  onClick={() => updatePlayerCount(number)}
                  className={count === number ? "primary-action" : "secondary-action"}
                >
                  {number}
                </ActionButton>
              ))}
            </div>

            <div className="mvp-settings-grid mvp-settings-grid-single">
              <div className="mvp-profile-summary">
                <b>Profile State</b>
                <dl>
                  <dt>Name</dt>
                  <dd>{playerProfile.displayName}</dd>
                  <dt>Character</dt>
                  <dd>{playerProfile.characterId}</dd>
                  <dt>Sound</dt>
                  <dd>{gameSettings.soundEnabled ? "enabled" : "disabled"}</dd>
                </dl>
              </div>
            </div>

            <div className="mvp-setup-actions">
              <ActionButton className="secondary-action" onClick={() => setStep("character")}>Choose Character</ActionButton>
              <ActionButton className="primary-action" onClick={startGame}>Start Game</ActionButton>
            </div>
          </section>
        ) : null}

        {step === "character" ? (
          <section className="mvp-setup-panel">
            <b>Choose Character</b>
            <div className="mvp-character-picker">
              <button type="button" className="avatar-carousel-nav" aria-label="Previous character" onClick={() => moveCharacter(-1)}>‹</button>
              <div className="mvp-character-card">
                <AvatarPhoto src={selectedCharacter.avatar} alt={selectedCharacter.name} fallback={selectedCharacter.fallback} size={78} />
                <strong>{selectedCharacter.name}</strong>
                <span>{selectedCharacter.role}</span>
                <p>{selectedCharacter.description || `${selectedCharacter.name} joins the table as your selected profile character.`}</p>
              </div>
              <button type="button" className="avatar-carousel-nav" aria-label="Next character" onClick={() => moveCharacter(1)}>›</button>
            </div>

            <label className="mvp-name-field">
              <span>Display name</span>
              <input
                value={configs[0]?.name || ""}
                onChange={(event) => updateHumanProfile({ name: event.target.value, displayName: event.target.value })}
                placeholder="Your name"
              />
            </label>

            <div className="mvp-character-strip">
              {AVATARS.map((character) => (
                <button
                  key={character.id}
                  type="button"
                  className={character.id === selectedCharacter.id ? "avatar-choice selected" : "avatar-choice"}
                  onClick={() => selectCharacter(AVATARS.findIndex((item) => item.id === character.id))}
                >
                  <AvatarPhoto src={character.avatar} alt={character.name} fallback={character.fallback} size={42} />
                  <small>{character.name}</small>
                </button>
              ))}
            </div>

            <div className="mvp-setup-actions">
              <ActionButton className="secondary-action" onClick={() => setStep("welcome")}>Back</ActionButton>
              <ActionButton className="primary-action" onClick={startGame}>Start Game</ActionButton>
            </div>
          </section>
        ) : null}

        {step === "instructions" ? (
          <section className="mvp-setup-panel mvp-instructions">
            <b>How to Play</b>
            <ul>
              <li>Draw from the stock or pick up from the discard pile when the chosen discard can immediately make a meld or layoff.</li>
              <li>Make sets of three or four matching ranks, or runs of three or more cards in the same suit.</li>
              <li>Lay off one selected card onto any valid table meld when it fits.</li>
              <li>End your turn by discarding one card. The hand scores when a player goes out.</li>
              <li>First player to 500 points wins.</li>
            </ul>
            <div className="mvp-setup-actions">
              <ActionButton className="secondary-action" onClick={() => setStep("character")}>Choose Character</ActionButton>
              <ActionButton className="primary-action" onClick={startGame}>Start Game</ActionButton>
            </div>
          </section>
        ) : null}
      </motion.div>
    </div>
  );
}
