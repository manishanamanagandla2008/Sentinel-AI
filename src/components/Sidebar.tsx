import React from 'react';
import {
  LayoutDashboard,
  Activity,
  BrainCircuit,
  FileCode2,
  AlertOctagon,
  Globe,
  Briefcase,
  Cpu,
  BarChart3,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'transactions'
  | 'anomaly-engine'
  | 'logs'
  | 'alerts'
  | 'threat-map'
  | 'incidents'
  | 'ibm-z'
  | 'analytics';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  alertCounts: {
    critical: number;
    high: number;
    newTotal: number;
  };
  totalTransactions: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  alertCounts,
  totalTransactions,
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    section?: string;
  }> = [
    { id: 'dashboard', label: 'Security Operations', icon: LayoutDashboard, section: 'CORE PLATFORM' },
    { id: 'transactions', label: 'Live Transactions', icon: Activity, badge: totalTransactions },
    { id: 'anomaly-engine', label: 'AI Anomaly & XAI', icon: BrainCircuit, badge: 'IsoForest' },
    { id: 'logs', label: 'Security Log Analyzer', icon: FileCode2, section: 'DETECTION & INTEL' },
    {
      id: 'alerts',
      label: 'Threat Alerts',
      icon: AlertOctagon,
      badge: alertCounts.newTotal > 0 ? `${alertCounts.newTotal} NEW` : undefined,
      badgeColor: 'text-rose-400 font-bold'
    },
    { id: 'threat-map', label: 'Live Threat Map', icon: Globe },
    { id: 'incidents', label: 'Incident Workspace', icon: Briefcase, section: 'RESPONSE & INTEGRATION' },
    { id: 'ibm-z', label: 'IBM Z Security Hub', icon: Cpu, badge: 'z/OS SMF', badgeColor: 'text-cyan-400 font-mono' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 }
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950/80 border-r border-slate-800/80 flex flex-col justify-between p-3 select-none">
      <div className="space-y-4">
        <nav className="space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <React.Fragment key={item.id}>
                {item.section && (
                  <div className={`text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 px-3 ${idx === 0 ? 'pt-1' : 'pt-4'} pb-1`}>
                    {item.section}
                  </div>
                )}
                <button
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-700/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge !== undefined && (
                      <span className={`text-[11px] font-mono ${item.badgeColor || 'text-slate-400'}`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Mainframe LPAR Sysplex Monitor Card */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>IBM z16 SYSPLEX</span>
            </span>
            <span className="text-[10px] text-emerald-400">ONLINE</span>
          </div>
          <div className="space-y-1 text-slate-400 text-[10px]">
            <div className="flex justify-between">
              <span>LPAR Node:</span>
              <span className="text-slate-300">PRD1 (z/OS 3.1)</span>
            </div>
            <div className="flex justify-between">
              <span>Crypto Coprocessor:</span>
              <span className="text-emerald-400">CPACF Active</span>
            </div>
            <div className="flex justify-between">
              <span>SMF Stream 80/110:</span>
              <span className="text-cyan-300">1,420 rec/sec</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
