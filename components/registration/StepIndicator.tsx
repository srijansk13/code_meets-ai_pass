'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number; // 1, 2, 3, 4
  onStepClick: (step: number) => void;
}

const steps = [
  { num: 1, label: 'IDENTITY' },
  { num: 2, label: 'ACADEMIC' },
  { num: 3, label: 'CONTACT' },
  { num: 4, label: 'CONFIRM' },
];

export default function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8 font-mono">
      <div className="flex items-center justify-between relative">
        {/* Track Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-800 -z-0" />

        {/* Progress Line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-300 -z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          const isAccessible = step.num < currentStep;

          return (
            <button
              key={step.num}
              type="button"
              onClick={() => isAccessible && onStepClick(step.num)}
              disabled={!isAccessible}
              className={`flex flex-col items-center group relative z-10 ${
                isAccessible ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isCompleted
                    ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-cyan-500 text-black font-black ring-4 ring-cyan-500/30 scale-105 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : `0${step.num}`}
              </div>

              <span
                className={`text-[10px] sm:text-xs font-bold tracking-wider uppercase mt-2 hidden sm:block ${
                  isCurrent ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
