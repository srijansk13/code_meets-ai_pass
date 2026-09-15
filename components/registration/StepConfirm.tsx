'use client';

import React from 'react';
import { Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';
import { maskPhoneNumber } from '@/lib/eventConfig';

interface StepConfirmProps {
  fullName: string;
  rollNumber: string;
  section: string;
  branch: string;
  year: string;
  phoneNumber: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export default function StepConfirm({
  fullName,
  rollNumber,
  section,
  branch,
  year,
  phoneNumber,
  loading,
  onSubmit,
  onBack,
}: StepConfirmProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 font-mono animate-toast-slide relative z-30 pointer-events-auto">
      <div className="border-b border-white/10 pb-3 mb-4">
        <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">STEP 04 OF 04</div>
        <h3 className="text-lg sm:text-xl font-extrabold text-white uppercase">CONFIRM YOUR DETAILS</h3>
        <p className="text-xs text-slate-400">Review your credentials before issuing your digital pass.</p>
      </div>

      <div className="bg-[#040711] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 text-xs">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <span className="text-slate-400 font-semibold">PARTICIPANT:</span>
          <span className="text-white font-extrabold text-sm uppercase">{fullName}</span>
        </div>

        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <span className="text-slate-400 font-semibold">ROLL NUMBER:</span>
          <span className="text-emerald-400 font-extrabold text-sm">{rollNumber}</span>
        </div>

        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <span className="text-slate-400 font-semibold">BRANCH & SECTION:</span>
          <span className="text-slate-200 font-bold">{branch} • {section}</span>
        </div>

        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <span className="text-slate-400 font-semibold">YEAR OF STUDY:</span>
          <span className="text-slate-200 font-bold">{year}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-semibold">PHONE (MASKED):</span>
          <span className="text-cyan-400 font-bold">{maskPhoneNumber(phoneNumber)}</span>
        </div>
      </div>

      <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-[11px] text-cyan-300 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>Official credential generation • Instant scannable QR ticket</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="py-3.5 px-4 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 touch-manipulation relative z-30 pointer-events-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>EDIT INFO</span>
        </button>

        <button
          type="submit"
          onClick={(e) => {
            if (!loading) onSubmit(e);
          }}
          disabled={loading}
          className="py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 touch-manipulation relative z-30 pointer-events-auto"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              GENERATING...
            </span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-black" />
              <span>CONFIRM & GENERATE</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
