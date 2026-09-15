'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SYSTEM INIT ERROR] Uncaught React exception caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development';
      return (
        <div className="w-full min-h-[100svh] bg-[#070b14] text-white flex flex-col items-center justify-center p-4 font-mono select-none">
          <div className="w-full max-w-md bg-[#0d1322] border border-red-500/60 rounded-2xl p-6 shadow-2xl text-center">
            {/* Branded Title */}
            <div className="mb-4">
              <h1 className="text-xl font-extrabold tracking-wider text-white uppercase">
                CODE MEETS AI
              </h1>
              <div className="text-xs font-bold text-red-500 tracking-wider uppercase mt-0.5">
                + A LITTLE BIT OF CHAOS 💀
              </div>
            </div>

            {/* Error Badge */}
            <div className="my-4 py-2 px-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-400 text-xs font-bold flex items-center justify-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />
              <span>[ SYSTEM INITIALIZATION FAILED ]</span>
            </div>

            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              System initialization encountered a runtime glitch. Tap below to re-initialize environment.
            </p>

            {/* Development Error Details */}
            {isDev && this.state.error && (
              <div className="mb-5 text-left bg-black/90 border border-red-500/40 rounded-xl p-3 text-[11px] text-red-300 overflow-x-auto max-h-48 font-mono select-text">
                <div className="font-bold text-red-400 mb-1">[SYSTEM INIT ERROR] {this.state.error.name}: {this.state.error.message}</div>
                {this.state.error.stack && (
                  <pre className="text-[9px] text-slate-400 whitespace-pre-wrap leading-tight mt-1">{this.state.error.stack}</pre>
                )}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>[ RELOAD SYSTEM 🔄 ]</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
