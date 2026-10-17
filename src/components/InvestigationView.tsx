import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  UserCheck,
  Send,
  Download,
  AlertTriangle,
  History,
  FileCheck,
  Printer,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Flame,
  ListTodo
} from 'lucide-react';
import { Alert, AuditRecord, AlertStatus } from '../types/index.ts';

interface InvestigationViewProps {
  alerts: Alert[];
  auditRecords: AuditRecord[];
  selectedAlertId: string | null;
  onSelectAlertId: (id: string) => void;
  onUpdateAlert: (id: string, updates: {
    status?: AlertStatus;
    assignedAnalyst?: string | null;
    noteText?: string;
    completedChecklistId?: string;
  }) => Promise<void>;
  currentUserRole: string;
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({
  alerts,
  auditRecords,
  selectedAlertId,
  onSelectAlertId,
  onUpdateAlert,
  currentUserRole,
}) => {
  const [noteInput, setNoteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewTab, setViewTab] = useState<'case' | 'audit'>('case');

  // Currently active incident
  const currentAlert = alerts.find(a => a.id === selectedAlertId) || alerts[0];

  const handleAddNote = async () => {
    if (!currentAlert || !noteInput.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateAlert(currentAlert.id, { noteText: noteInput });
      setNoteInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleChecklist = async (checkId: string) => {
    if (!currentAlert) return;
    await onUpdateAlert(currentAlert.id, { completedChecklistId: checkId });
  };

  const handleStatusChange = async (newStatus: AlertStatus) => {
    if (!currentAlert) return;
    await onUpdateAlert(currentAlert.id, { status: newStatus });
  };

  const handleAssignAnalyst = async (analyst: string) => {
    if (!currentAlert) return;
    await onUpdateAlert(currentAlert.id, { assignedAnalyst: analyst });
  };

  const printReport = () => {
    window.print();
  };

  const exportCSVReport = () => {
    if (!currentAlert) return;
    const content = [
      `SentinelAI Incident Forensic Dossier`,
      `Incident ID,${currentAlert.id}`,
      `Title,${currentAlert.title}`,
      `Severity,${currentAlert.severity}`,
      `Risk Score,${currentAlert.riskScore}/100`,
      `Status,${currentAlert.status}`,
      `Detection Method,${currentAlert.detectionMethod}`,
      `Target Entity,${currentAlert.affectedEntity}`,
      `Assigned Analyst,${currentAlert.assignedAnalyst || 'Unassigned'}`,
      `Summary,"${currentAlert.explanation.summary}"`,
      ``,
      `Investigation Notes:`,
      ...currentAlert.notes.map(n => `"${n.timestamp}","${n.author} (${n.authorRole})","${n.text}"`),
      ``,
      `Checklist Items:`,
      ...currentAlert.investigationChecklist.map(c => `"${c.task}",${c.completed ? 'COMPLETED' : 'PENDING'}`)
    ].join('\n');

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-${currentAlert.id}-dossier.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/70">
        <div>
          <h1 className="text-base font-bold font-mono text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            <span>Incident Investigation Center & Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full case management, correlated forensic timeline, remediation checklist, and immutable operator audit log.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setViewTab('case')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              viewTab === 'case'
                ? 'bg-cyan-950/80 border-cyan-700 text-cyan-200 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Active Case Dossier
          </button>
          <button
            onClick={() => setViewTab('audit')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              viewTab === 'audit'
                ? 'bg-cyan-950/80 border-cyan-700 text-cyan-200 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Audit Trail ({auditRecords.length})
          </button>
        </div>
      </div>

      {viewTab === 'audit' ? (
        /* Immutable Audit Trail View */
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Operator & Autopilot Forensic Audit Log</span>
            </div>
            <span className="text-xs text-slate-400">SOC 2 / ISO 27001 Tamper-Evident Trail</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                  <th className="pb-2">Audit ID</th>
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Operator / Agent</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Target</th>
                  <th className="pb-2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {auditRecords.map(aud => (
                  <tr key={aud.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold text-slate-200">{aud.id}</td>
                    <td className="py-2.5 text-slate-400 text-[11px]">{new Date(aud.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2.5 font-semibold text-cyan-300">{aud.user}</td>
                    <td className="py-2.5 text-slate-400 text-[11px]">{aud.role}</td>
                    <td className="py-2.5 font-bold text-amber-300">{aud.action}</td>
                    <td className="py-2.5 text-slate-200">{aud.target}</td>
                    <td className="py-2.5 text-slate-400 text-[11px]">{aud.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Active Case Dossier Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 Cols: Case Selector */}
          <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3 font-mono">
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Select Incident Case ({alerts.length})
            </div>

            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {alerts.map(a => {
                const isSelected = currentAlert?.id === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => onSelectAlertId(a.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-500 shadow-md text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold ${
                        a.severity === 'CRITICAL' ? 'text-rose-400' :
                        a.severity === 'HIGH' ? 'text-amber-400' : 'text-yellow-400'
                      }`}>
                        {a.id}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {a.status}
                      </span>
                    </div>
                    <div className="font-semibold truncate">{a.title}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-1">
                      {a.affectedEntity} · Risk: {a.riskScore}/100
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 8 Cols: Detailed Case Dossier */}
          {currentAlert && (
            <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-5 font-mono text-xs">
              {/* Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{currentAlert.id}</span>
                    <span className="text-slate-600">·</span>
                    <span className={`font-bold ${
                      currentAlert.severity === 'CRITICAL' ? 'text-rose-400' :
                      currentAlert.severity === 'HIGH' ? 'text-amber-400' : 'text-yellow-400'
                    }`}>
                      {currentAlert.severity} SEVERITY
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-cyan-400 font-bold">Risk {currentAlert.riskScore}/100</span>
                  </div>
                  <h2 className="text-sm font-semibold text-slate-100">{currentAlert.title}</h2>
                  <div className="text-slate-400 text-[11px]">
                    Target: <span className="text-slate-200">{currentAlert.affectedEntity}</span> · First Detected:{' '}
                    <span className="text-slate-200">{new Date(currentAlert.firstDetected).toLocaleString()}</span>
                  </div>
                </div>

                {/* Case Actions: Export, Print */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportCSVReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
                    title="Export Dossier as CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={printReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
                    title="Print Incident Report"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Dossier</span>
                  </button>
                </div>
              </div>

              {/* Status & Assignment Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Incident Status:</span>
                  <select
                    value={currentAlert.status}
                    onChange={e => handleStatusChange(e.target.value as AlertStatus)}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-semibold text-cyan-300 focus:outline-none"
                  >
                    <option value="NEW">NEW</option>
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Assigned Analyst:</span>
                  <select
                    value={currentAlert.assignedAnalyst || ''}
                    onChange={e => handleAssignAnalyst(e.target.value)}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    <option value="Marcus Vance, CISSP">Marcus Vance, CISSP</option>
                    <option value="Sarah Chen, SecOps">Sarah Chen, SecOps</option>
                    <option value="David Okonjo, Mainframe Sec">David Okonjo, Mainframe Sec</option>
                  </select>
                </div>
              </div>

              {/* Forensic Timeline */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Correlated Incident Timeline</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-start gap-2 text-[11px]">
                    <span className="text-cyan-400 shrink-0">T-00:02</span>
                    <div>
                      <span className="font-bold text-slate-200">Perimeter Ingress Check:</span> Connection established with suspicious routing tags.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-[11px]">
                    <span className="text-amber-400 shrink-0">T-00:01</span>
                    <div>
                      <span className="font-bold text-slate-200">Isolation Forest Flag:</span> Anomaly threshold breached with feature attribution weight 0.912.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-[11px]">
                    <span className="text-rose-400 shrink-0">T-00:00</span>
                    <div>
                      <span className="font-bold text-slate-200">Security Rule Fired:</span> {currentAlert.explanation.rulesTriggered.join(', ')}.
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Investigation Checklist */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-200 flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-cyan-400" />
                  <span>Mandatory SOC Investigation Checklist</span>
                </div>

                <div className="space-y-1.5">
                  {currentAlert.investigationChecklist.map(chk => (
                    <div
                      key={chk.id}
                      onClick={() => handleToggleChecklist(chk.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        chk.completed
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={chk.completed}
                          onChange={() => {}}
                          className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 pointer-events-none"
                        />
                        <span className={chk.completed ? 'line-through opacity-80' : ''}>{chk.task}</span>
                      </div>
                      {chk.completed && chk.completedBy && (
                        <span className="text-[10px] text-emerald-400">
                          ✓ {chk.completedBy} ({new Date(chk.completedAt || '').toLocaleTimeString()})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Investigation Notes & Audit Additions */}
              <div className="space-y-3 pt-2">
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>Analyst Case Notes ({currentAlert.notes.length})</span>
                  <span className="text-slate-400 text-[11px]">Immutable Timestamped Entries</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {currentAlert.notes.map(n => (
                    <div key={n.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-cyan-300">{n.author} ({n.authorRole})</span>
                        <span className="text-slate-400">{new Date(n.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-slate-300">{n.text}</div>
                    </div>
                  ))}
                </div>

                {/* Add Note Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    placeholder="Enter forensic finding or containment action..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={isSubmitting || !noteInput.trim()}
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
