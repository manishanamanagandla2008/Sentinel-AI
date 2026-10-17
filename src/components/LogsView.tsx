import React, { useState } from 'react';
import {
  FileCode2,
  Upload,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  FileText,
  Copy,
  Terminal,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { SecurityLog } from '../types/index.ts';

interface LogsViewProps {
  logs: SecurityLog[];
  onUploadLogs: (content: string, format: string, sourceName: string) => Promise<any>;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onUploadLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [manualText, setManualText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ count: number; suspicious: number } | null>(null);

  // Filter logs
  const filtered = logs.filter(log => {
    if (sourceFilter !== 'ALL' && log.source !== sourceFilter) return false;
    if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
    if (suspiciousOnly && !log.isSuspicious) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        log.id.toLowerCase().includes(q) ||
        log.event.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.ip.includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.smfRecordType && log.smfRecordType.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit for safety in demo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async event => {
      const text = event.target?.result as string;
      if (text) {
        setIsUploading(true);
        try {
          const res = await onUploadLogs(text, file.type, file.name);
          setUploadResult({ count: res.recordsParsed, suspicious: res.suspiciousDetected });
        } catch (err) {
          console.error(err);
        } finally {
          setIsUploading(false);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleManualSubmit = async () => {
    if (!manualText.trim()) return;
    setIsUploading(true);
    try {
      const res = await onUploadLogs(manualText, 'text/plain', 'MANUAL_PASTE');
      setUploadResult({ count: res.recordsParsed, suspicious: res.suspiciousDetected });
      setManualText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const loadSample = (sampleType: 'RACF' | 'SSH' | 'EXFIL') => {
    if (sampleType === 'RACF') {
      setManualText(
        `2026-10-16T21:18:00Z,RACF_SAF,CRITICAL,Z99ADMIN,192.168.1.105,RACF ICH408I USER(Z99ADMIN) GROUP(SYS1) INSUFFICIENT ACCESS AUTHORITY TO SYS1.PARMLIB\n` +
        `2026-10-16T21:18:12Z,RACF_SAF,ERROR,Z99ADMIN,192.168.1.105,RACF ICH408I USER(Z99ADMIN) INSUFFICIENT ACCESS AUTHORITY TO SYS1.NUCLEUS\n` +
        `2026-10-16T21:18:45Z,ZOS_SMF,WARN,APPLSERV,10.200.4.12,SMF 80 SUBTYPE 1 RACF SECURITY RECORD RECORDED`
      );
    } else if (sampleType === 'SSH') {
      setManualText(
        `2026-10-16T21:20:00Z,LINUX_AUTH,WARN,root,185.220.101.5,Failed password for invalid user root ssh2\n` +
        `2026-10-16T21:20:02Z,LINUX_AUTH,WARN,admin,185.220.101.5,Failed password for invalid user admin ssh2\n` +
        `2026-10-16T21:20:04Z,LINUX_AUTH,CRITICAL,svc_bank,185.220.101.5,Brute force threshold exceeded: 52 failed auth attempts in 60s`
      );
    } else {
      setManualText(
        `2026-10-16T21:21:00Z,DATABASE_CORE,WARN,dba_temp,10.200.12.88,SELECT * FROM CUSTOMER_CREDENTIALS LIMIT 500000\n` +
        `2026-10-16T21:21:30Z,DATABASE_CORE,CRITICAL,dba_temp,10.200.12.88,Unencrypted bulk pg_dump export initiated to /tmp/customer_export.sql`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload and Paste Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Manual Paste / Upload */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Security Log Ingestion & Parser</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">Sample Templates:</span>
              <button
                onClick={() => loadSample('RACF')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-slate-700 text-[10px] font-mono"
              >
                IBM Z RACF
              </button>
              <button
                onClick={() => loadSample('SSH')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-slate-700 text-[10px] font-mono"
              >
                SSH Burst
              </button>
              <button
                onClick={() => loadSample('EXFIL')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-slate-700 text-[10px] font-mono"
              >
                DB Exfil
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              rows={4}
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              placeholder="Paste log entries here in CSV (timestamp,source,level,user,ip,event) or JSON lines format..."
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-200 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upload CSV/JSON/TXT</span>
                  <input
                    type="file"
                    accept=".csv,.json,.txt,.log"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] font-mono text-slate-400">Max 2MB · Safe Client Parsing</span>
              </div>

              <button
                onClick={handleManualSubmit}
                disabled={isUploading || !manualText.trim()}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-mono font-semibold text-slate-950 flex items-center gap-1.5 transition-colors"
              >
                <span>{isUploading ? 'Parsing...' : 'Analyze Logs'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {uploadResult && (
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800 text-xs font-mono text-cyan-200 flex items-center justify-between">
              <span>Ingested {uploadResult.count} log records successfully.</span>
              <span className="font-bold text-amber-300">{uploadResult.suspicious} suspicious patterns detected!</span>
            </div>
          )}
        </div>

        {/* Right: IBM Z SMF Record Telemetry Card */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white font-mono">
              Supported IBM Z & Mainframe Record Types
            </h2>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
              <div className="flex justify-between font-bold text-slate-200">
                <span className="text-cyan-400">SMF Type 80</span>
                <span className="text-[10px] text-emerald-400">ACTIVE PARSER</span>
              </div>
              <div className="text-[11px] text-slate-400">RACF Processing Record: Audits resource access violations (ICH408I), privilege escalations, and user password errors.</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
              <div className="flex justify-between font-bold text-slate-200">
                <span className="text-cyan-400">SMF Type 83</span>
                <span className="text-[10px] text-emerald-400">ACTIVE PARSER</span>
              </div>
              <div className="text-[11px] text-slate-400">RACF Security Audit: Captures cryptographic coprocessor key operations and dataset authority changes.</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
              <div className="flex justify-between font-bold text-slate-200">
                <span className="text-cyan-400">SMF Type 110</span>
                <span className="text-[10px] text-emerald-400">ACTIVE PARSER</span>
              </div>
              <div className="text-[11px] text-slate-400">CICS Monitoring: Detects runaway tasks, abend codes (AICA, ASRA), and uncharacteristic transaction velocity spikes.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/70">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search event, user, IP, SMF record..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="ALL">All Sources</option>
            <option value="RACF_SAF">RACF / SAF (Mainframe)</option>
            <option value="ZOS_SMF">z/OS SMF</option>
            <option value="LINUX_AUTH">Linux Auth (SSH)</option>
            <option value="DATABASE_CORE">Database Core</option>
            <option value="API_GATEWAY">API Gateway</option>
            <option value="FIREWALL">Border Firewall</option>
          </select>

          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARN">Warning</option>
            <option value="ERROR">Error</option>
            <option value="INFO">Info</option>
          </select>

          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={suspiciousOnly}
              onChange={e => setSuspiciousOnly(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Suspicious Only</span>
          </label>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> of {logs.length} logs
        </div>
      </div>

      {/* Logs Records List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="divide-y divide-slate-800/80 font-mono text-xs">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No logs found matching your criteria.</div>
          ) : (
            filtered.map(log => {
              const isCrit = log.level === 'CRITICAL';
              const isWarn = log.level === 'WARN';
              return (
                <div
                  key={log.id}
                  className={`p-3.5 hover:bg-slate-800/30 transition-colors ${
                    isCrit ? 'bg-rose-950/15 border-l-4 border-l-rose-500' :
                    isWarn ? 'bg-amber-950/10 border-l-4 border-l-amber-500' :
                    'border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{log.id}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="text-slate-600">·</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 text-[10px] border border-slate-700">
                        {log.source}
                      </span>
                      {log.smfRecordType && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 text-[10px] border border-blue-800">
                          {log.smfRecordType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">User: <span className="text-slate-200">{log.user}</span></span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400 text-[11px]">IP: <span className="text-slate-200">{log.ip}</span></span>
                      {log.isSuspicious && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 text-[10px] font-bold border border-rose-800">
                          RISK {log.riskScore}/100
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-200 font-semibold mb-1">
                    {log.event}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {log.details}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
