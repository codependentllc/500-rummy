import type { ReactNode } from "react";
import "./GameViews.css";

type Props = {
  table: ReactNode;
  opponents: ReactNode;
  drawers: ReactNode;
  player: ReactNode;
};

export function MobileGameView({ table, player }: Props) {
  return (
    <div className="mobile-game-view">
      {table}
      {player}
    </div>
  );
}

export function TabletGameView({ opponents, table, player }: Props) {
  return (
    <div className="tablet-game-view">
      {opponents}
      {table}
      {player}
    </div>
  );
}

export function DesktopGameView({ opponents, table, drawers, player }: Props) {
  return (
    <div className="desktop-game-view">
      {opponents}
      {table}
      {drawers}
      {player}
    </div>
  );
}
