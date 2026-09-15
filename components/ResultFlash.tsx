'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

export type ScanResultStatus = 'success' | 'duplicate' | 'invalid' | null;

export interface ScanResultData {
  status: ScanResultStatus;
  participant?: {
    full_name: string;
    roll_number: string;
    section: string;
    year: string;
    checked_in_at?: string;
    checked_in_by?: string;
  };
  message?: string;
}

interface ResultFlashProps {
  result: ScanResultData | null;
  onDismiss: () => void;
}

// Synthesize audio tones for success, duplicate, and invalid scans using Web Audio API
function playSound(type: ScanResultStatus) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      // Pleasant high double beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'duplicate') {
      // Medium warning tone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'invalid') {
      // Low buzz error tone
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(164.81, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch (e) {
    console.error('Audio feedback error:', e);
  }
}

// Trigger haptic vibration feedback on supported mobile devices
function triggerVibration(type: ScanResultStatus) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    if (type === 'success') {
      navigator.vibrate([100]);
    } else if (type === 'duplicate') {
      navigator.vibrate([150, 80, 150]);
    } else if (type === 'invalid') {
      navigator.vibrate([300]);
    }
  }
}

export default function ResultFlash({ result, onDismiss }: ResultFlashProps) {
  useEffect(() => {
    if (result && result.status) {
      playSound(result.status);
      triggerVibration(result.status);

      const timer = setTimeout(() => {
        onDismiss();
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [result, onDismiss]);

  if (!result || !result.status) return null;

  const isSuccess = result.status === 'success';
  const isDuplicate = result.status === 'duplicate';
  const isInvalid = result.status === 'invalid';

  return (
    <div
      onClick={onDismiss}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 transition-all duration-200 cursor-pointer ${
        isSuccess
          ? 'bg-emerald-950/95 border-4 border-emerald-500 text-emerald-100'
          : isDuplicate
          ? 'bg-amber-950/95 border-4 border-amber-500 text-amber-100'
          : 'bg-red-950/95 border-4 border-red-500 text-red-100'
      }`}
    >
      <div className="w-full max-w-sm flex flex-col items-center text-center p-6 rounded-2xl bg-black/40 backdrop-blur-lg border border-white/10 shadow-2xl">
        {/* Status Icon */}
        <div className="mb-4">
          {isSuccess && <CheckCircle2 className="w-20 h-20 text-emerald-400 animate-bounce" />}
          {isDuplicate && <AlertTriangle className="w-20 h-20 text-amber-400 animate-pulse" />}
          {isInvalid && <XCircle className="w-20 h-20 text-red-500 animate-pulse" />}
        </div>

        {/* Status Title Banner */}
        <h2 className="text-2xl font-black tracking-wider uppercase mb-2 font-mono">
          {isSuccess && '✅ ENTRY ALLOWED'}
          {isDuplicate && '🔁 ALREADY CHECKED IN'}
          {isInvalid && '❌ INVALID / NOT FOUND'}
        </h2>

        {/* Participant Details Card */}
        {result.participant ? (
          <div className="w-full bg-black/60 border border-white/15 rounded-xl p-4 my-3 text-left font-mono space-y-1.5">
            <div className="text-lg font-bold text-white truncate">
              {result.participant.full_name}
            </div>
            <div className="text-xs text-slate-300 flex justify-between">
              <span>ROLL: <strong className="text-emerald-400">{result.participant.roll_number}</strong></span>
              <span>SEC: <strong>{result.participant.section}</strong></span>
            </div>
            <div className="text-xs text-slate-300">
              YEAR: <strong>{result.participant.year}</strong>
            </div>

            {isDuplicate && result.participant.checked_in_at && (
              <div className="mt-2 pt-2 border-t border-slate-700/80 text-[11px] text-amber-300">
                First checked in at:{' '}
                {new Date(result.participant.checked_in_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
                {result.participant.checked_in_by && ` (${result.participant.checked_in_by})`}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm font-mono text-slate-200 my-4">
            {result.message || 'Scanned QR token does not exist in event system.'}
          </p>
        )}

        <div className="text-[11px] font-mono text-slate-400 mt-2 flex items-center gap-1">
          <span>Resuming scan automatically</span>
          <ArrowRight className="w-3 h-3 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
