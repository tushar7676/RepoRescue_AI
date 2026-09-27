'use client';

import React, { useState } from 'react';
import { WorkflowInfo } from '../lib/types';
import { GitCommit, ArrowRight, FileCode, ChevronRight } from 'lucide-react';

interface WorkflowViewerProps {
  workflow: WorkflowInfo;
}

export const WorkflowViewer: React.FC<WorkflowViewerProps> = ({ workflow }) => {
  const [selectedStep, setSelectedStep] = useState<number>(1);

  if (!workflow.steps || workflow.steps.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 mb-8 border-slate-800 text-slate-400 text-center">
        No workflow steps available.
      </div>
    );
  }

  const activeStepObj = workflow.steps.find((s) => s.step_number === selectedStep) || workflow.steps[0];

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 border-slate-800 shadow-xl">
      <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg mb-2">
        <GitCommit className="w-5 h-5 text-cyan-400" />
        Interactive Data & Execution Workflow
      </div>
      <p className="text-slate-400 text-xs md:text-sm mb-6">{workflow.summary}</p>

      {/* Step Navigator Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {workflow.steps.map((step) => {
          const isSelected = step.step_number === selectedStep;
          return (
            <button
              key={step.step_number}
              onClick={() => setSelectedStep(step.step_number)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              {isSelected && <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400" />}

              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                  Step {step.step_number}
                </span>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
              </div>

              <div className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {step.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Details Panel */}
      <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-900">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center border border-cyan-500/40 text-sm">
            {activeStepObj.step_number}
          </div>
          <h4 className="text-base font-bold text-white">{activeStepObj.title}</h4>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-4">{activeStepObj.description}</p>

        {activeStepObj.involved_files.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              Involved Source Files
            </div>
            <div className="flex flex-wrap gap-2">
              {activeStepObj.involved_files.map((file) => (
                <span
                  key={file}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300"
                >
                  {file}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
