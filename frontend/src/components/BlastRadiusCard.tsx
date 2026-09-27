'use client';

import React, { useState } from 'react';
import { BlastRadiusItem } from '../lib/types';
import { Network, AlertCircle, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

interface BlastRadiusCardProps {
  blastRadius: BlastRadiusItem[];
}

export const BlastRadiusCard: React.FC<BlastRadiusCardProps> = ({ blastRadius }) => {
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  if (!blastRadius || blastRadius.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 mb-8 border-slate-800 text-slate-400 text-center">
        No high-dependency blast radius items discovered.
      </div>
    );
  }

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'High':
        return <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">High Blast Radius</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">Medium Impact</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px] font-semibold">Low Impact</span>;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-lg">
          <Network className="w-5 h-5 text-rose-400" />
          Dependency Blast Radius Matrix
        </div>
        <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          Ranked by Dependents Count
        </span>
      </div>

      <p className="text-slate-400 text-xs md:text-sm mb-6">
        Files with high fan-in imports. Modifying these files risks systemic regression across dependent components.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase bg-slate-900/60">
              <th className="p-3">File Path</th>
              <th className="p-3">Dependents Count</th>
              <th className="p-3">Risk Level</th>
              <th className="p-3">Impact Description</th>
              <th className="p-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {blastRadius.map((item) => {
              const isExpanded = expandedFile === item.file;
              return (
                <React.Fragment key={item.file}>
                  <tr
                    onClick={() => setExpandedFile(isExpanded ? null : item.file)}
                    className="hover:bg-slate-900/40 transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-mono font-semibold text-emerald-300">{item.file}</td>
                    <td className="p-3 font-bold text-white">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {item.dependents_count} files
                      </span>
                    </td>
                    <td className="p-3">{getRiskBadge(item.risk_level)}</td>
                    <td className="p-3 text-slate-400">{item.description}</td>
                    <td className="p-3 text-right text-slate-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-slate-950/90 border-t border-slate-900">
                      <td colSpan={5} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                              Directly Dependent Files ({item.direct_dependents.length})
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {item.direct_dependents.map((dep) => (
                                <span key={dep} className="px-2.5 py-1 rounded bg-slate-900 text-slate-300 font-mono text-[11px]">
                                  {dep}
                                </span>
                              ))}
                              {item.direct_dependents.length === 0 && <span className="text-slate-500">None</span>}
                            </div>
                          </div>

                          <div>
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                              Indirect Transitive Dependents ({item.indirect_dependents.length})
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {item.indirect_dependents.map((dep) => (
                                <span key={dep} className="px-2.5 py-1 rounded bg-slate-900 text-slate-400 font-mono text-[11px]">
                                  {dep}
                                </span>
                              ))}
                              {item.indirect_dependents.length === 0 && <span className="text-slate-500">None</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
