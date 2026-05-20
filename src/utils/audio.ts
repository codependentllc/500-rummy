const audioCache = new Map<string, HTMLAudioElement>();

export function playSound(src: string, volume = 0.55) {
  if (typeof window === "undefined") return;

  const cached = audioCache.get(src);
  const audio = cached ? cached.cloneNode(true) as HTMLAudioElement : new Audio(src);

  if (!cached) {
    audio.preload = "auto";
    audioCache.set(src, audio);
  }

  audio.volume = volume;
  audio.currentTime = 0;
  void audio.play().catch(() => undefined);
}
