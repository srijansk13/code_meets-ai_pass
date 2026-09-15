'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EVENT_CONFIG } from '@/lib/eventConfig';
import { Ticket, ExternalLink } from 'lucide-react';

export default function AppHeader() {
  const pathname = usePathname();
  const [activeToken, setActiveToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('chaos_qr_token');
      if (savedToken) setActiveToken(savedToken);
    }
  }, []);

  return (
    <header className="w-full sticky top-0 z-40 bg-[#040711]/90 backdrop-blur-md border-b border-white/10 transition-all pt-[env(safe-area-inset-top)] relative z-40 pointer-events-auto">
      <div className="max-w-xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between relative z-40 pointer-events-auto">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 active:scale-95 transition-transform relative z-40 pointer-events-auto cursor-pointer">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-cyan-500/40 p-0.5 bg-slate-900 shrink-0">
            <img
              src={EVENT_CONFIG.logoUrl}
              alt={EVENT_CONFIG.name}
              className="w-full h-full object-cover rounded"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-xs sm:text-sm tracking-wider text-white uppercase">
                {EVENT_CONFIG.name}
              </span>
              <span className="text-[10px]">💀</span>
            </div>
            <span className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase">
              ENTRY PASS APP
            </span>
          </div>
        </Link>

        {/* Action Controls (Mobile First Utility) */}
        <div className="flex items-center gap-2 font-mono text-xs relative z-40 pointer-events-auto">
          {activeToken && !pathname.startsWith('/ticket') && (
            <Link
              href={`/ticket/${activeToken}`}
              className="px-2.5 py-1.5 bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-cyan-900 transition-colors relative z-40 pointer-events-auto cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5 text-cyan-400" />
              <span>MY PASS</span>
            </Link>
          )}

          <a
            href={EVENT_CONFIG.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors relative z-40 pointer-events-auto cursor-pointer"
          >
            <span>MAIN SITE</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </a>
        </div>
      </div>
    </header>
  );
}
