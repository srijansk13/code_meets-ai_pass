'use client';

import { useEffect } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export default function TicketError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for observability — never expose stack trace to the user
    console.error('[TicketError]', error.message, error.digest);
  }, [error]);

  return (
    <div className="w-full min-h-screen bg-[#040711] flex flex-col items-center justify-center px-4 font-mono">
      <div className="w-full max-w-sm bg-[#091228] border border-red-500/50 rounded-3xl p-8 shadow-2xl text-center">

        <div className="text-5xl mb-4">💀</div>

        <div className="mb-4 py-2 px-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-400 text-xs font-bold flex items-center justify-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />
          <span>SYSTEM ERROR</span>
        </div>

        <h2 className="text-sm font-black text-white uppercase tracking-wider mb-2">
          Something went wrong
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Your entry pass could not be loaded. This is a temporary issue — tap below to try again.
        </p>

        <button
          onClick={reset}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4" />
          <span>TRY AGAIN</span>
        </button>
      </div>
    </div>
  );
}
