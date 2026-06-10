// Normalize speech-recognition volume events into 0–1 levels for the waveform UI.

export const WAVEFORM_BAR_COUNT = 18;

/** expo-speech-recognition volumechange values are roughly -2 (inaudible) to 10. */
export function normalizeVolumeLevel(value: number): number {
  if (value <= 0) return 0;
  return Math.min(1, value / 10);
}

export function createIdleLevels(count = WAVEFORM_BAR_COUNT): number[] {
  return Array.from({ length: count }, () => 0);
}

export function shiftVolumeLevel(levels: number[], next: number): number[] {
  if (levels.length === 0) return [next];
  return [...levels.slice(1), next];
}
