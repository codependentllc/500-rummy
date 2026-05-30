import type { TableTheme } from "@/types/rummy";

type Props = {
  themes: TableTheme[];
  selectedId: string;
  onChange: (id: string) => void;
};

export function ThemePicker({ themes, selectedId, onChange }: Props) {
  return <div className="picker-grid">{themes.map((theme) => <button key={theme.id} className={`picker-option ${theme.className} ${theme.id === selectedId ? "selected" : ""}`} type="button" onClick={() => onChange(theme.id)}><span className="theme-swatch" /><b>{theme.name}</b><small>{theme.description}</small></button>)}</div>;
}
