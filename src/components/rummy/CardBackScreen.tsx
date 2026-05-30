import { CARD_BACK_STYLES } from "@/data/themes";
import { CardBackPicker } from "./CardBackPicker";
import { SetupFrame } from "./SetupFrame";

type Props = { selectedId: string; onChange: (id: string) => void; onBack: () => void; onStart: () => void; };

export function CardBackScreen({ selectedId, onChange, onBack, onStart }: Props) {
  return <SetupFrame title="Choose Card Backs" subtitle="Pick the deck style for this table."><div className="setup-card"><CardBackPicker styles={CARD_BACK_STYLES} selectedId={selectedId} onChange={onChange} /></div><div className="setup-actions"><button className="setup-back" type="button" onClick={onBack}>Back</button><button className="start" type="button" onClick={onStart}>Deal Cards</button></div></SetupFrame>;
}
