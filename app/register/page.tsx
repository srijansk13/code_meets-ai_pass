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
import { Ticket, ArrowRight, Lock } from 'lucide-react';

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

  // Registration lock state
  const [registrationLocked, setRegistrationLocked] = useState<boolean>(false);
  const [statusChecked, setStatusChecked] = useState<boolean>(false);

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

  // Fetch registration lock status
  const [firstYearLocked, setFirstYearLocked] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchRegStatus = async () => {
      try {
        const res = await fetch('/api/registration/status', { cache: 'no-store' });
        const data = await res.json();
        setRegistrationLocked(data.registration_locked === true);
        setFirstYearLocked(data.first_year_locked === true);
      } catch {
        setRegistrationLocked(false);
        setFirstYearLocked(false);
      } finally {
        setStatusChecked(true);
      }
    };

    fetchRegStatus();
  }, []);

  // Debounced check for existing roll number
  const [rollNumberDbError, setRollNumberDbError] = useState<string | null>(null);
  
  useEffect(() => {
    const roll = rollNumber.trim();
    if (roll.length > 0 && roll.startsWith('26') && firstYearLocked) {
      setRollNumberDbError('First year pass generation is stopped.');
      return;
    }
    
    if (roll.length === 10 && deriveYearFromRollNumber(roll).isValid) {
      const checkRoll = async () => {
        try {
          const { supabase } = await import('@/lib/supabase');
          const { data } = await supabase
            .from('participants')
            .select('id')
            .ilike('roll_number', roll)
            .maybeSingle();

          if (data) {
            setRollNumberDbError(`Pass already generated for ${roll}`);
          } else {
            setRollNumberDbError(null);
          }
        } catch (err) {
          // Ignore network errors here to avoid blocking
        }
      };
      
      const timer = setTimeout(checkRoll, 400);
      return () => clearTimeout(timer);
    } else {
      setRollNumberDbError(null);
    }
  }, [rollNumber, firstYearLocked]);

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: double-check lock client-side (server will enforce too)
    if (registrationLocked) {
      addToast('error', 'Registrations are currently closed.');
      return;
    }

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

      // Handle registration lock rejection from server
      if (res.status === 403) {
        addToast('error', data.error || 'Registrations are currently closed.');
        setRegistrationLocked(true);
        setLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed. Try again!');
      }

      const token = data.participant.qr_token;
      if (typeof window !== 'undefined') {
        let existing = [];
        try {
          existing = JSON.parse(localStorage.getItem('chaos_qr_tokens') || '[]');
        } catch {
          existing = [];
        }
        if (!existing.includes(token)) {
          existing.push(token);
          localStorage.setItem('chaos_qr_tokens', JSON.stringify(existing));
        }
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
        


        {/* Registration Locked Banner */}
        {statusChecked && registrationLocked && (
          <div className="w-full bg-[#1a0505]/90 border border-red-500/50 rounded-2xl p-5 mb-6 text-center shadow-xl">
            <div className="flex items-center justify-center gap-2 text-red-400 font-extrabold text-sm uppercase tracking-wider mb-2">
              <Lock className="w-5 h-5" />
              <span>REGISTRATIONS LOCKED</span>
            </div>
            <p className="text-xs text-slate-400">
              Entry pass generation is currently closed by the event organiser.
              If you already have a pass, it remains fully valid.
            </p>
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
              externalRollError={rollNumberDbError}
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
              loading={loading || registrationLocked}
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
