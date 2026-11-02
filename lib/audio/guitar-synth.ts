import { midiToFrequency } from "../music/notes";

export type GuitarTone = "acoustic" | "electric";

let audioContext: AudioContext | null = null;

function getContext() {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) throw new Error("Web Audio is not supported in this browser.");
  audioContext ??= new AudioContextClass();
  return audioContext;
}

/** A lightweight plucked-string approximation built with Web Audio (not a recorded guitar sample). */
export async function playGuitarNote(midi: number, tone: GuitarTone, volume = 0.22) {
  const context = getContext();
  if (context.state === "suspended") await context.resume();

  const now = context.currentTime;
  const fundamental = midiToFrequency(midi);
  const output = context.createGain();
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(tone === "acoustic" ? 4200 : 6500, now);
  filter.Q.value = tone === "acoustic" ? 0.65 : 1.1;
  output.gain.setValueAtTime(0.0001, now);
  output.gain.exponentialRampToValueAtTime(volume, now + 0.012);
  output.gain.exponentialRampToValueAtTime(0.0001, now + (tone === "acoustic" ? 1.35 : 1.05));
  filter.connect(output);
  output.connect(context.destination);

  const partials = tone === "acoustic" ? [1, 2, 3, 4] : [1, 2, 3, 5, 7];
  partials.forEach((partial, index) => {
    const oscillator = context.createOscillator();
    const partialGain = context.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(fundamental * partial, now);
    partialGain.gain.value = 1 / (partial * (tone === "acoustic" ? 1.7 : 1.25));
    oscillator.connect(partialGain);
    partialGain.connect(filter);
    oscillator.start(now);
    oscillator.stop(now + (tone === "acoustic" ? 1.4 : 1.1));
    oscillator.onended = () => { oscillator.disconnect(); partialGain.disconnect(); };
  });

  const pluck = context.createOscillator();
  const pluckGain = context.createGain();
  pluck.type = "triangle";
  pluck.frequency.setValueAtTime(fundamental * 2.03, now);
  pluckGain.gain.setValueAtTime(0.055, now);
  pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
  pluck.connect(pluckGain);
  pluckGain.connect(filter);
  pluck.start(now);
  pluck.stop(now + 0.05);
  pluck.onended = () => { pluck.disconnect(); pluckGain.disconnect(); };

  window.setTimeout(() => { filter.disconnect(); output.disconnect(); }, 1700);
}
