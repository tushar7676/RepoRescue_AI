'use client';

import React, { useState } from 'react';
import { AnalyzeResponse } from '../lib/types';
import { analyzeRepository } from '../lib/api';
import { HeroInput } from '../components/HeroInput';
import { LoadingState } from '../components/LoadingState';
import { RepositoryOverview } from '../components/RepositoryOverview';
import { SummaryArchitectureCard } from '../components/SummaryArchitectureCard';
import { WorkflowViewer } from '../components/WorkflowViewer';
import { RunbookCard } from '../components/RunbookCard';
import { ChangeImpactExplorer } from '../components/ChangeImpactExplorer';
import { HealthScoreCard } from '../components/HealthScoreCard';
import { BlastRadiusCard } from '../components/BlastRadiusCard';
import { CleanupAssistant } from '../components/CleanupAssistant';
import {
  Sparkles,
  Search,
  Layers,
  GitCommit,
  Terminal,
  Zap,
  ShieldCheck,
  Network,
  Trash2,
  RefreshCcw,
  AlertTriangle,
} from 'lucide-react';

type TabType = 'overview' | 'workflow' | 'runbook' | 'impact' | 'health' | 'blast' | 'cleanup';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentRepoUrl, setCurrentRepoUrl] = useState<string>('');

  const handleAnalyze = async (url: string) => {
    setLoading(true);
    setError(null);
    setCurrentRepoUrl(url);

    try {
      const result = await analyzeRepository(url);
      setData(result);
      setActiveTab('overview');
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing the repository.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
    setCurrentRepoUrl('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19]">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            onClick={handleReset}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img
              src="/logo.png"
              alt="RepoRescue AI Logo"
              className="w-9 h-9 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform object-cover"
            />
            <div>
              <span className="text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                RepoRescue <span className="text-emerald-400">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full font-mono">
                v1.0 MVP
              </span>
            </div>
          </div>

          {data && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all border-slate-800"
              >
                <RefreshCcw className="w-3.5 h-3.5 text-emerald-400" />
                Analyze Another Repo
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {!data && !loading && (
          <HeroInput onAnalyze={handleAnalyze} isLoading={loading} />
        )}

        {loading && <LoadingState />}

        {error && !loading && (
          <div className="max-w-2xl mx-auto my-12 glass-card border-rose-500/30 rounded-2xl p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Analysis Failed</h3>
            <p className="text-slate-300 text-sm mb-6">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors border border-slate-700"
            >
              Try Again
            </button>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            {/* Repository Top Header */}
            <RepositoryOverview repository={data.repository} health={data.health} />

            {/* Dashboard Tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'glass-card text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                Summary & Architecture
              </button>

              <button
                onClick={() => setActiveTab('workflow')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'workflow'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'glass-card text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                <GitCommit className="w-4 h-4" />
                Workflow Flow
              </button>

              <button
                onClick={() => setActiveTab('runbook')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'runbook'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'glass-card text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                <Terminal className="w-4 h-4" />
                Runbook
              </button>

              <button
                onClick={() => setActiveTab('impact')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'impact'
                    ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-md shadow-violet-500/20'
                    : 'glass-card text-violet-300 hover:text-white border-violet-500/30'
                }`}
              >
                <Zap className="w-4 h-4" />
                Change Impact Analysis
              </button>

              <button
                onClick={() => setActiveTab('health')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'health'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'glass-card text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Code Health ({data.health.score})
              </button>

              <button
                onClick={() => setActiveTab('blast')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'blast'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'glass-card text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                <Network className="w-4 h-4" />
                Blast Radius
              </button>

              <button
                onClick={() => setActiveTab('cleanup')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'cleanup'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'glass-card text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Cleanup Assistant
              </button>
            </div>

            {/* Active Tab View Rendering */}
            {activeTab === 'overview' && (
              <SummaryArchitectureCard
                summary={data.summary}
                architecture={data.architecture}
                mermaidDiagram={data.mermaid_diagram}
              />
            )}

            {activeTab === 'workflow' && <WorkflowViewer workflow={data.workflow} />}

            {activeTab === 'runbook' && <RunbookCard runbook={data.runbook} />}

            {activeTab === 'impact' && (
              <ChangeImpactExplorer repoUrl={data.repository.repo_url || currentRepoUrl} />
            )}

            {activeTab === 'health' && <HealthScoreCard health={data.health} />}

            {activeTab === 'blast' && <BlastRadiusCard blastRadius={data.blast_radius} />}

            {activeTab === 'cleanup' && <CleanupAssistant cleanup={data.cleanup} />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 px-6 text-center text-xs text-slate-500 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            RepoRescue AI &copy; 2026 • AI-Powered GitHub Repository Understanding & Change Impact Analysis
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Next.js 14</span>
            <span>FastAPI</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
