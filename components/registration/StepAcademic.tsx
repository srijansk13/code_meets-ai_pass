'use client';

import React from 'react';
import { BookOpen, GraduationCap, Building, ArrowRight, ArrowLeft } from 'lucide-react';

interface StepAcademicProps {
  section: string;
  setSection: (val: string) => void;
  branch: string;
  setBranch: (val: string) => void;
  year: '1st Year' | '2nd Year';
  setYear: (val: '1st Year' | '2nd Year') => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepAcademic({
  section,
  setSection,
  branch,
  setBranch,
  year,
  setYear,
  onNext,
  onBack,
}: StepAcademicProps) {
  const isFormValid = section.trim().length > 0 && branch.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-mono animate-toast-slide relative z-30 pointer-events-auto">
      <div className="border-b border-white/10 pb-3 mb-4">
        <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">STEP 02 OF 04</div>
        <h3 className="text-lg sm:text-xl font-extrabold text-white uppercase">ACADEMIC PROFILE</h3>
        <p className="text-xs text-slate-400">Select your branch, year, and section.</p>
      </div>

      <div className="space-y-4">
        {/* Branch */}
        <div>
          <label className="block text-xs text-slate-300 mb-1.5 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-cyan-400" />
              BRANCH <span className="text-emerald-400">*</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal">e.g. CSE, ECE, IT</span>
          </label>
          <input
            type="text"
            required
            value={branch}
            onChange={(e) => setBranch(e.target.value.toUpperCase())}
            placeholder="[ e.g. CSE ]"
            className="w-full bg-[#040711] border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 text-sm transition-all uppercase touch-manipulation"
          />
        </div>

        {/* Section */}
        <div>
          <label className="block text-xs text-slate-300 mb-1.5 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              SECTION <span className="text-emerald-400">*</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal">e.g. CSE-A, ECE-B</span>
          </label>
          <input
            type="text"
            required
            value={section}
            onChange={(e) => setSection(e.target.value.toUpperCase())}
            placeholder="[ e.g. CSE-A ]"
            className="w-full bg-[#040711] border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 text-sm transition-all uppercase touch-manipulation"
          />
        </div>

        {/* Year Selection */}
        <div>
          <label className="block text-xs text-slate-300 mb-1.5 font-bold flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            YEAR OF STUDY <span className="text-emerald-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setYear('1st Year')}
              className={`py-3 px-4 rounded-xl font-bold text-xs border transition-all cursor-pointer touch-manipulation relative z-30 pointer-events-auto ${
                year === '1st Year'
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                  : 'bg-[#040711] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              1ST YEAR 🎓
            </button>

            <button
              type="button"
              onClick={() => setYear('2nd Year')}
              className={`py-3 px-4 rounded-xl font-bold text-xs border transition-all cursor-pointer touch-manipulation relative z-30 pointer-events-auto ${
                year === '2nd Year'
                  ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20'
                  : 'bg-[#040711] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              2ND YEAR ⚡
            </button>
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
          onClick={() => {
            if (isFormValid) onNext();
          }}
          disabled={!isFormValid}
          className="py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation relative z-30 pointer-events-auto"
        >
          <span>CONTINUE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
