'use client';

import React from 'react';
import { CleanupInfo } from '../lib/types';
import { Trash2, AlertCircle, Info, ShieldCheck } from 'lucide-react';

interface CleanupAssistantProps {
  cleanup: CleanupInfo;
}

export const CleanupAssistant: React.FC<CleanupAssistantProps> = ({ cleanup }) => {
  if (!cleanup.candidates || cleanup.candidates.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 mb-8 border-slate-800 text-slate-400 text-center">
        <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-300">Clean Codebase Structure</p>
        <p className="text-xs text-slate-500 mt-1">No obvious unreferenced files or dead candidates identified.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
          <Trash2 className="w-5 h-5 text-amber-400" />
          Cleanup Assistant (Advisory Candidates)
        </div>
        <span className="text-xs text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 font-medium">
          {cleanup.unused_file_count} Candidate(s) Found
        </span>
      </div>

      <p className="text-slate-400 text-xs md:text-sm mb-6">
        Identified potentially unreferenced source files based on static import analysis. All suggestions are informational — human verification required.
      </p>

      <div className="space-y-4">
        {cleanup.candidates.map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {item.item_name}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {item.status} {item.item_type}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium mt-2">{item.reason}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{item.evidence}</p>
            </div>

            <div className="shrink-0 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 max-w-xs">
              <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Safety Guidance
              </div>
              {item.safety_recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
