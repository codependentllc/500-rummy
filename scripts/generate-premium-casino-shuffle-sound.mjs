import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = join(root, "public", "sounds", "premium-casino-card-shuffle.wav");
const sampleRate = 44100;
const duration = 2.72;
const channels = 2;
const sampleCount = Math.floor(sampleRate * duration);
const samples = new Float32Array(sampleCount * channels);

let seed = 86420;
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0xffffffff;
}

function addStereo(index, left, right) {
  if (index < 0 || index >= sampleCount) return;
  samples[index * 2] += left;
  samples[index * 2 + 1] += right;
}

function addPolishedPaper(start, length, gain, pan, brightness = 0.5) {
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));
  let low = 0;
  let mid = 0;

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const p = Math.min(1, t / length);
    const env = Math.sin(Math.PI * p);
    const white = random() * 2 - 1;
    low += (white - low) * 0.12;
    mid += (white - mid) * brightness;
    const sheen = white - low * 0.5;
    const value = (sheen * 0.38 + mid * 0.34 + low * 0.28) * env * gain;
    addStereo(i, value * (1 - pan * 0.32), value * (1 + pan * 0.32));
  }
}

function addCardSnap(start, gain, pan, pitch) {
  const length = 0.055;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.exp(-t * 86);
    const tone = Math.sin(2 * Math.PI * pitch * t) * 0.32;
    const edge = (random() * 2 - 1) * 0.68;
    const value = (tone + edge) * env * gain;
    addStereo(i, value * (1 - pan * 0.42), value * (1 + pan * 0.42));
  }
}

function addControlledRiffle(start, count, spacing, panStart, panEnd) {
  for (let i = 0; i < count; i += 1) {
    const p = i / Math.max(1, count - 1);
    const time = start + i * spacing + (random() - 0.5) * spacing * 0.45;
    const pan = panStart + (panEnd - panStart) * p + Math.sin(i * 0.9) * 0.12;
    const gain = 0.072 + Math.sin(p * Math.PI) * 0.035 + random() * 0.012;
    addCardSnap(time, gain, Math.max(-1, Math.min(1, pan)), 760 + random() * 620);
    if (i % 5 === 0) addPolishedPaper(time - 0.008, 0.042, 0.018, pan, 0.62);
  }
}

function addBridge(start, count, spacing) {
  addPolishedPaper(start - 0.035, count * spacing + 0.2, 0.035, 0, 0.28);
  for (let i = 0; i < count; i += 1) {
    const p = i / Math.max(1, count - 1);
    const crown = Math.sin(p * Math.PI);
    const time = start + i * spacing + (random() - 0.5) * 0.004;
    const pan = -0.22 + p * 0.44;
    addCardSnap(time, 0.045 + crown * 0.055, pan, 520 + crown * 260 + random() * 120);
  }
}

function addDeckSquare(start) {
  addPolishedPaper(start, 0.26, 0.052, 0.04, 0.22);
  for (const [offset, pan, gain] of [
    [0.06, -0.08, 0.064],
    [0.14, 0.08, 0.056],
    [0.22, 0.02, 0.047]
  ]) {
    addCardSnap(start + offset, gain, pan, 390 + random() * 140);
  }
}

function addFeltTap(start) {
  const length = 0.24;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.exp(-t * 21);
    const low = Math.sin(2 * Math.PI * 82 * t) * env * 0.22;
    const cardEdge = (random() * 2 - 1) * Math.exp(-t * 64) * 0.035;
    const value = low + cardEdge;
    addStereo(i, value * 0.97, value * 1.03);
  }
}

addPolishedPaper(0.06, 0.22, 0.04, -0.28, 0.42);
addPolishedPaper(0.18, 0.22, 0.038, 0.28, 0.42);
addControlledRiffle(0.48, 54, 0.009, -0.46, 0.46);
addPolishedPaper(0.98, 0.18, 0.032, 0, 0.34);
addBridge(1.18, 40, 0.013);
addDeckSquare(1.84);
addFeltTap(2.36);
addCardSnap(2.375, 0.052, 0.03, 340);

let peak = 0;
for (const sample of samples) peak = Math.max(peak, Math.abs(sample));

const normalizer = peak > 0 ? 0.72 / peak : 1;
for (let i = 0; i < samples.length; i += 1) {
  const t = Math.floor(i / channels) / sampleRate;
  const fadeIn = Math.min(1, t / 0.018);
  const fadeOut = Math.min(1, (duration - t) / 0.14);
  samples[i] = Math.max(-1, Math.min(1, samples[i] * normalizer * fadeIn * fadeOut));
}

function writeString(buffer, offset, value) {
  for (let i = 0; i < value.length; i += 1) buffer.writeUInt8(value.charCodeAt(i), offset + i);
}

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
buffer.writeUInt32LE(sampleRate * channels * 2, 28);
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
