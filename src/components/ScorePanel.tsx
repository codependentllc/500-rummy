import { motion } from "framer-motion";
import type { Player } from "../game/types";
import { AvatarPhoto } from "./AvatarPhoto";

type Props = {
  players: Player[];
  turn: number;
  handOver: boolean;
};

export function ScorePanel({ players, turn, handOver }: Props) {
  return (
    <motion.div
      className="score-panel"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      {players.map((player) => (
        <motion.div
          key={player.id}
          className={turn === player.id && !handOver ? "score-card active" : "score-card"}
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.24 }}
        >
          <div className="score-avatar">
            <AvatarPhoto src={player.avatar} alt={player.name} fallback={player.fallback || (player.isAI ? "🤖" : "🧑")} size={62} />
          </div>
          <div className="score-details">
            <div className="score-name">{player.name}</div>
            <div className="score-value">{player.score}</div>
            <div className="score-meta">{player.hand.length} cards</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
