import React, { useState } from 'react';
import {
  Radio,
  ShieldAlert,
  Flame,
  AlertTriangle,
  Compass,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Transaction } from '../types/index.ts';
import { soundFx } from '../lib/soundFx.ts';

interface CyberRadarWidgetProps {
  transactions: Transaction[];
  onInspectTransaction: (txn: Transaction) => void;
}

export const CyberRadarWidget: React.FC<CyberRadarWidgetProps> = ({
  transactions,
  onInspectTransaction,
}) => {
  const [activeBlip, setActiveBlip] = useState<Transaction | null>(null);
  const [filterAnomaliesOnly, setFilterAnomaliesOnly] = useState(false);

  const displayedTxns = filterAnomaliesOnly
    ? transactions.filter(t => t.riskScore >= 65).slice(0, 16)
    : transactions.slice(0, 18);

  // Generate deterministic polar coordinates from transaction data
  const getCoordinates = (txn: Transaction, index: number) => {
    // Angle based on hash of transaction ID + index
    const hash = txn.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index * 37;
    const angleDeg = (hash * 47) % 360;
    const angleRad = (angleDeg * Math.PI) / 180;

    // Radius: critical threats are closer to the center bullseye (immediate defense perimeter)
    // Low risk are on outer ring
    const normalizedDist = 1 - (txn.riskScore / 130); // 0.23 (center) to 0.95 (edge)
    const radiusPct = Math.max(0.18, Math.min(0.88, normalizedDist)) * 46; // percentage of half-width

    const x = 50 + radiusPct * Math.cos(angleRad);
    const y = 50 + radiusPct * Math.sin(angleRad);

    return { x, y, angleDeg };
  };

  return (
    <div className="relative rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl font-mono overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">Cyber Threat Defense Radar</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase font-bold">
                Live Polar Arc
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Center core: Immediate zero-trust perimeter hold (Critical $\ge 80$). Outer rings: Ingress traffic.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterAnomaliesOnly(!filterAnomaliesOnly)}
            className={`px-2.5 py-1 rounded-lg border transition-all text-[11px] ${
              filterAnomaliesOnly
                ? 'bg-rose-950/80 border-rose-600 text-rose-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {filterAnomaliesOnly ? 'Anomalies Only (Active)' : 'Show All Traffic'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left 7 Cols: Circular Radar Display */}
        <div className="lg:col-span-7 flex items-center justify-center py-2">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-cyan-500/40 bg-gradient-to-b from-slate-950 via-[#070e1c] to-slate-950 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex items-center justify-center overflow-hidden select-none">
            {/* Concentric rings */}
            <div className="absolute inset-[15%] rounded-full border border-dashed border-cyan-500/30"></div>
            <div className="absolute inset-[35%] rounded-full border border-cyan-500/25"></div>
            <div className="absolute inset-[60%] rounded-full border border-dashed border-rose-500/30"></div>
            <div className="absolute inset-[82%] rounded-full border border-rose-500/40"></div>

            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/20"></div>
            <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/20"></div>

            {/* Sweep radar beam */}
            <div className="absolute inset-0 pointer-events-none radar-sweep origin-center">
              <div className="w-1/2 h-1/2 origin-bottom-right bg-gradient-to-br from-cyan-400/25 via-cyan-500/5 to-transparent rounded-tl-full"></div>
            </div>

            {/* Center Bullseye: IBM Z Sysplex Core */}
            <div className="relative z-10 flex flex-col items-center justify-center w-12 h-12 rounded-full bg-slate-900/90 border border-cyan-400 shadow-lg shadow-cyan-950">
              <span className="text-[8px] font-bold text-cyan-300 leading-none">IBM Z</span>
              <span className="text-[7px] text-emerald-400 leading-none mt-0.5">CORE</span>
            </div>

            {/* Threat Blips */}
            {displayedTxns.map((txn, index) => {
              const { x, y } = getCoordinates(txn, index);
              const isCrit = txn.riskScore >= 80;
              const isHigh = txn.riskScore >= 65;
              const isMed = txn.riskScore >= 35;

              const colorClass = isCrit
                ? 'bg-rose-500 shadow-rose-500/80 animate-ping'
                : isHigh
                ? 'bg-amber-400 shadow-amber-400/80'
                : isMed
                ? 'bg-yellow-400 shadow-yellow-400/80'
                : 'bg-cyan-400 shadow-cyan-400/80';

              return (
                <div
                  key={txn.id}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => {
                    soundFx.playBlip();
                    setActiveBlip(txn);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div className={`w-3 h-3 rounded-full border border-white/60 shadow-md ${colorClass} transition-transform group-hover:scale-150`}></div>
                  {/* Hover Tag */}
                  <div className="absolute left-1/2 -top-6 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-2 py-0.5 rounded bg-slate-950/95 border border-slate-700 text-[10px] text-white whitespace-nowrap shadow-xl z-30">
                    {txn.id} ({txn.riskScore}/100)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Selected Blip Telemetry Box */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="text-xs uppercase font-bold text-cyan-400 tracking-wider flex items-center justify-between">
            <span>Interception Telemetry</span>
            <span className="text-[10px] text-slate-400">Target Resolution</span>
          </div>

          {activeBlip ? (
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-sm">{activeBlip.id}</span>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                  activeBlip.riskScore >= 80 ? 'bg-rose-950 text-rose-300 border-rose-700' :
                  activeBlip.riskScore >= 65 ? 'bg-amber-950 text-amber-300 border-amber-700' :
                  'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}>
                  Score {activeBlip.riskScore}/100 · {activeBlip.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Amount:</span>
                  <span className="font-bold text-white">${activeBlip.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Type:</span>
                  <span>{activeBlip.transactionType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Origin:</span>
                  <span>{activeBlip.location.city}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Source IP:</span>
                  <span>{activeBlip.sourceIp}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {activeBlip.explanation.summary}
              </p>

              <button
                onClick={() => onInspectTransaction(activeBlip)}
                className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors"
              >
                Inspect Isolation Forest Attribution
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">
              Click any blip on the radar screen to examine incoming payload vector details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
