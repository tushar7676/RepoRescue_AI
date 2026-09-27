'use client';

import React, { useState } from 'react';
import { Search, Sparkles, GitBranch, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeroInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

const SAMPLE_REPOS = [
  { name: 'FastAPI', url: 'https://github.com/fastapi/fastapi', desc: 'Python API Framework' },
  { name: 'React', url: 'https://github.com/facebook/react', desc: 'UI Library' },
  { name: 'Express', url: 'https://github.com/expressjs/express', desc: 'Node.js Web App' },
  { name: 'Flask', url: 'https://github.com/pallets/flask', desc: 'Python Microframework' },
];

export const HeroInput: React.FC<HeroInputProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleValidationAndSubmit = (targetUrl: string) => {
    setError(null);
    const cleaned = targetUrl.trim();
    if (!cleaned) {
      setError('Please enter a GitHub repository URL.');
      return;
    }

    // Basic format check
    const pattern = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(\/)?$/;
    const shortPattern = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

    if (!pattern.test(cleaned) && !shortPattern.test(cleaned)) {
      setError('Invalid format. Enter a full GitHub URL (e.g. https://github.com/owner/repo) or owner/repo.');
      return;
    }

    const fullUrl = shortPattern.test(cleaned) ? `https://github.com/${cleaned}` : cleaned;
    onAnalyze(fullUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleValidationAndSubmit(url);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto text-center py-10 px-4">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-6 shadow-lg">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
        AI-Powered Codebase Intelligence & Blast Radius Engine
      </div>

      {/* Main Title */}
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
        Understand & Map Any <br />
        <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
          GitHub Repository in Seconds
        </span>
      </h1>

      <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
        Clones, flattens, maps module dependencies, predicts change impact, and assesses code health before you touch a single line of code.
      </p>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto mb-6">
        <div className="relative flex items-center glass-card rounded-2xl p-2 border-slate-700/80 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-2xl">
          <div className="pl-3 pr-2 text-slate-400">
            <GitBranch className="w-5 h-5 text-emerald-400" />
          </div>
          
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste GitHub URL (e.g. https://github.com/fastapi/fastapi)..."
            disabled={isLoading}
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm md:text-base focus:outline-none px-2 py-2"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 whitespace-nowrap"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              <>
                Rescue Codebase
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-rose-400 text-xs mt-3 bg-rose-950/40 border border-rose-500/30 rounded-lg p-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Quick Select Samples */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
        <span className="text-slate-500 font-medium mr-1">Quick Try:</span>
        {SAMPLE_REPOS.map((sample) => (
          <button
            key={sample.name}
            type="button"
            onClick={() => {
              setUrl(sample.url);
              handleValidationAndSubmit(sample.url);
            }}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg glass-card hover:bg-slate-800/80 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-all flex items-center gap-1.5 border-slate-800"
          >
            <span className="font-semibold">{sample.name}</span>
            <span className="text-[10px] text-slate-500">({sample.desc})</span>
          </button>
        ))}
      </div>
    </div>
  );
};
