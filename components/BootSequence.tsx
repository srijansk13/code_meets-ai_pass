'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, CheckCircle2 } from 'lucide-react';

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const booted = sessionStorage.getItem('chaos_booted');
      
      if (mediaQuery.matches || booted === 'true') {
        onComplete();
        return;
      }
    }

    // Phase 1: Logo Reveal (0 - 650ms)
    // Phase 2: Logo Recedes into Environment (650ms+)
    const phase2Timer = setTimeout(() => {
      setPhase(2);
    }, 650);

    const script = [
      '$ ./boot_event.sh',
      '> initializing CODE MEETS AI...',
      '> loading chaos module...',
      '> checking event environment...',
      '> registration system online',
      '✓ ENTRY SYSTEM READY 🚀',
    ];

    let lineIndex = 0;
    const typingInterval = setInterval(() => {
      if (lineIndex < script.length) {
        setLines((prev) => [...prev, script[lineIndex]]);
        lineIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          finishBoot();
        }, 300);
      }
    }, 320);

    return () => {
      clearTimeout(phase2Timer);
      clearInterval(typingInterval);
    };
  }, []);

  const finishBoot = () => {
    if (done) return;
    setDone(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('chaos_booted', 'true');
    }
    setTimeout(() => {
      onComplete();
    }, 350);
  };

  return (
    <div
      onClick={finishBoot}
      className={`fixed inset-0 z-50 bg-[#070b14] text-white flex flex-col items-center justify-center p-6 font-mono transition-opacity duration-500 cursor-pointer select-none ${
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* PHASE 1 & 2: LOGO REVEAL & RECEDE */}
        <div
          className={`relative transition-all duration-700 ease-out mb-4 ${
            phase === 1
              ? 'scale-110 brightness-125 drop-shadow-[0_0_45px_rgba(16,185,129,0.9)] opacity-100'
              : 'scale-65 brightness-90 opacity-60 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] -translate-y-2'
          }`}
        >
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-emerald-500/70 p-1 bg-[#0d1322] shadow-2xl relative">
            <img
              src="/logo.jpeg"
              alt="CODE MEETS AI Logo"
              className="w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-black/90 border border-emerald-500 flex items-center justify-center text-xs shadow-md">
            💀
          </div>
        </div>

        {/* PHASE 3: EVENT IDENTITY & TERMINAL TYPING */}
        <div
          className={`w-full bg-[#0d1322]/95 border border-slate-800 rounded-2xl p-4 shadow-2xl terminal-glow transition-all duration-500 ${
            phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Terminal className="w-4 h-4" />
              <span>CODE_MEETS_AI_BOOT</span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          <div className="space-y-1 text-xs text-left font-mono min-h-[110px]">
            {lines.map((line, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200 ${
                  idx === 0
                    ? 'text-emerald-400 font-bold'
                    : idx === lines.length - 1
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-300'
                }`}
              >
                <span>{line}</span>
              </div>
            ))}
            {!done && (
              <div className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1 align-middle"></div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>CODE MEETS AI 💀</span>
            <span className="text-emerald-400">Tap to skip</span>
          </div>
        </div>
      </div>
    </div>
  );
}
