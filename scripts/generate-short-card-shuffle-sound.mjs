import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = join(root, "public", "sounds", "card-shuffle-short-ui.wav");
const sampleRate = 44100;
const duration = 0.82;
const channels = 2;
const sampleCount = Math.floor(sampleRate * duration);
const samples = new Float32Array(sampleCount * channels);

let seed = 731;
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0xffffffff;
}

function addStereo(index, left, right) {
  if (index < 0 || index >= sampleCount) return;
  samples[index * 2] += left;
  samples[index * 2 + 1] += right;
}

function addPaperTick(start, gain, pan, pitch) {
  const length = 0.035;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.exp(-t * 110);
    const snap = Math.sin(2 * Math.PI * pitch * t) * 0.35 + (random() * 2 - 1) * 0.65;
    const value = snap * env * gain;
    addStereo(i, value * (1 - pan * 0.34), value * (1 + pan * 0.34));
  }
}

function addFlutter(start, length, gain, pan) {
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));
  let lp = 0;

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.sin(Math.PI * Math.min(1, t / length));
    const white = random() * 2 - 1;
    lp += (white - lp) * 0.34;
    const paper = (white * 0.5 + lp * 0.5) * env * gain;
    addStereo(i, paper * (1 - pan * 0.28), paper * (1 + pan * 0.28));
  }
}

function addSoftTap(start, gain) {
  const length = 0.13;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.exp(-t * 28);
    const thump = Math.sin(2 * Math.PI * 115 * t) * env * gain;
    const paper = (random() * 2 - 1) * env * gain * 0.08;
    addStereo(i, thump + paper, thump + paper);
  }
}

addFlutter(0.03, 0.22, 0.035, -0.18);
for (let i = 0; i < 18; i += 1) {
  const time = 0.09 + i * 0.018 + (random() - 0.5) * 0.009;
  const pan = Math.sin(i * 0.9) * 0.42;
  addPaperTick(time, 0.065 + random() * 0.025, pan, 820 + random() * 520);
}
addFlutter(0.38, 0.2, 0.028, 0.2);
for (let i = 0; i < 7; i += 1) {
  addPaperTick(0.43 + i * 0.021 + (random() - 0.5) * 0.006, 0.045, -0.16 + i * 0.05, 620 + random() * 260);
}
addSoftTap(0.66, 0.19);

let peak = 0;
for (const sample of samples) peak = Math.max(peak, Math.abs(sample));

const normalizer = peak > 0 ? 0.62 / peak : 1;
for (let i = 0; i < samples.length; i += 1) {
  const t = Math.floor(i / channels) / sampleRate;
  const fadeIn = Math.min(1, t / 0.012);
  const fadeOut = Math.min(1, (duration - t) / 0.08);
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
