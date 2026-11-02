"use client";

import { useEffect, useRef, useState } from "react";
import { AudioLines, Guitar, Headphones, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Fretboard } from "../guitar/fretboard";
import { playGuitarNote, type GuitarTone } from "../../lib/audio/guitar-synth";
import { fretNote } from "../../lib/music/notes";

const melody = [
  { stringIndex: 5, fret: 0 }, { stringIndex: 5, fret: 3 },
  { stringIndex: 4, fret: 1 }, { stringIndex: 4, fret: 3 },
  { stringIndex: 3, fret: 0 }, { stringIndex: 3, fret: 2 },
  { stringIndex: 4, fret: 1 }, { stringIndex: 5, fret: 0 },
];

export function PracticePlayer() {
  const [tone, setTone] = useState<GuitarTone>("acoustic");
  const [tempo, setTempo] = useState(82);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<{ stringIndex: number; fret: number } | null>(melody[0]);
  const [error, setError] = useState("");
  const timer = useRef<number | null>(null);
  const cursor = useRef(0);
  const interval = 60000 / tempo;

  const playPosition = async (index: number) => {
    const position = melody[index];
    setActive(index);
    setSelected(position);
    try {
      await playGuitarNote(fretNote(position.stringIndex, position.fret).midi, tone);
      setError("");
    } catch {
      setError("Audio could not start. Please try tapping a note again.");
    }
  };

  const stop = () => {
    setPlaying(false);
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  };

  const start = async () => {
    if (playing) { stop(); return; }
    setPlaying(true);
    cursor.current = active;
    await playPosition(cursor.current);
  };

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      cursor.current = (cursor.current + 1) % melody.length;
      const position = melody[cursor.current];
      setActive(cursor.current);
      setSelected(position);
      void playGuitarNote(fretNote(position.stringIndex, position.fret).midi, tone)
        .catch(() => setError("Audio could not start."));
    }, interval);
    return () => { if (timer.current !== null) window.clearInterval(timer.current); timer.current = null; };
  }, [playing, tempo, tone, interval]);

  useEffect(() => () => { if (timer.current !== null) window.clearInterval(timer.current); }, []);

  const chooseTone = (next: GuitarTone) => {
    setTone(next);
    if (selected) void playGuitarNote(fretNote(selected.stringIndex, selected.fret).midi, next).catch(() => setError("Audio could not start."));
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
        <div className="mt-6"><Fretboard selected={selected} onSelect={setSelected} onPlay={(stringIndex, fret) => { void playGuitarNote(fretNote(stringIndex, fret).midi, tone).catch(() => setError("Audio could not start. Tap again to enable sound.")); }} /></div>
        {selected && <p className="mt-3 text-xs text-[#aeb3a5]">Selected: <strong className="text-[#c8f169]">{fretNote(selected.stringIndex, selected.fret).name}</strong> · {["Low E","A","D","G","B","High e"][selected.stringIndex]} string · fret {selected.fret}</p>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(270px,0.8fr)]">
        <div className="rounded-[26px] border border-white/10 bg-[#191b18] p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="font-semibold">First melody</h2><p className="mt-1 text-xs text-[#969b91]">Original beginner exercise · 8 notes</p></div><span className="text-xs text-[#969b91]">Note {active + 1} / 8</span></div>
          <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#11130f] p-4">
            <div className="mb-3 flex items-center justify-between text-xs text-[#858b7e]"><span>Guitar tablature</span><span>4/4</span></div>
            <div className="grid grid-cols-8 gap-1 text-center">
              {melody.map((position, index) => <button key={index} onClick={() => { stop(); void playPosition(index); }} className={`rounded-lg py-3 text-sm font-bold ${active === index ? "bg-[#c8f169] text-[#15190e]" : "bg-white/[0.04] text-[#e5e8dc] hover:bg-white/10"}`} aria-label={`Play note ${index + 1}`}>{position.fret}</button>)}
            </div>
            <div className="mt-2 grid grid-cols-8 gap-1 text-center text-[9px] text-[#777d70]">{melody.map((position,index)=><span key={index}>{["E","A","D","G","B","e"][position.stringIndex]}</span>)}</div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => { stop(); void playPosition(Math.max(0, active - 1)); }} className="rounded-full border border-white/10 p-2.5 text-[#aeb3a5]" aria-label="Previous note"><SkipBack size={16}/></button>
              <button onClick={() => void start()} className="grid h-12 w-12 place-items-center rounded-full bg-[#c8f169] text-[#15190e]" aria-label={playing ? "Pause playback" : "Play melody"}>{playing ? <Pause size={19}/> : <Play size={19} fill="currentColor"/>}</button>
              <button onClick={() => { stop(); void playPosition(Math.min(7, active + 1)); }} className="rounded-full border border-white/10 p-2.5 text-[#aeb3a5]" aria-label="Next note"><SkipForward size={16}/></button>
            </div>
            <div className="flex items-center gap-3"><Volume2 size={16} className="text-[#858b7e]"/><span className="text-xs text-[#969b91]">{tempo} BPM</span><input aria-label="Tempo" type="range" min="40" max="180" value={tempo} onChange={event=>setTempo(Number(event.target.value))} className="w-28 accent-[#c8f169]"/></div>
          </div>
          {error && <p role="status" className="mt-3 text-xs text-amber-300">{error}</p>}
        </div>

        <aside className="rounded-[26px] border border-white/10 bg-[#191b18] p-5 sm:p-6">
          <div className="flex items-center gap-2"><Guitar size={17} className="text-[#c8f169]"/><h2 className="font-semibold">Guitar sound</h2></div>
          <p className="mt-2 text-xs leading-5 text-[#969b91]">Choose the tone that matches the guitar you’re practising on.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(["acoustic","electric"] as const).map(option=><button key={option} onClick={()=>chooseTone(option)} aria-pressed={tone===option} className={`rounded-xl border px-3 py-3 text-left transition ${tone===option ? "border-[#c8f169]/50 bg-[#c8f169]/10 text-[#c8f169]" : "border-white/10 text-[#c4c8bc] hover:bg-white/5"}`}><span className="block text-sm font-semibold capitalize">{option}</span><span className="mt-1 block text-[10px] text-[#858b7e]">{option==="acoustic" ? "Warm, woody tone" : "Brighter, sharper tone"}</span></button>)}
          </div>
          <div className="my-5 border-t border-white/[0.07]"/>
          <div className="flex items-center gap-2 text-sm font-medium"><Headphones size={16} className="text-[#c8f169]"/> Audio preview</div>
          <p className="mt-2 text-xs leading-5 text-[#969b91]">Tap a fret or play the melody to compare the two tones. Use headphones for a clearer comparison.</p>
          <p className="mt-4 rounded-xl bg-white/[0.04] p-3 text-[11px] leading-5 text-[#858b7e]">These are synthesized guitar-like tones generated in your browser, not studio-recorded guitar samples. We can refine or remove either sound profile based on how it feels in practice.</p>
        </aside>
      </div>
    </section>
  );
}
