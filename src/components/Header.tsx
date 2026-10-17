import React from 'react';
import {
  ShieldAlert,
  Server,
  RefreshCw,
  Play,
  Pause,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock,
  UserCheck,
  Mic
} from 'lucide-react';
import { UserSession } from '../types/index.ts';

interface HeaderProps {
  user: UserSession;
  securityStatus: 'SECURE' | 'ELEVATED' | 'HIGH_ALERT' | 'COMPROMISED';
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onTriggerScenario: () => void;
  onSwitchRole: (role: 'ADMINISTRATOR' | 'SECURITY_ANALYST') => void;
  onOpenVoiceModal: () => void;
  lastUpdated: string;
  isScenarioRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  securityStatus,
  isSimulating,
  onToggleSimulation,
  onTriggerScenario,
  onSwitchRole,
  onOpenVoiceModal,
  lastUpdated,
  isScenarioRunning,
}) => {
  const getStatusBadge = () => {
    switch (securityStatus) {
      case 'HIGH_ALERT':
      case 'COMPROMISED':
        return {
          bg: 'bg-rose-950/70 border-rose-600/60 text-rose-300',
          dot: 'bg-rose-500 animate-ping',
          label: 'DEFCON 2 · HIGH ALERT',
        };
      case 'ELEVATED':
        return {
          bg: 'bg-amber-950/70 border-amber-600/60 text-amber-300',
          dot: 'bg-amber-400 animate-pulse',
          label: 'DEFCON 3 · ELEVATED THREAT',
        };
      default:
        return {
          bg: 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300',
          dot: 'bg-emerald-400',
          label: 'DEFCON 5 · NORMAL OPERATIONS',
        };
    }
  };

  const status = getStatusBadge();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5">
      {/* Top Demo Disclaimer Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/50 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400"></span>
          <span className="text-cyan-400 font-semibold tracking-wider">IBM Z DATATHON DEMO TESTBED</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Synthetic Mainframe & Banking Transaction Simulation (Offline Safe)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Last Telemetry: <span className="text-slate-200">{new Date(lastUpdated).toLocaleTimeString()}</span></span>
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400/90 font-medium">Model: Sentinel-IsoForest-Z1</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 via-blue-700 to-slate-900 border border-cyan-500/40 shadow-lg shadow-cyan-950/40">
            <ShieldAlert className="w-5 h-5 text-cyan-200" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
                Sentinel<span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-700/60 text-blue-300">
                IBM Z Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Detect Threats Before They Become Breaches.</p>
          </div>
        </div>

        {/* Center: System Status & Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Defcon Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono font-medium ${status.bg}`}>
            <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
            <span>{status.label}</span>
          </div>

          {/* Voice SecOps (gemini-3.8-live) Button */}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium font-mono border bg-gradient-to-r from-cyan-950 via-blue-950 to-slate-900 border-cyan-500/70 text-cyan-200 hover:border-cyan-400 hover:text-white shadow-sm transition-all"
            title="Open real-time voice conversation with model gemini-3.8-live"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span>Voice SecOps</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-900 text-cyan-200 font-bold">LIVE</span>
          </button>

          {/* Scenario Trigger Button */}
          <button
            onClick={onTriggerScenario}
            disabled={isScenarioRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium font-mono border transition-all ${
              isScenarioRunning
                ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
                : 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-700/60 text-rose-300 hover:text-white shadow-sm'
            }`}
            title="Simulate a real-time multi-stage cyber attack (Reconnaissance -> RACF violation -> $145k wire exfiltration)"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>{isScenarioRunning ? 'Simulating Attack...' : 'Trigger Attack'}</span>
          </button>

          {/* Background Stream Generator Toggle */}
          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono border transition-all ${
              isSimulating
                ? 'bg-cyan-950/50 border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/40'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle live synthetic transaction generator stream"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5 text-slate-400" />}
            <span>Stream: {isSimulating ? 'LIVE (8s)' : 'PAUSED'}</span>
          </button>
        </div>

        {/* Right: Operator Profile & RBAC Switcher */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">{user.name}</div>
            <div className="text-[10px] font-mono text-cyan-400 flex items-center justify-end gap-1">
              <UserCheck className="w-3 h-3 text-cyan-400" />
              <span>{user.role}</span>
            </div>
          </div>

          {/* Quick Role Toggle */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => onSwitchRole('ADMINISTRATOR')}
              className={`px-2 py-1 rounded transition-colors ${
                user.role === 'ADMINISTRATOR'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Administrator role"
            >
              Admin
            </button>
            <button
              onClick={() => onSwitchRole('SECURITY_ANALYST')}
              className={`px-2 py-1 rounded transition-colors ${
                user.role === 'SECURITY_ANALYST'
                  ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Security Analyst role"
            >
              Analyst
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
