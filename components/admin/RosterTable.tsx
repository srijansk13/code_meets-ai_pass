'use client';

import React from 'react';
import { Search, Download, CheckCircle2 } from 'lucide-react';

export interface Participant {
  id: string;
  full_name: string;
  roll_number: string;
  section: string;
  branch?: string;
  year: string;
  phone_number?: string;
  qr_token: string;
  is_checked_in: boolean;
  checked_in_at?: string;
  checked_in_by?: string;
}

interface RosterTableProps {
  participants: Participant[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterStatus: 'all' | 'checked_in' | 'pending';
  setFilterStatus: (status: 'all' | 'checked_in' | 'pending') => void;
  stats: { total_registered: number; total_checked_in: number };
  loading: boolean;
  onManualCheckin: (participant: Participant) => void;
  actionLoadingId: string | null;
  onExportCSV: () => void;
}

export default function RosterTable({
  participants,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  stats,
  loading,
  onManualCheckin,
  actionLoadingId,
  onExportCSV,
}: RosterTableProps) {
  const filtered = participants.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    const matches =
      p.full_name.toLowerCase().includes(query) ||
      p.roll_number.toLowerCase().includes(query) ||
      p.section.toLowerCase().includes(query) ||
      (p.branch || '').toLowerCase().includes(query);

    if (filterStatus === 'checked_in') return matches && p.is_checked_in;
    if (filterStatus === 'pending') return matches && !p.is_checked_in;
    return matches;
  });

  return (
    <div className="w-full bg-[#091228]/95 border border-white/10 rounded-3xl p-5 sm:p-6 font-mono shadow-2xl space-y-4">
      {/* Controls Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search participant name, roll number, section, or branch..."
            className="w-full bg-[#040711] border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 text-xs focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                filterStatus === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-[#040711] text-slate-400 border border-slate-800'
              }`}
            >
              ALL ({stats.total_registered})
            </button>

            <button
              onClick={() => setFilterStatus('checked_in')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                filterStatus === 'checked_in'
                  ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                  : 'bg-[#040711] text-slate-400 border border-slate-800'
              }`}
            >
              CHECKED IN ({stats.total_checked_in})
            </button>

            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                filterStatus === 'pending'
                  ? 'bg-amber-950 border border-amber-500 text-amber-400'
                  : 'bg-[#040711] text-slate-400 border border-slate-800'
              }`}
            >
              PENDING ({stats.total_registered - stats.total_checked_in})
            </button>
          </div>

          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-[10px] flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Roster List */}
      <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
        {loading && participants.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500 animate-pulse">
            $ loading participant roster data...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">
            No matching participants found 💀
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="bg-[#040711] border border-slate-800 rounded-2xl p-3.5 text-xs flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white truncate">{p.full_name}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="text-emerald-400 font-bold">{p.roll_number}</span>
                  <span>•</span>
                  <span>{p.branch || 'CSE'} • {p.section}</span>
                  <span>•</span>
                  <span>{p.year}</span>
                </div>
              </div>

              <div className="shrink-0">
                {p.is_checked_in ? (
                  <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-500/60 text-emerald-400 text-[10px] font-bold rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PRESENT</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onManualCheckin(p)}
                    disabled={actionLoadingId === p.id}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] rounded-lg uppercase cursor-pointer disabled:opacity-50"
                  >
                    {actionLoadingId === p.id ? 'MARKING...' : 'MARK PRESENT'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
