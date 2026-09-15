'use client';

import React from 'react';
import { ShieldCheck, Ticket, Share2, Award, Sparkles } from 'lucide-react';

export default function ExperienceSection() {
  const steps = [
    {
      num: '01',
      title: 'DIGITAL REGISTRATION',
      desc: 'Instant 4-step onboarding flow. Receive your encrypted digital gate credential token.',
      icon: Ticket,
      color: 'text-cyan-400',
    },
    {
      num: '02',
      title: "I'M ATTENDING CARD",
      desc: 'Generate a canonical 1200×1500 event creative with your portrait and official badge.',
      icon: Share2,
      color: 'text-emerald-400',
    },
    {
      num: '03',
      title: 'ATOMIC GATE SCANNER',
      desc: 'Seamless entrance experience with real-time camera scanning and verification at venue.',
      icon: ShieldCheck,
      color: 'text-teal-400',
    },
    {
      num: '04',
      title: 'EVENT ARENA & CHAOS',
      desc: 'Full-day immersive event featuring live scoring, challenges, and competition stages.',
      icon: Award,
      color: 'text-amber-400',
    },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-12 font-mono">
      <div className="text-center mb-10">
        <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">
          &gt; EVENT JOURNEY
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-wider">
          WHAT PARTICIPANTS CAN EXPECT
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => {
          const IconComponent = step.icon;
          return (
            <div
              key={step.num}
              className="bg-[#091228]/80 border border-white/10 rounded-2xl p-5 relative flex flex-col justify-between hover:border-cyan-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-slate-600">{step.num}</span>
                  <IconComponent className={`w-6 h-6 ${step.color}`} />
                </div>
                <h3 className="text-sm font-bold text-white mb-2 uppercase">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
