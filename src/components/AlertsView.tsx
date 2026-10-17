import React, { useState } from 'react';
import {
  AlertOctagon,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  Send,
  Flame,
  Info
} from 'lucide-react';
import { Alert, ThreatCategory, AlertStatus, Severity } from '../types/index.ts';

interface AlertsViewProps {
  alerts: Alert[];
  onInspectAlert: (alert: Alert) => void;
  onUpdateAlert: (id: string, updates: {
    status?: AlertStatus;
    assignedAnalyst?: string | null;
    noteText?: string;
  }) => Promise<void>;
  currentUserRole: string;
}

const CATEGORY_LABELS: Record<ThreatCategory, string> = {
  SUSPICIOUS_FINANCIAL: 'Suspicious Financial Activity',
  BRUTE_FORCE_LOGIN: 'Brute-Force & Credential Attacks',
  UNAUTHORIZED_ACCESS: 'Unauthorized Access / Privilege Escalation',
  ACCOUNT_COMPROMISE: 'Potential Account Compromise',
  UNUSUAL_SYSTEM_ACTIVITY: 'Unusual Mainframe / System Activity',
  DATA_EXFILTRATION: 'Potential Data Exfiltration'
};

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onInspectAlert,
  onUpdateAlert,
  currentUserRole,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Quick note popover state
  const [activeNoteAlertId, setActiveNoteAlertId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');
  const [isSubmittingNote, setIsSubmittingNote] = useState<boolean>(false);

  const filtered = alerts.filter(alert => {
    if (selectedCategory !== 'ALL' && alert.category !== selectedCategory) return false;
    if (selectedSeverity !== 'ALL' && alert.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'ALL' && alert.status !== selectedStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        alert.id.toLowerCase().includes(q) ||
        alert.title.toLowerCase().includes(q) ||
        alert.affectedEntity.toLowerCase().includes(q) ||
        alert.detectionMethod.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleQuickStatusChange = async (id: string, newStatus: AlertStatus) => {
    await onUpdateAlert(id, { status: newStatus });
  };

  const handleAddNote = async (id: string) => {
    if (!noteInput.trim()) return;
    setIsSubmittingNote(true);
    try {
      await onUpdateAlert(id, { noteText: noteInput });
      setNoteInput('');
      setActiveNoteAlertId(null);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/70">
        <div>
          <h1 className="text-base font-bold font-mono text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-500" />
            <span>Threat Detection & Alert Management Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Indicators requiring triage and investigation. Detections combine Isolation Forest anomaly weights with verified rules.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Total Alerts: <span className="text-white font-bold">{alerts.length}</span> · Active:{' '}
          <span className="text-rose-400 font-bold">
            {alerts.filter(a => a.status === 'NEW' || a.status === 'INVESTIGATING').length}
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/70">
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search alerts, targets, methods..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none"
        >
          <option value="ALL">All Threat Categories</option>
          <option value="SUSPICIOUS_FINANCIAL">Suspicious Financial</option>
          <option value="BRUTE_FORCE_LOGIN">Brute-Force Login</option>
          <option value="UNAUTHORIZED_ACCESS">Unauthorized Access</option>
          <option value="ACCOUNT_COMPROMISE">Account Compromise</option>
          <option value="UNUSUAL_SYSTEM_ACTIVITY">Unusual System Activity</option>
          <option value="DATA_EXFILTRATION">Data Exfiltration</option>
        </select>

        <select
          value={selectedSeverity}
          onChange={e => setSelectedSeverity(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">NEW</option>
          <option value="INVESTIGATING">INVESTIGATING</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
        </select>
      </div>

      {/* Alerts Grid / Cards */}
      <div className="space-y-3 font-mono">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800 text-xs">
            No alerts found matching the selected filters.
          </div>
        ) : (
          filtered.map(alert => (
            <div
              key={alert.id}
              className={`rounded-xl border p-4 transition-all bg-slate-900/70 hover:bg-slate-900/90 ${
                alert.severity === 'CRITICAL' ? 'border-rose-900/70 hover:border-rose-600/80' :
                alert.severity === 'HIGH' ? 'border-amber-900/60 hover:border-amber-600/70' :
                'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`font-bold ${
                      alert.severity === 'CRITICAL' ? 'text-rose-400' :
                      alert.severity === 'HIGH' ? 'text-amber-400' :
                      alert.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      {alert.id}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-300 font-semibold">{alert.severity}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-cyan-400">Score: {alert.riskScore}/100</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 text-[11px]">{CATEGORY_LABELS[alert.category]}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500 text-[11px]">First seen: {new Date(alert.firstDetected).toLocaleTimeString()}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    {alert.title}
                  </h3>

                  <div className="text-xs text-slate-400">
                    Target: <span className="text-slate-200 font-semibold">{alert.affectedEntity}</span> · Detection: <span className="text-slate-300">{alert.detectionMethod}</span>
                  </div>

                  <p className="text-xs text-slate-300 pt-1">
                    {alert.explanation.summary}
                  </p>

                  {/* Evidence Points */}
                  <div className="pt-2">
                    <div className="text-[11px] text-slate-400 mb-1">Key Forensic Evidence:</div>
                    <ul className="space-y-0.5 text-xs text-slate-400">
                      {alert.evidence.slice(0, 2).map((ev, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-400">▸</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Notes counter */}
                  {alert.notes.length > 0 && (
                    <div className="pt-1 text-[11px] text-cyan-400/90 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{alert.notes.length} investigation note(s) logged</span>
                    </div>
                  )}
                </div>

                {/* Right Action Controls */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Status:</span>
                    <select
                      value={alert.status}
                      onChange={e => handleQuickStatusChange(alert.id, e.target.value as AlertStatus)}
                      className={`text-xs px-2.5 py-1 rounded-md border font-mono font-medium focus:outline-none cursor-pointer ${
                        alert.status === 'NEW' ? 'bg-rose-950/70 border-rose-700 text-rose-300' :
                        alert.status === 'INVESTIGATING' ? 'bg-amber-950/70 border-amber-700 text-amber-300' :
                        alert.status === 'RESOLVED' ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300' :
                        'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="INVESTIGATING">INVESTIGATING</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                    </select>
                  </div>

                  {/* Assigned Analyst */}
                  <div className="text-[11px] text-slate-400">
                    Assigned: <span className="text-slate-200">{alert.assignedAnalyst || 'Unassigned'}</span>
                  </div>

                  {/* Open Investigation Center Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveNoteAlertId(activeNoteAlertId === alert.id ? null : alert.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                      title="Quick log note"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Note</span>
                    </button>

                    <button
                      onClick={() => onInspectAlert(alert)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>Investigate</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Note Expandable Drawer */}
              {activeNoteAlertId === alert.id && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      placeholder="Add analyst triage note (e.g. Verified with treasury officer, valid vendor change)..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={() => handleAddNote(alert.id)}
                      disabled={isSubmittingNote || !noteInput.trim()}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Log</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
