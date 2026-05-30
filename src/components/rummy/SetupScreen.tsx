import type { SeatConfig } from "@/types/rummy";
import { BrandHeader } from "./BrandHeader";
import { SeatEditor } from "./SeatEditor";

type Props = {
  playerName: string;
  playerCount: number;
  seats: SeatConfig[];
  onCountChange: (count: number) => void;
  onSeatChange: (index: number, seat: SeatConfig) => void;
  onStart: () => void;
};

export function SetupScreen({ playerName, playerCount, seats, onCountChange, onSeatChange, onStart }: Props) {
  return (
    <section id="setup" className="screen active">
      <BrandHeader />
      <div><h1>500 Rummy</h1><p className="sub">Playing as {playerName}</p></div>
      <div className="setup-card">
        <div className="label">Players</div>
        <div className="counts">
          {[2, 3, 4].map((count) => <button key={count} className={`count ${count === playerCount ? "active" : ""}`} onClick={() => onCountChange(count)}>{count}</button>)}
        </div>
        <div className="seat-grid">
          {seats.slice(0, playerCount).map((seat, index) => <SeatEditor key={index} index={index} seat={seat} onChange={(next) => onSeatChange(index, next)} />)}
        </div>
        <button className="start" type="button" onClick={onStart}>Deal Cards</button>
      </div>
    </section>
  );
}
