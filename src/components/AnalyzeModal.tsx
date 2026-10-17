import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Play,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Transaction, TransactionType } from '../types/index.ts';
import { CITIES } from '../lib/dataStore.ts';

interface AnalyzeModalProps {
  onClose: () => void;
  onAnalyzeSuccess: (newTxn: Transaction) => void;
}

export const AnalyzeModal: React.FC<AnalyzeModalProps> = ({
  onClose,
  onAnalyzeSuccess,
}) => {
  const [sourceAccount, setSourceAccount] = useState('ACC-89104-US');
  const [destinationAccount, setDestinationAccount] = useState('ACC-MULE-KY-999');
  const [amount, setAmount] = useState<number>(45000);
  const [transactionType, setTransactionType] = useState<TransactionType>('WIRE_TRANSFER');
  const [sourceIp, setSourceIp] = useState('190.21.84.11');
  const [selectedCityName, setSelectedCityName] = useState('George Town');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<Transaction | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cityObj = CITIES.find(c => c.city === selectedCityName) || CITIES[0];

    try {
      const response = await fetch('/api/transactions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          sourceAccount,
          destinationAccount,
          transactionType,
          sourceIp,
          location: cityObj,
          timestamp: new Date().toISOString()
        })
      });

      const newTxn = await response.json();
      setResult(newTxn);
      onAnalyzeSuccess(newTxn);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-mono text-xs">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Score Custom Financial Transaction</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Source Account Identifier:</label>
                  <input
                    type="text"
                    value={sourceAccount}
                    onChange={e => setSourceAccount(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Destination Entity Account:</label>
                  <input
                    type="text"
                    value={destinationAccount}
                    onChange={e => setDestinationAccount(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Amount ($ USD):</label>
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Transaction Type:</label>
                  <select
                    value={transactionType}
                    onChange={e => setTransactionType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="WIRE_TRANSFER">Wire Transfer</option>
                    <option value="ACH_TRANSFER">ACH Transfer</option>
                    <option value="CREDIT_PAYMENT">Credit Payment</option>
                    <option value="API_PAYMENT">API Payment</option>
                    <option value="MAINFRAME_BATCH">Mainframe Batch</option>
                    <option value="ATM_WITHDRAWAL">ATM Withdrawal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Origin Location:</label>
                  <select
                    value={selectedCityName}
                    onChange={e => setSelectedCityName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {CITIES.map(c => (
                      <option key={c.city} value={c.city}>
                        {c.city}, {c.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Source IP Address:</label>
                  <input
                    type="text"
                    value={sourceIp}
                    onChange={e => setSourceIp(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isSubmitting ? 'Evaluating...' : 'Run Anomaly Evaluation'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">{result.id}</span>
                  <span className={`px-2 py-0.5 rounded border font-bold text-xs ${
                    result.riskLevel === 'CRITICAL' ? 'bg-rose-950/70 border-rose-700 text-rose-300' :
                    result.riskLevel === 'HIGH' ? 'bg-amber-950/70 border-amber-700 text-amber-300' :
                    result.riskLevel === 'MEDIUM' ? 'bg-yellow-950/70 border-yellow-700 text-yellow-300' :
                    'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                  }`}>
                    {result.riskLevel} · {result.status}
                  </span>
                </div>

                <div className="text-2xl font-bold font-mono">
                  Risk Score: <span className={result.riskScore >= 65 ? 'text-rose-400' : 'text-emerald-400'}>{result.riskScore}/100</span>
                </div>

                <p className="text-slate-300 text-xs">
                  {result.explanation.summary}
                </p>

                {result.explanation.rulesTriggered.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {result.explanation.rulesTriggered.map((r, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setResult(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Analyze Another
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
