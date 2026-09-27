'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArchitectureInfo } from '../lib/types';
import { Cpu, Network, Layers, Maximize2, Minimize2, HelpCircle, Code } from 'lucide-react';

interface SummaryArchitectureCardProps {
  summary: string;
  architecture: ArchitectureInfo;
  mermaidDiagram: string;
}

export const SummaryArchitectureCard: React.FC<SummaryArchitectureCardProps> = ({
  summary,
  architecture,
  mermaidDiagram,
}) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagram' | 'code'>('diagram');

  useEffect(() => {
    let isMounted = true;
    const renderMermaid = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          flowchart: { curve: 'basis' },
        });

        if (mermaidRef.current && isMounted) {
          mermaidRef.current.innerHTML = '';
          const id = `mermaid-${Math.floor(Math.random() * 10000)}`;
          const { svg } = await mermaid.render(id, mermaidDiagram);
          if (mermaidRef.current && isMounted) {
            mermaidRef.current.innerHTML = svg;
          }
        }
      } catch (err) {
        console.error('Mermaid render failure:', err);
        if (isMounted) setRenderError(true);
      }
    };

    renderMermaid();
    return () => {
      isMounted = false;
    };
  }, [mermaidDiagram]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      {/* Left Column: Project Summary & Component Breakdown */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-card rounded-2xl p-6 border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base mb-3">
            <Cpu className="w-5 h-5 text-emerald-400" />
            Project Purpose & Summary
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">{summary}</p>

          <div className="border-t border-slate-800 pt-4 mt-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Architecture Pattern
            </div>
            <div className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-bold">
              {architecture.pattern}
            </div>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">{architecture.summary}</p>
          </div>
        </div>

        {/* Modules Breakdown */}
        <div className="glass-card rounded-2xl p-6 border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-base mb-4">
            <Layers className="w-5 h-5" />
            Major Component Modules
          </div>

          <div className="space-y-3">
            {architecture.main_components.map((comp, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="text-sm font-semibold text-white">{comp.name}</div>
                <div className="text-xs text-slate-400 mt-1">{comp.role}</div>
              </div>
            ))}
          </div>

          {architecture.entry_points.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Primary Entry Points
              </div>
              <div className="flex flex-wrap gap-2">
                {architecture.entry_points.map((ep) => (
                  <code key={ep} className="text-xs px-2.5 py-1 rounded bg-slate-950 text-emerald-300 border border-slate-800 font-mono">
                    {ep}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Visual Architecture Mermaid Diagram */}
      <div className="lg:col-span-7">
        <div
          className={`glass-card rounded-2xl p-6 border-slate-800 shadow-xl relative transition-all duration-300 flex flex-col ${
            isFullscreen ? 'fixed inset-4 z-50 bg-slate-950/95 max-w-none' : 'h-full min-h-[500px]'
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-violet-400" />
              <h3 className="font-bold text-white text-base">Visual Architecture Diagram</h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveTab('diagram')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'diagram' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Diagram
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'code' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mermaid Source
                </button>
              </div>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Diagram'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Render Container */}
          <div className="flex-1 flex items-center justify-center p-4 bg-slate-950/60 rounded-xl border border-slate-900 overflow-auto">
            {activeTab === 'diagram' ? (
              renderError ? (
                <div className="text-center p-6 text-slate-400">
                  <HelpCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">Mermaid Visual Fallback</p>
                  <p className="text-xs text-slate-500 mt-1">Unable to render graphic diagram. Showing text schema.</p>
                  <pre className="text-left text-xs bg-slate-900 p-4 rounded-lg mt-4 text-emerald-400 font-mono overflow-auto max-h-60">
                    {mermaidDiagram}
                  </pre>
                </div>
              ) : (
                <div ref={mermaidRef} className="mermaid w-full flex justify-center items-center overflow-auto" />
              )
            ) : (
              <pre className="w-full text-xs bg-slate-900 p-4 rounded-lg text-emerald-300 font-mono overflow-auto max-h-[450px]">
                {mermaidDiagram}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
