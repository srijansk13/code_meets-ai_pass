import React from 'react';

interface TerminalCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export default function TerminalCard({
  title = '$ bash - chaos_app.sh',
  children,
  className = '',
  glow = true,
}: TerminalCardProps) {
  return (
    <div
      className={`w-full bg-[#0d1322]/90 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden shadow-2xl ${
        glow ? 'terminal-glow' : ''
      } ${className}`}
    >
      {/* Terminal Window Header Bar */}
      <div className="bg-[#070b14] px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-red-500/90 inline-block shadow-sm shadow-red-500/50"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500/90 inline-block shadow-sm shadow-yellow-500/50"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block shadow-sm shadow-emerald-500/50"></span>
        </div>
        <div className="text-xs font-mono text-slate-400 truncate max-w-[200px] text-center select-none">
          {title}
        </div>
        <div className="text-[10px] text-emerald-500/80 font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE</span>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
