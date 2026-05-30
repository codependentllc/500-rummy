import { BrandHeader } from "./BrandHeader";

type Props = {
  onContinue: () => void;
};

export function WelcomeScreen({ onContinue }: Props) {
  return (
    <section id="welcome" className="screen active">
      <BrandHeader />
      <div className="welcome-copy">
        <h1>500 Rummy</h1>
        <p className="sub">Build melds, lay off cards, and race to 500.</p>
      </div>
      <button className="start" type="button" onClick={onContinue}>Start</button>
    </section>
  );
}
