'use client';

import React from 'react';
import { HealthInfo } from '../lib/types';
import { ShieldCheck, CheckCircle, AlertTriangle, Lightbulb, Activity, ArrowUpRight } from 'lucide-react';

interface HealthScoreCardProps {
  health: HealthInfo;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ health }) => {
  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'Excellent':
        return <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">Excellent Condition</span>;
      case 'Good':
        return <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold">Good Condition</span>;
      case 'Needs Improvement':
        return <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">Needs Attention</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">Critical Risk</span>;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 border-slate-800 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Codebase Health Assessment
          </div>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Evaluated architecture maintainability, tests, documentation, security, and project layout.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {getRatingBadge(health.rating)}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{health.score}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Score</span>
          </div>
        </div>
      </div>

      {/* Category Scores Progress */}
      {health.category_scores && Object.keys(health.category_scores).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {Object.entries(health.category_scores).map(([cat, score]) => (
            <div key={cat} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{cat}</span>
                <span className="font-bold text-white">{score}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Findings */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-900">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Positive Architectural Evidence ({health.positive_findings.length})
          </h4>
          <ul className="space-y-2">
            {health.positive_findings.map((pos, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{pos}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Risks */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-900">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Key Technical Risks & Gaps ({health.key_risks.length})
          </h4>
          {health.key_risks.length > 0 ? (
            <ul className="space-y-2">
              {health.key_risks.map((risk, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">No high severity risks identified.</p>
          )}
        </div>
      </div>

      {/* Actionable Recommendations */}
      {health.recommendations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-800">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-cyan-400" />
            Actionable Improvement Recommendations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {health.recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                <ArrowUpRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
