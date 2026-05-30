import type { CardBackStyle, TableTheme } from "@/types/rummy";

export const TABLE_THEMES: TableTheme[] = [
  { id: "classic-green", name: "Classic Green", className: "theme-classic-green", description: "Traditional green felt" },
  { id: "royal-gold", name: "Royal Gold", className: "theme-royal-gold", description: "Warm casino gold" },
  { id: "midnight-casino", name: "Midnight Casino", className: "theme-midnight-casino", description: "Deep blue night table" },
  { id: "riverboat", name: "Riverboat", className: "theme-riverboat", description: "Rich red riverboat felt" }
];

export const CARD_BACK_STYLES: CardBackStyle[] = [
  { id: "burgundy-diamond", name: "Burgundy Diamond", className: "back-burgundy-diamond", description: "Classic burgundy pattern" },
  { id: "emerald-fan", name: "Emerald Fan", className: "back-emerald-fan", description: "Green fan pattern" },
  { id: "gold-trim", name: "Gold Trim", className: "back-gold-trim", description: "Dark cards with gold trim" },
  { id: "midnight-pattern", name: "Midnight Pattern", className: "back-midnight-pattern", description: "Midnight blue pattern" }
];
