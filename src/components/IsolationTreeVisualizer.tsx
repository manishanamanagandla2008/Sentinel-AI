import React, { useState } from 'react';
import {
  BrainCircuit,
  GitBranch,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowDownRight,
  ArrowDownLeft
} from 'lucide-react';

export const IsolationTreeVisualizer: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<'anomaly' | 'normal'>('anomaly');

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl font-mono space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/50">
            <GitBranch className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Isolation Tree Architecture & Mathematical Partitioning</span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive demonstration of path length isolation $h(x)$ vs average tree depth $c(n)$
            </p>
          </div>
        </div>

        {/* Case Toggle */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setSelectedCase('anomaly')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              selectedCase === 'anomaly'
                ? 'bg-rose-950/80 border-rose-600 text-rose-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Anomalous Point: h(x) = 3 (Short Path)
          </button>
          <button
            onClick={() => setSelectedCase('normal')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              selectedCase === 'normal'
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Normal Point: h(x) = 11 (Deep Path)
          </button>
        </div>
      </div>

      {/* Visual Tree Stage */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center space-y-4">
        {/* Root Node */}
        <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/60 shadow-lg text-center max-w-sm w-full">
          <div className="text-[10px] text-cyan-400 uppercase font-bold">Root Split 0</div>
          <div className="text-xs text-white font-semibold">Amount &gt; $18,500?</div>
          <div className="text-[10px] text-slate-400 mt-1">Evaluates volume deviation vs baseline</div>
        </div>

        {/* Level 1 Connections */}
        <div className="flex justify-between w-full max-w-md text-slate-500 text-[10px]">
          <span>YES (Anomalous branch) ↘</span>
          <span>↙ NO (Dense Cluster)</span>
        </div>

        {/* Level 1 Nodes */}
        <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
          {/* Left Branch (Anomaly branch) */}
          <div className={`p-3 rounded-xl border text-center transition-all ${
            selectedCase === 'anomaly'
              ? 'bg-rose-950/60 border-rose-500 shadow-md shadow-rose-950'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            <div className="text-[10px] text-rose-400 uppercase font-bold">Split 1</div>
            <div className="text-xs text-slate-200 font-semibold">Travel Speed &gt; 800 km/h?</div>
            <div className="text-[10px] text-slate-400 mt-1">Impossible velocity check</div>
          </div>

          {/* Right Branch (Normal cluster) */}
          <div className={`p-3 rounded-xl border text-center transition-all ${
            selectedCase === 'normal'
              ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            <div className="text-[10px] text-emerald-400 uppercase font-bold">Split 1</div>
            <div className="text-xs text-slate-200 font-semibold">Velocity &gt; 3 txns/15m?</div>
            <div className="text-[10px] text-slate-400 mt-1">Normal cluster subdivision</div>
          </div>
        </div>

        {/* Level 2 Final Isolation for Anomaly */}
        {selectedCase === 'anomaly' ? (
          <div className="w-full max-w-md pt-2 space-y-3">
            <div className="text-center text-rose-400 text-[11px] font-bold">
              YES ↘ Terminal Leaf Node Reached in Only 3 Splits!
            </div>
            <div className="p-4 rounded-xl bg-rose-950/40 border-2 border-rose-500 shadow-xl text-center space-y-1 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-center gap-2 text-rose-300 font-bold text-xs">
                <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
                <span>ISOLATED ANOMALY LEAF: TXN-90218</span>
              </div>
              <div className="text-xs text-white">
                Observed Path Length: <span className="font-bold text-rose-400 font-mono">h(x) = 3</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Anomaly Score: <span className="text-rose-400 font-bold">s(x, n) = 0.912</span> (Extreme Outlier)
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md pt-2 space-y-3">
            <div className="text-center text-emerald-400 text-[11px] font-bold">
              ↙ Continuing Recursive Splits through High-Density Cluster...
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-600/60 shadow-lg text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>NORMAL IN-CLUSTER BEHAVIOR</span>
              </div>
              <div className="text-xs text-white">
                Average Path Length to Isolate: <span className="font-bold text-emerald-400 font-mono">h(x) = 11</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Anomaly Score: <span className="text-emerald-400 font-bold">s(x, n) = 0.145</span> (Conforms to Baseline)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formula Explanation Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="font-bold text-cyan-300">Why Isolation Forest Works for Financial Fraud:</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Unlike density or distance algorithms, Isolation Forest explicitly isolates anomalies rather than profiling normal points. Because fraud vectors possess extreme feature values, they require far fewer random splits to isolate into single-element leaf nodes.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="font-bold text-cyan-300">Mathematical Anomaly Score Formulation:</div>
          <div className="p-2 rounded bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto">
            s(x, n) = 2^(-E(h(x)) / c(n))
          </div>
          <p className="text-[11px] text-slate-400">
            When $E(h(x)) \to 0$, $s \to 1$ (Definite Anomaly). When $E(h(x)) \to n-1$, $s \to 0$ (Normal).
          </p>
        </div>
      </div>
    </div>
  );
};
