'use client';

import React, { useState } from 'react';
import { Phone, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { maskPhoneNumber } from '@/lib/eventConfig';

interface StepContactProps {
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
  onErrorToast?: (msg: string) => void;
}

export default function StepContact({
  phoneNumber,
  setPhoneNumber,
  onNext,
  onBack,
  onErrorToast,
}: StepContactProps) {
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const cleanPhone = phoneNumber.toString().trim().replace(/\D/g, '');

  const validateAndProceed = () => {
    const rawTrimmed = phoneNumber.toString().trim();
    if (!rawTrimmed) {
      setPhoneError('Phone number is required');
      if (onErrorToast) onErrorToast('Phone number is required');
      return;
    }

    if (cleanPhone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
      if (onErrorToast) onErrorToast('Please enter a valid 10-digit phone number');
      return;
    }

    setPhoneError(null);
    onNext();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndProceed();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-mono animate-toast-slide relative z-30 pointer-events-auto">
      <div className="border-b border-white/10 pb-3 mb-4">
        <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">STEP 03 OF 04</div>
        <h3 className="text-lg sm:text-xl font-extrabold text-white uppercase">CONTACT & VERIFICATION</h3>
        <p className="text-xs text-slate-400">Provide your 10-digit mobile number.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-slate-300 mb-1.5 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-cyan-400" />
              PHONE NUMBER <span className="text-emerald-400">*</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal">10 digits</span>
          </label>

          <input
            type="tel"
            maxLength={10}
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              if (phoneError) setPhoneError(null);
            }}
            placeholder="[ e.g. 9876543210 ]"
            className={`w-full bg-[#040711] border ${
              phoneError ? 'border-red-500/80 focus:border-red-400 focus:ring-red-400/50' : 'border-slate-800 focus:border-cyan-400 focus:ring-cyan-400/50'
            } rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 text-sm transition-all touch-manipulation`}
          />
          {phoneError && (
            <p className="text-xs text-red-400 font-semibold mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>{phoneError}</span>
            </p>
          )}
        </div>

        {/* Live Privacy Masking Preview Pill */}
        {cleanPhone.length > 0 && (
          <div className="bg-[#040711] border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">PUBLIC DISPLAY PREVIEW:</span>
            <span className="text-cyan-400 font-bold">{maskPhoneNumber(cleanPhone)}</span>
          </div>
        )}

        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[11px] text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            Your full phone number is strictly encrypted and used solely for gate verification. Only the first two digits will be displayed publicly on your entry pass and social card.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onBack}
          className="py-3.5 px-4 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation relative z-30 pointer-events-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK</span>
        </button>

        <button
          type="submit"
          className="py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation relative z-30 pointer-events-auto"
        >
          <span>REVIEW PASS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
