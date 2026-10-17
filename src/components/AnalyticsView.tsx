import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Flame,
  Printer,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const [dateRange, setDateRange] = useState('24h');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const exportAnalyticsCSV = () => {
    if (!data) return;
    const content = [
      `SentinelAI Analytics & Threat Report (${dateRange})`,
      `Total Transactions Analyzed,${data.summary.totalTransactionsAnalyzed}`,
      `Suspicious Detected,${data.summary.suspiciousDetected}`,
      `Threat Rate,${data.summary.threatRatePct}%`,
      `Total Alerts,${data.summary.totalAlerts}`,
      `Resolved Alerts,${data.summary.resolvedAlerts}`,
      `Resolution Rate,${data.summary.resolutionRatePct}%`,
      `Mean Time To Resolve (MTTR),${data.summary.averageMTRMinutes} minutes`,
      ``,
      `Most Common Detection Rules Triggered:`,
      `Rule,Count,Description`,
      ...data.rulesTriggeredRanking.map((r: any) => `"${r.rule}",${r.count},"${r.description}"`)
    ].join('\n');

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel-analytics-report-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 font-mono text-xs">
        Loading analytics telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Disclaimer */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <div>
          <span className="font-bold text-cyan-300">DEMO METRICS DATASET:</span> Analytics calculations reflect in-memory testbed transactions, synthetic attacks, and simulated MTTR resolutions.
        </div>
      </div>

      {/* Top Header & Range Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/70">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Threat Intelligence Analytics & Compliance Reporting</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical aggregation of rule firing frequency, hourly volume trends, and incident resolution velocity.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={exportAnalyticsCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-[11px] text-slate-400 uppercase">Detection Rate</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{data.summary.threatRatePct}%</div>
          <div className="text-[10px] text-slate-400 mt-1">Of total ingested transactions</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-[11px] text-slate-400 uppercase">Mean Time To Resolve</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{data.summary.averageMTRMinutes} min</div>
          <div className="text-[10px] text-slate-400 mt-1">Average analyst triage duration</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-[11px] text-slate-400 uppercase">Total Alerts Generated</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{data.summary.totalAlerts}</div>
          <div className="text-[10px] text-slate-400 mt-1">Across all 6 threat vectors</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-[11px] text-slate-400 uppercase">Resolution Efficiency</div>
          <div className="text-2xl font-bold text-white mt-1">{data.summary.resolutionRatePct}%</div>
          <div className="text-[10px] text-slate-400 mt-1">{data.summary.resolvedAlerts} incidents resolved</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Volume vs Anomaly Hourly Density */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Hourly Transaction Throughput vs Threat Density
            </h2>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 bg-cyan-500 rounded-sm"></span> Volume
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span> Threats
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.volumeByHour} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="volume" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="threats" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 Cols: Alerts by Severity */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Alert Volume by Severity Tier
          </h2>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.severityBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {data.severityBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Most Common Detection Rules Ranking Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">
          Top Triggered Heuristic & ML Rules
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <th className="pb-2">Detection Rule Identifier</th>
                <th className="pb-2">Triggers Count</th>
                <th className="pb-2">Detection Rule Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data.rulesTriggeredRanking.map((r: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-2.5 font-bold text-cyan-400">{r.rule}</td>
                  <td className="py-2.5 font-bold text-amber-300">{r.count} hits</td>
                  <td className="py-2.5 text-slate-400">{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
