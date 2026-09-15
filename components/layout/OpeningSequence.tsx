'use client';

import React, { useState, useEffect } from 'react';
import { EVENT_CONFIG } from '@/lib/eventConfig';

interface OpeningSequenceProps {
  onComplete?: () => void;
  children: React.ReactNode;
}

export default function OpeningSequence({ onComplete, children }: OpeningSequenceProps) {
  const [introDone, setIntroDone] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Check if intro has already been shown in this session
    if (typeof window !== 'undefined') {
      const hasSeenIntro = sessionStorage.getItem('cma_intro_seen');
      if (hasSeenIntro) {
        setIntroDone(true);
        if (onComplete) onComplete();
        return;
      }
    }

    // Hard fallback timer at 2.8s
    const timer = setTimeout(() => {
      dismiss();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cma_intro_seen', 'true');
    }
    setIntroDone(true);
    if (onComplete) onComplete();
  };

  return (
    <>
      {/* MAIN APP CONTENT */}
      <div className="w-full relative z-10">
        {children}
      </div>

      {/* FULLSCREEN IMMERSIVE BRAND LOGO OVERLAY */}
      {!introDone && (
        <div
          onClick={dismiss}
          role="button"
          tabIndex={0}
          aria-label="Skip intro"
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && dismiss()}
          className="fixed inset-0 w-screen h-[100svh] z-[9999] bg-[#040711] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
          style={{
            animation: 'pureIntroFade 2.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.18)_0%,transparent_70%)] pointer-events-none" />

          {/* Large Logo & Raw Brand Identity — No containers/cards */}
          <div className="relative flex flex-col items-center justify-center z-10 px-4 text-center">
            {!imgError ? (
              <div className="relative mb-6">
                <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 blur-3xl animate-pulse pointer-events-none" />
                <img
                  src={EVENT_CONFIG.logoUrl}
                  alt={EVENT_CONFIG.name}
                  onError={() => setImgError(true)}
                  className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 rounded-full object-cover shadow-[0_0_80px_rgba(6,182,212,0.4)] border border-cyan-400/40"
                />
              </div>
            ) : (
              <div className="text-7xl mb-4">💀</div>
            )}

            <h1 className="font-extrabold text-3xl sm:text-5xl text-white tracking-widest uppercase mb-1">
              {EVENT_CONFIG.name}
            </h1>

            <div className="font-extrabold text-sm sm:text-lg text-red-500 uppercase tracking-wider mb-6">
              {EVENT_CONFIG.tagline}
            </div>

            <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase border border-cyan-500/30 px-3 py-1 rounded-full bg-cyan-950/40">
              DIGITAL ENTRY PASS SYSTEM
            </div>
          </div>
        </div>
      )}
    </>
  );
}
