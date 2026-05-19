import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { AVATARS } from "../data/avatars";
import { AvatarPhoto } from "./AvatarPhoto";

type Props = {
  onClose: () => void;
};

const handCards = ["3♠", "4♠", "5♠", "9♥", "9♦", "Q♣", "K♠"];

export function MobileGameplayPreview({ onClose }: Props) {
  return (
    <div className="mobile-preview-overlay" role="dialog" aria-modal="true" aria-label="Mobile 500 Rummy gameplay preview">
      <div className="mobile-preview-controls">
        <button type="button" onClick={onClose}>Close</button>
      </div>

      <motion.div
        className="mobile-phone-shell"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mobile-phone-speaker" />
        <div className="mobile-game-screen">
          <div className="mobile-game-felt" />

          <div className="mobile-game-topbar">
            <div>
              <span>500 Rummy</span>
              <b>Your Turn</b>
            </div>
            <strong>285 / 500</strong>
          </div>

          <div className="mobile-opponents" aria-label="Opponent avatars">
            {[AVATARS[1], AVATARS[2], AVATARS[3]].map((avatar, index) => (
              <motion.div
                key={avatar.id}
                className={index === 1 ? "mobile-opponent active" : "mobile-opponent"}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + index * 0.06, duration: 0.22 }}
              >
                <AvatarPhoto src={avatar.src} alt={avatar.name} fallback={avatar.fallback} size={34} />
                <span>{index === 0 ? "CPU 1" : index === 1 ? "Maya" : "CPU 3"}</span>
              </motion.div>
            ))}
          </div>

          <div className="mobile-table-center" aria-label="Stock and discard piles">
            <div className="mobile-stock-pile">
              <span />
              <span />
              <span />
            </div>
            <motion.div
              className="mobile-discard-pile"
              initial={{ rotate: -4, y: 5 }}
              animate={{ rotate: 3, y: 0 }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
              <i>Q</i>
              <b>♠</b>
              <small>40</small>
            </motion.div>
          </div>

          <div className="mobile-meld-preview" aria-label="Melds on table">
            <span>7♥</span>
            <span>8♥</span>
            <span>9♥</span>
          </div>

          <div className="mobile-action-bar" aria-label="Action buttons">
            <button type="button">Draw</button>
            <button type="button" className="primary">Meld</button>
            <button type="button">Discard</button>
          </div>

          <div className="mobile-player-hand" aria-label="Player hand">
            {handCards.map((card, index) => (
              <motion.div
                key={card}
                className={card.includes("♥") || card.includes("♦") ? "mobile-hand-card red" : "mobile-hand-card"}
                style={{ "--hand-index": index } as CSSProperties}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.035, duration: 0.24 }}
              >
                <span>{card.slice(0, -1)}</span>
                <b>{card.slice(-1)}</b>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
