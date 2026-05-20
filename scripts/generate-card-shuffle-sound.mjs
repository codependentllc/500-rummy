import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = join(root, "public", "sounds", "card-shuffle-riffle-square-tap.wav");
const sampleRate = 44100;
const duration = 2.35;
const sampleCount = Math.floor(sampleRate * duration);
const channels = 2;
const samples = new Float32Array(sampleCount * channels);

let seed = 500;
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0xffffffff;
}

function addStereo(index, left, right) {
  if (index < 0 || index >= sampleCount) return;
  samples[index * 2] += left;
  samples[index * 2 + 1] += right;
}

function envelope(t, start, attack, decay, sustain, release, length) {
  const local = t - start;
  if (local < 0 || local > length) return 0;
  if (local < attack) return local / attack;
  if (local < attack + decay) {
    const k = (local - attack) / decay;
    return 1 - k * (1 - sustain);
  }
  const releaseStart = Math.max(attack + decay, length - release);
  if (local > releaseStart) {
    return sustain * Math.max(0, 1 - (local - releaseStart) / release);
  }
  return sustain;
}

function addNoiseBurst(start, length, gain, pan, tone = 0.58) {
  let hp = 0;
  let lp = 0;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate;
    const local = t - start;
    const env = Math.sin(Math.PI * Math.min(1, local / length));
    const white = random() * 2 - 1;
    lp += (white - lp) * tone;
    hp = white - lp * 0.55;
    const paper = (hp * 0.72 + lp * 0.28) * env * gain;
    const left = paper * (1 - pan * 0.45);
    const right = paper * (1 + pan * 0.45);
    addStereo(i, left, right);
  }
}

function addClick(start, gain, pan, pitch = 840) {
  const length = 0.052;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.exp(-t * 92);
    const paperSnap = Math.sin(2 * Math.PI * pitch * t) * 0.42 + (random() * 2 - 1) * 0.58;
    const value = paperSnap * env * gain;
    addStereo(i, value * (1 - pan * 0.4), value * (1 + pan * 0.4));
  }
}

function addLowThump(start, gain, pan, pitch = 92) {
  const length = 0.17;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.exp(-t * 22);
    const felt = Math.sin(2 * Math.PI * pitch * t) * env * gain;
    const softNoise = (random() * 2 - 1) * env * gain * 0.11;
    const value = felt + softNoise;
    addStereo(i, value * (1 - pan * 0.35), value * (1 + pan * 0.35));
  }
}

function addRiffle(start, count, spacing, panBase) {
  for (let i = 0; i < count; i += 1) {
    const jitter = (random() - 0.5) * spacing * 0.72;
    const time = start + i * spacing + jitter;
    const pan = panBase + Math.sin(i * 0.73) * 0.55;
    addClick(time, 0.15 + random() * 0.08, Math.max(-1, Math.min(1, pan)), 760 + random() * 720);
    if (i % 3 === 0) addNoiseBurst(time - 0.008, 0.038 + random() * 0.014, 0.035, pan, 0.72);
  }
}

function addDeckSlide(start, length, gain, panDirection) {
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));
  let lp = 0;

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate;
    const local = t - start;
    const env = envelope(t, start, 0.04, 0.12, 0.72, 0.16, length);
    const white = random() * 2 - 1;
    lp += (white - lp) * 0.18;
    const scrape = (white * 0.32 + lp * 0.68) * env * gain;
    const sweep = (local / length - 0.5) * panDirection;
    addStereo(i, scrape * (1 - sweep * 0.42), scrape * (1 + sweep * 0.42));
  }
}

addDeckSlide(0.05, 0.28, 0.055, -1);
addRiffle(0.24, 35, 0.012, -0.35);
addDeckSlide(0.67, 0.22, 0.045, 1);
addRiffle(0.8, 38, 0.011, 0.35);
addNoiseBurst(1.2, 0.28, 0.06, 0, 0.45);
addDeckSlide(1.24, 0.36, 0.075, 0.25);

for (const time of [1.58, 1.66, 1.74]) {
  addClick(time, 0.12, (random() - 0.5) * 0.4, 420 + random() * 220);
}

addLowThump(1.86, 0.32, -0.12, 86);
addClick(1.88, 0.16, -0.08, 360);
addLowThump(2.07, 0.22, 0.12, 104);
addClick(2.085, 0.08, 0.14, 460);

let peak = 0;
for (let i = 0; i < samples.length; i += 1) {
  peak = Math.max(peak, Math.abs(samples[i]));
}

const normalizer = peak > 0 ? 0.86 / peak : 1;
for (let i = 0; i < samples.length; i += 1) {
  const t = Math.floor(i / channels) / sampleRate;
  const fadeIn = Math.min(1, t / 0.018);
  const fadeOut = Math.min(1, (duration - t) / 0.12);
  samples[i] = Math.max(-1, Math.min(1, samples[i] * normalizer * fadeIn * fadeOut));
}

function writeString(buffer, offset, value) {
  for (let i = 0; i < value.length; i += 1) {
    buffer.writeUInt8(value.charCodeAt(i), offset + i);
  }
}

const byteRate = sampleRate * channels * 2;
const dataSize = sampleCount * channels * 2;
const buffer = Buffer.alloc(44 + dataSize);
writeString(buffer, 0, "RIFF");
buffer.writeUInt32LE(36 + dataSize, 4);
writeString(buffer, 8, "WAVE");
writeString(buffer, 12, "fmt ");
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(channels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(channels * 2, 32);
buffer.writeUInt16LE(16, 34);
writeString(buffer, 36, "data");
buffer.writeUInt32LE(dataSize, 40);

for (let i = 0; i < samples.length; i += 1) {
  buffer.writeInt16LE(Math.round(samples[i] * 32767), 44 + i * 2);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, buffer);
console.log(outputPath);
