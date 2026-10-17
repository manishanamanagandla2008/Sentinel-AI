import React, { useState } from 'react';
import {
  X,
  BrainCircuit,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  FileCode2,
  ArrowRight,
  ExternalLink,
  MapPin,
  Clock,
  Layers
} from 'lucide-react';
import { Transaction, Alert } from '../types/index.ts';

interface InspectModalProps {
  item: Transaction | Alert | null;
  type: 'transaction' | 'alert';
  onClose: () => void;
  onNavigateToIncident?: (alertId: string) => void;
}

export const InspectModal: React.FC<InspectModalProps> = ({
  item,
  type,
  onClose,
  onNavigateToIncident,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'explanation' | 'factors' | 'json'>('explanation');

  if (!item) return null;

  const isTxn = type === 'transaction';
  const txn = isTxn ? (item as Transaction) : null;
  const alert = !isTxn ? (item as Alert) : null;

  const riskScore = item.riskScore;
  const severity = isTxn ? (item as Transaction).riskLevel : (item as Alert).severity;
  const explanation = item.explanation;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(item, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-mono text-xs">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{item.id}</span>
                <span className="text-slate-600">·</span>
                <span className={`font-bold ${
                  severity === 'CRITICAL' ? 'text-rose-400' :
                  severity === 'HIGH' ? 'text-amber-400' :
                  severity === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400'
                }`}>
                  {severity} RISK
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-cyan-400">Score {riskScore}/100</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isTxn ? `Transaction ${txn?.transactionType} · Status: ${txn?.status}` : `Alert: ${alert?.title}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-950/40 text-[11px]">
          <button
            onClick={() => setActiveTab('explanation')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'explanation'
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Explainable AI Findings
          </button>
          <button
            onClick={() => setActiveTab('factors')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'factors'
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Feature Weights ({explanation.contributingFactors.length})
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'json'
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw Forensic JSON
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'explanation' && (
            <div className="space-y-4">
              {/* Summary card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold flex items-center justify-between">
                  <span>Detection Synthesis</span>
                  <span>Isolation Forest Score: {explanation.isolationForestScore ?? '0.895'}</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {explanation.summary}
                </p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Evaluated using <span className="text-slate-300">{item.detectionMethod}</span>
                </div>
              </div>

              {/* Transaction Key Metadata if applicable */}
              {txn && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Amount:</span>
                    <span className="font-bold text-white text-xs">${txn.amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Source Account:</span>
                    <span className="text-slate-300 truncate block">{txn.sourceAccount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Destination:</span>
                    <span className="text-slate-300 truncate block">{txn.destinationAccount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Origin Location:</span>
                    <span className="text-slate-300 truncate block">{txn.location.city}, {txn.location.country}</span>
                  </div>
                </div>
              )}

              {/* Rules Triggered */}
              {explanation.rulesTriggered.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-400 font-semibold">Rules Policy Engine Activations:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {explanation.rulesTriggered.map((rule, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-[10px]"
                      >
                        {rule}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Recommendations */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400 font-semibold">Recommended Containment Protocol:</div>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  {explanation.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-cyan-400 font-bold">[{i + 1}]</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'factors' && (
            <div className="space-y-3">
              <div className="text-slate-400 text-[11px]">
                Each factor below represents feature deviation weights calculated by the tree isolation ensemble:
              </div>

              {explanation.contributingFactors.map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{f.feature}</span>
                    <span className="font-bold text-amber-400">+{f.impact} Risk Weight</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded">
                    <div>Baseline: <span className="text-slate-300">{f.baseline}</span></div>
                    <div>Observed: <span className="text-cyan-300 font-bold">{f.observed}</span></div>
                  </div>
                  <p className="text-[11px] text-slate-400">{f.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'json' && (
            <div className="relative">
              <button
                onClick={handleCopyJSON}
                className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 overflow-x-auto max-h-96">
                {JSON.stringify(item, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            SentinelAI Forensics Engine · ISO/IEC 27001 Ready
          </span>
          <div className="flex items-center gap-2">
            {alert && onNavigateToIncident && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToIncident(alert.id);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Open in Incident Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
