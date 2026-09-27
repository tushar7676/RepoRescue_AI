'use client';

import React from 'react';
import { RepositoryInfo, HealthInfo } from '../lib/types';
import { Github, Code2, Files, Layers, ShieldCheck, ExternalLink } from 'lucide-react';

interface RepositoryOverviewProps {
  repository: RepositoryInfo;
  health: HealthInfo;
}

export const RepositoryOverview: React.FC<RepositoryOverviewProps> = ({ repository, health }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="w-full glass-card rounded-2xl p-6 mb-6 border-slate-800 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Github className="w-6 h-6 text-slate-300" />
            <span className="text-xs text-slate-400 font-mono tracking-wide uppercase bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              {repository.owner}
            </span>
            <span className="text-slate-600">/</span>
            <h2 className="text-2xl font-bold text-white tracking-tight">{repository.name}</h2>
            
            <a
              href={repository.repo_url}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition-colors p-1"
              title="View on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <p className="text-slate-300 text-sm max-w-2xl mt-1 leading-relaxed">
            {repository.description || 'Public GitHub Repository Analysis'}
          </p>

          {/* Languages Stack badges */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              {repository.primary_language}
            </span>
            {repository.languages.map((lang) => (
              <span
                key={lang}
                className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="glass-card rounded-xl p-3.5 text-center min-w-[90px] border-slate-800">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Files className="w-3.5 h-3.5 text-cyan-400" />
              Files
            </div>
            <span className="text-lg font-extrabold text-white">{repository.file_count}</span>
          </div>

          <div className="glass-card rounded-xl p-3.5 text-center min-w-[90px] border-slate-800">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              Lines
            </div>
            <span className="text-lg font-extrabold text-white">
              {repository.total_lines > 1000 ? `${(repository.total_lines / 1000).toFixed(1)}k` : repository.total_lines}
            </span>
          </div>

          <div className={`glass-card rounded-xl p-3.5 text-center min-w-[100px] border ${getScoreColor(health.score)}`}>
            <div className="flex items-center justify-center gap-1 text-xs mb-1 font-semibold opacity-90">
              <ShieldCheck className="w-3.5 h-3.5" />
              Health
            </div>
            <div className="text-2xl font-black">{health.score}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
