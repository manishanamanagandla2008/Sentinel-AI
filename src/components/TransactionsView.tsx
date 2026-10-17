import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Play,
  Pause,
  Download,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  ShieldAlert,
  Zap,
  Info
} from 'lucide-react';
import { Transaction, TransactionType, TransactionStatus, Severity } from '../types/index.ts';

interface TransactionsViewProps {
  transactions: Transaction[];
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onGenerateBatch: () => void;
  onInspectTransaction: (txn: Transaction) => void;
  onOpenAnalyzeModal: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  isSimulating,
  onToggleSimulation,
  onGenerateBatch,
  onInspectTransaction,
  onOpenAnalyzeModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'timestamp' | 'amount' | 'riskScore'>('timestamp');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filter transactions
  const filtered = transactions.filter(txn => {
    if (selectedType !== 'ALL' && txn.transactionType !== selectedType) return false;
    if (selectedStatus !== 'ALL' && txn.status !== selectedStatus) return false;
    if (selectedRisk !== 'ALL' && txn.riskLevel !== selectedRisk) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        txn.id.toLowerCase().includes(q) ||
        txn.sourceAccount.toLowerCase().includes(q) ||
        txn.destinationAccount.toLowerCase().includes(q) ||
        txn.sourceIp.includes(q) ||
        txn.location.city.toLowerCase().includes(q) ||
        txn.location.country.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortField === 'timestamp') {
      diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else if (sortField === 'amount') {
      diff = b.amount - a.amount;
    } else if (sortField === 'riskScore') {
      diff = b.riskScore - a.riskScore;
    }
    return sortAsc ? -diff : diff;
  });

  const handleSort = (field: 'timestamp' | 'amount' | 'riskScore') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const exportCSV = () => {
    const headers = ['ID,Timestamp,SourceAccount,DestinationAccount,Type,Amount,Currency,SourceIP,City,Country,RiskScore,Severity,Status'];
    const rows = sorted.map(t =>
      `"${t.id}","${t.timestamp}","${t.sourceAccount}","${t.destinationAccount}","${t.transactionType}",${t.amount},"${t.currency}","${t.sourceIp}","${t.location.city}","${t.location.country}",${t.riskScore},"${t.riskLevel}","${t.status}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Demo Warning Banner */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <div className="flex-1">
          <span className="font-bold text-cyan-300">DEMO TESTBED DATA:</span> All financial records, accounts, and IPs are synthetically generated for IBM Z Datathon evaluation. Real financial accounts are never accessed.
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Total In Memory: <span className="text-white font-bold">{transactions.length}</span>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/70">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search TXN, account, IP, city..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Types</option>
            <option value="WIRE_TRANSFER">Wire Transfer</option>
            <option value="ACH_TRANSFER">ACH Transfer</option>
            <option value="CREDIT_PAYMENT">Credit Payment</option>
            <option value="API_PAYMENT">API Payment</option>
            <option value="MAINFRAME_BATCH">Mainframe Batch</option>
            <option value="ATM_WITHDRAWAL">ATM Withdrawal</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="FLAGGED">Flagged</option>
            <option value="BLOCKED">Blocked</option>
            <option value="PENDING_REVIEW">Pending Review</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRisk}
            onChange={e => setSelectedRisk(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical (≥ 80)</option>
            <option value="HIGH">High (65 - 79)</option>
            <option value="MEDIUM">Medium (35 - 64)</option>
            <option value="LOW">Low (0 - 34)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAnalyzeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-700/60 text-xs font-mono font-medium text-cyan-200 transition-colors"
            title="Score a custom transaction against the ML Isolation Forest model"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Analyze Custom TXN</span>
          </button>

          <button
            onClick={onGenerateBatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-200 transition-colors"
            title="Emit 1 synthetic transaction into pipeline"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate 1 TXN</span>
          </button>

          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
              isSimulating
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isSimulating ? 'Streaming (8s)' : 'Stream Paused'}</span>
          </button>

          <button
            onClick={exportCSV}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Export filtered records as CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">
                  <button onClick={() => handleSort('timestamp')} className="flex items-center gap-1 hover:text-white">
                    <span>Timestamp</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">Transaction ID</th>
                <th className="py-3 px-3">Source Account</th>
                <th className="py-3 px-3">Destination Entity</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort('amount')} className="flex items-center gap-1 hover:text-white">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">Location & IP</th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort('riskScore')} className="flex items-center gap-1 hover:text-white">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-mono text-xs">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                sorted.map(txn => {
                  const isHighRisk = txn.riskScore >= 65;
                  return (
                    <tr
                      key={txn.id}
                      className={`hover:bg-slate-800/40 transition-colors group ${
                        txn.riskScore >= 80 ? 'bg-rose-950/15' :
                        txn.riskScore >= 65 ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(txn.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-200">
                        {txn.id}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {txn.sourceAccount}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        <span className={txn.destinationAccount.includes('MULE') || txn.destinationAccount.includes('-KY') ? 'text-rose-400 font-semibold' : ''}>
                          {txn.destinationAccount}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {txn.transactionType}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-100">
                        ${txn.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        <div>{txn.location.city}, {txn.location.country}</div>
                        <div className="text-[10px] text-slate-400">{txn.sourceIp}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${
                            txn.riskScore >= 80 ? 'text-rose-400' :
                            txn.riskScore >= 65 ? 'text-amber-400' :
                            txn.riskScore >= 35 ? 'text-yellow-400' : 'text-emerald-400'
                          }`}>
                            {txn.riskScore}
                          </span>
                          <span className="text-[10px] text-slate-400">/100</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${
                          txn.status === 'BLOCKED' ? 'bg-rose-950/60 text-rose-300 border-rose-800' :
                          txn.status === 'FLAGGED' ? 'bg-amber-950/60 text-amber-300 border-amber-800' :
                          txn.status === 'PENDING_REVIEW' ? 'bg-yellow-950/60 text-yellow-300 border-yellow-800' :
                          'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onInspectTransaction(txn)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 hover:border-cyan-700 text-xs font-mono text-slate-300 transition-colors inline-flex items-center gap-1"
                        >
                          <span>Explain</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
