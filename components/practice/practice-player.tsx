"use client";

import { useEffect, useRef, useState } from "react";
import { AudioLines, Guitar, Headphones, Mic, MicOff, Pause, Play, RotateCcw, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { PitchDetector } from "pitchy";
import { Fretboard, type FretPosition } from "../guitar/fretboard";
import { playGuitarNote, type GuitarTone } from "../../lib/audio/guitar-synth";
import { fretNote } from "../../lib/music/notes";

const exercises = [
  {
    title: "First melody",
    description: "Play each note in order. Listen to the reference, then try it on your guitar.",
    tempo: 82,
    notes: [
      { stringIndex: 5, fret: 0 }, { stringIndex: 5, fret: 3 },
      { stringIndex: 4, fret: 1 }, { stringIndex: 4, fret: 3 },
      { stringIndex: 3, fret: 0 }, { stringIndex: 3, fret: 2 },
      { stringIndex: 4, fret: 1 }, { stringIndex: 5, fret: 0 },
    ],
  },
  {
    title: "G string steps",
    description: "A short exercise on one string: play frets 0, 2, 3 and 5.",
    tempo: 72,
    notes: [0, 2, 3, 5].map((fret) => ({ stringIndex: 3, fret })),
  },
];

type ListenState = "idle" | "listening" | "complete" | "error";

export function PracticePlayer() {
  const [tone, setTone] = useState<GuitarTone>("acoustic");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const exercise = exercises[exerciseIndex];
  const [tempo, setTempo] = useState(exercise.tempo);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<FretPosition | null>(exercise.notes[0]);
  const [completed, setCompleted] = useState<FretPosition[]>([]);
  const [listenState, setListenState] = useState<ListenState>("idle");
  const [feedback, setFeedback] = useState("Tap Listen to Me, then play the highlighted note on your guitar.");
  const [detectedNote, setDetectedNote] = useState("");
  const [error, setError] = useState("");
  const timer = useRef<number | null>(null);
  const cursor = useRef(0);
  const listenResources = useRef<{ stream: MediaStream; context: AudioContext; frame: number } | null>(null);
  const interval = 60000 / tempo;
  const target = exercise.notes[Math.min(active, exercise.notes.length - 1)] ?? null;
  const progress = completed.length;

  const playPosition = async (position: FretPosition) => {
    setSelected(position);
    try {
      await playGuitarNote(fretNote(position.stringIndex, position.fret).midi, tone);
      setError("");
    } catch {
      setError("Audio could not start. Tap the note again to enable sound.");
    }
  };

  const stopPlayback = () => {
    setPlaying(false);
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  };

  const stopListening = () => {
    const resources = listenResources.current;
    if (resources) {
      window.cancelAnimationFrame(resources.frame);
      resources.stream.getTracks().forEach((track) => track.stop());
      void resources.context.close();
      listenResources.current = null;
    }
    setListenState((current) => current === "complete" ? current : "idle");
  };

  const resetExercise = () => {
    stopPlayback();
    stopListening();
    setCompleted([]);
    setActive(0);
    cursor.current = 0;
    setSelected(exercise.notes[0]);
    setDetectedNote("");
    setFeedback("Exercise reset. Start again when you're ready.");
    setError("");
  };

  const startListening = async () => {
    if (listenState === "listening") {
      stopListening();
      setFeedback("Listening paused. Your progress is saved.");
      return;
    }
    if (listenState === "complete") resetExercise();
    if (!navigator.mediaDevices?.getUserMedia) {
      setListenState("error");
      setError("Microphone access is unavailable. Open PlayMySong over HTTPS and use a supported browser.");
      return;
    }
    try {
      setError("");
      setFeedback("Requesting microphone access…");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const context = new AudioContext();
      await context.resume();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      const detector = PitchDetector.forFloat32Array(analyser.fftSize);
      detector.minVolumeDecibels = -48;
      const input = new Float32Array(analyser.fftSize);
      let stableMidi = -1;
      let stableFrames = 0;
      setListenState("listening");
      setFeedback("Listening… play the yellow highlighted note on your guitar.");
      const resources = { stream, context, frame: 0 };
      listenResources.current = resources;

      const analyse = () => {
        if (listenResources.current !== resources) return;
        analyser.getFloatTimeDomainData(input);
        const [frequency, clarity] = detector.findPitch(input, context.sampleRate);
        if (frequency > 0 && clarity > 0.82) {
          const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
          setDetectedNote(fretNoteFromMidi(midi));
          const expected = exercise.notes[activeRef.current];
          if (expected) {
            const expectedMidi = fretNote(expected.stringIndex, expected.fret).midi;
            if (Math.abs(midi - expectedMidi) <= 1) {
              if (stableMidi === midi) stableFrames += 1;
              else { stableMidi = midi; stableFrames = 1; }
              if (stableFrames >= 4) {
                setCompleted((current) => current.some((item) => item.stringIndex === expected.stringIndex && item.fret === expected.fret) ? current : [...current, expected]);
                setActive((current) => {
                  const next = current + 1;
                  if (next >= exercise.notes.length) {
                    setListenState("complete");
                    setFeedback("Excellent! You completed the exercise.");
                  } else {
                    setFeedback("Correct note! Now play the next highlighted position.");
                  }
                  return Math.min(next, exercise.notes.length - 1);
                });
                stableFrames = 0;
                stableMidi = -1;
              }
            } else {
              stableFrames = 0;
              stableMidi = -1;
            }
          }
        } else {
          stableFrames = 0;
          stableMidi = -1;
        }
        resources.frame = window.requestAnimationFrame(analyse);
      };
      resources.frame = window.requestAnimationFrame(analyse);
    } catch (cause) {
      setListenState("error");
      setError(cause instanceof Error && cause.name === "NotAllowedError"
        ? "Microphone permission was denied. Allow microphone access in your browser settings and try again."
        : "Could not start the microphone. Please check your microphone and try again.");
    }
  };

  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      cursor.current = (cursor.current + 1) % exercise.notes.length;
      const position = exercise.notes[cursor.current];
      setActive(cursor.current);
      setSelected(position);
      void playGuitarNote(fretNote(position.stringIndex, position.fret).midi, tone)
        .catch(() => setError("Audio could not start. Tap a note to enable sound."));
    }, interval);
    return () => { if (timer.current !== null) window.clearInterval(timer.current); timer.current = null; };
  }, [playing, tempo, tone, interval, exercise]);

  useEffect(() => () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    const resources = listenResources.current;
    if (resources) {
      window.cancelAnimationFrame(resources.frame);
      resources.stream.getTracks().forEach((track) => track.stop());
      void resources.context.close();
    }
  }, []);

  const chooseExercise = (index: number) => {
    stopPlayback();
    stopListening();
    setExerciseIndex(index);
    setTempo(exercises[index].tempo);
    setActive(0);
    cursor.current = 0;
    setCompleted([]);
    setSelected(exercises[index].notes[0]);
    setListenState("idle");
    setDetectedNote("");
    setFeedback("Choose Play Exercise to hear the notes, or Listen to Me to try it yourself.");
  };

  const startPlayback = async () => {
    if (playing) { stopPlayback(); return; }
    stopListening();
    setPlaying(true);
    cursor.current = active;
    await playPosition(exercise.notes[active]);
  };

  const step = async (direction: -1 | 1) => {
    stopPlayback();
    const next = Math.max(0, Math.min(exercise.notes.length - 1, active + direction));
    setActive(next);
    await playPosition(exercise.notes[next]);
  };

  const chooseTone = (next: GuitarTone) => {
    setTone(next);
    if (selected) void playGuitarNote(fretNote(selected.stringIndex, selected.fret).midi, next)
      .catch(() => setError("Audio could not start. Tap again to enable sound."));
  };

  return (
    <section className="space-y-5">
      <div className="rounded-[26px] border border-white/10 bg-[#191b18] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#29351d] text-[#c8f169]"><AudioLines size={20} /></span>
            <div><h2 className="font-semibold">Interactive fretboard</h2><p className="mt-1 text-xs text-[#969b91]">Standard tuning · E A D G B e · 0–12 frets</p></div>
          </div>
          <span className="rounded-full bg-[#c8f169]/10 px-3 py-1.5 text-xs text-[#c8f169]">Tap any fret to hear it</span>
        </div>
        <div className="mt-6"><Fretboard
          selected={selected}
          completed={completed}
          target={listenState === "listening" ? target : null}
          onSelect={(stringIndex, fret) => setSelected({ stringIndex, fret })}
          onPlay={(stringIndex, fret) => { void playGuitarNote(fretNote(stringIndex, fret).midi, tone).catch(() => setError("Audio could not start. Tap again to enable sound.")); }}
        /></div>
        {selected && <p className="mt-3 text-xs text-[#aeb3a5]">Selected: <strong className="text-[#c8f169]">{fretNote(selected.stringIndex, selected.fret).name}</strong> · string {["Low E","A","D","G","B","High e"][selected.stringIndex]} · fret {selected.fret}</p>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(270px,0.8fr)]">
        <div className="rounded-[26px] border border-white/10 bg-[#191b18] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-semibold">Practice exercises</h2><p className="mt-1 text-xs text-[#969b91]">Play the reference or let PlayMySong listen to your guitar.</p></div>
            <select value={exerciseIndex} onChange={(event) => chooseExercise(Number(event.target.value))} className="rounded-lg border border-white/10 bg-[#11130f] px-3 py-2 text-xs text-white">
              {exercises.map((item, index) => <option key={item.title} value={index}>{index + 1}. {item.title}</option>)}
            </select>
          </div>
          <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#11130f] p-4">
            <div className="mb-3 flex items-center justify-between text-xs text-[#858b7e]"><span>{exercise.title}</span><span>{progress} / {exercise.notes.length} correct</span></div>
            <p className="mb-4 text-xs leading-5 text-[#aeb3a5]">{exercise.description}</p>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(progress / exercise.notes.length) * 100}%` }}/></div>
            <div className="grid grid-cols-8 gap-1 text-center">
              {exercise.notes.map((position, index) => <button key={index} onClick={() => { stopPlayback(); setActive(index); void playPosition(position); }} className={`rounded-lg py-3 text-sm font-bold ${completed.some((item) => item.stringIndex === position.stringIndex && item.fret === position.fret) ? "bg-emerald-500 text-white" : active === index ? "bg-amber-400 text-[#15190e]" : "bg-white/[0.04] text-[#e5e8dc] hover:bg-white/10"}`} aria-label={`Play note ${index + 1}`}>{position.fret}</button>)}
            </div>
            <div className="mt-2 grid grid-cols-8 gap-1 text-center text-[9px] text-[#777d70]">{exercise.notes.map((position,index)=><span key={index}>{["E","A","D","G","B","e"][position.stringIndex]}</span>)}</div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => void step(-1)} className="rounded-full border border-white/10 p-2.5 text-[#aeb3a5]" aria-label="Previous note"><SkipBack size={16}/></button>
              <button onClick={() => void startPlayback()} className="grid h-12 w-12 place-items-center rounded-full bg-[#c8f169] text-[#15190e]" aria-label={playing ? "Pause playback" : "Play exercise"}>{playing ? <Pause size={19}/> : <Play size={19} fill="currentColor"/>}</button>
              <button onClick={() => void step(1)} className="rounded-full border border-white/10 p-2.5 text-[#aeb3a5]" aria-label="Next note"><SkipForward size={16}/></button>
              <button onClick={resetExercise} className="rounded-full border border-white/10 p-2.5 text-[#aeb3a5]" aria-label="Reset exercise"><RotateCcw size={16}/></button>
            </div>
            <div className="flex items-center gap-3"><Volume2 size={16} className="text-[#858b7e]"/><span className="text-xs text-[#969b91]">{tempo} BPM</span><input aria-label="Tempo" type="range" min="40" max="180" value={tempo} onChange={(event)=>setTempo(Number(event.target.value))} className="w-28 accent-[#c8f169]"/></div>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Mic size={17} className={listenState === "listening" ? "text-emerald-400" : "text-[#c8f169]"}/><span className="text-sm font-medium">Play on your guitar</span></div>
              <button onClick={() => void startListening()} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${listenState === "listening" ? "bg-rose-500/15 text-rose-300" : "bg-[#c8f169] text-[#15190e]"}`}>
                {listenState === "listening" ? <><MicOff size={14}/> Stop listening</> : <><Mic size={14}/> Listen to me</>}
              </button>
            </div>
            <p aria-live="polite" className="mt-2 text-xs leading-5 text-[#aeb3a5]">{feedback}</p>
            {detectedNote && listenState === "listening" && <p className="mt-1 text-[11px] text-emerald-300">Detected: {detectedNote}</p>}
            {listenState === "complete" && <p className="mt-2 text-xs font-semibold text-emerald-300">Exercise completed — all notes detected!</p>}
          </div>
          {error && <p role="alert" className="mt-3 text-xs text-amber-300">{error}</p>}
        </div>

        <aside className="rounded-[26px] border border-white/10 bg-[#191b18] p-5 sm:p-6">
          <div className="flex items-center gap-2"><Guitar size={17} className="text-[#c8f169]"/><h2 className="font-semibold">Guitar sound</h2></div>
          <p className="mt-2 text-xs leading-5 text-[#969b91]">Choose the reference tone for your practice.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(["acoustic","electric"] as const).map(option=><button key={option} onClick={()=>chooseTone(option)} aria-pressed={tone===option} className={`rounded-xl border px-3 py-3 text-left transition ${tone===option ? "border-[#c8f169]/50 bg-[#c8f169]/10 text-[#c8f169]" : "border-white/10 text-[#c4c8bc] hover:bg-white/5"}`}><span className="block text-sm font-semibold capitalize">{option}</span><span className="mt-1 block text-[10px] text-[#858b7e]">{option==="acoustic" ? "Warm reference tone" : "Bright reference tone"}</span></button>)}
          </div>
          <div className="my-5 border-t border-white/[0.07]"/>
          <div className="flex items-center gap-2 text-sm font-medium"><Headphones size={16} className="text-[#c8f169]"/>Practice tips</div>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-[#969b91]">
            <li>• Tune your guitar before starting.</li>
            <li>• Play one clear note at a time.</li>
            <li>• Keep your guitar close to the microphone.</li>
            <li>• Use headphones for the reference sound to avoid microphone feedback.</li>
          </ul>
          <p className="mt-4 rounded-xl bg-white/[0.04] p-3 text-[11px] leading-5 text-[#858b7e]">Microphone detection checks pitch. It cannot yet distinguish the same pitch played on different strings, so it marks the exercise's expected fret when the correct pitch is heard.</p>
        </aside>
      </div>
    </section>
  );
}

function fretNoteFromMidi(midi: number) {
  const names = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  return `${names[((midi % 12) + 12) % 12]} ${Math.floor(midi / 12) - 1}`;
}
