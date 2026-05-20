import type { CSSProperties } from "react";

const particles = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  left: 8 + ((index * 19) % 84),
  top: 12 + ((index * 23) % 76),
  delay: (index % 14) * -0.7,
  drift: ((index % 7) - 3) * 8,
  scale: 0.72 + (index % 5) * 0.12
}));

export function MenuLoopBackground() {
  return (
    <div className="menu-loop-background" aria-hidden="true">
      <div className="menu-loop-camera">
        <div className="menu-loop-table-light" />
        <div className="menu-loop-felt-table">
          <div className="menu-loop-deck">
            <span />
            <span />
            <span />
          </div>
          <div className="menu-loop-card card-one">A♠</div>
          <div className="menu-loop-card card-two">7♥</div>
          <div className="menu-loop-card card-three">Q♣</div>
          <div className="menu-loop-chip-stack stack-one">
            <i />
            <i />
            <i />
          </div>
          <div className="menu-loop-chip-stack stack-two">
            <i />
            <i />
          </div>
        </div>
      </div>

      <div className="menu-loop-particles">
        {particles.map((particle) => (
          <i
            key={particle.id}
            style={{
              "--particle-left": `${particle.left}%`,
              "--particle-top": `${particle.top}%`,
              "--particle-delay": `${particle.delay}s`,
              "--particle-drift": `${particle.drift}px`,
              "--particle-scale": particle.scale
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
