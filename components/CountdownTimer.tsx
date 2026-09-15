'use client';

import React, { useState, useEffect } from 'react';

// Target date: 17 September 2026 9:00 AM IST (03:30 AM UTC)
// Explicit Date.UTC(year, monthIndex, day, hours, minutes, seconds) avoids ISO string parsing bugs on mobile WebKit/Safari
const TARGET_TIMESTAMP = Date.UTC(2026, 8, 17, 3, 30, 0);

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
}

function calculateTimeLeft(): TimeLeft {
  const now = new Date().getTime();
  const difference = TARGET_TIMESTAMP - now;

  if (difference <= 0) {
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

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    if (typeof window !== 'undefined') {
      return calculateTimeLeft();
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false };
  });

  useEffect(() => {
    // Sync timer immediately on client mount
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeLeft.isLive) {
    return (
      <div className="w-full bg-emerald-950/50 border border-emerald-500/50 rounded-xl p-3.5 text-center my-3 terminal-glow font-mono">
        <div className="text-emerald-400 font-bold text-sm sm:text-base animate-pulse flex items-center justify-center gap-2">
          <span>&gt; CHAOS IS LIVE 💀</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
        </div>
        <div className="text-[11px] text-slate-300 mt-1">Get your digital pass scanned at the gate now! 🚀</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#070b14]/90 border border-slate-800/90 rounded-xl p-3.5 my-3 font-mono shadow-xl">
      <div className="text-[11px] text-emerald-400/90 mb-2.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-bold">
          <span className="text-slate-500">$</span> ./countdown.sh
        </span>
        <span className="text-slate-400 text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
          17 SEPT 9:00 AM IST
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-[#0b1120] border border-slate-800 rounded-lg p-2 shadow-inner">
          <div className="text-base sm:text-lg font-extrabold text-white tracking-wider">
            {String(timeLeft.days).padStart(2, '0')}
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">DAYS</div>
        </div>

        <div className="bg-[#0b1120] border border-slate-800 rounded-lg p-2 shadow-inner">
          <div className="text-base sm:text-lg font-extrabold text-white tracking-wider">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">HRS</div>
        </div>

        <div className="bg-[#0b1120] border border-slate-800 rounded-lg p-2 shadow-inner">
          <div className="text-base sm:text-lg font-extrabold text-white tracking-wider">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">MINS</div>
        </div>

        <div className="bg-[#0b1120] border border-slate-800 rounded-lg p-2 shadow-inner">
          <div className="text-base sm:text-lg font-extrabold text-emerald-400 tracking-wider">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">SECS</div>
        </div>
      </div>
    </div>
  );
}
