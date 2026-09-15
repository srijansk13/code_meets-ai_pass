'use client';

import React, { useState, useEffect } from 'react';
import OpeningSequence from '@/components/layout/OpeningSequence';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import CountdownSection from '@/components/event/CountdownSection';
import Link from 'next/link';
import { EVENT_CONFIG } from '@/lib/eventConfig';
import { Sparkles, ArrowRight, ExternalLink, Ticket, Calendar, MapPin, Lock } from 'lucide-react';

export default function LandingPage() {
  // 'checking' prevents flash of stale pass banner during server validation
  const [passState, setPassState] = useState<'checking' | 'valid' | 'none'>('checking');
  const [validPasses, setValidPasses] = useState<any[]>([]);
  const [registrationLocked, setRegistrationLocked] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const validateTokensAndFetch = async () => {
      // 1. Migrate legacy single token to array if needed
      const legacyToken = localStorage.getItem('chaos_qr_token');
      if (legacyToken) {
        let existing = [];
        try {
          existing = JSON.parse(localStorage.getItem('chaos_qr_tokens') || '[]');
        } catch {
          existing = [];
        }
        if (!existing.includes(legacyToken)) {
          existing.push(legacyToken);
        }
        localStorage.setItem('chaos_qr_tokens', JSON.stringify(existing));
        localStorage.removeItem('chaos_qr_token');
      }

      // 2. Read all tokens
      let storedTokens: string[] = [];
      try {
        storedTokens = JSON.parse(localStorage.getItem('chaos_qr_tokens') || '[]');
      } catch {
        storedTokens = [];
      }

      if (storedTokens.length === 0) {
        setPassState('none');
        return;
      }

      // 3. Validate each token using the existing endpoint
      const validTokens: string[] = [];
      for (const token of storedTokens) {
        try {
          const res = await fetch(`/api/pass/validate?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
          const data = await res.json();
          if (data.valid) {
            validTokens.push(token);
          }
        } catch {
          // Keep optimistically on network error
          validTokens.push(token);
        }
      }

      // 4. Update localStorage with only valid tokens
      localStorage.setItem('chaos_qr_tokens', JSON.stringify(validTokens));

      if (validTokens.length === 0) {
        setPassState('none');
        return;
      }

      // 5. Fetch details for valid tokens to display on homepage
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data } = await supabase
          .from('participants')
          .select('full_name, roll_number, branch, year, section, qr_token, is_checked_in')
          .in('qr_token', validTokens);
          
        if (data && data.length > 0) {
          // Match the order of tokens in localStorage
          const orderedPasses = validTokens
            .map(t => data.find(p => p.qr_token === t))
            .filter(Boolean) as any[];
            
          setValidPasses(orderedPasses);
          setPassState('valid');
        } else {
          setPassState('none');
        }
      } catch {
        setPassState('none');
      }
    };

    const fetchRegStatus = async () => {
      try {
        const res = await fetch('/api/registration/status', { cache: 'no-store' });
        const data = await res.json();
        setRegistrationLocked(data.registration_locked === true);
      } catch {
        setRegistrationLocked(false);
      }
    };

    validateTokensAndFetch();
    fetchRegStatus();
  }, []);

  return (
    <OpeningSequence>
      <div className="w-full min-h-screen flex flex-col justify-between relative z-20 pointer-events-auto">
        <AppHeader />

        <main className="w-full max-w-xl mx-auto px-4 py-6 sm:py-10 flex flex-col items-center text-center font-mono relative z-20 pointer-events-auto">
          
          {/* Active Pass Banner (Single Pass Experience) */}
          {passState === 'valid' && validPasses.length === 1 && (
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
                You already have an entry pass on this device! Tap below to view your digital pass &amp; 5-digit backup code.
              </p>
              <Link
                href={`/ticket/${validPasses[0].qr_token}`}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 relative z-30 pointer-events-auto block"
              >
                <Ticket className="w-4 h-4" />
                <span>VIEW MY DIGITAL ENTRY PASS 🎟️</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Active Passes List (Multi-Pass Experience) */}
          {passState === 'valid' && validPasses.length > 1 && (
            <div className="w-full mb-6 relative z-20 pointer-events-auto">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-cyan-400" />
                  <span>YOUR EVENT PASSES</span>
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                  {validPasses.length} PASSES GENERATED
                </span>
              </div>
              
              <div className="flex flex-col gap-3">
                {validPasses.map((pass, index) => (
                  <div key={index} className="w-full bg-[#091228]/90 border border-white/10 rounded-2xl p-4 text-left shadow-xl flex flex-col gap-3">
                    <div className="flex items-start justify-between border-b border-white/10 pb-3">
                      <div>
                        <div className="text-sm font-extrabold text-white uppercase tracking-wider">{pass.full_name}</div>
                        <div className="text-xs text-emerald-400 font-bold mt-0.5">{pass.roll_number}</div>
                      </div>
                      {pass.is_checked_in ? (
                        <div className="text-[9px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded font-bold uppercase tracking-widest">
                          VERIFIED
                        </div>
                      ) : (
                        <div className="text-[9px] bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded font-bold uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                          ACTIVE
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold tracking-wider">
                      <span>{pass.branch} • {pass.year}</span>
                      <span>SEC {pass.section}</span>
                    </div>
                    
                    <Link
                      href={`/ticket/${pass.qr_token}`}
                      className="w-full py-2.5 mt-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 hover:border-cyan-500/50 text-cyan-300 font-bold text-[11px] rounded-xl uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <span>VIEW ENTRY PASS</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
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

            {/* Primary CTA — behaviour depends on registration lock and pass check state */}
            {registrationLocked ? (
              /* REGISTRATION LOCKED STATE */
              <div className="w-full rounded-xl border border-red-500/40 bg-[#1a0505]/80 p-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-red-400 font-extrabold text-xs uppercase tracking-wider">
                  <Lock className="w-4 h-4" />
                  <span>REGISTRATIONS LOCKED</span>
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  Entry pass generation is currently closed. Existing passes remain valid.
                </p>
              </div>
            ) : passState === 'checking' ? (
              /* LOADING STATE — brief spinner while validating token/status */
              <div className="w-full py-4 px-6 bg-slate-900/60 border border-slate-700/40 rounded-xl flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Checking...</span>
              </div>
            ) : (
              /* NORMAL STATE — GET ENTRY PASS */
              <Link
                href="/register"
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer relative z-30 pointer-events-auto block"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>{passState === 'valid' && validPasses.length > 0 ? '+ GET ANOTHER ENTRY PASS' : 'GET ENTRY PASS'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

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
