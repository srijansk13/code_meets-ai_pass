'use client';

import React, { useState } from 'react';
import { BookOpen, GraduationCap, Building, ArrowRight, ArrowLeft, AlertCircle, Lock } from 'lucide-react';
import { ALLOWED_BRANCHES, ALLOWED_SECTIONS } from '@/lib/validation';

interface StepAcademicProps {
  section: string;
  setSection: (val: string) => void;
  branch: string;
  setBranch: (val: string) => void;
  year: '1st Year' | '2nd Year';
  onNext: () => void;
  onBack: () => void;
  onErrorToast?: (msg: string) => void;
}

export default function StepAcademic({
  section,
  setSection,
  branch,
  setBranch,
  year,
  onNext,
  onBack,
  onErrorToast,
}: StepAcademicProps) {
  const [branchError, setBranchError] = useState<string | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);

  const validateAndProceed = () => {
    let valid = true;

    const trimmedBranch = branch.trim();
    if (!trimmedBranch) {
      setBranchError('Please select your branch');
      if (onErrorToast) onErrorToast('Please select your branch');
      valid = false;
    } else {
      setBranchError(null);
    }

    const trimmedSection = section.trim();
    if (!trimmedSection) {
      setSectionError('Please select your section');
      if (valid && onErrorToast) onErrorToast('Please select your section');
      valid = false;
    } else {
      setSectionError(null);
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
        <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">STEP 02 OF 04</div>
        <h3 className="text-lg sm:text-xl font-extrabold text-white uppercase">ACADEMIC PROFILE</h3>
        <p className="text-xs text-slate-400">Select your official academic branch and section.</p>
      </div>

      <div className="space-y-4">
        {/* Branch Dropdown */}
        <div>
          <label className="block text-xs text-slate-300 mb-1.5 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-cyan-400" />
              BRANCH <span className="text-emerald-400">*</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal">7 options</span>
          </label>
          <div className="relative">
            <select
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                if (branchError) setBranchError(null);
              }}
              className={`w-full bg-[#040711] border ${
                branchError ? 'border-red-500/80 focus:border-red-400 focus:ring-red-400/50' : 'border-slate-800 focus:border-cyan-400 focus:ring-cyan-400/50'
              } rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 text-sm transition-all appearance-none cursor-pointer touch-manipulation relative z-30`}
            >
              <option value="" disabled className="bg-[#040711] text-slate-500">
                [ Select Branch ]
              </option>
              {ALLOWED_BRANCHES.map((b) => (
                <option key={b} value={b} className="bg-[#091228] text-white py-1">
                  {b}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          {branchError && (
            <p className="text-xs text-red-400 font-semibold mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>{branchError}</span>
            </p>
          )}
        </div>

        {/* Section Dropdown */}
        <div>
          <label className="block text-xs text-slate-300 mb-1.5 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              SECTION <span className="text-emerald-400">*</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal">A - E</span>
          </label>
          <div className="relative">
            <select
              value={section}
              onChange={(e) => {
                setSection(e.target.value);
                if (sectionError) setSectionError(null);
              }}
              className={`w-full bg-[#040711] border ${
                sectionError ? 'border-red-500/80 focus:border-red-400 focus:ring-red-400/50' : 'border-slate-800 focus:border-cyan-400 focus:ring-cyan-400/50'
              } rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 text-sm transition-all appearance-none cursor-pointer touch-manipulation relative z-30`}
            >
              <option value="" disabled className="bg-[#040711] text-slate-500">
                [ Select Section ]
              </option>
              {ALLOWED_SECTIONS.map((s) => (
                <option key={s} value={s} className="bg-[#091228] text-white py-1">
                  Section {s}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          {sectionError && (
            <p className="text-xs text-red-400 font-semibold mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>{sectionError}</span>
            </p>
          )}
        </div>

        {/* Year Display (Read-only / Derived from Roll Number) */}
        <div>
          <label className="block text-xs text-slate-300 mb-1.5 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              YEAR OF STUDY <span className="text-emerald-400">*</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" /> AUTO-DERIVED
            </span>
          </label>

          <div className="p-3.5 bg-[#040711] border border-cyan-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white uppercase">{year}</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                LOCKED TO ROLL NUMBER
              </span>
            </div>
          </div>
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
          <span>CONTINUE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
