/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TransactionsView } from './components/TransactionsView.tsx';
import { AnomalyEngineView } from './components/AnomalyEngineView.tsx';
import { LogsView } from './components/LogsView.tsx';
import { AlertsView } from './components/AlertsView.tsx';
import { ThreatMapView } from './components/ThreatMapView.tsx';
import { InvestigationView } from './components/InvestigationView.tsx';
import { IbmZModuleView } from './components/IbmZModuleView.tsx';
import { LinuxOneView } from './components/LinuxOneView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { InspectModal } from './components/InspectModal.tsx';
import { AnalyzeModal } from './components/AnalyzeModal.tsx';
import { ScenarioToast } from './components/ScenarioToast.tsx';
import { VoiceSecOpsModal } from './components/VoiceSecOpsModal.tsx';
import { VoiceFloatingOrb } from './components/VoiceFloatingOrb.tsx';
import { soundFx } from './lib/soundFx.ts';

import {
  DashboardSummary,
  Transaction,
  Alert,
  SecurityLog,
  AuditRecord,
  UserSession,
  AlertStatus
} from './types/index.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [user, setUser] = useState<UserSession>({
    username: 'sec_ops_lead',
    name: 'Marcus Vance, CISSP',
    role: 'ADMINISTRATOR',
    avatar: 'MV',
    lastLogin: new Date().toISOString()
  });

  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isScenarioRunning, setIsScenarioRunning] = useState<boolean>(false);
  const [scenarioSteps, setScenarioSteps] = useState<{ step: string; message: string; alertId?: string }[]>([]);

  // Inspect modal
  const [inspectItem, setInspectItem] = useState<Transaction | Alert | null>(null);
  const [inspectType, setInspectType] = useState<'transaction' | 'alert'>('transaction');

  // Analyze custom txn modal
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState<boolean>(false);

  // Gemini Live API Voice Conversation Modal
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  // Selected alert for incident workspace
  const [selectedIncidentAlertId, setSelectedIncidentAlertId] = useState<string | null>(null);

  // Fetch core telemetry from server
  const fetchTelemetry = useCallback(async () => {
    try {
      const [sumRes, txnRes, alertRes, logsRes, audRes, userRes] = await Promise.all([
        fetch('/api/dashboard/summary').then(r => r.json()),
        fetch('/api/transactions?limit=100').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json()),
        fetch('/api/logs').then(r => r.json()),
        fetch('/api/audit-logs').then(r => r.json()),
        fetch('/api/auth/me').then(r => r.json())
      ]);

      setSummary(sumRes);
      setTransactions(txnRes.transactions || []);
      setAlerts(alertRes || []);
      setLogs(logsRes || []);
      setAuditRecords(audRes || []);
      if (userRes && userRes.username) {
        setUser(userRes);
      }
      if (sumRes) {
        setIsSimulating(sumRes.simulationActive);
      }
    } catch (err) {
      console.error('Telemetry fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 4000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Actions
  const handleToggleSimulation = async () => {
    try {
      soundFx.playBlip(750);
      const res = await fetch('/api/transactions/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_AUTO' })
      }).then(r => r.json());
      setIsSimulating(res.simulationActive);
      fetchTelemetry();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateBatch = async () => {
    try {
      soundFx.playBlip(900);
      await fetch('/api/transactions/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GENERATE_SINGLE' })
      });
      fetchTelemetry();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerScenario = async () => {
    setIsScenarioRunning(true);
    soundFx.playAlertSound();
    try {
      const res = await fetch('/api/demo/scenario', { method: 'POST' }).then(r => r.json());
      setScenarioSteps(res.steps || []);
      await fetchTelemetry();
    } catch (err) {
      console.error(err);
    } finally {
      setIsScenarioRunning(false);
    }
  };

  const handleSwitchRole = async (newRole: 'ADMINISTRATOR' | 'SECURITY_ANALYST') => {
    try {
      soundFx.playBlip(800);
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      }).then(r => r.json());
      if (res.user) {
        setUser(res.user);
      }
      fetchTelemetry();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAlert = async (id: string, updates: {
    status?: AlertStatus;
    assignedAnalyst?: string | null;
    noteText?: string;
    completedChecklistId?: string;
  }) => {
    try {
      soundFx.playBlip(950);
      await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      await fetchTelemetry();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadLogs = async (content: string, format: string, sourceName: string) => {
    soundFx.playRadarPing();
    const res = await fetch('/api/logs/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, format, sourceName })
    }).then(r => r.json());
    await fetchTelemetry();
    return res;
  };

  const handleInspectAlert = (alert: Alert) => {
    soundFx.playBlip(1000);
    setInspectItem(alert);
    setInspectType('alert');
  };

  const handleInspectTransaction = (txn: Transaction) => {
    soundFx.playBlip(1000);
    setInspectItem(txn);
    setInspectType('transaction');
  };

  const handleNavigateToIncident = (alertId: string) => {
    setSelectedIncidentAlertId(alertId);
    setCurrentTab('incidents');
  };

  const alertCounts = {
    critical: alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length,
    high: alerts.filter(a => a.severity === 'HIGH' && a.status !== 'RESOLVED').length,
    newTotal: alerts.filter(a => a.status === 'NEW').length,
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200 bg-cyber-grid">
      {/* Top Application Header */}
      <Header
        user={user}
        securityStatus={summary?.systemSecurityStatus || 'SECURE'}
        isSimulating={isSimulating}
        onToggleSimulation={handleToggleSimulation}
        onTriggerScenario={handleTriggerScenario}
        onSwitchRole={handleSwitchRole}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        lastUpdated={summary?.lastUpdated || new Date().toISOString()}
        isScenarioRunning={isScenarioRunning}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => {
            soundFx.playBlip(700);
            setCurrentTab(tab);
          }}
          alertCounts={alertCounts}
          totalTransactions={summary?.totalTransactions || transactions.length}
        />

        {/* Center Main Stage Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-68px)]">
          {currentTab === 'dashboard' && (
            <DashboardView
              summary={summary}
              logs={logs}
              onInspectAlert={handleInspectAlert}
              onInspectTransaction={handleInspectTransaction}
              onNavigateTab={setCurrentTab}
              onTriggerScenario={handleTriggerScenario}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              isSimulating={isSimulating}
              onToggleSimulation={handleToggleSimulation}
              onGenerateBatch={handleGenerateBatch}
              onInspectTransaction={handleInspectTransaction}
              onOpenAnalyzeModal={() => {
                soundFx.playBlip(900);
                setIsAnalyzeModalOpen(true);
              }}
            />
          )}

          {currentTab === 'anomaly-engine' && (
            <AnomalyEngineView />
          )}

          {currentTab === 'logs' && (
            <LogsView
              logs={logs}
              onUploadLogs={handleUploadLogs}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onInspectAlert={handleInspectAlert}
              onUpdateAlert={handleUpdateAlert}
              currentUserRole={user.role}
            />
          )}

          {currentTab === 'threat-map' && (
            <ThreatMapView
              transactions={transactions}
              alerts={alerts}
              onInspectTransaction={handleInspectTransaction}
            />
          )}

          {currentTab === 'incidents' && (
            <InvestigationView
              alerts={alerts}
              auditRecords={auditRecords}
              selectedAlertId={selectedIncidentAlertId}
              onSelectAlertId={setSelectedIncidentAlertId}
              onUpdateAlert={handleUpdateAlert}
              currentUserRole={user.role}
            />
          )}

          {currentTab === 'ibm-z' && (
            <IbmZModuleView />
          )}

          {currentTab === 'linux-one' && (
            <LinuxOneView />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView />
          )}
        </main>
      </div>

      {/* Floating Holographic Voice SecOps Launcher & Audio FX Controls */}
      <VoiceFloatingOrb
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
      />

      {/* Inspect Item Modal (XAI & Forensic Evidence) */}
      {inspectItem && (
        <InspectModal
          item={inspectItem}
          type={inspectType}
          onClose={() => setInspectItem(null)}
          onNavigateToIncident={handleNavigateToIncident}
        />
      )}

      {/* Custom Transaction Analyzer Modal */}
      {isAnalyzeModalOpen && (
        <AnalyzeModal
          onClose={() => setIsAnalyzeModalOpen(false)}
          onAnalyzeSuccess={newTxn => {
            soundFx.playAlertSound();
            setTransactions(prev => [newTxn, ...prev]);
            fetchTelemetry();
          }}
        />
      )}

      {/* Gemini Live API Voice Conversation Modal */}
      <VoiceSecOpsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        systemStatus={summary?.systemSecurityStatus || 'SECURE'}
      />

      {/* Multi-Stage Attack Scenario Toast */}
      {scenarioSteps.length > 0 && (
        <ScenarioToast
          steps={scenarioSteps}
          onClose={() => setScenarioSteps([])}
          onViewAlert={alertId => {
            setScenarioSteps([]);
            handleNavigateToIncident(alertId);
          }}
        />
      )}
    </div>
  );
}
