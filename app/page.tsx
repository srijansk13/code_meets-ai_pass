'use client';

import React, { useState, useEffect } from 'react';
import OpeningSequence from '@/components/layout/OpeningSequence';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import CountdownSection from '@/components/event/CountdownSection';
import Link from 'next/link';
import { EVENT_CONFIG } from '@/lib/eventConfig';
import { Sparkles, ArrowRight, ExternalLink, Ticket, Calendar, MapPin } from 'lucide-react';

export default function LandingPage() {
  const [activeToken, setActiveToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('chaos_qr_token');
      if (savedToken) setActiveToken(savedToken);
    }
  }, []);

  return (
    <OpeningSequence>
      <div className="w-full min-h-screen flex flex-col justify-between relative z-20 pointer-events-auto">
        <AppHeader />

        <main className="w-full max-w-xl mx-auto px-4 py-6 sm:py-10 flex flex-col items-center text-center font-mono relative z-20 pointer-events-auto">
          
          {/* Active Pass Banner (if registered) */}
          {activeToken && (
            <div className="w-full bg-[#091228]/90 border border-cyan-500/40 rounded-2xl p-4 mb-6 text-center shadow-xl relative z-20 pointer-events-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Ticket className="w-4 h-4 text-cyan-400" />
                  <span>ACTIVE PASS FOUND</span>
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                  ● GATE READY
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
              You already have an entry pass on this device! Tap below to view your digital pass & 5-digit backup code.
              </p>
              <Link
                href={`/ticket/${activeToken}`}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 relative z-30 pointer-events-auto block"
              >
                <Ticket className="w-4 h-4" />
                <span>VIEW MY DIGITAL ENTRY PASS 🎟️</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Minimal Event Identity */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold mb-4 uppercase tracking-widest">
            <span>OFFICIAL EVENT ENTRY SYSTEM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-wider uppercase mb-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              {EVENT_CONFIG.name}
            </span>
          </h1>

          <div className="text-sm sm:text-xl font-extrabold text-red-500 tracking-wider uppercase mb-6">
            {EVENT_CONFIG.tagline}
          </div>

          {/* Event Quick Meta Strip */}
          <div className="w-full bg-[#091228]/80 border border-white/10 rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-bold">{EVENT_CONFIG.dateShort} • {EVENT_CONFIG.time}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold truncate">{EVENT_CONFIG.venue}</span>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="w-full mb-8">
            <CountdownSection />
          </div>

          {/* Primary Action Buttons */}
          <div className="w-full flex flex-col gap-3.5 relative z-30 pointer-events-auto">
            {/* Primary CTA */}
            <Link
              href="/register"
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer relative z-30 pointer-events-auto block"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>GET ENTRY PASS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* EXPLORE THE EVENT (Anchor navigation with explicit target) */}
            <a
              href={EVENT_CONFIG.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 bg-slate-900/90 border border-slate-700/80 hover:border-cyan-400 text-cyan-300 font-bold text-xs rounded-xl uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer relative z-30 pointer-events-auto block"
            >
              <span>EXPLORE THE EVENT ↗</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
          </div>

        </main>

        <AppFooter />
      </div>
    </OpeningSequence>
  );
}
