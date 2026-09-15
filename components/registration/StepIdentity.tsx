'use client';

import React, { useState } from 'react';
import { User, IdCard, ArrowRight, AlertCircle } from 'lucide-react';
import { deriveYearFromRollNumber } from '@/lib/validation';

interface StepIdentityProps {
  fullName: string;
  setFullName: (val: string) => void;
  rollNumber: string;
  setRollNumber: (val: string) => void;
  onNext: () => void;
  onErrorToast?: (msg: string) => void;
  externalRollError?: string | null;
}

export default function StepIdentity({
  fullName,
  setFullName,
  rollNumber,
  setRollNumber,
  onNext,
  onErrorToast,
  externalRollError,
}: StepIdentityProps) {
  const [nameError, setNameError] = useState<string | null>(null);
  const [rollError, setRollError] = useState<string | null>(null);

  const validateAndProceed = () => {
    let valid = true;

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setNameError('Name is required');
      if (onErrorToast) onErrorToast('Name is required');
      valid = false;
    } else {
      setNameError(null);
    }

    const trimmedRoll = rollNumber.trim();
    if (!trimmedRoll) {
      setRollError('Roll number is required');
      if (valid && onErrorToast) onErrorToast('Roll number is required');
      valid = false;
    } else {
      const rollRes = deriveYearFromRollNumber(trimmedRoll);
      if (!rollRes.isValid) {
        const msg = rollRes.error || 'Roll number must be exactly 10 characters';
        setRollError(msg);
        if (valid && onErrorToast) onErrorToast(msg);
        valid = false;
      } else {
        setRollError(null);
      }
    }

    if (valid && externalRollError) {
      if (onErrorToast) onErrorToast(externalRollError);
      valid = false;
    }

    if (valid) {
      onNext();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndProceed();
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
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (nameError) setNameError(null);
            }}
            placeholder="[ Enter your full name ]"
            className={`w-full bg-[#040711] border ${
              nameError ? 'border-red-500/80 focus:border-red-400 focus:ring-red-400/50' : 'border-slate-800 focus:border-cyan-400 focus:ring-cyan-400/50'
            } rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 text-sm transition-all touch-manipulation`}
          />
          {nameError && (
            <p className="text-xs text-red-400 font-semibold mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>{nameError}</span>
            </p>
          )}
        </div>

        {/* Roll Number */}
        <div>
          <label className="block text-xs text-slate-300 mb-1.5 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <IdCard className="w-4 h-4 text-cyan-400" />
              ROLL NUMBER <span className="text-emerald-400">*</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal">10 characters</span>
          </label>
          <input
            type="text"
            maxLength={10}
            value={rollNumber}
            onChange={(e) => {
              setRollNumber(e.target.value.toUpperCase());
              if (rollError) setRollError(null);
            }}
            placeholder="[ 10-character Roll Number ]"
            className={`w-full bg-[#040711] border ${
              (rollError || externalRollError) ? 'border-red-500/80 focus:border-red-400 focus:ring-red-400/50' : 'border-slate-800 focus:border-cyan-400 focus:ring-cyan-400/50'
            } rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 text-sm transition-all uppercase touch-manipulation`}
          />
          {(rollError || externalRollError) && (
            <p className="text-xs text-red-400 font-semibold mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>{rollError || externalRollError}</span>
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation relative z-30 pointer-events-auto"
      >
        <span>CONTINUE TO ACADEMIC</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
