"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  Bookmark,
  Check,
  ChevronDown,
  CircleHelp,
  Guitar,
  Headphones,
  ListMusic,
  Menu,
  Minus,
  Pause,
  Play,
  Plus,
  Search,
  Settings2,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  Volume2,
} from "lucide-react";

const notes = [
  { string: 1, fret: 0, label: "E" },
  { string: 1, fret: 3, label: "G" },
  { string: 2, fret: 1, label: "C" },
  { string: 2, fret: 3, label: "D" },
  { string: 3, fret: 0, label: "G" },
  { string: 3, fret: 2, label: "A" },
  { string: 2, fret: 1, label: "C" },
  { string: 1, fret: 0, label: "E" },
];

const tabRows = [
  { string: "e", values: ["0", "—", "3", "—", "—", "—", "—", "—"] },
  { string: "B", values: ["—", "1", "—", "3", "—", "—", "1", "—"] },
  { string: "G", values: ["—", "—", "—", "—", "0", "2", "—", "—"] },
  { string: "D", values: ["—", "—", "—", "—", "—", "—", "—", "—"] },
  { string: "A", values: ["—", "—", "—", "—", "—", "—", "—", "—"] },
  { string: "E", values: ["—", "—", "—", "—", "—", "—", "—", "—"] },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold tracking-wide text-[#f4f3ed]">
        {children}
      </h2>
    </div>
  );
}

export default function Home() {
  const [tempo, setTempo] = useState(82);
  const [playing, setPlaying] = useState(false);
  const [activeNote, setActiveNote] = useState(0);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("Practice");

  const progress = useMemo(() => ((activeNote + 1) / notes.length) * 100, [activeNote]);

  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-4 pb-12 sm:px-7 lg:px-10">
      <header className="flex h-[76px] items-center justify-between border-b border-white/[0.08]">
        <a href="#" className="flex items-center gap-2.5" aria-label="PlayMySong home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#c8f169] text-[#15190e]">
            <Guitar size={20} strokeWidth={2.4} />
          </span>
          <span className="text-[17px] font-bold tracking-tight">play<span className="text-[#c8f169]">my</span>song</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {["Explore", "My songs", "Practice"].map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`rounded-full px-4 py-2 text-sm transition ${activeTab === item ? "bg-white/10 text-white" : "text-[#969b91] hover:text-white"}`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button className="hidden rounded-full border border-white/10 p-2.5 text-[#a7ab9f] hover:bg-white/5 sm:inline-flex" aria-label="Help">
            <CircleHelp size={17} />
          </button>
          <button className="flex items-center gap-2 rounded-full border border-white/10 py-1.5 pl-1.5 pr-3 text-sm text-[#e9e9e1] hover:bg-white/5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#343c2b] text-xs font-bold text-[#c8f169]">R</span>
            <span className="hidden sm:inline">My practice</span>
            <ChevronDown size={14} className="text-[#969b91]" />
          </button>
          <button className="inline-flex rounded-lg p-2 text-[#a7ab9f] md:hidden" aria-label="Open menu">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <section className="pb-7 pt-9 sm:pt-12">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#a7b987]">
              <Sparkles size={14} /> Your music journey starts here
            </div>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-[#f4f3ed] sm:text-4xl lg:text-[46px]">
              A little practice.<br className="hidden sm:block" /> A lot of <span className="text-[#c8f169]">music.</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#969b91] sm:text-base">
              Learn the melodies you love, one note at a time. Pick up your guitar and let’s play.
            </p>
          </div>
          <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <Search size={18} className="shrink-0 text-[#969b91]" />
            <input
              aria-label="Search songs"
              placeholder="Search a song or artist..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#73786e]"
            />
            <span className="hidden rounded-md border border-white/10 px-2 py-1 text-[10px] text-[#73786e] sm:inline">⌘ K</span>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(290px,0.85fr)]">
        <section className="min-w-0 overflow-hidden rounded-[26px] border border-white/10 bg-[#191b18]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#29351d] text-[#c8f169]">
                <AudioLines size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold">Melody practice</div>
                <div className="mt-0.5 text-xs text-[#969b91]">Beginner · Single-note lead</div>
              </div>
            </div>
            <button
              onClick={() => setSaved(!saved)}
              className={`rounded-full border p-2.5 transition ${saved ? "border-[#c8f169]/40 bg-[#c8f169]/10 text-[#c8f169]" : "border-white/10 text-[#969b91] hover:text-white"}`}
              aria-label={saved ? "Remove from favourites" : "Save practice"}
            >
              {saved ? <Check size={17} /> : <Bookmark size={17} />}
            </button>
          </div>

          <div className="px-5 pb-5 pt-5 sm:px-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-xs text-[#969b91]">TODAY’S PRACTICE</div>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">First melody</h2>
                <p className="mt-1 text-xs text-[#969b91]">A simple original exercise to get your fingers moving</p>
              </div>
              <span className="rounded-full bg-[#c8f169]/10 px-3 py-1.5 text-xs font-medium text-[#c8f169]">8 notes · 2 bars</span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11130f]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                <span className="flex items-center gap-2 text-xs font-medium text-[#c5c9bd]"><ListMusic size={15} /> Guitar tablature</span>
                <span className="text-[11px] text-[#777d70]">Standard tuning · E A D G B e</span>
              </div>
              <div className="tab-scroll overflow-x-auto px-3 py-5 sm:px-5">
                <div className="min-w-[460px]">
                  <div className="mb-3 grid grid-cols-[28px_repeat(8,minmax(0,1fr))] items-center text-center text-[10px] text-[#72786d]">
                    <span />
                    {Array.from({ length: 8 }, (_, i) => <span key={i}>{i + 1}</span>)}
                  </div>
                  {tabRows.map((row, rowIndex) => (
                    <div key={row.string} className="grid h-9 grid-cols-[28px_repeat(8,minmax(0,1fr))] items-center text-center">
                      <span className="text-xs font-semibold text-[#a4aa9a]">{row.string}</span>
                      {row.values.map((value, index) => {
                        const isActive = index === activeNote && value !== "—";
                        return (
                          <button
                            key={index}
                            onClick={() => setActiveNote(index)}
                            className={`relative mx-1 grid h-7 place-items-center rounded-md text-xs font-semibold transition ${isActive ? "bg-[#c8f169] text-[#15190e]" : value === "—" ? "text-[#555b50]" : "text-[#e5e8dc] hover:bg-white/10"}`}
                            aria-label={`String ${row.string}, ${value === "—" ? "no note" : `fret ${value}`}, position ${index + 1}`}
                          >
                            {value === "—" ? "" : value}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-3 text-[11px] text-[#777d70]">
                <span>↓ Play each note slowly and clearly</span>
                <span>4/4 time</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveNote(Math.max(0, activeNote - 1))}
                  className="rounded-full border border-white/10 p-2.5 text-[#aeb3a5] hover:bg-white/5"
                  aria-label="Previous note"
                >
                  <SkipBack size={16} />
                </button>
                <button
                  onClick={() => setPlaying(!playing)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c8f169] text-[#15190e] transition hover:bg-[#d6f88d]"
                  aria-label={playing ? "Pause practice" : "Play practice"}
                >
                  {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>
                <button
                  onClick={() => setActiveNote(Math.min(7, activeNote + 1))}
                  className="rounded-full border border-white/10 p-2.5 text-[#aeb3a5] hover:bg-white/5"
                  aria-label="Next note"
                >
                  <SkipForward size={16} />
                </button>
                <div className="ml-1">
                  <div className="text-xs font-semibold">{playing ? "Practice playing" : "Ready when you are"}</div>
                  <div className="mt-0.5 text-[11px] text-[#858b7e]">Note {activeNote + 1} of 8</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Volume2 size={16} className="text-[#858b7e]" />
                <div className="w-24">
                  <div className="mb-1 flex justify-between text-[10px] text-[#858b7e]"><span>Progress</span><span>{Math.round(progress)}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#c8f169] transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-5">
          <section className="rounded-[26px] border border-white/10 bg-[#191b18] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <SectionLabel>Practice settings</SectionLabel>
              <Settings2 size={17} className="text-[#858b7e]" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Tempo</div>
                <div className="mt-1 text-xs text-[#858b7e]">Beats per minute</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setTempo(Math.max(40, tempo - 2))} className="rounded-lg border border-white/10 p-1.5 text-[#aeb3a5] hover:bg-white/5" aria-label="Decrease tempo"><Minus size={14} /></button>
                <span className="w-8 text-center text-lg font-semibold tabular-nums">{tempo}</span>
                <button onClick={() => setTempo(Math.min(180, tempo + 2))} className="rounded-lg border border-white/10 p-1.5 text-[#aeb3a5] hover:bg-white/5" aria-label="Increase tempo"><Plus size={14} /></button>
              </div>
            </div>
            <input
              aria-label="Tempo slider"
              type="range"
              min="40"
              max="180"
              value={tempo}
              onChange={(event) => setTempo(Number(event.target.value))}
              className="mt-5 w-full accent-[#c8f169]"
            />
            <div className="mt-1 flex justify-between text-[10px] text-[#777d70]"><span>40 BPM</span><span>180 BPM</span></div>
            <div className="my-5 border-t border-white/[0.07]" />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Practice mode</div>
                <div className="mt-1 text-xs text-[#858b7e]">One note at a time</div>
              </div>
              <span className="rounded-full bg-[#c8f169]/10 px-3 py-1.5 text-[11px] font-medium text-[#c8f169]">Lead</span>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[26px] border border-[#c8f169]/20 bg-[#20271a] p-5 sm:p-6">
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#c8f169]/[0.08] blur-2xl" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#c8f169]">
                <Sparkles size={14} /> Small steps add up
              </div>
              <h3 className="max-w-[230px] text-xl font-semibold leading-snug tracking-tight">Your next favourite song is closer than you think.</h3>
              <p className="mt-2 text-sm leading-6 text-[#a6ad9a]">Build confidence with short, focused practice sessions.</p>
              <div className="mt-5 flex items-center gap-2 text-xs font-medium text-[#c8f169]">
                Keep practising <ArrowRight size={14} />
              </div>
            </div>
          </section>

          <section className="rounded-[26px] border border-white/10 bg-[#191b18] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <SectionLabel>Quick tips</SectionLabel>
              <Headphones size={16} className="text-[#858b7e]" />
            </div>
            <div className="space-y-3">
              {[
                ["01", "Tune before you play", "A well-tuned guitar makes learning easier."],
                ["02", "Start slow", "Accuracy first. Speed will follow."],
                ["03", "Keep fingers close", "Small movements make notes cleaner."],
              ].map(([number, title, description]) => (
                <div key={number} className="flex gap-3">
                  <span className="pt-0.5 text-[11px] font-semibold text-[#c8f169]">{number}</span>
                  <div>
                    <div className="text-xs font-semibold text-[#e6e8df]">{title}</div>
                    <p className="mt-1 text-[11px] leading-5 text-[#858b7e]">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-white/[0.08] pt-5 text-[11px] text-[#73796e] sm:flex-row">
        <span>© 2026 PlayMySong. Learn songs. Play your way.</span>
        <span className="flex items-center gap-2"><Guitar size={13} /> Made for the love of playing.</span>
      </footer>
    </main>
  );
}