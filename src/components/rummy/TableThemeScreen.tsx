import { TABLE_THEMES } from "@/data/themes";
import { SetupFrame } from "./SetupFrame";
import { ThemePicker } from "./ThemePicker";

type Props = { selectedId: string; onChange: (id: string) => void; onBack: () => void; onContinue: () => void; };

export function TableThemeScreen({ selectedId, onChange, onBack, onContinue }: Props) {
  return <SetupFrame title="Choose Your Table" subtitle="Select the casino table for this game."><div className="setup-card"><ThemePicker themes={TABLE_THEMES} selectedId={selectedId} onChange={onChange} /></div><div className="setup-actions"><button className="setup-back" type="button" onClick={onBack}>Back</button><button className="start" type="button" onClick={onContinue}>Continue</button></div></SetupFrame>;
}
