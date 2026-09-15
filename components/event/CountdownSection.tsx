'use client';

import React, { useState, useEffect } from 'react';
import { EVENT_CONFIG } from '@/lib/eventConfig';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
}

function calculateTimeLeft(): TimeLeft {
  const now = new Date().getTime();
  const target = EVENT_CONFIG.targetTimestamp;
  const difference = target - now;

  if (isNaN(difference) || difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days: isNaN(days) ? 0 : days,
    hours: isNaN(hours) ? 0 : hours,
    minutes: isNaN(minutes) ? 0 : minutes,
    seconds: isNaN(seconds) ? 0 : seconds,
    isLive: false,
  };
}

export default function CountdownSection() {
  // null = not yet mounted (server side). Avoids SSR/client mismatch.
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Only calculate on client after hydration to avoid SSR mismatch
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-6 font-mono">
      <div className="bg-[#091228]/90 border border-cyan-500/30 rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span>EVENT COUNTDOWN</span>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full font-bold">
            {EVENT_CONFIG.timezone}
          </span>
        </div>

        {!timeLeft ? (
          // Server placeholder — identical structure, zeros, avoids hydration mismatch
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            {['DAYS','HOURS','MINS','SECS'].map((label, i) => (
              <div key={i} className="bg-[#040711] border border-slate-800 rounded-xl p-3 sm:p-5 shadow-inner">
                <div className="text-xl sm:text-4xl font-extrabold text-white tracking-wider">--</div>
                <div className="text-[9px] sm:text-xs text-slate-400 uppercase tracking-widest mt-1">{label}</div>
              </div>
            ))}
          </div>
        ) : timeLeft.isLive ? (
          <div className="py-6 text-center">
            <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400 uppercase tracking-widest animate-pulse mb-2">
              EVENT IS LIVE 🚀
            </div>
            <p className="text-xs text-slate-300">
              Check in at the gate now with your digital entry pass!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            <div className="bg-[#040711] border border-slate-800 rounded-xl p-3 sm:p-5 shadow-inner">
              <div className="text-xl sm:text-4xl font-extrabold text-white tracking-wider">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[9px] sm:text-xs text-slate-400 uppercase tracking-widest mt-1">DAYS</div>
            </div>

            <div className="bg-[#040711] border border-slate-800 rounded-xl p-3 sm:p-5 shadow-inner">
              <div className="text-xl sm:text-4xl font-extrabold text-white tracking-wider">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[9px] sm:text-xs text-slate-400 uppercase tracking-widest mt-1">HOURS</div>
            </div>

            <div className="bg-[#040711] border border-slate-800 rounded-xl p-3 sm:p-5 shadow-inner">
              <div className="text-xl sm:text-4xl font-extrabold text-white tracking-wider">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[9px] sm:text-xs text-slate-400 uppercase tracking-widest mt-1">MINUTES</div>
            </div>

            <div className="bg-[#040711] border border-slate-800 rounded-xl p-3 sm:p-5 shadow-inner">
              <div className="text-xl sm:text-4xl font-extrabold text-emerald-400 tracking-wider">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[9px] sm:text-xs text-slate-400 uppercase tracking-widest mt-1">SECONDS</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
