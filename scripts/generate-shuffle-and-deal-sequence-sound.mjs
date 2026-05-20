import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = join(root, "public", "sounds", "shuffle-square-deal-sequence.wav");
const sampleRate = 44100;
const duration = 3.4;
const channels = 2;
const sampleCount = Math.floor(sampleRate * duration);
const samples = new Float32Array(sampleCount * channels);

let seed = 9941;
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0xffffffff;
}

function addStereo(index, left, right) {
  if (index < 0 || index >= sampleCount) return;
  samples[index * 2] += left;
  samples[index * 2 + 1] += right;
}

function addPaperClick(start, gain, pan, pitch) {
  const length = 0.052;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.exp(-t * 92);
    const click = Math.sin(2 * Math.PI * pitch * t) * 0.34 + (random() * 2 - 1) * 0.66;
    const value = click * env * gain;
    addStereo(i, value * (1 - pan * 0.42), value * (1 + pan * 0.42));
  }
}

function addPaperBed(start, length, gain, pan, brightness = 0.34) {
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));
  let low = 0;

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.sin(Math.PI * Math.min(1, t / length));
    const white = random() * 2 - 1;
    low += (white - low) * brightness;
    const paper = (white * 0.5 + low * 0.5) * env * gain;
    addStereo(i, paper * (1 - pan * 0.34), paper * (1 + pan * 0.34));
  }
}

function addSlide(start, length, gain, panStart, panEnd) {
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));
  let low = 0;

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const progress = Math.min(1, t / length);
    const env = Math.sin(Math.PI * progress);
    const white = random() * 2 - 1;
    low += (white - low) * 0.12;
    const feltSlide = (white * 0.22 + low * 0.78) * env * gain;
    const pan = panStart + (panEnd - panStart) * progress;
    addStereo(i, feltSlide * (1 - pan * 0.36), feltSlide * (1 + pan * 0.36));
  }
}

function addTap(start, gain, pan, pitch = 138) {
  const length = 0.12;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.exp(-t * 32);
    const tap = Math.sin(2 * Math.PI * pitch * t) * env * gain;
    const edge = (random() * 2 - 1) * Math.exp(-t * 65) * gain * 0.1;
    const value = tap + edge;
    addStereo(i, value * (1 - pan * 0.28), value * (1 + pan * 0.28));
  }
}

function addMiniShuffle(start) {
  addPaperBed(start, 0.16, 0.035, -0.12, 0.58);
  for (let i = 0; i < 26; i += 1) {
    const time = start + 0.08 + i * 0.014 + (random() - 0.5) * 0.007;
    addPaperClick(time, 0.055 + random() * 0.025, Math.sin(i * 0.8) * 0.38, 720 + random() * 680);
  }
  addPaperBed(start + 0.45, 0.16, 0.045, 0.08, 0.3);
}

function addDealCard(start, destinationPan, pitchOffset) {
  addPaperClick(start, 0.065, -0.06, 620 + pitchOffset);
  addSlide(start + 0.014, 0.18, 0.038, -0.1, destinationPan);
  addTap(start + 0.2, 0.075, destinationPan, 124 + pitchOffset * 0.04);
}

addMiniShuffle(0.04);
addSlide(0.64, 0.28, 0.052, -0.2, 0.08);
addPaperClick(0.78, 0.075, 0.02, 410);
addTap(0.91, 0.13, 0.02, 102);

const dealPans = [-0.58, 0.54, -0.22, 0.28, -0.66, 0.62, -0.12, 0.16];
for (let i = 0; i < dealPans.length; i += 1) {
  addDealCard(1.18 + i * 0.235, dealPans[i], i * 18);
}

addPaperBed(3.05, 0.12, 0.018, 0, 0.24);

let peak = 0;
for (const sample of samples) peak = Math.max(peak, Math.abs(sample));

const normalizer = peak > 0 ? 0.66 / peak : 1;
for (let i = 0; i < samples.length; i += 1) {
  const t = Math.floor(i / channels) / sampleRate;
  const fadeIn = Math.min(1, t / 0.012);
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
