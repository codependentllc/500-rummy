import { useState } from "react";
import { motion } from "framer-motion";
import type { PlayerConfig } from "../game/types";
import { ActionButton } from "./ActionButton";
import { AvatarPhoto } from "./AvatarPhoto";

type LobbyMode = "host" | "join" | "computer";

type Props = {
  players: PlayerConfig[];
  count: number;
  onClose: () => void;
  onPlayComputer: () => void;
};

const roomCodePrefixes = ["RMY", "MELD", "RUN", "SET", "500"];

function createRoomCode() {
  const prefix = roomCodePrefixes[Math.floor(Math.random() * roomCodePrefixes.length)];
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

function normalizeRoomCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 10);
}

const modeOptions: Array<{ id: LobbyMode; label: string; detail: string }> = [
  { id: "host", label: "Host Game", detail: "Create a private room" },
  { id: "join", label: "Join Game", detail: "Enter a room code" },
  { id: "computer", label: "Play Computer", detail: "Start solo practice" }
];

export function OnlineLobbyScreen({ players, count, onClose, onPlayComputer }: Props) {
  const [mode, setMode] = useState<LobbyMode>("host");
  const [ready, setReady] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [roomCode, setRoomCode] = useState(createRoomCode);
  const seats = Array.from({ length: Math.max(4, count) }, (_, index) => players[index]);
  const displayRoomCode = roomCode || "ROOM-CODE";

  function refreshRoomCode() {
    setRoomCode(createRoomCode());
    setInviteCopied(false);
  }

  function updateRoomCode(value: string) {
    setRoomCode(normalizeRoomCode(value));
    setInviteCopied(false);
  }

  function copyInvite() {
    const inviteText = `Join my 500 Rummy room with code ${displayRoomCode}`;

    if (navigator.clipboard) {
      void navigator.clipboard.writeText(inviteText).catch(() => undefined);
    }

    setInviteCopied(true);
    window.setTimeout(() => setInviteCopied(false), 1300);
  }

  return (
    <motion.div className="lobby-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section
        className="online-lobby"
        initial={{ opacity: 0, y: 22, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label="Online multiplayer lobby"
      >
        <button type="button" className="lobby-close" aria-label="Close lobby" onClick={onClose}>
          ×
        </button>

        <div className="lobby-cinema-glow" />

        <div className="lobby-hero">
          <div className="lobby-header">
            <span>Online Multiplayer</span>
            <h2>500 Rummy Lobby</h2>
          </div>

          <div className="lobby-room-code-display">
            <span>{mode === "join" ? "Join Code" : "Room Code"}</span>
            <motion.b
              key={displayRoomCode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {displayRoomCode}
            </motion.b>
          </div>
        </div>

        <div className="lobby-mode-row" aria-label="Game mode">
          {modeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={mode === option.id ? "lobby-mode selected" : "lobby-mode"}
              onClick={() => setMode(option.id as LobbyMode)}
            >
              <b>{option.label}</b>
              <span>{option.detail}</span>
            </button>
          ))}
        </div>

        <div className="lobby-cinematic-stage">
          <div className="lobby-table-scene">
            <div className="lobby-felt-table">
              <div className="lobby-table-shine" />
              <i className="lobby-table-card card-one">5♣</i>
              <i className="lobby-table-card card-two">10♦</i>
              <i className="lobby-table-card card-three">K♠</i>
              <div className="lobby-deck-stack">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="lobby-seats" aria-label="Player avatar slots">
            {seats.map((player, index) => {
              const occupied = index < count && player;
              return (
                <motion.div
                  key={index}
                  className={occupied ? `lobby-seat occupied seat-${index}` : `lobby-seat seat-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.24 }}
                >
                  {occupied ? (
                    <>
                      <AvatarPhoto src={player.avatar} alt={player.name || `Player ${index + 1}`} fallback={player.fallback || (index === 0 ? "🧑" : "🤖")} size={52} />
                      <div>
                        <b>{player.name || `Player ${index + 1}`}</b>
                        <span>{index === 0 ? "Host" : mode === "computer" ? "Computer" : "Waiting"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="lobby-empty-avatar">+</div>
                      <div>
                        <b>Open Seat</b>
                        <span>Invite player</span>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
            </div>
          </div>

          <div className="lobby-room-card">
            <label htmlFor="room-code">{mode === "join" ? "Enter Room Code" : "Room Code"}</label>
            <div className="room-code-row">
              <input id="room-code" value={roomCode} readOnly={mode !== "join"} onChange={(event) => updateRoomCode(event.target.value)} />
              <div className="room-code-actions">
                <button type="button" className="refresh-code-button" onClick={refreshRoomCode} disabled={mode === "join"}>
                  New Code
                </button>
                <button type="button" onClick={copyInvite}>
                  {inviteCopied ? "Copied" : "Invite Link"}
                </button>
              </div>
            </div>
            <div className="lobby-status">
              <span className="status-dot" />
              {mode === "host" ? "Private room open" : mode === "join" ? "Ready to join by code" : "Local computer match"}
            </div>
          </div>
        </div>

        <div className="lobby-footer">
          <button type="button" className={ready ? "ready-toggle ready" : "ready-toggle"} onClick={() => setReady((value) => !value)}>
            {ready ? "Ready" : "Ready Up"}
          </button>
          <ActionButton onClick={mode === "computer" ? onPlayComputer : onClose} style={{ flex: 1, background: "#ffe082", color: "#1a472a", padding: 13, fontSize: 15 }}>
            {mode === "computer" ? "Play Computer" : "Enter Lobby"}
          </ActionButton>
        </div>
      </motion.section>
    </motion.div>
  );
}
