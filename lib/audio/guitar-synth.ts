import { midiToFrequency } from "../music/notes";

export type GuitarTone = "acoustic" | "electric";

let audioContext: AudioContext | null = null;

function getContext() {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("Web Audio is not supported in this browser.");
  }

  audioContext ??= new AudioContextClass({ latencyHint: "interactive" });
  return audioContext;
}

/**
 * A lightweight plucked-string approximation built with Web Audio.
 * This is synthesized in-browser, not a recording or a guitar sample.
 */
export async function playGuitarNote(
  midi: number,
  tone: GuitarTone,
  volume = 0.22,
) {
  const context = getContext();

  // IMPORTANT: request audio activation synchronously in the tap handler.
  // On iOS Safari, awaiting resume() before creating/starting nodes can lose
  // the user-activation window and leave the first note silent.
  const resumePromise =
    context.state === "running" ? Promise.resolve() : context.resume();

  const now = context.currentTime;
  const fundamental = midiToFrequency(midi);
  const duration = tone === "acoustic" ? 1.35 : 1.05;

  const output = context.createGain();
  const filter = context.createBiquadFilter();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(tone === "acoustic" ? 4200 : 6500, now);
  filter.Q.setValueAtTime(tone === "acoustic" ? 0.65 : 1.1, now);
  output.gain.setValueAtTime(0.0001, now);
  output.gain.exponentialRampToValueAtTime(volume, now + 0.012);
  output.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  filter.connect(output);
  output.connect(context.destination);

  // Fundamental plus quieter harmonics gives the note a plucked character.
  const partials = tone === "acoustic" ? [1, 2, 3, 4] : [1, 2, 3, 5, 7];
  partials.forEach((partial) => {
    const oscillator = context.createOscillator();
    const partialGain = context.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(fundamental * partial, now);
    partialGain.gain.setValueAtTime(
      1 / (partial * (tone === "acoustic" ? 1.8 : 1.35)),
      now,
    );
    oscillator.connect(partialGain);
    partialGain.connect(filter);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.04);
    oscillator.onended = () => {
      oscillator.disconnect();
      partialGain.disconnect();
    };
  });

  // A very short attack transient makes the note easier to hear on phones.
  const pluck = context.createOscillator();
  const pluckGain = context.createGain();
  pluck.type = "triangle";
  pluck.frequency.setValueAtTime(fundamental * 2.03, now);
  pluckGain.gain.setValueAtTime(0.07, now);
  pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
  pluck.connect(pluckGain);
  pluckGain.connect(filter);
  pluck.start(now);
  pluck.stop(now + 0.06);
  pluck.onended = () => {
    pluck.disconnect();
    pluckGain.disconnect();
  };

  await resumePromise;
  if (context.state !== "running") {
    throw new Error("Audio is not active. Tap the note again to enable sound.");
  }

  window.setTimeout(() => {
    try {
      filter.disconnect();
      output.disconnect();
    } catch {
      // Nodes may already be disconnected after browser audio cleanup.
    }
  }, 1700);
}
