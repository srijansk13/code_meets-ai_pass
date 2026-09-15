'use client';

import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';

interface HeaderProps {
  onOpenPoster?: () => void;
}

export default function Header({ onOpenPoster }: HeaderProps) {
  return (
    <header className="w-full flex flex-col items-center text-center mb-5 pt-1 select-none font-mono">
      {/* Persistent Environment Logo Mark */}
      <div className="relative mb-3 group cursor-pointer" onClick={onOpenPoster}>
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/60 p-1 bg-[#0d1322] shadow-2xl relative transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <img
            src="/logo.jpeg"
            alt="CODE MEETS AI Logo"
            className="w-full h-full object-cover rounded-xl opacity-95"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black/90 border border-emerald-500 flex items-center justify-center text-xs shadow-md">
          💀
        </div>
      </div>

      {/* Top Navigation Links */}
      <div className="flex items-center gap-2 mb-3">
        <a
          href="https://code-meets-ai.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs hover:bg-emerald-900/60 hover:border-emerald-400 transition-all shadow-sm shadow-emerald-500/10"
        >
          <span>Part of CODE MEETS AI 💀</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {onOpenPoster && (
          <button
            onClick={onOpenPoster}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs hover:bg-cyan-900/60 hover:border-cyan-400 transition-all cursor-pointer shadow-sm shadow-cyan-500/10"
          >
            <FileText className="w-3 h-3 text-cyan-400" />
            <span>View Poster 📄</span>
          </button>
        )}
      </div>

      {/* Main Title & Subtitle */}
      <div className="relative my-1 py-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-white uppercase drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 animate-pulse">
            CODE MEETS AI
          </span>
        </h1>
        <div className="text-sm sm:text-base font-extrabold text-red-500 tracking-wider uppercase mt-1 flex items-center justify-center gap-1">
          <span>+ A LITTLE BIT OF CHAOS</span>
          <span className="animate-bounce">💀</span>
        </div>
      </div>

      {/* Hero Subheading & Voice */}
      <div className="my-2 space-y-1">
        <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          &gt; ENTER THE CHAOS
        </div>
        <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
          Generate your official CODE MEETS AI digital entry pass.
        </p>
      </div>

      {/* System Metadata Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full my-2 text-[10px]">
        <div className="bg-[#0b1120] border border-slate-800 rounded px-2 py-1 text-slate-300">
          📅 <span className="font-bold text-white">17 SEPT 2026</span>
        </div>
        <div className="bg-[#0b1120] border border-slate-800 rounded px-2 py-1 text-slate-300">
          ⏰ <span className="font-bold text-white">09:00 AM IST</span>
        </div>
        <div className="bg-[#0b1120] border border-slate-800 rounded px-2 py-1 text-slate-300">
          🎓 <span className="font-bold text-white">1ST + 2ND YEAR</span>
        </div>
        <div className="bg-[#0b1120] border border-slate-800 rounded px-2 py-1 text-emerald-400 flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-bold">SYSTEM: ONLINE</span>
        </div>
      </div>
    </header>
  );
}
