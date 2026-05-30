import type { CardBackStyle } from "@/types/rummy";

type Props = {
  styles: CardBackStyle[];
  selectedId: string;
  onChange: (id: string) => void;
};

export function CardBackPicker({ styles, selectedId, onChange }: Props) {
  return <div className="picker-grid">{styles.map((style) => <button key={style.id} className={`picker-option ${style.id === selectedId ? "selected" : ""}`} type="button" onClick={() => onChange(style.id)}><span className={`back back-preview ${style.className}`} /><b>{style.name}</b><small>{style.description}</small></button>)}</div>;
}
