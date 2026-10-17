import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  Lock,
  Terminal,
  Database,
  ArrowRight,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Alert, SecurityLog } from '../types/index.ts';

interface KillChainMatrixProps {
  alerts: Alert[];
  logs: SecurityLog[];
  onSelectAlert: (alert: Alert) => void;
}

export const KillChainMatrix: React.FC<KillChainMatrixProps> = ({
  alerts,
  logs,
  onSelectAlert,
}) => {
  const [activeStage, setActiveStage] = useState<string>('privilege');

  const stages = [
    {
      id: 'recon',
      title: '1. Reconnaissance',
      subtitle: 'Perimeter Port Scans',
      level: 'WARN',
      count: logs.filter(l => l.event.toLowerCase().includes('scan') || l.source === 'FIREWALL').length || 2,
      description: 'Sequential TCP SYN port sweep across mainframe connector ports.',
      activeThreat: 'IP 198.51.100.44 scanning ports 22, 443, 50000'
    },
    {
      id: 'access',
      title: '2. Initial Access',
      subtitle: 'TOR / SSH Brute-Force',
      level: 'HIGH',
      count: alerts.filter(a => a.category === 'BRUTE_FORCE_LOGIN').length || 1,
      description: '48 authentication failures in 60s from anonymizer proxy.',
      activeThreat: 'ALT-3089: TOR exit node dictionary attack'
    },
    {
      id: 'execution',
      title: '3. Execution',
      subtitle: 'CICS Runaway Batch',
      level: 'MEDIUM',
      count: logs.filter(l => l.event.includes('CICS') || l.source === 'ZOS_SMF').length || 1,
      description: 'SMF 110 Subtype 1 runaway task during high-volume batch.',
      activeThreat: 'Task CSQ4 abend code AICA execution ceiling'
    },
    {
      id: 'privilege',
      title: '4. Privilege Escalation',
      subtitle: 'IBM Z RACF SAF Violations',
      level: 'CRITICAL',
      count: alerts.filter(a => a.category === 'UNAUTHORIZED_ACCESS').length || 1,
      description: 'ICH408I write violation against protected SYS1.PARMLIB.',
      activeThreat: 'ALT-3090: RACF code 08 privilege attempt by Z99ADMIN'
    },
    {
      id: 'evasion',
      title: '5. Defense Evasion',
      subtitle: 'DB Unindexed Bulk Dump',
      level: 'HIGH',
      count: alerts.filter(a => a.category === 'DATA_EXFILTRATION').length || 1,
      description: '145,000 PII records queried without pagination headers.',
      activeThreat: 'ALT-3088: Full table scan by user dba_readonly'
    },
    {
      id: 'exfiltration',
      title: '6. Exfiltration / Impact',
      subtitle: 'Offshore Wire Transfer',
      level: 'CRITICAL',
      count: alerts.filter(a => a.category === 'SUSPICIOUS_FINANCIAL').length || 2,
      description: '$84,500 wire diverted to Cayman Islands shell entity.',
      activeThreat: 'ALT-3091: Automated hold placed on SWIFT MT103'
    }
  ];

  const selected = stages.find(s => s.id === activeStage) || stages[3];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl font-mono space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>Enterprise MITRE ATT&CK Kill-Chain Telemetry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time correlation of attack vectors across mainframe and financial boundaries
          </p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
          6 Kill-Chain Vectors Monitored
        </span>
      </div>

      {/* Kill-Chain Progression Steps */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {stages.map((stage) => {
          const isActive = stage.id === activeStage;
          const isCrit = stage.level === 'CRITICAL';
          const isHigh = stage.level === 'HIGH';

          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? isCrit
                    ? 'bg-rose-950/80 border-rose-500 shadow-lg shadow-rose-950/50'
                    : 'bg-cyan-950/80 border-cyan-500 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className={`font-bold ${isCrit ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {stage.level}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-slate-950 text-slate-300 font-bold">
                  {stage.count} evt
                </span>
              </div>
              <div className="font-bold text-xs text-slate-200 truncate">
                {stage.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {stage.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Deep Detail Drawer */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-cyan-300">{selected.title}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300 font-semibold">{selected.subtitle}</span>
            <span className="text-slate-600">·</span>
            <span className={`font-bold ${selected.level === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>
              Severity: {selected.level}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {selected.description}
          </p>
          <div className="text-[11px] text-amber-300 font-semibold pt-1 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Forensic Indicator: {selected.activeThreat}</span>
          </div>
        </div>

        <button
          onClick={() => {
            const matchAlert = alerts.find(a =>
              (selected.id === 'privilege' && a.category === 'UNAUTHORIZED_ACCESS') ||
              (selected.id === 'exfiltration' && a.category === 'SUSPICIOUS_FINANCIAL') ||
              (selected.id === 'access' && a.category === 'BRUTE_FORCE_LOGIN') ||
              (selected.id === 'evasion' && a.category === 'DATA_EXFILTRATION')
            ) || alerts[0];
            onSelectAlert(matchAlert);
          }}
          className="shrink-0 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <span>Examine Alert in SOC</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
