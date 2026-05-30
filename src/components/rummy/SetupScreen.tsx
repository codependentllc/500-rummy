type Props = {
  playerName: string;
  playerCount: number;
  onCountChange: (count: number) => void;
  onStart: () => void;
};

export function SetupScreen({ playerName, playerCount, onCountChange, onStart }: Props) {
  return (
    <section id="setup" className="screen active">
      <div><h1>500<br />Rummy</h1><p className="sub">Playing as {playerName}</p></div>
      <div className="setup-card">
        <div className="label">Players</div>
        <div className="counts">
          {[2, 3, 4].map((count) => <button key={count} className={`count ${count === playerCount ? "active" : ""}`} onClick={() => onCountChange(count)}>{count}</button>)}
        </div>
        <button className="start" type="button" onClick={onStart}>Deal Cards</button>
      </div>
    </section>
  );
}
