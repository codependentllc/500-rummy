import { CARD_BACK_STYLES } from "@/data/themes";
import type { ComputerDifficulty } from "@/types/rummy";
import { CardBackPicker } from "./CardBackPicker";
import { SetupFrame } from "./SetupFrame";

const DIFFICULTIES: { id: ComputerDifficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "normal", label: "Normal" },
  { id: "hard", label: "Hard" }
];

type Props = { selectedId: string; difficulty: ComputerDifficulty; onChange: (id: string) => void; onDifficultyChange: (difficulty: ComputerDifficulty) => void; onBack: () => void; onStart: () => void; };

export function CardBackScreen({ selectedId, difficulty, onChange, onDifficultyChange, onBack, onStart }: Props) {
  return <SetupFrame title="Choose Card Backs" subtitle="Pick the deck style and computer difficulty."><div className="setup-card"><CardBackPicker styles={CARD_BACK_STYLES} selectedId={selectedId} onChange={onChange} /><div className="difficulty-picker"><div className="label">Computer Difficulty</div><div className="difficulty-options">{DIFFICULTIES.map((option) => <button key={option.id} className={`difficulty-option ${difficulty === option.id ? "active" : ""}`} type="button" onClick={() => onDifficultyChange(option.id)}>{option.label}</button>)}</div></div></div><div className="setup-actions"><button className="setup-back" type="button" onClick={onBack}>Back</button><button className="start" type="button" onClick={onStart}>Deal Cards</button></div></SetupFrame>;
}
