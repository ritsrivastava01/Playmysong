"use client";

import { fretNote, STANDARD_TUNING } from "../../lib/music/notes";

export type FretPosition = { stringIndex: number; fret: number };

type Props = {
  selected: FretPosition | null;
  completed: FretPosition[];
  target: FretPosition | null;
  onSelect: (stringIndex: number, fret: number) => void;
  onPlay: (stringIndex: number, fret: number) => void;
};

function samePosition(a: FretPosition | null, b: FretPosition) {
  return Boolean(a && a.stringIndex === b.stringIndex && a.fret === b.fret);
}

export function Fretboard({ selected, completed, target, onSelect, onPlay }: Props) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[690px]">
        <div className="mb-2 grid grid-cols-[48px_repeat(13,minmax(0,1fr))] text-center text-[10px] text-[#858b7e]">
          <span className="text-left">STRING</span>
          {Array.from({ length: 13 }, (_, fret) => <span key={fret}>{fret || "OPEN"}</span>)}
        </div>
        <div className="relative space-y-2 rounded-xl border border-white/10 bg-gradient-to-b from-[#292b26] to-[#11130f] px-2 py-4">
          {STANDARD_TUNING.map((string, stringIndex) => (
            <div key={string.name} className="relative z-10 grid h-10 grid-cols-[48px_repeat(13,minmax(0,1fr))] items-center">
              <span className="text-xs font-semibold text-[#c8f169]">{string.name}{string.octave}</span>
              {Array.from({ length: 13 }, (_, fret) => {
                const position = { stringIndex, fret };
                const note = fretNote(stringIndex, fret);
                const done = completed.some((item) => samePosition(item, position));
                const isTarget = samePosition(target, position);
                const active = samePosition(selected, position);
                const color = done
                  ? "bg-emerald-500 text-white shadow-[0_0_16px_rgba(16,185,129,.35)]"
                  : isTarget
                    ? "bg-amber-400 text-[#19130a] ring-4 ring-amber-300/20 shadow-[0_0_18px_rgba(251,191,36,.35)]"
                    : active
                      ? "bg-[#c8f169] text-[#15190e]"
                      : "bg-[#92999a]/25 text-[#9ca3af] hover:bg-white/20 hover:text-white";
                return (
                  <button
                    key={fret}
                    onClick={() => { onSelect(stringIndex, fret); onPlay(stringIndex, fret); }}
                    title={`${note.name} · ${string.label}, fret ${fret}`}
                    aria-label={`${note.name}, ${string.label}, fret ${fret}; play note`}
                    className={`relative mx-auto grid h-7 w-7 place-items-center rounded-full text-[9px] font-bold transition sm:h-8 sm:w-8 ${color}`}
                  >
                    {done ? "✓" : isTarget ? "•" : fret === 0 ? "○" : active ? note.name.replace(/ \\d+$/, "") : ""}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="pointer-events-none absolute inset-x-[58px] top-0 bottom-0 grid grid-cols-12">
            {Array.from({ length: 12 }, (_, i) => <span key={i} className={`border-l ${i === 0 ? "border-white/30" : "border-white/10"}`} />)}
          </div>
          <div className="pointer-events-none absolute left-[58px] right-2 top-1/2 h-px bg-white/20" />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-[#969b91]">
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500"/> Played correctly</span>
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-400"/> Next note</span>
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#92999a]/50"/> Not played yet</span>
        </div>
      </div>
    </div>
  );
}
