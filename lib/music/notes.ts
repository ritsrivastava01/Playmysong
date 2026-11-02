export const STANDARD_TUNING = [
  { name: "E", octave: 2, midi: 40, label: "Low E" },
  { name: "A", octave: 2, midi: 45, label: "A" },
  { name: "D", octave: 3, midi: 50, label: "D" },
  { name: "G", octave: 3, midi: 55, label: "G" },
  { name: "B", octave: 3, midi: 59, label: "B" },
  { name: "e", octave: 4, midi: 64, label: "High e" },
] as const;

export const NOTE_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

export function midiToFrequency(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function noteName(midi: number) {
  return `${NOTE_NAMES[midi % 12]} ${Math.floor(midi / 12) - 1}`;
}

export function fretNote(stringIndex: number, fret: number) {
  const midi = STANDARD_TUNING[stringIndex].midi + fret;
  return { midi, frequency: midiToFrequency(midi), name: noteName(midi) };
}
