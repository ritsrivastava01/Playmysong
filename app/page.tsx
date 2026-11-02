"use client";

import { useState } from "react";
import { ArrowRight, CircleHelp, Guitar, Menu, Search, Sparkles } from "lucide-react";
import { PracticePlayer } from "../components/practice/practice-player";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Practice");

  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-4 pb-12 sm:px-7 lg:px-10">
      <header className="flex h-[76px] items-center justify-between border-b border-white/[0.08]">
        <a href="#" className="flex items-center gap-2.5" aria-label="PlayMySong home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#c8f169] text-[#15190e]"><Guitar size={20} strokeWidth={2.4}/></span>
          <span className="text-[17px] font-bold tracking-tight">play<span className="text-[#c8f169]">my</span>song</span>
        </a>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {["Explore","My songs","Practice"].map(item=><button key={item} onClick={()=>setActiveTab(item)} className={`rounded-full px-4 py-2 text-sm transition ${activeTab===item ? "bg-white/10 text-white" : "text-[#969b91] hover:text-white"}`}>{item}</button>)}
        </nav>
        <div className="flex items-center gap-2">
          <button className="hidden rounded-full border border-white/10 p-2.5 text-[#a7ab9f] hover:bg-white/5 sm:inline-flex" aria-label="Help"><CircleHelp size={17}/></button>
          <span className="flex items-center gap-2 rounded-full border border-white/10 py-1.5 pl-1.5 pr-3 text-sm text-[#e9e9e1]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#343c2b] text-xs font-bold text-[#c8f169]">R</span><span className="hidden sm:inline">My practice</span></span>
          <button className="inline-flex rounded-lg p-2 text-[#a7ab9f] md:hidden" aria-label="Open menu"><Menu size={20}/></button>
        </div>
      </header>

      <section className="pb-7 pt-9 sm:pt-12">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#a7b987]"><Sparkles size={14}/> Your music journey starts here</div>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-[#f4f3ed] sm:text-4xl lg:text-[46px]">A little practice.<br className="hidden sm:block"/> A lot of <span className="text-[#c8f169]">music.</span></h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#969b91] sm:text-base">Learn the melodies you love, one note at a time. Pick up your guitar and let’s play.</p>
          </div>
          <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <Search size={18} className="shrink-0 text-[#969b91]"/>
            <input aria-label="Search songs" placeholder="Song library coming next..." disabled className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#73786e] disabled:cursor-not-allowed"/>
          </div>
        </div>
      </section>

      <PracticePlayer/>

      <section className="mt-5 flex flex-col justify-between gap-3 rounded-[26px] border border-[#c8f169]/20 bg-[#20271a] p-5 sm:flex-row sm:items-center sm:p-6">
        <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#c8f169]"><Sparkles size={14}/> Next up</div><h2 className="text-lg font-semibold">Learn a complete song, one section at a time.</h2><p className="mt-1 text-sm text-[#a6ad9a]">We’re building the tab playback and song library on top of this fretboard.</p></div>
        <span className="flex items-center gap-2 text-sm font-medium text-[#c8f169]">Keep practising <ArrowRight size={15}/></span>
      </section>

      <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-white/[0.08] pt-5 text-[11px] text-[#73796e] sm:flex-row">
        <span>© 2026 PlayMySong. Learn songs. Play your way.</span>
        <span className="flex items-center gap-2"><Guitar size={13}/> Made for the love of playing.</span>
      </footer>
    </main>
  );
}
