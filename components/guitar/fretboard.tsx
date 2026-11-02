"use client";

import { fretNote, STANDARD_TUNING } from "../../lib/music/notes";

type Props = {
  selected: { stringIndex: number; fret: number } | null;
  onSelect: (stringIndex: number, fret: number) => void;
  onPlay: (stringIndex: number, fret: number) => void;
};

export function Fretboard({ selected, onSelect, onPlay }: Props) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[690px]">
        <div className="mb-2 grid grid-cols-[48px_repeat(13,minmax(0,1fr))] text-center text-[10px] text-[#858b7e]">
          <span className="text-left">STRING</span>
          {Array.from({ length: 13 }, (_, fret) => <span key={fret}>{fret}</span>)}
        </div>
        <div className="relative space-y-2 rounded-xl bg-[#11130f] px-2 py-4">
          {STANDARD_TUNING.map((string, stringIndex) => (
            <div key={string.name} className="grid h-9 grid-cols-[48px_repeat(13,minmax(0,1fr))] items-center">
              <span className="text-xs font-semibold text-[#c8f169]">{string.name}{string.octave}</span>
              {Array.from({ length: 13 }, (_, fret) => {
                const note = fretNote(stringIndex, fret);
                const active = selected?.stringIndex === stringIndex && selected.fret === fret;
                return (
                  <button
                    key={fret}
                    onClick={() => { onSelect(stringIndex, fret); onPlay(stringIndex, fret); }}
                    title={`${note.name} · ${string.label}, fret ${fret}`}
                    aria-label={`${note.name}, ${string.label}, fret ${fret}; play note`}
                    className={`relative z-10 mx-auto grid h-7 w-7 place-items-center rounded-full text-[9px] font-bold transition sm:h-8 sm:w-8 ${active ? "bg-[#c8f169] text-[#15190e] ring-2 ring-[#c8f169]/30" : "text-[#777d70] hover:bg-white/10 hover:text-white"}`}
                  >
                    {active ? note.name.replace(/ \d+$/, "") : fret === 0 ? "○" : ""}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="pointer-events-none absolute inset-x-[58px] top-0 bottom-0 grid grid-cols-12">
            {Array.from({ length: 12 }, (_, i) => <span key={i} className={`border-l ${i === 0 ? "border-white/30" : "border-white/10"}`} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
