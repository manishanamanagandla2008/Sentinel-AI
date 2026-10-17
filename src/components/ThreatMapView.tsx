import React, { useState } from 'react';
import {
  Globe,
  Filter,
  Flame,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  MapPin,
  Clock,
  Layers,
  Info
} from 'lucide-react';
import { Transaction, Alert, Severity } from '../types/index.ts';

interface ThreatMapViewProps {
  transactions: Transaction[];
  alerts: Alert[];
  onInspectTransaction: (txn: Transaction) => void;
}

interface MapNode {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  region: string;
  count: number;
  highestSeverity: Severity;
  highestScore: number;
  events: Transaction[];
}

export const ThreatMapView: React.FC<ThreatMapViewProps> = ({
  transactions,
  alerts,
  onInspectTransaction,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [activeNode, setActiveNode] = useState<MapNode | null>(null);

  // Filter transactions by severity
  const filteredTxns = transactions.filter(t => {
    if (selectedSeverity !== 'ALL' && t.riskLevel !== selectedSeverity) return false;
    return true;
  });

  // Group by location coordinates
  const nodesMap: Record<string, MapNode> = {};
  filteredTxns.forEach(t => {
    const key = `${t.location.city}-${t.location.country}`;
    if (!nodesMap[key]) {
      nodesMap[key] = {
        id: key,
        city: t.location.city,
        country: t.location.country,
        lat: t.location.lat,
        lng: t.location.lng,
        region: t.location.region,
        count: 0,
        highestSeverity: 'LOW',
        highestScore: 0,
        events: []
      };
    }
    nodesMap[key].count += 1;
    nodesMap[key].events.push(t);
    if (t.riskScore > nodesMap[key].highestScore) {
      nodesMap[key].highestScore = t.riskScore;
      nodesMap[key].highestSeverity = t.riskLevel;
    }
  });

  const nodes = Object.values(nodesMap);

  // Region aggregation
  const regions: Record<string, { count: number; highThreats: number }> = {};
  nodes.forEach(n => {
    if (!regions[n.region]) {
      regions[n.region] = { count: 0, highThreats: 0 };
    }
    regions[n.region].count += n.count;
    if (n.highestScore >= 65) {
      regions[n.region].highThreats += n.count;
    }
  });

  // Convert lat/lng to SVG projection percentage (Equirectangular standard projection)
  // X: (-180 to 180) -> (0% to 100%)
  // Y: (90 to -90) -> (0% to 100%)
  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x: Math.max(3, Math.min(97, x)), y: Math.max(8, Math.min(92, y)) };
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <div>
          <span className="font-bold text-cyan-300">DEMONSTRATION GEOGRAPHICAL TELEMETRY:</span> All coordinates are mapped to synthetic simulated transaction origins for IBM Z Datathon evaluation. Real user geolocation is never captured.
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/70">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold font-mono text-white">Global Threat Ingestion Map</h2>
            <p className="text-xs text-slate-400">Pulsing nodes indicate detected anomalies and geographical velocity displacements</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Severity Filter:</span>
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only (≥ 80)</option>
            <option value="HIGH">High (65 - 79)</option>
            <option value="MEDIUM">Medium (35 - 64)</option>
            <option value="LOW">Low (0 - 34)</option>
          </select>
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="relative rounded-2xl border border-slate-800 bg-[#090d19] overflow-hidden p-4 min-h-[460px] flex items-center justify-center">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* World Map SVG Outline */}
        <div className="relative w-full aspect-[2/1] max-h-[520px]">
          <svg viewBox="0 0 1000 500" className="w-full h-full opacity-35">
            {/* World Continents simplified high-tech wireframe */}
            {/* North America */}
            <path
              d="M140,90 Q220,70 260,110 T240,210 Q210,230 180,210 T130,160 Z"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="0.75"
            />
            {/* Central & South America */}
            <path
              d="M230,230 Q280,260 290,320 T260,430 Q230,460 210,400 T210,270 Z"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="0.75"
            />
            {/* Europe */}
            <path
              d="M470,90 Q540,80 570,120 T520,180 Q480,180 460,150 Z"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="0.75"
            />
            {/* Africa */}
            <path
              d="M480,190 Q570,200 580,280 T540,390 Q490,410 460,320 T460,220 Z"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="0.75"
            />
            {/* Asia & Russia */}
            <path
              d="M580,80 Q760,70 850,120 T820,240 Q710,260 620,200 T570,120 Z"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="0.75"
            />
            {/* Australia */}
            <path
              d="M780,330 Q870,320 880,390 T800,430 Q750,420 760,360 Z"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="0.75"
            />
            {/* Equator & Meridian Guides */}
            <line x1="0" y1="250" x2="1000" y2="250" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.5" />
            <line x1="500" y1="0" x2="500" y2="500" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.5" />
          </svg>

          {/* Interactive Threat Nodes Placed at Projected Coordinates */}
          {nodes.map(node => {
            const { x, y } = projectCoords(node.lat, node.lng);
            const isCrit = node.highestSeverity === 'CRITICAL';
            const isHigh = node.highestSeverity === 'HIGH';
            const isMed = node.highestSeverity === 'MEDIUM';

            const colorClass = isCrit ? 'bg-rose-500' :
              isHigh ? 'bg-amber-500' :
              isMed ? 'bg-yellow-400' : 'bg-cyan-400';

            const ringClass = isCrit ? 'border-rose-500' :
              isHigh ? 'border-amber-500' :
              isMed ? 'border-yellow-400' : 'border-cyan-400';

            return (
              <div
                key={node.id}
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={() => setActiveNode(node)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                {/* Pulsing ring animation */}
                <div className={`absolute -inset-2.5 rounded-full border ${ringClass} opacity-60 animate-ping`}></div>
                
                {/* Node Center Badge */}
                <div className={`relative flex items-center justify-center w-6 h-6 rounded-full ${colorClass} text-slate-950 font-mono font-bold text-[10px] shadow-lg shadow-black/80 transition-transform group-hover:scale-125 border border-white/40`}>
                  {node.count}
                </div>

                {/* City Tooltip on hover */}
                <div className="absolute left-1/2 -top-7 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[10px] font-mono text-slate-200 whitespace-nowrap shadow-md">
                  {node.city} ({node.highestScore}/100)
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected City Details Modal / Overlay */}
        {activeNode && (
          <div className="absolute right-4 top-4 max-w-sm w-full rounded-xl bg-slate-950/95 border border-cyan-500/50 p-4 shadow-2xl z-30 font-mono text-xs backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>{activeNode.city}, {activeNode.country}</span>
              </div>
              <button
                onClick={() => setActiveNode(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-3 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Region:</span>
                <span>{activeNode.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Observed Events:</span>
                <span className="font-bold text-white">{activeNode.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Peak Anomaly Score:</span>
                <span className={`font-bold ${activeNode.highestScore >= 80 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {activeNode.highestScore}/100 ({activeNode.highestSeverity})
                </span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-2 space-y-1.5">
              <div className="text-[11px] text-slate-400">Recent Transactions from this Node:</div>
              {activeNode.events.slice(0, 3).map(ev => (
                <div
                  key={ev.id}
                  onClick={() => onInspectTransaction(ev)}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 cursor-pointer"
                >
                  <span className="text-slate-200">{ev.id}</span>
                  <span className="font-bold text-slate-100">${ev.amount.toLocaleString()}</span>
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Regional Threat Intelligence Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(regions).map(([regionName, stats]) => (
          <div key={regionName} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 font-mono">
            <div className="text-xs text-slate-400 uppercase tracking-wider">{regionName}</div>
            <div className="text-xl font-bold text-white mt-1">{stats.count} Events</div>
            <div className="mt-2 text-[11px] flex items-center justify-between">
              <span className="text-slate-400">Flagged Anomalies:</span>
              <span className={`font-bold ${stats.highThreats > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {stats.highThreats}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
