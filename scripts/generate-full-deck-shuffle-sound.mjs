import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = join(root, "public", "sounds", "full-deck-shuffle-bridge-tap.wav");
const sampleRate = 44100;
const duration = 3.05;
const channels = 2;
const sampleCount = Math.floor(sampleRate * duration);
const samples = new Float32Array(sampleCount * channels);

let seed = 50052;
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0xffffffff;
}

function addStereo(index, left, right) {
  if (index < 0 || index >= sampleCount) return;
  samples[index * 2] += left;
  samples[index * 2 + 1] += right;
}

function addPaperNoise(start, length, gain, pan, texture = 0.34) {
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));
  let low = 0;
  let high = 0;

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const fade = Math.sin(Math.PI * Math.min(1, t / length));
    const white = random() * 2 - 1;
    low += (white - low) * texture;
    high = white - low * 0.68;
    const paper = (high * 0.58 + low * 0.42) * fade * gain;
    addStereo(i, paper * (1 - pan * 0.38), paper * (1 + pan * 0.38));
  }
}

function addSnap(start, gain, pan, pitch) {
  const length = 0.06;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.exp(-t * 78);
    const snap = Math.sin(2 * Math.PI * pitch * t) * 0.36 + (random() * 2 - 1) * 0.64;
    const value = snap * env * gain;
    addStereo(i, value * (1 - pan * 0.44), value * (1 + pan * 0.44));
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
    low += (white - low) * 0.16;
    const scrape = (white * 0.28 + low * 0.72) * env * gain;
    const pan = panStart + (panEnd - panStart) * progress;
    addStereo(i, scrape * (1 - pan * 0.34), scrape * (1 + pan * 0.34));
  }
}

function addRiffle(start, count, spacing, panStart, panEnd, gain) {
  for (let i = 0; i < count; i += 1) {
    const progress = i / Math.max(1, count - 1);
    const time = start + i * spacing + (random() - 0.5) * spacing * 0.82;
    const pan = panStart + (panEnd - panStart) * progress + Math.sin(i * 1.13) * 0.2;
    addSnap(time, gain * (0.78 + random() * 0.44), Math.max(-1, Math.min(1, pan)), 680 + random() * 760);
    if (i % 4 === 0) addPaperNoise(time - 0.01, 0.05, gain * 0.22, pan, 0.62);
  }
}

function addBridge(start, count, spacing) {
  addPaperNoise(start - 0.035, count * spacing + 0.26, 0.045, 0, 0.24);
  for (let i = 0; i < count; i += 1) {
    const progress = i / Math.max(1, count - 1);
    const curve = Math.sin(progress * Math.PI);
    const time = start + i * spacing + (random() - 0.5) * 0.006;
    const pan = -0.32 + progress * 0.64;
    addSnap(time, 0.055 + curve * 0.06, pan, 420 + curve * 360 + random() * 160);
  }
}

function addFeltTap(start, gain) {
  const length = 0.24;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.exp(-t * 20);
    const thump = Math.sin(2 * Math.PI * 86 * t) * env * gain;
    const paperEdge = (random() * 2 - 1) * Math.exp(-t * 52) * gain * 0.15;
    const value = thump + paperEdge;
    addStereo(i, value * 0.96, value * 1.04);
  }
}

addSlide(0.05, 0.28, 0.052, -0.3, -0.72);
addSlide(0.2, 0.24, 0.05, 0.28, 0.72);
addPaperNoise(0.4, 0.16, 0.032, 0, 0.3);

addRiffle(0.62, 52, 0.0095, -0.62, 0.62, 0.078);
addPaperNoise(1.12, 0.24, 0.05, 0, 0.42);

addBridge(1.34, 42, 0.014);
addPaperNoise(1.92, 0.22, 0.04, 0, 0.28);

addSlide(2.08, 0.34, 0.07, -0.18, 0.12);
for (const time of [2.31, 2.39, 2.48]) {
  addSnap(time, 0.09, (random() - 0.5) * 0.24, 330 + random() * 180);
}

addFeltTap(2.68, 0.34);
addSnap(2.695, 0.08, 0.05, 300);

let peak = 0;
for (const sample of samples) peak = Math.max(peak, Math.abs(sample));

const normalizer = peak > 0 ? 0.78 / peak : 1;
for (let i = 0; i < samples.length; i += 1) {
  const t = Math.floor(i / channels) / sampleRate;
  const fadeIn = Math.min(1, t / 0.018);
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
