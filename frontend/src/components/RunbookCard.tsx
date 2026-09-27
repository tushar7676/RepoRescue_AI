'use client';

import React, { useState } from 'react';
import { RunbookCommand } from '../lib/types';
import { Terminal, Copy, Check, Play, Settings, Cpu } from 'lucide-react';

interface RunbookCardProps {
  runbook: RunbookCommand[];
}

export const RunbookCard: React.FC<RunbookCardProps> = ({ runbook }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Setup':
        return <Settings className="w-4 h-4 text-emerald-400" />;
      case 'Environment':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'Run':
        return <Play className="w-4 h-4 text-violet-400" />;
      default:
        return <Terminal className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
          <Terminal className="w-5 h-5 text-emerald-400" />
          Automated Runbook & Quickstart
        </div>
        <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          Discovered from repo configs
        </span>
      </div>

      <p className="text-slate-400 text-xs md:text-sm mb-6">
        Practical 3-step setup and execution sequence to build and run this repository locally.
      </p>

      <div className="space-y-4">
        {runbook.map((cmd, idx) => (
          <div key={idx} className="rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden shadow-md">
            {/* Command Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-300">
                {getCategoryIcon(cmd.category)}
                <span>Step {cmd.step || idx + 1}: {cmd.category}</span>
              </div>
              <span className="text-slate-400 font-normal">{cmd.description}</span>
            </div>

            {/* Terminal Command Line */}
            <div className="flex items-center justify-between p-4 font-mono text-xs md:text-sm text-emerald-300 bg-slate-950 overflow-x-auto">
              <div className="flex items-center gap-3">
                <span className="text-slate-600 select-none">$</span>
                <code className="whitespace-pre-wrap">{cmd.command}</code>
              </div>

              <button
                onClick={() => copyToClipboard(cmd.command, idx)}
                className="ml-4 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition-all shrink-0 flex items-center gap-1.5"
                title="Copy Command"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-sans font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-[10px] text-slate-400 font-sans">Copy</span>
                  </>
                )}
              </button>
            </div>

            {cmd.expected_output && (
              <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-900 text-[11px] text-slate-500 font-mono">
                Expected: {cmd.expected_output}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
