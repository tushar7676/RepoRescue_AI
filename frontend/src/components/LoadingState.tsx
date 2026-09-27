'use client';

import React, { useEffect, useState } from 'react';
import { GitBranch, FileCode, Network, ShieldCheck, Cpu, Sparkles } from 'lucide-react';

const STAGES = [
  { id: 1, label: 'Initiating Shallow Git Clone', sub: 'Fetching single-branch repository tree...', icon: GitBranch },
  { id: 2, label: 'Flattening & Scanning Codebase', sub: 'Filtering binaries, caches, and lockfiles...', icon: FileCode },
  { id: 3, label: 'Mapping File Dependency Graph', sub: 'Calculating module imports and blast radius...', icon: Network },
  { id: 4, label: 'Evaluating Architecture & Code Health', sub: 'Scanning test suites, documentation, and security risk...', icon: ShieldCheck },
  { id: 5, label: 'Synthesizing AI Engine Insights', sub: 'Generating visual diagrams, runbook, and workflow...', icon: Cpu },
];

export const LoadingState: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto py-16 px-6 text-center">
      <div className="relative inline-flex mb-8">
        <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center border border-blue-500/40 shadow-2xl relative overflow-hidden">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-ping" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">Analyzing Repository Structure</h3>
      <p className="text-slate-400 text-sm mb-8">Extracting architecture patterns, dependencies, and risk matrix</p>

      {/* Stage Cards */}
      <div className="space-y-3 text-left">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          const isActive = currentStage === stage.id;
          const isDone = currentStage > stage.id;

          return (
            <div
              key={stage.id}
              className={`p-4 rounded-xl border transition-all duration-500 flex items-center gap-4 ${
                isActive
                  ? 'bg-slate-900/90 border-emerald-500/60 shadow-lg shadow-emerald-500/10 translate-x-1'
                  : isDone
                  ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                  : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : isDone
                    ? 'bg-slate-800 text-emerald-400'
                    : 'bg-slate-900 text-slate-600'
                }`}
              >
                {isActive ? (
                  <span className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-semibold ${isActive ? 'text-emerald-300' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                    {stage.label}
                  </h4>
                  {isDone && <span className="text-xs font-bold text-emerald-400">Done</span>}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{stage.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
