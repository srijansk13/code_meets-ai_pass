'use client';

import { AlertOctagon, RefreshCw } from 'lucide-react';

/**
 * global-error.tsx — catches errors that propagate above all route segments,
 * including errors in the root layout itself.
 *
 * This is the last line of defense before the browser shows a raw crash.
 * It must include its own <html> and <body> tags.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#040711] text-white flex items-center justify-center min-h-screen p-4 font-mono">
        <div className="w-full max-w-sm bg-[#091228] border border-red-500/50 rounded-3xl p-8 text-center shadow-2xl">
          <div className="text-5xl mb-4">💀</div>

          <div className="mb-4 py-2 px-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-400 text-xs font-bold flex items-center justify-center gap-2">
            <AlertOctagon className="w-4 h-4 animate-pulse" />
            <span>APPLICATION ERROR</span>
          </div>

          <h1 className="text-sm font-black text-white uppercase tracking-wider mb-2">
            CODE MEETS AI
          </h1>
          <p className="text-xs text-slate-400 mb-6">
            Something unexpected happened. Tap below to reload.
          </p>

          <button
            onClick={reset}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            RELOAD
          </button>
        </div>
      </body>
    </html>
  );
}
