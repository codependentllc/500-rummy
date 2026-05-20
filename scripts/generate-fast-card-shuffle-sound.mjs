import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = join(root, "public", "sounds", "fast-card-shuffle-ui.wav");
const sampleRate = 44100;
const duration = 0.72;
const channels = 2;
const sampleCount = Math.floor(sampleRate * duration);
const samples = new Float32Array(sampleCount * channels);

let seed = 5707;
function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0xffffffff;
}

function addStereo(index, left, right) {
  if (index < 0 || index >= sampleCount) return;
  samples[index * 2] += left;
  samples[index * 2 + 1] += right;
}

function addTick(start, gain, pan, pitch) {
  const length = 0.028;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.exp(-t * 128);
    const value = (Math.sin(2 * Math.PI * pitch * t) * 0.28 + (random() * 2 - 1) * 0.72) * env * gain;
    addStereo(i, value * (1 - pan * 0.36), value * (1 + pan * 0.36));
  }
}

function addFlutter(start, length, gain, pan) {
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));
  let low = 0;

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.sin(Math.PI * Math.min(1, t / length));
    const white = random() * 2 - 1;
    low += (white - low) * 0.42;
    const value = (white * 0.58 + low * 0.42) * env * gain;
    addStereo(i, value * (1 - pan * 0.28), value * (1 + pan * 0.28));
  }
}

function addSquare(start, gain) {
  for (const [offset, pan, pitch] of [
    [0, -0.1, 430],
    [0.045, 0.08, 360]
  ]) {
    addTick(start + offset, gain, pan, pitch);
  }
}

function addTap(start, gain) {
  const length = 0.09;
  const startIndex = Math.floor(start * sampleRate);
  const endIndex = Math.min(sampleCount, startIndex + Math.floor(length * sampleRate));

  for (let i = startIndex; i < endIndex; i += 1) {
    const t = i / sampleRate - start;
    const env = Math.exp(-t * 38);
    const value = Math.sin(2 * Math.PI * 120 * t) * env * gain + (random() * 2 - 1) * env * gain * 0.07;
    addStereo(i, value, value);
  }
}

addFlutter(0.025, 0.16, 0.042, -0.16);
for (let i = 0; i < 24; i += 1) {
  const time = 0.08 + i * 0.011 + (random() - 0.5) * 0.006;
  addTick(time, 0.058 + random() * 0.018, Math.sin(i * 0.85) * 0.38, 760 + random() * 580);
}
addFlutter(0.33, 0.12, 0.032, 0.14);
addSquare(0.48, 0.096);
addTap(0.61, 0.13);

let peak = 0;
for (const sample of samples) peak = Math.max(peak, Math.abs(sample));

const normalizer = peak > 0 ? 0.64 / peak : 1;
for (let i = 0; i < samples.length; i += 1) {
  const t = Math.floor(i / channels) / sampleRate;
  const fadeIn = Math.min(1, t / 0.008);
  const fadeOut = Math.min(1, (duration - t) / 0.06);
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
