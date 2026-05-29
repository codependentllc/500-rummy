import { motion } from "framer-motion";
import { useState } from "react";
import type { Player } from "../../game/types";
import { ActionButton } from "../ActionButton";
import { ScorePanel } from "../ScorePanel";
import "./Header.css";

type Props = {
  players: Player[];
  turn: number;
  handOver: boolean;
  disabled: boolean;
  onNewGame: () => void;
};

export function Header({ players, turn, handOver, disabled, onNewGame }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const current = players[turn];

  return (
    <motion.header className="top-bar game-header" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="game-header-brand" aria-label="500 Rummy">
        <button type="button" className="game-header-menu" aria-label="Open game menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>☰</button>
        <div className="title"><span>500</span> Rummy</div>
      </div>

      {menuOpen ? (
        <div className="game-header-mobile-menu" aria-label="Game menu">
          <button type="button" disabled={disabled} onClick={() => { setMenuOpen(false); onNewGame(); }}>
            New Game
          </button>
        </div>
      ) : null}

      <div className="mobile-header-chips" aria-label="Player status">
        {players.map((player) => (
          <span key={player.id} className={player.id === turn && !handOver ? "mobile-player-chip active" : "mobile-player-chip"}>
            <b>{player.id === 0 ? "You" : player.name}</b>
            <small>{player.score} · {player.hand.length}</small>
          </span>
        ))}
      </div>

      <div className="header-right">
        <div className="header-score-panel">
          <ScorePanel players={players} turn={turn} handOver={handOver} />
        </div>
        <div className="top-actions">
          <span className="turn-mini-chip">{current?.name || "Turn"}</span>
          <ActionButton disabled={disabled} onClick={onNewGame} className="new-game-action">New</ActionButton>
        </div>
      </div>
    </motion.header>
  );
}
