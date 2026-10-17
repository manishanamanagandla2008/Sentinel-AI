import React from 'react';
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DashboardSummary, Alert, Transaction, SecurityLog } from '../types/index.ts';
import { CyberRadarWidget } from './CyberRadarWidget.tsx';
import { KillChainMatrix } from './KillChainMatrix.tsx';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  onInspectAlert: (alert: Alert) => void;
  onInspectTransaction: (txn: Transaction) => void;
  onNavigateTab: (tab: any) => void;
  onTriggerScenario: () => void;
  logs?: SecurityLog[];
}

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#10b981'
};

const CATEGORY_COLORS = ['#38bdf8', '#818cf8', '#f43f5e', '#fb923c', '#a855f7', '#34d399'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  onInspectAlert,
  onInspectTransaction,
  onNavigateTab,
  onTriggerScenario,
  logs = [],
}) => {
  if (!summary) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 font-mono text-sm">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400 animate-spin" />
          <span>Synchronizing telemetry with IBM Z security hub...</span>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Critical', value: summary.countsBySeverity.critical, color: SEVERITY_COLORS.CRITICAL },
    { name: 'High', value: summary.countsBySeverity.high, color: SEVERITY_COLORS.HIGH },
    { name: 'Medium', value: summary.countsBySeverity.medium, color: SEVERITY_COLORS.MEDIUM },
    { name: 'Low', value: summary.countsBySeverity.low, color: SEVERITY_COLORS.LOW },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome / Status Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/40 p-6 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-semibold tracking-wider">LIVE CYBER DEFENSE & MAINFRAME INGESTION ACTIVE</span>
            </div>
            <h1 className="text-xl lg:text-3xl font-bold tracking-tight text-white font-mono flex items-center gap-2.5">
              <span>SentinelAI Threat Operations Center</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Real-time machine learning anomaly detection correlating financial payment rails, Linux auth streams, and IBM z/OS SMF audit records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('anomaly-engine')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/60 text-xs font-semibold text-cyan-200 transition-all shadow-md font-mono"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Inspect ML Pipeline</span>
            </button>
            <button
              onClick={onTriggerScenario}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/80 text-xs font-semibold text-rose-200 transition-all shadow-md font-mono"
            >
              <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
              <span>Simulate Attack</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Transactions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition-all hover:border-cyan-500/40 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono uppercase tracking-wider">Analyzed Transactions</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {summary.totalTransactions.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8/sec streaming rate</span>
          </div>
        </div>

        {/* Card 2: Suspicious Detected */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition-all hover:border-amber-500/40 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono uppercase tracking-wider">Suspicious Anomalies</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 tracking-tight">
            {summary.suspiciousTransactions.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono">
            <span>Detection rate: </span>
            <span className="text-cyan-400 font-medium">{summary.threatDetectionRate}%</span>
          </div>
        </div>

        {/* Card 3: Active Threats by Severity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition-all hover:border-rose-500/40 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono uppercase tracking-wider">Active Critical Threats</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 tracking-tight">
            {summary.countsBySeverity.critical}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="text-rose-400 font-bold">{summary.countsBySeverity.critical} Crit</span>
            <span>·</span>
            <span className="text-amber-400">{summary.countsBySeverity.high} High</span>
            <span>·</span>
            <span className="text-yellow-400">{summary.countsBySeverity.medium} Med</span>
          </div>
        </div>

        {/* Card 4: Model Inference Latency */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition-all hover:border-emerald-500/40 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono uppercase tracking-wider">Inference Latency</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            {summary.activeModel.latencyMs} ms
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono">
            <span>Model: </span>
            <span className="text-slate-300">{summary.activeModel.name}</span>
          </div>
        </div>
      </div>

      {/* Innovative Interactive Cyber Radar Ingestion Widget */}
      <CyberRadarWidget
        transactions={summary.recentTransactions}
        onInspectTransaction={onInspectTransaction}
      />

      {/* MITRE ATT&CK Kill-Chain Matrix */}
      <KillChainMatrix
        alerts={summary.recentAlerts}
        logs={logs}
        onSelectAlert={onInspectAlert}
      />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Trends Over Time */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Transaction Throughput & Anomaly Density</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Live time-window aggregation of transaction ingestion vs flagged risk spikes</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-1 bg-cyan-400 rounded-sm"></span> Volume
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-1 bg-rose-500 rounded-sm"></span> Anomalies
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.activityTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontFamily: 'JetBrains Mono' }}
                />
                <Area type="monotone" dataKey="transactions" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                <Area type="monotone" dataKey="anomalies" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorAnomalies)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Severity Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white font-mono flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Risk Severity Distribution</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">Active alerts segmented by threat severity</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Critical: {summary.countsBySeverity.critical}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>High: {summary.countsBySeverity.high}</span>
            </div>
            <div className="flex items-center gap-1.5 text-yellow-400">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              <span>Medium: {summary.countsBySeverity.medium}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Low: {summary.countsBySeverity.low}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Categories Breakdown & Recent Incidents Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Distribution by Category */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Threats by Vector Category</span>
            </h2>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {summary.threatsByCategory.map((cat, idx) => {
              const maxCount = Math.max(...summary.threatsByCategory.map(c => c.count), 1);
              const pct = Math.round((cat.count / maxCount) * 100);
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate max-w-[200px]">{cat.label}</span>
                    <span className="font-mono font-semibold text-slate-200">{cat.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent High-Risk Incidents (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Priority Security Incidents Requiring Investigation</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Prioritized by multi-factor anomaly risk score</p>
            </div>
            <button
              onClick={() => onNavigateTab('incidents')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
            >
              <span>Incident Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {summary.recentAlerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => onInspectAlert(alert)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/80 cursor-pointer transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-mono font-bold ${
                      alert.severity === 'CRITICAL' ? 'text-rose-400' :
                      alert.severity === 'HIGH' ? 'text-amber-400' :
                      alert.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      {alert.id}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 font-mono">{alert.severity}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 font-mono">Risk: {alert.riskScore}/100</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500 text-[11px]">{new Date(alert.firstDetected).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {alert.title}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-xl">
                    Target: <span className="font-mono text-slate-300">{alert.affectedEntity}</span> · {alert.explanation.summary}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                    alert.status === 'NEW' ? 'bg-rose-950/40 text-rose-300 border-rose-800/60' :
                    alert.status === 'INVESTIGATING' ? 'bg-amber-950/40 text-amber-300 border-amber-800/60' :
                    alert.status === 'RESOLVED' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60' :
                    'bg-slate-900 text-slate-400 border-slate-700'
                  }`}>
                    {alert.status}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Recent Transactions Feed Row */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Ingestion Stream (Recent Processed Items)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Continuous scoring via SentinelAI Isolation Forest pipeline</p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
          >
            <span>Full Stream Table</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="pb-2">TXN ID</th>
                <th className="pb-2">Time</th>
                <th className="pb-2">Source / Destination</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Location</th>
                <th className="pb-2">Risk Score</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {summary.recentTransactions.map(txn => {
                const isHighRisk = txn.riskScore >= 65;
                return (
                  <tr key={txn.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-2.5 font-bold text-slate-200">{txn.id}</td>
                    <td className="py-2.5 text-slate-400 text-[11px]">{new Date(txn.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2.5 text-slate-300">
                      <div className="flex items-center gap-1">
                        <span>{txn.sourceAccount}</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-slate-400">{txn.destinationAccount}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-400 text-[11px]">{txn.transactionType}</td>
                    <td className="py-2.5 font-bold text-slate-100">
                      ${txn.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-slate-400 text-[11px]">
                      {txn.location.city}, {txn.location.country}
                    </td>
                    <td className="py-2.5">
                      <span className={`font-bold ${
                        txn.riskScore >= 80 ? 'text-rose-400' :
                        txn.riskScore >= 65 ? 'text-amber-400' :
                        txn.riskScore >= 35 ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {txn.riskScore}/100
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        txn.status === 'BLOCKED' ? 'bg-rose-950/50 text-rose-300 border-rose-800' :
                        txn.status === 'FLAGGED' ? 'bg-amber-950/50 text-amber-300 border-amber-800' :
                        txn.status === 'PENDING_REVIEW' ? 'bg-yellow-950/50 text-yellow-300 border-yellow-800' :
                        'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onInspectTransaction(txn)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono underline underline-offset-2"
                      >
                        Explain
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
