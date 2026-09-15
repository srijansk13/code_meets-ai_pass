'use client';

import React, { useState } from 'react';
import { ShieldAlert, Eye, EyeOff, Lock } from 'lucide-react';

interface GateLoginFormProps {
  deviceLabel: string;
  setDeviceLabel: (label: string) => void;
  onLogin: (key: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function GateLoginForm({
  deviceLabel,
  setDeviceLabel,
  onLogin,
  loading,
  error,
}: GateLoginFormProps) {
  const [securityKey, setSecurityKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const canSubmit = !loading && securityKey.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      await onLogin(securityKey.trim());
    }
  };

  return (
    <div className="w-full max-w-md bg-[#091228]/95 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 font-mono shadow-2xl relative z-30 pointer-events-auto">
      <div className="flex items-center gap-2 mb-6 text-emerald-400 text-sm font-bold border-b border-white/10 pb-4">
        <ShieldAlert className="w-5 h-5 text-emerald-400" />
        <span>CODE MEETS AI • GATE ACCESS 🔒</span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-300 text-xs flex items-center gap-2.5">
          <span className="text-lg">💀</span>
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        <div>
          <label className="block text-slate-300 mb-2 font-bold">
            ENTER SECURITY KEY <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              required
              value={securityKey}
              onChange={(e) => setSecurityKey(e.target.value)}
              placeholder="[ Enter security passphrase ]"
              className="w-full bg-[#040711] border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none text-sm pr-12 touch-manipulation"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-3 text-slate-400 hover:text-white p-1 touch-manipulation cursor-pointer"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-slate-300 mb-2 font-bold flex justify-between">
            <span>DEVICE / SCANNER LABEL</span>
            <span className="text-[10px] text-slate-500 font-normal">e.g. Gate 1</span>
          </label>
          <input
            type="text"
            value={deviceLabel}
            onChange={(e) => setDeviceLabel(e.target.value)}
            placeholder="Gate 1"
            className="w-full bg-[#040711] border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none text-sm touch-manipulation"
          />
        </div>

        <button
          type="submit"
          onClick={() => {
            if (canSubmit) onLogin(securityKey.trim());
          }}
          disabled={!canSubmit}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-black font-extrabold text-xs sm:text-sm rounded-2xl uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation relative z-30 pointer-events-auto"
        >
          {loading ? (
            <span>VERIFYING KEY...</span>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>UNLOCK GATE SCANNER 🚀</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
