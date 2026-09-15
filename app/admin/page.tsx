'use client';

import React, { useState, useEffect, useRef } from 'react';
import GateLoginForm from '@/components/admin/GateLoginForm';
import RosterTable, { Participant } from '@/components/admin/RosterTable';
import ResultFlash, { ScanResultData } from '@/components/ResultFlash';
import Toast, { ToastMessage } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import {
  Camera,
  Users,
  Lock,
  AlertCircle,
  RefreshCw,
  History,
  Key,
  CheckCircle2,
} from 'lucide-react';

interface RecentScan {
  time: string;
  name: string;
  roll: string;
  status: 'success' | 'duplicate' | 'invalid';
}

type ScannerLifecycleState = 'idle' | 'starting' | 'running' | 'stopping';

export default function AdminPage() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [deviceLabel, setDeviceLabel] = useState('Gate 1');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Tab State ('scanner' or 'dashboard')
  const [activeTab, setActiveTab] = useState<'scanner' | 'dashboard'>('scanner');

  // Manual 5-Digit Code State
  const [backupCodeInput, setBackupCodeInput] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);

  // Scanner State & Locks
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);

  const isProcessingRef = useRef(false);
  const html5QrcodeRef = useRef<any>(null);
  const scannerStateRef = useRef<ScannerLifecycleState>('idle');
  const stopRequestedRef = useRef<boolean>(false);
  const scannerMutexRef = useRef<Promise<void>>(Promise.resolve());

  // Roster & Stats State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked_in' | 'pending'>('all');
  const [dashLoading, setDashLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total_registered: 0, total_checked_in: 0 });

  // Toasts
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
    if (typeof window !== 'undefined') {
      const savedLabel = localStorage.getItem('chaos_gate_label');
      if (savedLabel) setDeviceLabel(savedLabel);
    }
    fetchParticipantsData();
  }, []);

  // Supabase Realtime Subscription for Live Admin Roster
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;

    let channel: any;
    try {
      channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'participants' },
          () => {
            fetchParticipantsData();
          }
        )
        .subscribe();
    } catch (e) {}

    return () => {
      if (channel) {
        try { supabase.removeChannel(channel); } catch (e) {}
      }
    };
  }, [isAuthenticated]);

  const fetchParticipantsData = async () => {
    try {
      setDashLoading(true);
      const res = await fetch('/api/admin/participants');
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setParticipants(data.participants || []);
        setStats(data.stats || { total_registered: 0, total_checked_in: 0 });
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setDashLoading(false);
    }
  };

  const handleLogin = async (key: string) => {
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, label: deviceLabel }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid security key');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('chaos_gate_label', deviceLabel);
      }

      setIsAuthenticated(true);
      addToast('success', 'GATE UNLOCKED 🚀');
      fetchParticipantsData();
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
      addToast('error', err.message || 'Access Denied 💀');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await stopCameraScanner();
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    addToast('info', 'GATE LOCKED 🔒');
  };

  const executeScannerOperation = (operation: () => Promise<void>) => {
    const nextMutex = scannerMutexRef.current
      .then(async () => {
        await operation();
      })
      .catch((err) => {});
    scannerMutexRef.current = nextMutex;
    return nextMutex;
  };

  const startCameraScannerInternal = async (cancelledRef: { current: boolean }) => {
    if (typeof window === 'undefined') return;
    if (scannerStateRef.current === 'starting' || scannerStateRef.current === 'running') return;

    setCameraError(null);
    scannerStateRef.current = 'starting';
    stopRequestedRef.current = false;

    const elementId = 'reader-viewport';

    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      if (cancelledRef.current || stopRequestedRef.current) {
        scannerStateRef.current = 'idle';
        return;
      }

      const html5Qrcode = new Html5Qrcode(elementId);
      html5QrcodeRef.current = html5Qrcode;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5Qrcode.start(
        { facingMode: 'environment' },
        config,
        onQrCodeSuccess,
        () => {}
      );

      scannerStateRef.current = 'running';
      setScannerActive(true);

      if (cancelledRef.current || stopRequestedRef.current) {
        await stopCameraScannerInternal();
      }
    } catch (err: any) {
      scannerStateRef.current = 'idle';
      setScannerActive(false);
      setCameraError(
        'Camera access failed. Ensure camera permissions are enabled.'
      );
    }
  };

  const stopCameraScannerInternal = async () => {
    if (scannerStateRef.current === 'idle' || scannerStateRef.current === 'stopping') return;

    if (scannerStateRef.current === 'starting') {
      stopRequestedRef.current = true;
      return;
    }

    scannerStateRef.current = 'stopping';

    if (html5QrcodeRef.current) {
      try {
        const currentState = typeof html5QrcodeRef.current.getState === 'function' 
          ? html5QrcodeRef.current.getState() 
          : (html5QrcodeRef.current.isScanning ? 2 : 0);

        if (currentState === 2 || html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
        if (typeof html5QrcodeRef.current.clear === 'function') {
          await html5QrcodeRef.current.clear();
        }
      } catch (e) {
      } finally {
        html5QrcodeRef.current = null;
      }
    }

    scannerStateRef.current = 'idle';
    stopRequestedRef.current = false;
    setScannerActive(false);
  };

  const startCameraScanner = () => {
    const cancelledRef = { current: false };
    return executeScannerOperation(() => startCameraScannerInternal(cancelledRef));
  };

  const stopCameraScanner = () => {
    return executeScannerOperation(() => stopCameraScannerInternal());
  };

  useEffect(() => {
    const cancelledRef = { current: false };

    if (isAuthenticated && activeTab === 'scanner') {
      executeScannerOperation(() => startCameraScannerInternal(cancelledRef));
    } else {
      executeScannerOperation(() => stopCameraScannerInternal());
    }

    return () => {
      cancelledRef.current = true;
      executeScannerOperation(() => stopCameraScannerInternal());
    };
  }, [isAuthenticated, activeTab]);

  const onQrCodeSuccess = async (decodedText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const res = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_token: decodedText,
          device_label: deviceLabel,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      setScanResult({
        status: data.status,
        participant: data.participant,
        message: data.message,
      });

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setRecentScans((prev) => [
        {
          time: timeStr,
          name: data.participant?.full_name || 'Unknown',
          roll: data.participant?.roll_number || decodedText.substring(0, 8),
          status: data.status,
        },
        ...prev.slice(0, 7),
      ]);

      fetchParticipantsData();
    } catch (err) {
      setScanResult({
        status: 'invalid',
        message: 'Network error during scan verification.',
      });
    }
  };

  // 5-Digit Backup Code Manual Entry
  const handleVerifyBackupCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = backupCodeInput.trim();
    if (cleanCode.length !== 5 || !/^\d{5}$/.test(cleanCode)) {
      addToast('error', 'Enter a valid 5-digit backup code');
      return;
    }

    setCodeLoading(true);

    try {
      const res = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backup_code: cleanCode,
          device_label: `${deviceLabel} (Backup Code)`,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      setScanResult({
        status: data.status,
        participant: data.participant,
        message: data.message,
      });

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setRecentScans((prev) => [
        {
          time: timeStr,
          name: data.participant?.full_name || 'Manual Code',
          roll: data.participant?.roll_number || `CODE:${cleanCode}`,
          status: data.status,
        },
        ...prev.slice(0, 7),
      ]);

      setBackupCodeInput('');
      fetchParticipantsData();
    } catch (err) {
      addToast('error', 'Verification error occurred');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleDismissResult = () => {
    setScanResult(null);
    isProcessingRef.current = false;
  };

  const handleManualCheckin = async (participant: Participant) => {
    if (participant.is_checked_in) return;
    setActionLoadingId(participant.id);

    try {
      const res = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_token: participant.qr_token,
          device_label: `${deviceLabel} (Manual)`,
        }),
      });

      const data = await res.json();
      setScanResult({
        status: data.status,
        participant: data.participant || participant,
        message: data.message,
      });

      fetchParticipantsData();
    } catch (err: any) {
      addToast('error', 'Manual check-in failed: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExportCSV = () => {
    if (typeof window !== 'undefined') {
      window.open('/api/admin/participants?format=csv', '_blank');
    }
  };

  // UNAUTHENTICATED GATE LOGIN
  if (!isAuthenticated) {
    return (
      <main className="w-full min-h-screen flex flex-col items-center justify-center p-4 font-mono bg-[#040711]">
        <Toast toasts={toasts} onDismiss={removeToast} />
        <GateLoginForm
          deviceLabel={deviceLabel}
          setDeviceLabel={setDeviceLabel}
          onLogin={handleLogin}
          loading={authLoading}
          error={authError}
        />
      </main>
    );
  }

  return (
    <main className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 font-mono pb-16 bg-[#040711] min-h-screen flex flex-col">
      <Toast toasts={toasts} onDismiss={removeToast} />
      <ResultFlash result={scanResult} onDismiss={handleDismissResult} />

      {/* Admin Top Status Bar */}
      <div className="w-full bg-[#091228] border border-white/10 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
          <div>
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">● GATE CONTROL</div>
            <div className="text-lg font-black text-white leading-none">
              {stats.total_checked_in} <span className="text-slate-500 text-xs font-normal">/ {stats.total_registered} CHECKED IN</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 px-3 py-1 rounded-full font-bold">
            {deviceLabel}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Lock Gate"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>LOCK</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
            activeTab === 'scanner'
              ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20'
              : 'bg-[#091228] text-slate-300 border-white/10 hover:border-white/20'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>GATE SCANNER</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20'
              : 'bg-[#091228] text-slate-300 border-white/10 hover:border-white/20'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ROSTER & SEARCH</span>
        </button>
      </div>

      {/* SCANNER TAB */}
      {activeTab === 'scanner' && (
        <div className="space-y-6">
          {/* Camera Scanner Box */}
          <div className="bg-[#091228]/95 border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
            <div className="w-full relative bg-black rounded-2xl overflow-hidden border-2 border-slate-800 min-h-[280px] flex items-center justify-center">
              <div id="reader-viewport" className="w-full h-full"></div>

              {cameraError && (
                <div className="absolute inset-0 bg-black/90 p-6 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                  <div className="text-xs text-red-400 mb-4">{cameraError}</div>
                  <button
                    onClick={startCameraScanner}
                    className="px-4 py-2.5 bg-emerald-500 text-black font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Camera</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Scanning live camera stream...</span>
            </div>
          </div>

          {/* 5-DIGIT BACKUP CODE VERIFICATION SECTION */}
          <div className="bg-[#091228]/95 border border-amber-500/40 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-3">
              <Key className="w-4 h-4 text-amber-400" />
              <span>OR ENTER 5-DIGIT BACKUP CODE</span>
            </div>

            <form onSubmit={handleVerifyBackupCode} className="flex gap-2">
              <input
                type="text"
                maxLength={5}
                value={backupCodeInput}
                onChange={(e) => setBackupCodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="58321"
                className="flex-1 bg-[#040711] border border-slate-700 focus:border-amber-400 text-amber-300 font-mono font-bold text-xl tracking-[0.25em] text-center py-3 rounded-xl outline-none transition-colors"
              />

              <button
                type="submit"
                disabled={codeLoading || backupCodeInput.length !== 5}
                className="px-5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-black font-black text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {codeLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>VERIFY</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RECENT SCANS LOG */}
          {recentScans.length > 0 && (
            <div className="bg-[#091228]/95 border border-white/10 rounded-3xl p-5 text-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-400 font-bold border-b border-white/10 pb-2">
                <History className="w-4 h-4 text-emerald-400" />
                <span>RECENT GATE SCANS</span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {recentScans.map((scan, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs bg-[#040711] p-2.5 rounded-xl border border-slate-800"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-500 text-[10px]">{scan.time}</span>
                      <span className="font-bold text-white truncate">{scan.name}</span>
                      <span className="text-emerald-400 text-[10px]">{scan.roll}</span>
                    </div>

                    <div>
                      {scan.status === 'success' && (
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded-full font-bold">
                          ✓ VERIFIED
                        </span>
                      )}
                      {scan.status === 'duplicate' && (
                        <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-500/50 px-2 py-0.5 rounded-full font-bold">
                          ⚠ DUPLICATE
                        </span>
                      )}
                      {scan.status === 'invalid' && (
                        <span className="text-[9px] bg-red-950 text-red-400 border border-red-500/50 px-2 py-0.5 rounded-full font-bold">
                          ✕ INVALID
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROSTER TAB */}
      {activeTab === 'dashboard' && (
        <RosterTable
          participants={participants}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          stats={stats}
          loading={dashLoading}
          onManualCheckin={handleManualCheckin}
          actionLoadingId={actionLoadingId}
          onExportCSV={handleExportCSV}
        />
      )}
    </main>
  );
}
