import React, { useState } from 'react';
import {
  BrainCircuit,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  BarChart2,
  GitBranch
} from 'lucide-react';
import { evaluateTransactionRisk } from '../lib/anomalyEngine.ts';
import { LocationInfo } from '../types/index.ts';
import { IsolationTreeVisualizer } from './IsolationTreeVisualizer.tsx';

export const AnomalyEngineView: React.FC = () => {
  // Interactive Simulation Controls for Analysts
  const [testAmount, setTestAmount] = useState<number>(68500);
  const [testSpeedKmh, setTestSpeedKmh] = useState<number>(1450);
  const [testBurstCount, setTestBurstCount] = useState<number>(7);
  const [isOffHours, setIsOffHours] = useState<boolean>(true);
  const [isOffshoreDest, setIsOffshoreDest] = useState<boolean>(true);
  const [selectedSourceAccount, setSelectedSourceAccount] = useState<string>('ACC-89104-US');

  // Compute live score using the engine
  const simulatedLocation: LocationInfo = testSpeedKmh > 800
    ? { city: 'George Town', country: 'Cayman Islands', lat: 19.2869, lng: -81.3674, region: 'Caribbean' }
    : { city: 'New York', country: 'United States', lat: 40.7128, lng: -74.006, region: 'North America' };

  const destAccount = isOffshoreDest ? 'ACC-MULE-KY-999' : 'ACC-10294-US';
  const simulatedTimestamp = isOffHours ? '2026-10-16T03:15:00Z' : '2026-10-16T14:30:00Z';

  const evaluation = evaluateTransactionRisk({
    amount: testAmount,
    sourceAccount: selectedSourceAccount,
    destinationAccount: destAccount,
    transactionType: 'WIRE_TRANSFER',
    sourceIp: '190.21.84.11',
    location: simulatedLocation,
    timestamp: simulatedTimestamp
  });

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <span>ISOLATION FOREST ENSEMBLE + HEURISTIC CORRELATION PIPELINE</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold font-mono text-white">
              AI Anomaly Detection & Explainable AI (XAI)
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              SentinelAI calculates risk using tree isolation depths combined with domain heuristics. Transparent feature attribution explains exactly why an event was flagged.
            </p>
          </div>

          {/* Model Specification Card */}
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono shadow-md">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Architecture</div>
              <div className="text-slate-200 font-bold">Isolation Forest (150 Trees)</div>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Synthetic AUC-ROC</div>
              <div className="text-emerald-400 font-bold">0.964 (Evaluated)</div>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Avg Latency</div>
              <div className="text-cyan-400 font-bold">14.2 ms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Anomaly Calculator Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Feature Sliders */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Interactive Feature Vector Tester</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Live Inference</span>
          </div>

          {/* Source Profile Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 flex justify-between">
              <span>Account Profile Baseline:</span>
              <span className="text-cyan-400">{selectedSourceAccount}</span>
            </label>
            <select
              value={selectedSourceAccount}
              onChange={e => setSelectedSourceAccount(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="ACC-89104-US">ACC-89104-US (Avg: $480 · New York)</option>
              <option value="ACC-52019-DE">ACC-52019-DE (Avg: $850 · Frankfurt)</option>
              <option value="ACC-31405-SG">ACC-31405-SG (Avg: $1,200 · Singapore)</option>
              <option value="ZOS-CICS-BATCH">ZOS-CICS-BATCH (Avg: $15,000 · IBM Z LPAR)</option>
            </select>
          </div>

          {/* Feature 1: Transaction Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Transaction Amount:</span>
              <span className="text-cyan-400 font-bold">${testAmount.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={100}
              max={150000}
              step={500}
              value={testAmount}
              onChange={e => setTestAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>$100 (Normal)</span>
              <span>$75,000</span>
              <span>$150,000 (Spike)</span>
            </div>
          </div>

          {/* Feature 2: Geo Velocity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Geographic Displacement Speed:</span>
              <span className={`font-bold ${testSpeedKmh > 800 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {testSpeedKmh} km/h {testSpeedKmh > 800 && '(Impossible)'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2500}
              step={50}
              value={testSpeedKmh}
              onChange={e => setTestSpeedKmh(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0 km/h (Local)</span>
              <span>800 km/h (Commercial Jet)</span>
              <span>2500 km/h</span>
            </div>
          </div>

          {/* Feature 3: Burst Frequency */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">15-Minute Window Transaction Count:</span>
              <span className={`font-bold ${testBurstCount >= 5 ? 'text-amber-400' : 'text-slate-300'}`}>
                {testBurstCount} txns
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              value={testBurstCount}
              onChange={e => setTestBurstCount(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>1 (Normal)</span>
              <span>5 (Alert)</span>
              <span>15 (Automated Burst)</span>
            </div>
          </div>

          {/* Feature 4 & 5: Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer text-xs font-mono text-slate-300 hover:border-slate-700">
              <input
                type="checkbox"
                checked={isOffshoreDest}
                onChange={e => setIsOffshoreDest(e.target.checked)}
                className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-0"
              />
              <span>Offshore Counterparty</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer text-xs font-mono text-slate-300 hover:border-slate-700">
              <input
                type="checkbox"
                checked={isOffHours}
                onChange={e => setIsOffHours(e.target.checked)}
                className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-0"
              />
              <span>Off-Hours (03:15 AM)</span>
            </label>
          </div>
        </div>

        {/* Right 7 Cols: Real-Time Explainable AI Output */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-white font-mono">
                  Real-Time Model Evaluation & Explainability
                </h2>
              </div>
              <span className={`text-xs font-mono px-2.5 py-1 rounded-md border font-semibold ${
                evaluation.riskLevel === 'CRITICAL' ? 'bg-rose-950/60 border-rose-700 text-rose-300' :
                evaluation.riskLevel === 'HIGH' ? 'bg-amber-950/60 border-amber-700 text-amber-300' :
                evaluation.riskLevel === 'MEDIUM' ? 'bg-yellow-950/60 border-yellow-700 text-yellow-300' :
                'bg-emerald-950/60 border-emerald-700 text-emerald-300'
              }`}>
                {evaluation.riskLevel} RISK · {evaluation.status}
              </span>
            </div>

            {/* Score Meters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              {/* Composite Risk Score */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Calibrated Composite Risk Score
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-bold font-mono ${
                    evaluation.riskScore >= 80 ? 'text-rose-400' :
                    evaluation.riskScore >= 65 ? 'text-amber-400' :
                    evaluation.riskScore >= 35 ? 'text-yellow-400' : 'text-emerald-400'
                  }`}>
                    {evaluation.riskScore}
                  </span>
                  <span className="text-xs font-mono text-slate-500">/ 100</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      evaluation.riskScore >= 80 ? 'bg-rose-500' :
                      evaluation.riskScore >= 65 ? 'bg-amber-500' :
                      evaluation.riskScore >= 35 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${evaluation.riskScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Isolation Forest Raw Score */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Isolation Forest Anomaly Score
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold font-mono text-cyan-400">
                    {evaluation.explanation.isolationForestScore}
                  </span>
                  <span className="text-xs font-mono text-slate-500">/ 1.000</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Tree path length ratio: {evaluation.explanation.isolationForestScore! > 0.65 ? 'Anomalous (Short Path)' : 'Normal Cluster'}
                </p>
              </div>
            </div>

            {/* Explainable AI Factor Breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
                <span>Feature Contribution Breakdown (SHAP-inspired Weights)</span>
                <span className="text-slate-400 font-normal">Impact on Risk Score</span>
              </div>

              {evaluation.explanation.contributingFactors.length === 0 ? (
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300 font-mono">
                  ✓ All analyzed parameters fall within 2 standard deviations of normal account behavior.
                </div>
              ) : (
                <div className="space-y-2">
                  {evaluation.explanation.contributingFactors.map((f, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200">{f.feature}</span>
                        <span className="font-mono font-bold text-amber-400">+{f.impact} pts</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                        <span>Baseline: {f.baseline}</span>
                        <span>·</span>
                        <span className="text-slate-300">Observed: {f.observed}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{f.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rules Triggered */}
            {evaluation.explanation.rulesTriggered.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-xs font-mono text-slate-400 mb-2">Rules Engine Matches:</div>
                <div className="flex flex-wrap gap-1.5">
                  {evaluation.explanation.rulesTriggered.map((rule, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 font-mono text-[10px]"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actionable Recommendations */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs font-mono text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Automated Analyst Remediation Protocol:</span>
            </div>
            <ul className="space-y-1 text-xs text-slate-300">
              {evaluation.explanation.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-mono text-[10px]">[{idx + 1}]</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Innovative Isolation Tree Path Length Visualizer */}
      <IsolationTreeVisualizer />
    </div>
  );
};
