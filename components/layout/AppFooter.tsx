'use client';

import React from 'react';
import { EVENT_CONFIG } from '@/lib/eventConfig';

export default function AppFooter() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#020408] text-slate-500 text-[11px] font-mono py-6 px-4 text-center mt-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto flex flex-col items-center gap-1.5">
        <div className="flex items-center justify-center gap-1.5 text-slate-300 font-bold">
          <span>{EVENT_CONFIG.name}</span>
          <span className="text-red-500">{EVENT_CONFIG.tagline}</span>
        </div>
        <div className="text-[10px] text-slate-400">
          Official Entry Credential System • 17 SEP 2026
        </div>
        <div className="text-[9px] text-slate-500 pt-1">
          {EVENT_CONFIG.venue}
        </div>
      </div>
    </footer>
  );
}
