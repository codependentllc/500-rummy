type Props = {
  type: "trailer" | "instructions" | null;
  onClose: () => void;
};

export function InfoModal({ type, onClose }: Props) {
  if (!type) return null;
  return (
    <div className="info-overlay active" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <section className="info-sheet">
        <div className="info-head"><b>{type === "trailer" ? "500 Rummy Trailer" : "How to Play"}</b><button className="new" type="button" onClick={onClose}>Close</button></div>
        {type === "trailer" ? (
          <div className="trailer-stage">
            <img src="/art/500-rummy-cinematic-table.png" alt="Casino table prepared for a game of 500 Rummy" />
            <div className="trailer-copy"><strong>Deal. Meld. Lay off. Win.</strong><span>A quick casino-table preview of the 500 Rummy experience.</span></div>
          </div>
        ) : (
          <ol className="instructions-list">
            <li>Draw from the stock or tap the discard pile to pick up a legal card.</li>
            <li>Select three or more matching cards to play a set or run.</li>
            <li>Select one card to lay it off on a highlighted table meld.</li>
            <li>Finish each turn by discarding one selected card.</li>
            <li>Empty your hand to score your melded cards minus cards still held.</li>
          </ol>
        )}
      </section>
    </div>
  );
}
