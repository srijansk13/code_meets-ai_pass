'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import StepIndicator from '@/components/registration/StepIndicator';
import StepIdentity from '@/components/registration/StepIdentity';
import StepAcademic from '@/components/registration/StepAcademic';
import StepContact from '@/components/registration/StepContact';
import StepConfirm from '@/components/registration/StepConfirm';
import Toast, { ToastMessage } from '@/components/Toast';
import { validateParticipantData, deriveYearFromRollNumber } from '@/lib/validation';
import { Ticket, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  // Multi-step state (1..4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [section, setSection] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState<'1st Year' | '2nd Year'>('1st Year');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [existingToken, setExistingToken] = useState<string | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'warning' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Automatically derive academic year when roll number prefix changes
  useEffect(() => {
    const rollRes = deriveYearFromRollNumber(rollNumber);
    if (rollRes.isValid && rollRes.year) {
      setYear(rollRes.year);
    }
  }, [rollNumber]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('chaos_qr_token');
      if (savedToken) setExistingToken(savedToken);
    }
  }, []);

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side full validation before submitting
    const validation = validateParticipantData({
      full_name: fullName,
      roll_number: rollNumber,
      section,
      branch,
      year,
      phone_number: phoneNumber,
    });

    if (!validation.isValid) {
      const errMsg = validation.error || 'Please fill in all mandatory fields correctly.';
      addToast('error', errMsg);

      // Jump back to relevant step if a field is invalid
      if (validation.fieldErrors.full_name || validation.fieldErrors.roll_number) {
        setCurrentStep(1);
      } else if (validation.fieldErrors.branch || validation.fieldErrors.section || validation.fieldErrors.year) {
        setCurrentStep(2);
      } else if (validation.fieldErrors.phone_number) {
        setCurrentStep(3);
      }
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phoneNumber.toString().trim().replace(/\D/g, '');

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          roll_number: rollNumber.trim(),
          section: section.trim(),
          branch: branch.trim().toUpperCase(),
          year: validation.derivedYear || year,
          phone_number: cleanPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed. Try again!');
      }

      const token = data.participant.qr_token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('chaos_qr_token', token);
      }

      if (data.already_registered) {
        addToast('warning', 'You already have an entry pass 👀 — loading it now!');
      } else {
        addToast('success', 'ENTRY PASS GENERATED ✓');
      }

      // Fire celebratory confetti burst safely
      try {
        const confettiModule = await import('canvas-confetti');
        const confetti = confettiModule.default || confettiModule;
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10b981', '#06b6d4', '#ffffff', '#f59e0b'],
          });
        }
      } catch (e) {}

      setTimeout(() => {
        router.push(`/ticket/${token}`);
      }, 400);

    } catch (err: any) {
      addToast('error', err.message || 'Network error occurred. Please try again!');
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between relative z-20 pointer-events-auto">
      <Toast toasts={toasts} onDismiss={removeToast} />
      <AppHeader />

      <main className="w-full max-w-xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center relative z-20 pointer-events-auto">
        
        {/* Active Pass Recover Banner */}
        {existingToken && (
          <div className="w-full bg-[#091228]/90 border border-cyan-500/40 rounded-2xl p-4 mb-6 text-center shadow-xl relative z-20 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Ticket className="w-4 h-4 text-cyan-400" />
                <span>ACTIVE PASS DETECTED</span>
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                ● READY FOR GATE
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              You already have an entry pass on this device! Tap below to view it.
            </p>

            <button
              onClick={() => router.push(`/ticket/${existingToken}`)}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 relative z-30 pointer-events-auto"
            >
              <Ticket className="w-4 h-4" />
              <span>VIEW MY DIGITAL ENTRY PASS 🎟️</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Structured Onboarding Card */}
        <div className="w-full bg-[#091228]/85 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-20 pointer-events-auto overflow-hidden backdrop-blur-xl">
          
          <StepIndicator currentStep={currentStep} onStepClick={(step) => setCurrentStep(step)} />

          {currentStep === 1 && (
            <StepIdentity
              fullName={fullName}
              setFullName={setFullName}
              rollNumber={rollNumber}
              setRollNumber={setRollNumber}
              onNext={() => setCurrentStep(2)}
              onErrorToast={(msg) => addToast('error', msg)}
            />
          )}

          {currentStep === 2 && (
            <StepAcademic
              section={section}
              setSection={setSection}
              branch={branch}
              setBranch={setBranch}
              year={year}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
              onErrorToast={(msg) => addToast('error', msg)}
            />
          )}

          {currentStep === 3 && (
            <StepContact
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
              onErrorToast={(msg) => addToast('error', msg)}
            />
          )}

          {currentStep === 4 && (
            <StepConfirm
              fullName={fullName}
              rollNumber={rollNumber}
              section={section}
              branch={branch}
              year={year}
              phoneNumber={phoneNumber}
              loading={loading}
              onSubmit={handleFinalSubmit}
              onBack={() => setCurrentStep(3)}
            />
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
