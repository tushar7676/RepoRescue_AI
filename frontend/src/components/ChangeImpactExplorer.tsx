'use client';

import React, { useState } from 'react';
import { ImpactResponse } from '../lib/types';
import { analyzeImpact } from '../lib/api';
import { Zap, AlertTriangle, ShieldAlert, CheckCircle2, FileText, ArrowRight, CornerDownRight, RefreshCw } from 'lucide-react';

interface ChangeImpactExplorerProps {
  repoUrl: string;
}

const PRESET_CHANGES = [
  'Replace database driver from SQLite to PostgreSQL',
  'Migrate authentication system to OAuth2 / JWT session tokens',
  'Add Redis caching layer to API routes',
  'Upgrade primary framework version and update middleware',
];

export const ChangeImpactExplorer: React.FC<ChangeImpactExplorerProps> = ({ repoUrl }) => {
  const [changeText, setChangeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [impactData, setImpactData] = useState<ImpactResponse | null>(null);

  const handleRunImpact = async (customPrompt?: string) => {
    const textToRun = customPrompt || changeText;
    if (!textToRun.trim()) {
      setError('Please describe a proposed change or feature request.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await analyzeImpact(repoUrl, textToRun.trim());
      setImpactData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze change impact.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'High':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            High Risk Impact
          </span>
        );
      case 'Medium':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Medium Risk Impact
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Low Risk Impact
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 border-slate-800 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-violet-400 font-bold text-lg">
          <Zap className="w-5 h-5 text-violet-400" />
          Change Impact & Blast-Radius Explorer
        </div>
        <span className="text-xs text-violet-300 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/30 font-medium">
          Core Differentiating Engine
        </span>
      </div>

      <p className="text-slate-400 text-xs md:text-sm mb-6">
        Describe a planned modification or feature addition to predict affected files, module blast radius, and safe implementation sequence.
      </p>

      {/* Input Box & Presets */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={changeText}
            onChange={(e) => setChangeText(e.target.value)}
            placeholder="e.g. Replace authentication system with OAuth2 or Add Redis caching layer..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all"
          />

          <button
            onClick={() => handleRunImpact()}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-violet-500/20"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing Impact...
              </>
            ) : (
              <>
                Predict Impact
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-500 font-medium">Try Preset:</span>
          {PRESET_CHANGES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setChangeText(preset);
                handleRunImpact(preset);
              }}
              disabled={loading}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-violet-300 transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>

        {error && (
          <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 rounded-lg p-3 mt-2">
            {error}
          </div>
        )}
      </div>

      {/* Results View */}
      {impactData && (
        <div className="mt-8 border-t border-slate-800 pt-6 space-y-6">
          {/* Risk & Summary Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                Change Proposal
              </div>
              <h4 className="text-base font-bold text-white">&quot;{impactData.change_request}&quot;</h4>
              <p className="text-xs text-slate-400 mt-1">{impactData.summary}</p>
            </div>
            <div className="shrink-0">{getRiskBadge(impactData.risk_level)}</div>
          </div>

          {/* Affected Modules & Affected Files Matrix */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-400" />
              Affected Source Files ({impactData.affected_files.length})
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase bg-slate-900/60">
                    <th className="p-3">File Path</th>
                    <th className="p-3">Impact Type</th>
                    <th className="p-3">Risk</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Suggested Modification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {impactData.affected_files.map((af, i) => (
                    <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-mono font-semibold text-white whitespace-nowrap">{af.file}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            af.impact_type === 'Direct' ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {af.impact_type}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-300">{af.risk_level}</td>
                      <td className="p-3 text-slate-400 min-w-[200px]">{af.reason}</td>
                      <td className="p-3 text-slate-300 min-w-[220px]">{af.suggested_changes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommended Changes Order */}
          {impactData.recommended_changes.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-900">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Suggested Implementation Sequence
              </h5>
              <div className="space-y-2">
                {impactData.recommended_changes.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CornerDownRight className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
