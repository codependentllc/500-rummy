import { motion } from "framer-motion";
import { AVATARS } from "../data/avatars";
import { AvatarPhoto } from "./AvatarPhoto";

type Props = {
  onClose: () => void;
};

const seats = [
  { label: "You", className: "seat-bottom", avatar: AVATARS[0], joined: true },
  { label: "Joining", className: "seat-right", avatar: AVATARS[2], joining: true },
  { label: "Open Seat", className: "seat-top" },
  { label: "Open Seat", className: "seat-left" }
];

export function WaitingRoomAnimation({ onClose }: Props) {
  return (
    <motion.div className="waiting-room-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="tutorial-controls">
        <button type="button" onClick={onClose}>Close</button>
      </div>
      <motion.section
        className="waiting-room-stage"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Waiting room animation"
      >
        <div className="waiting-room-code">Room RMY-500</div>
        <div className="waiting-room-status">
          <span />
          Waiting for players…
        </div>

        <div className="waiting-table-wrap">
          <div className="waiting-table">
            <div className="waiting-table-inner">
              <i className="waiting-card card-a">5♣</i>
              <i className="waiting-card card-b">Q♥</i>
              <i className="waiting-card card-c">9♠</i>
            </div>
          </div>

          {seats.map((seat) => (
            <div key={seat.className} className={`waiting-seat ${seat.className}${seat.joining ? " joining" : ""}${seat.joined ? " joined" : ""}`}>
              {seat.avatar ? (
                <div className="waiting-seat-avatar">
                  <AvatarPhoto src={seat.avatar.src} alt={seat.avatar.name} fallback={seat.avatar.fallback} size={54} />
                </div>
              ) : (
                <div className="waiting-seat-placeholder">+</div>
              )}
              <b>{seat.label}</b>
              <small>{seat.joining ? "Connected" : seat.joined ? "Ready" : "Waiting"}</small>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
