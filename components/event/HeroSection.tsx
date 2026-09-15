'use client';

import React from 'react';
import Link from 'next/link';
import { EVENT_CONFIG } from '@/lib/eventConfig';
import { Sparkles, ArrowRight, Calendar, Clock, MapPin, Ticket } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="w-full relative py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center overflow-hidden">
      {/* Background Lighting Bloom */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-6 shadow-lg shadow-cyan-500/10">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="font-bold tracking-wider uppercase">OFFICIAL 2026 EVENT CAMPAIGN</span>
      </div>

      {/* Event Title */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-wider uppercase max-w-5xl leading-[1.1] mb-2">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
          {EVENT_CONFIG.name}
        </span>
      </h1>

      {/* Tagline */}
      <div className="text-xl sm:text-3xl font-extrabold text-red-500 tracking-wider uppercase mb-8 flex items-center justify-center gap-2">
        <span>{EVENT_CONFIG.tagline}</span>
      </div>

      {/* Key Event Metadata Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mb-10 text-xs font-mono">
        <div className="bg-[#091228]/80 border border-white/10 rounded-xl p-3.5 flex items-center justify-center gap-2.5 text-slate-200">
          <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-bold">{EVENT_CONFIG.dateShort}</span>
        </div>

        <div className="bg-[#091228]/80 border border-white/10 rounded-xl p-3.5 flex items-center justify-center gap-2.5 text-slate-200">
          <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-bold">{EVENT_CONFIG.time}</span>
        </div>

        <div className="bg-[#091228]/80 border border-white/10 rounded-xl p-3.5 flex items-center justify-center gap-2.5 text-emerald-400">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold truncate">{EVENT_CONFIG.venue}</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md font-mono">
        <Link
          href="/register"
          className="w-full sm:w-auto flex-1 py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          <span>GET ENTRY PASS</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <a
          href="#event-info"
          className="w-full sm:w-auto py-4 px-6 bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-cyan-300 font-bold text-xs sm:text-sm rounded-xl uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>EXPLORE EVENT</span>
        </a>
      </div>
    </section>
  );
}
