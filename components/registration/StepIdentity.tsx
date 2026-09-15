'use client';

import React from 'react';
import { User, IdCard, ArrowRight } from 'lucide-react';

interface StepIdentityProps {
  fullName: string;
  setFullName: (val: string) => void;
  rollNumber: string;
  setRollNumber: (val: string) => void;
  onNext: () => void;
}

export default function StepIdentity({
  fullName,
  setFullName,
  rollNumber,
  setRollNumber,
  onNext,
}: StepIdentityProps) {
  const isFormValid = fullName.trim().length > 0 && rollNumber.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-mono animate-toast-slide relative z-30 pointer-events-auto">
      <div className="border-b border-white/10 pb-3 mb-4">
        <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">STEP 01 OF 04</div>
        <h3 className="text-lg sm:text-xl font-extrabold text-white uppercase">PERSONAL IDENTITY</h3>
        <p className="text-xs text-slate-400">Enter your official student credentials.</p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs text-slate-300 mb-1.5 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-cyan-400" />
              FULL NAME <span className="text-emerald-400">*</span>
            </span>
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="[ Enter your full name ]"
            className="w-full bg-[#040711] border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 text-sm transition-all touch-manipulation"
          />
        </div>

        {/* Roll Number */}
        <div>
          <label className="block text-xs text-slate-300 mb-1.5 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <IdCard className="w-4 h-4 text-cyan-400" />
              ROLL NUMBER <span className="text-emerald-400">*</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal">e.g. 24CSE042</span>
          </label>
          <input
            type="text"
            required
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
            placeholder="[ e.g. 24CSE042 ]"
            className="w-full bg-[#040711] border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 text-sm transition-all uppercase touch-manipulation"
          />
        </div>
      </div>

      <button
        type="submit"
        onClick={() => {
          if (isFormValid) onNext();
        }}
        disabled={!isFormValid}
        className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation relative z-30 pointer-events-auto"
      >
        <span>CONTINUE TO ACADEMIC</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
