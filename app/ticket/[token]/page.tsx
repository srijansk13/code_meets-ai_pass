'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import CountdownSection from '@/components/event/CountdownSection';
import CanonicalSocialCard from '@/components/social-card/CanonicalSocialCard';
import Toast, { ToastMessage } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import { EVENT_CONFIG, maskPhoneNumber } from '@/lib/eventConfig';
import { Download, CheckCircle2, ArrowLeft, Camera, Share2, Ticket, MapPin, Phone, ShieldCheck, Key } from 'lucide-react';

interface Participant {
  id: string;
  full_name: string;
  roll_number: string;
  section: string;
  branch?: string;
  year: string;
  phone_number?: string;
  qr_token: string;
  backup_code?: string;
  is_checked_in: boolean;
  checked_in_at?: string;
}

export default function TicketPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const routeParams = useParams();
  
  // Safely extract token: prefer useParams() hook (standard Next.js client hook),
  // with fallback if params is a Promise or plain object without throwing React.use() exception
  let token = (routeParams?.token as string) || '';
  if (!token && params) {
    if (typeof (params as any)?.then === 'function') {
      try {
        const unwrapped = React.use(params);
        token = unwrapped?.token || '';
      } catch (err) {
        console.error('[TicketPage] Error unwrapping params Promise:', err);
      }
    } else if (typeof params === 'object' && 'token' in (params as any)) {
      token = (params as any).token || '';
    }
  }

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!token) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('chaos_qr_token', token);
    }

    const fetchParticipant = async () => {
      try {
        setLoading(true);
        const { data, error: dbError } = await supabase
          .from('participants')
          .select('id, full_name, roll_number, section, branch, year, phone_number, qr_token, backup_code, is_checked_in, checked_in_at')
          .eq('qr_token', token)
          .single();

        if (dbError || !data) {
          throw new Error('Ticket token not found or invalid 💀');
        }

        setParticipant(data);
      } catch (err: any) {
        console.error('Fetch ticket error:', err);
        setError(err.message || 'Failed to load entry pass.');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipant();
  }, [token]);

  const downloadQR = () => {
    const svgElement = document.getElementById('ticket-qr-code');
    if (!svgElement) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width + 40;
        canvas.height = img.height + 40;
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 20, 20);
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = `CODE_MEETS_AI_PASS_${participant?.roll_number || 'TICKET'}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
          addToast('success', 'Pass saved to your downloads! 📲');
        }
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch (e) {
      addToast('error', 'Download failed. Please take a screenshot.');
    }
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'CODE MEETS AI Digital Entry Pass',
          text: `Digital Entry Pass for ${participant?.full_name} (${participant?.roll_number})`,
          url: window.location.href,
        });
        addToast('success', 'Pass link shared! 📤');
      } catch (e) {}
    } else if (typeof window !== 'undefined') {
      try {
        await navigator.clipboard.writeText(window.location.href);
        addToast('success', 'Pass link copied to clipboard! 📋');
      } catch (e) {
        addToast('info', 'Copy URL from your browser address bar!');
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-between bg-[#040711]">
        <AppHeader />
        <main className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center font-mono">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-cyan-400 text-xs animate-pulse">$ decrypting digital credential pass...</div>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-between bg-[#040711]">
        <AppHeader />
        <main className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center font-mono">
          <div className="w-full max-w-md bg-[#091228] border border-red-500/50 rounded-3xl p-8 shadow-2xl">
            <div className="text-5xl mb-4">💀</div>
            <h2 className="text-lg font-bold text-red-400 mb-2 uppercase">ENTRY PASS NOT FOUND</h2>
            <p className="text-xs text-slate-400 mb-6">
              The entry pass QR token appears invalid or expired.
            </p>
            <button
              onClick={() => router.push('/register')}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Get Entry Pass</span>
            </button>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  const maskedPhone = maskPhoneNumber(participant.phone_number);
  const branchName = participant.branch || 'CSE';
  const backupCodeDisplay = participant.backup_code || '58321';

  return (
    <div className="w-full min-h-screen flex flex-col justify-between bg-[#040711]">
      <Toast toasts={toasts} onDismiss={removeToast} />
      <AppHeader />

      <main className="w-full max-w-xl mx-auto px-4 py-6 sm:py-10 flex flex-col items-center space-y-8">
        
        {/* DIGITAL ENTRY PASS CREDENTIAL */}
        <div className="w-full bg-[#091228]/95 border border-cyan-500/40 rounded-3xl p-5 sm:p-7 font-mono shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          {/* Header Badge */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                <span>OFFICIAL DIGITAL PASS</span>
              </span>
              <span className="text-white font-black text-lg tracking-wider">
                {EVENT_CONFIG.name} 💀
              </span>
            </div>

            {participant.is_checked_in ? (
              <span className="px-3 py-1 bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-extrabold rounded-full flex items-center gap-1.5 shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>VERIFIED AT GATE</span>
              </span>
            ) : (
              <span className="px-3 py-1 bg-cyan-950 border border-cyan-500 text-cyan-300 text-[10px] font-extrabold rounded-full flex items-center gap-1.5 shadow-md shadow-cyan-500/20">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>ENTRY PASS ACTIVE</span>
              </span>
            )}
          </div>

          {/* High-Contrast QR Code */}
          <div className="flex flex-col items-center bg-white p-5 sm:p-6 rounded-2xl shadow-2xl mb-5 border-2 border-slate-200">
            <QRCodeSVG
              id="ticket-qr-code"
              value={participant.qr_token}
              size={210}
              level="H"
              includeMargin={true}
            />
            <div className="mt-3 text-[10px] text-slate-900 font-extrabold uppercase tracking-widest text-center">
              CM-AI / 2026 • GATE ENTRY QR
            </div>
          </div>

          {/* 5-DIGIT EMERGENCY BACKUP CODE STRIP */}
          <div className="bg-[#040711] border border-amber-500/50 rounded-2xl p-4 mb-5 flex flex-col items-center justify-center text-center shadow-inner">
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>5-DIGIT MANUAL BACKUP CODE</span>
            </div>
            <div className="text-3xl font-black tracking-[0.25em] text-white my-1 font-mono selection:bg-amber-500 selection:text-black">
              {backupCodeDisplay}
            </div>
            <div className="text-[9px] text-slate-400">
              Use for manual check-in if scanner camera fails
            </div>
          </div>

          {/* Participant Credentials Details */}
          <div className="bg-[#040711] border border-slate-800 rounded-2xl p-4 mb-5 text-xs space-y-2.5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-semibold">PARTICIPANT:</span>
              <span className="text-white font-extrabold text-sm text-right uppercase">
                {participant.full_name}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-semibold">ROLL NUMBER:</span>
              <span className="text-emerald-400 font-extrabold text-sm">{participant.roll_number}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-semibold">BRANCH / YEAR:</span>
              <span className="text-slate-200 font-bold">{branchName} • {participant.section} • {participant.year}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-semibold">PHONE (MASKED):</span>
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>{maskedPhone}</span>
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1">
              <span className="text-slate-400">VENUE:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{EVENT_CONFIG.venue}</span>
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">DATE & TIME:</span>
              <span className="text-cyan-400 font-bold">{EVENT_CONFIG.dateShort} • {EVENT_CONFIG.time}</span>
            </div>
          </div>

          {/* Gate Scanner Notice */}
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 text-center mb-5">
            <div className="text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 mb-0.5">
              <Camera className="w-4 h-4 text-amber-400 shrink-0" />
              <span>SHOW THIS SCREEN AT EVENT GATE</span>
            </div>
            <p className="text-[10px] text-slate-300">
              Present QR code or 5-digit backup code for volunteer entry verification.
            </p>
          </div>

          {/* Pass Action Buttons */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={downloadQR}
              className="py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>SAVE PASS 📲</span>
            </button>

            <button
              onClick={handleShare}
              className="py-3.5 bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 font-bold rounded-xl uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>SHARE LINK 📤</span>
            </button>
          </div>
        </div>

        {/* CANONICAL 1200x1500 "I'M ATTENDING" SOCIAL CARD GENERATOR */}
        <div className="w-full">
          <CanonicalSocialCard participant={participant} onToast={addToast} />
        </div>

        {/* Countdown Section */}
        <div className="w-full">
          <CountdownSection />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
