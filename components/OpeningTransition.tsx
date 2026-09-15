'use client';

import React, { useState, useEffect } from 'react';

interface OpeningTransitionProps {
  onComplete?: () => void;
  children: React.ReactNode;
}

/**
 * UNSTUCKABLE CINEMATIC INTRO
 *
 * Guarantees:
 * 1. Main page content (`children`) is ALWAYS rendered & interactive underneath.
 * 2. Fullscreen overlay is animated via GPU CSS @keyframes (pureIntroFade).
 * 3. CSS automatically sets `visibility: hidden` and `pointer-events: none` at 1.5s,
 *    so browser CANNOT get stuck even if JS timers delay.
 * 4. Hard React unmount timer at 1.8s cleans up DOM node completely.
 * 5. Tap anywhere instantly unmounts overlay.
 */
export default function OpeningTransition({ onComplete, children }: OpeningTransitionProps) {
  const [introDone, setIntroDone] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Hard DOM cleanup timer (1.8s max)
    const timer = setTimeout(() => {
      setIntroDone(true);
      if (onComplete) onComplete();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const dismissImmediately = () => {
    setIntroDone(true);
    if (onComplete) onComplete();
  };

  return (
    <>
      {/* LAYER 1: MAIN REGISTRATION PAGE — Always visible & interactive */}
      <div className="w-full relative z-10">
        {children}
      </div>

      {/* LAYER 2: INTRO OVERLAY — In DOM from initial HTML render, driven by GPU CSS keyframes */}
      {!introDone && (
        <div
          onClick={dismissImmediately}
          role="button"
          tabIndex={0}
          aria-label="Skip intro — tap anywhere"
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && dismissImmediately()}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100svh',
            minHeight: '100vh',
            zIndex: 9999,
            backgroundColor: '#060a12',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            animation: 'pureIntroFade 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
          }}
        >
          {/* Radial Glow Bloom */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80vw',
              height: '80vw',
              maxWidth: '360px',
              maxHeight: '360px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(6,182,212,0.12) 45%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Logo & Content */}
          <div className="relative flex flex-col items-center justify-center z-10 px-4 text-center">
            {!imgError ? (
              <div className="relative mb-5">
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: '-12px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, rgba(6,182,212,0.25) 50%, transparent 70%)',
                    filter: 'blur(16px)',
                    pointerEvents: 'none',
                  }}
                />
                <img
                  src="/logo.jpeg"
                  alt="CODE MEETS AI"
                  onError={() => setImgError(true)}
                  style={{
                    display: 'block',
                    width: 'min(48vw, 170px)',
                    height: 'min(48vw, 170px)',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    position: 'relative',
                    zIndex: 1,
                    filter: 'brightness(1.25) saturate(1.1)',
                    boxShadow: '0 0 40px 6px rgba(16,185,129,0.5), 0 0 80px 16px rgba(6,182,212,0.25)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    fontSize: '22px',
                    lineHeight: 1,
                    zIndex: 2,
                    filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.8))',
                  }}
                >
                  💀
                </div>
              </div>
            ) : (
              <div className="text-4xl mb-3">💀</div>
            )}

            <h1
              style={{
                margin: 0,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 'clamp(20px, 5.5vw, 26px)',
                fontWeight: 900,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textShadow: '0 0 20px rgba(16,185,129,0.7), 0 0 40px rgba(6,182,212,0.3)',
                lineHeight: 1.15,
              }}
            >
              CODE MEETS AI
            </h1>

            <div
              style={{
                marginTop: '6px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 'clamp(11px, 3vw, 13px)',
                fontWeight: 700,
                color: '#ef4444',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                textShadow: '0 0 10px rgba(239,68,68,0.5)',
              }}
            >
              + A LITTLE BIT OF CHAOS 💀
            </div>

            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#64748b',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10b981',
                  display: 'inline-block',
                }}
              />
              <span>Tap anywhere to skip</span>
            </div>
          </div>

          <style>{`
            @keyframes pureIntroFade {
              0% {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
              }
              60% {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
              }
              90% {
                opacity: 0;
                visibility: visible;
                pointer-events: none;
              }
              100% {
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
