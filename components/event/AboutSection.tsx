'use client';

import React from 'react';
import { EVENT_CONFIG } from '@/lib/eventConfig';
import { Terminal, Cpu, Zap, Code } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="event-info" className="w-full max-w-5xl mx-auto px-4 py-12 font-mono">
      <div className="text-center mb-10">
        <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">
          &gt; THE EVENT CONCEPT
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-wider">
          WHAT IS {EVENT_CONFIG.name}?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#091228]/60 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mb-4">
            <Code className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 uppercase">CODING & COMPETITION</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Push your algorithmic and problem-solving limits in real-time competitive programming challenges.
          </p>
        </div>

        <div className="bg-[#091228]/60 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-4">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 uppercase">GENERATIVE AI INTEGRATION</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Leverage state-of-the-art AI tooling to craft innovative solutions under competition constraints.
          </p>
        </div>

        <div className="bg-[#091228]/60 border border-white/10 rounded-2xl p-6 hover:border-red-500/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 uppercase">CONTROLLED CHAOS 💀</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unexpected curveballs, speed challenges, and chaotic environment shifts designed to test adaptability.
          </p>
        </div>
      </div>
    </section>
  );
}
