import React from 'react';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface ScenarioToastProps {
  steps: { step: string; message: string; alertId?: string }[];
  onClose: () => void;
  onViewAlert: (alertId: string) => void;
}

export const ScenarioToast: React.FC<ScenarioToastProps> = ({
  steps,
  onClose,
  onViewAlert,
}) => {
  if (steps.length === 0) return null;

  const lastAlertId = steps.find(s => s.alertId)?.alertId;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full rounded-2xl bg-slate-950/95 border border-rose-600/80 shadow-2xl p-4 font-mono text-xs backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between border-b border-rose-900/60 pb-2 mb-3">
        <div className="flex items-center gap-2 text-rose-400 font-bold">
          <Flame className="w-4 h-4 animate-bounce" />
          <span>CYBER ATTACK SCENARIO EXECUTED</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {steps.map((s, idx) => (
          <div key={idx} className="flex items-start gap-2 p-1.5 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-cyan-400 font-bold shrink-0">[{idx + 1}]</span>
            <div>
              <div className="text-slate-200 font-semibold">{s.step}</div>
              <div className="text-[11px] text-slate-400">{s.message}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <span className="text-[10px] text-emerald-400">
          ✓ Threat Intercepted & Contained
        </span>
        {lastAlertId && (
          <button
            onClick={() => onViewAlert(lastAlertId)}
            className="flex items-center gap-1 px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors"
          >
            <span>Triage Incident</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
