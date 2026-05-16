import { useEffect, useState, type CSSProperties } from "react";
import { AVATARS } from "../data/avatars";
import { AvatarPhoto } from "./AvatarPhoto";

type Props = {
  onClose: () => void;
};

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

const dealCards = [
  { label: "7", suit: "♦", x: "-34vw", y: "-22vh", rot: "-16deg" },
  { label: "K", suit: "♣", x: "32vw", y: "-21vh", rot: "14deg" },
  { label: "9", suit: "♥", x: "-35vw", y: "20vh", rot: "11deg" },
  { label: "A", suit: "♣", x: "33vw", y: "19vh", rot: "-13deg" }
];

const runCards = [
  { label: "3", suit: "♠", rot: "-8deg" },
  { label: "4", suit: "♠", rot: "0deg" },
  { label: "5", suit: "♠", rot: "8deg" }
];

function scheduleTone(
  context: AudioContext,
  destination: AudioNode,
  start: number,
  duration: number,
  frequency: number,
  type: OscillatorType,
  volume: number
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.035);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
}

function scheduleSweep(context: AudioContext, destination: AudioNode, start: number, duration: number, from: number, to: number, volume: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(from, start);
  oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
}

function scheduleCardFlick(context: AudioContext, destination: AudioNode, start: number) {
  const buffer = context.createBuffer(1, context.sampleRate * 0.09, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  filter.type = "highpass";
  filter.frequency.setValueAtTime(1200, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.08, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);

  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(destination);
  source.start(start);
}

function startTrailerAudio() {
  const AudioContextClass = window.AudioContext || (window as AudioWindow).webkitAudioContext;
  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  const master = context.createGain();
  const music = context.createGain();
  const effects = context.createGain();
  const compressor = context.createDynamicsCompressor();

  master.gain.setValueAtTime(0.0001, context.currentTime);
  master.gain.linearRampToValueAtTime(0.7, context.currentTime + 0.35);
  master.gain.setValueAtTime(0.7, context.currentTime + 13.8);
  master.gain.linearRampToValueAtTime(0.0001, context.currentTime + 15);
  music.gain.value = 0.42;
  effects.gain.value = 0.72;

  music.connect(master);
  effects.connect(master);
  master.connect(compressor).connect(context.destination);

  const now = context.currentTime + 0.04;
  const chords = [
    [146.83, 220, 293.66],
    [130.81, 196, 261.63],
    [164.81, 246.94, 329.63],
    [146.83, 220, 349.23]
  ];
  const bass = [73.42, 65.41, 82.41, 73.42];

  chords.forEach((chord, index) => {
    const start = now + index * 3.5;
    scheduleTone(context, music, start, 3.4, bass[index], "triangle", 0.09);
    chord.forEach((frequency) => scheduleTone(context, music, start + 0.05, 3.25, frequency, "sine", 0.035));
  });

  for (let beat = 0; beat < 30; beat += 1) {
    const start = now + beat * 0.5;
    const note = [440, 493.88, 587.33, 659.25][beat % 4];
    scheduleTone(context, music, start, 0.16, note, "triangle", beat % 4 === 0 ? 0.035 : 0.022);
  }

  [2, 2.22, 2.44, 2.66].forEach((offset) => scheduleCardFlick(context, effects, now + offset));
  [4.95, 5.18, 5.38].forEach((offset) => scheduleTone(context, effects, now + offset, 0.14, 880 + offset * 20, "sine", 0.08));
  [7.6, 7.85, 8.1].forEach((offset, index) => scheduleTone(context, effects, now + offset, 0.32, [392, 493.88, 587.33][index], "sine", 0.1));
  scheduleSweep(context, effects, now + 10.7, 1.1, 146.83, 880, 0.12);
  scheduleTone(context, effects, now + 11.25, 0.72, 98, "sawtooth", 0.08);
  scheduleSweep(context, effects, now + 13.1, 1.6, 220, 880, 0.11);
  scheduleTone(context, effects, now + 13.8, 1.2, 293.66, "triangle", 0.08);

  void context.resume();
  return context;
}

export function CinematicTrailer({ onClose }: Props) {
  const [replayKey, setReplayKey] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    if (!audioEnabled) return;

    const context = startTrailerAudio();
    return () => {
      void context?.close();
    };
  }, [replayKey, audioEnabled]);

  return (
    <div className="trailer-overlay" role="dialog" aria-modal="true" aria-label="500 Rummy cinematic trailer">
      <div className="trailer-controls">
        <button type="button" onClick={() => setReplayKey((key) => key + 1)}>Replay</button>
        <button type="button" onClick={() => setAudioEnabled((enabled) => !enabled)}>{audioEnabled ? "Mute" : "Sound"}</button>
        <button type="button" onClick={onClose}>Close</button>
      </div>

      <div key={replayKey} className="trailer-stage">
        <div className="trailer-camera">
          <div className="trailer-table">
            <div className="trailer-light" />

            <div className="trailer-deck">
              <div className="card-back stacked one" />
              <div className="card-back stacked two" />
              <div className="card-back stacked three" />
            </div>

            <div className="trailer-avatars">
              {AVATARS.slice(0, 4).map((avatar, index) => (
                <div key={avatar.id} className={`trailer-avatar avatar-${index + 1}`}>
                  <AvatarPhoto src={avatar.src} alt={avatar.name} fallback={avatar.fallback} size={58} />
                  <span>{index === 0 ? "You" : avatar.name}</span>
                </div>
              ))}
            </div>

            <div className="trailer-deal-layer">
              {dealCards.map((card, index) => (
                <div
                  key={`${card.label}${card.suit}`}
                  className={`trailer-card deal-card ${card.suit === "♥" || card.suit === "♦" ? "red" : ""}`}
                  style={{
                    "--deal-delay": `${2 + index * 0.22}s`,
                    "--tx": card.x,
                    "--ty": card.y,
                    "--rot": card.rot
                  } as CSSProperties}
                >
                  <span>{card.label}</span>
                  <b>{card.suit}</b>
                </div>
              ))}
            </div>

            <div className="discard-glow">
              <div className="card-back mini" />
              <div className="trailer-card mini red"><span>8</span><b>♥</b></div>
            </div>

            <div className="selection-ring" />

            <div className="run-row">
              {runCards.map((card, index) => (
                <div
                  key={`${card.label}${card.suit}`}
                  className="trailer-card run-card"
                  style={{ "--run-delay": `${7.6 + index * 0.25}s`, "--rot": card.rot } as CSSProperties}
                >
                  <span>{card.label}</span>
                  <b>{card.suit}</b>
                </div>
              ))}
            </div>

            <div className="queen-highlight">
              <div className="trailer-card queen-card">
                <span>Q</span>
                <b>♠</b>
              </div>
              <div className="queen-copy">Queen of Spades: 40 Points</div>
            </div>

            <div className="trailer-title">
              <span>500 Rummy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
