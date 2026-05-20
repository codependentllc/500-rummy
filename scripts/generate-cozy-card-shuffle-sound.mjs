import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = join(root, "public", "sounds", "cozy-card-shuffle-soft-tap.wav");
const sampleRate = 44100;
const duration = 1.85;
const channels = 2;
const sampleCount = Math.floor(sampleRate * duration);
const samples = new Float32Array(sampleCount * channels);

let seed = 2407;
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0xffffffff;
}

function addStereo(index, left, right) {
  if (index < 0 || index >= sampleCount) return;
  samples[index * 2] += left;
  samples[index * 2 + 1] += right;
}

function addSoftPaper(start, length, gain, pan, warmth = 0.12) {
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));
  let low = 0;
  let mid = 0;

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const progress = Math.min(1, t / length);
    const env = Math.sin(Math.PI * progress);
    const white = random() * 2 - 1;
    low += (white - low) * warmth;
    mid += (white - mid) * 0.32;
    const paper = (low * 0.64 + mid * 0.26 + white * 0.1) * env * gain;
    addStereo(i, paper * (1 - pan * 0.24), paper * (1 + pan * 0.24));
  }
}

function addGentleCardTick(start, gain, pan, pitch) {
  const length = 0.045;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.exp(-t * 76);
    const tick = Math.sin(2 * Math.PI * pitch * t) * 0.22 + (random() * 2 - 1) * 0.38;
    const value = tick * env * gain;
    addStereo(i, value * (1 - pan * 0.28), value * (1 + pan * 0.28));
  }
}

function addQuietTap(start, gain, pan) {
  const length = 0.18;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.exp(-t * 24);
    const felt = Math.sin(2 * Math.PI * 92 * t) * env * gain;
    const paperEdge = (random() * 2 - 1) * Math.exp(-t * 48) * gain * 0.055;
    const value = felt + paperEdge;
    addStereo(i, value * (1 - pan * 0.18), value * (1 + pan * 0.18));
  }
}

addSoftPaper(0.05, 0.32, 0.032, -0.12, 0.1);
for (let i = 0; i < 18; i += 1) {
  const time = 0.18 + i * 0.028 + (random() - 0.5) * 0.01;
  addGentleCardTick(time, 0.034 + random() * 0.012, Math.sin(i * 0.72) * 0.26, 520 + random() * 260);
}

addSoftPaper(0.74, 0.38, 0.037, 0.1, 0.09);
for (let i = 0; i < 8; i += 1) {
  addGentleCardTick(0.9 + i * 0.035 + (random() - 0.5) * 0.008, 0.025, -0.1 + i * 0.025, 430 + random() * 150);
}

addSoftPaper(1.19, 0.22, 0.026, 0, 0.08);
addQuietTap(1.48, 0.145, 0.04);

let peak = 0;
for (const sample of samples) peak = Math.max(peak, Math.abs(sample));

const normalizer = peak > 0 ? 0.5 / peak : 1;
for (let i = 0; i < samples.length; i += 1) {
  const t = Math.floor(i / channels) / sampleRate;
  const fadeIn = Math.min(1, t / 0.025);
  const fadeOut = Math.min(1, (duration - t) / 0.16);
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
