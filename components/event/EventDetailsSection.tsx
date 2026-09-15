'use client';

import React from 'react';
import Link from 'next/link';
import { EVENT_CONFIG } from '@/lib/eventConfig';
import { Calendar, Clock, MapPin, Sparkles, ArrowRight } from 'lucide-react';

export default function EventDetailsSection() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-12 font-mono">
      <div className="bg-gradient-to-br from-[#091228] via-[#0b1633] to-[#040711] border border-cyan-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <span>VENUE & LOGISTICS</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wider">
              OFFICIAL EVENT DETAILS
            </h2>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Date: <strong className="text-white">{EVENT_CONFIG.date}</strong></span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Start Time: <strong className="text-white">{EVENT_CONFIG.time}</strong></span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Venue: <strong className="text-emerald-400">{EVENT_CONFIG.venue}</strong></span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
            <Link
              href="/register"
              className="py-4 px-8 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>CLAIM YOUR PASS NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
