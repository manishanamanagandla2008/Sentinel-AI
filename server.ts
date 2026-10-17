import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { globalStore, CURRENT_USER, CITIES } from './src/lib/dataStore.ts';
import { evaluateTransactionRisk } from './src/lib/anomalyEngine.ts';
import { TransactionType } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const server = http.createServer(app);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Background transaction simulation timer (emits realistic transactions every 8 seconds if enabled)
  let simInterval: NodeJS.Timeout | null = null;
  const startSimulationLoop = () => {
    if (simInterval) clearInterval(simInterval);
    simInterval = setInterval(() => {
      if (globalStore.simulationActive) {
        globalStore.generateSyntheticTransaction();
      }
    }, 8000);
  };
  startSimulationLoop();

  // 1. Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'UP',
      service: 'SentinelAI Cyber Threat Detection Platform',
      version: '3.4.1-ibm-z-edition',
      timestamp: new Date().toISOString(),
      models: {
        isolationForest: 'HEALTHY',
        rulesEngine: 'HEALTHY',
        smfParser: 'HEALTHY',
        liveVoiceAPI: process.env.GEMINI_API_KEY ? 'gemini-3.8-live' : 'SIMULATED_VOICE_FALLBACK'
      },
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      activeIncidents: globalStore.alerts.filter(a => a.status === 'NEW' || a.status === 'INVESTIGATING').length
    });
  });

  // 2. Auth / User profile & role switching
  app.get('/api/auth/me', (_req: Request, res: Response) => {
    res.json(CURRENT_USER);
  });

  app.post('/api/auth/switch-role', (req: Request, res: Response) => {
    const { role } = req.body;
    if (role === 'ADMINISTRATOR' || role === 'SECURITY_ANALYST') {
      CURRENT_USER.role = role;
      if (role === 'ADMINISTRATOR') {
        CURRENT_USER.name = 'Marcus Vance, CISSP';
      } else {
        CURRENT_USER.name = 'Sarah Chen, SecOps';
      }
      globalStore.auditRecords.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: CURRENT_USER.username,
        role: CURRENT_USER.role,
        action: 'ROLE_SWITCH',
        target: 'SESSION',
        details: `Active operator role switched to ${role}`,
        ipAddress: '10.200.0.45'
      });
      res.json({ success: true, user: CURRENT_USER });
    } else {
      res.status(400).json({ error: 'Invalid role specified' });
    }
  });

  // 3. Dashboard Summary
  app.get('/api/dashboard/summary', (_req: Request, res: Response) => {
    const summary = globalStore.getDashboardSummary();
    res.json(summary);
  });

  // 4. Transactions List & Filter
  app.get('/api/transactions', (req: Request, res: Response) => {
    const {
      search,
      type,
      status,
      riskLevel,
      limit = '100',
      offset = '0'
    } = req.query;

    let filtered = [...globalStore.transactions];

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.sourceAccount.toLowerCase().includes(q) ||
        t.destinationAccount.toLowerCase().includes(q) ||
        t.sourceIp.includes(q) ||
        t.location.city.toLowerCase().includes(q)
      );
    }

    if (type && typeof type === 'string' && type !== 'ALL') {
      filtered = filtered.filter(t => t.transactionType === type);
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      filtered = filtered.filter(t => t.status === status);
    }

    if (riskLevel && typeof riskLevel === 'string' && riskLevel !== 'ALL') {
      filtered = filtered.filter(t => t.riskLevel === riskLevel);
    }

    const start = parseInt(offset as string, 10) || 0;
    const max = parseInt(limit as string, 10) || 100;
    const paginated = filtered.slice(start, start + max);

    res.json({
      total: filtered.length,
      offset: start,
      limit: max,
      transactions: paginated
    });
  });

  // 5. Single Transaction
  app.get('/api/transactions/:id', (req: Request, res: Response) => {
    const txn = globalStore.transactions.find(t => t.id === req.params.id);
    if (!txn) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json(txn);
  });

  // 6. Manual Transaction Analysis
  app.post('/api/transactions/analyze', (req: Request, res: Response) => {
    const {
      amount,
      sourceAccount,
      destinationAccount,
      transactionType,
      sourceIp = '192.168.1.100',
      location = { city: 'New York', country: 'United States', lat: 40.7128, lng: -74.006, region: 'North America' },
      timestamp = new Date().toISOString()
    } = req.body;

    if (amount === undefined || !sourceAccount || !destinationAccount || !transactionType) {
      res.status(400).json({ error: 'Missing required transaction fields: amount, sourceAccount, destinationAccount, transactionType' });
      return;
    }

    const evaluated = evaluateTransactionRisk({
      amount: Number(amount),
      sourceAccount,
      destinationAccount,
      transactionType: transactionType as TransactionType,
      sourceIp,
      location,
      timestamp
    });

    const txnId = `TXN-AD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTxn = {
      id: txnId,
      timestamp,
      sourceAccount,
      destinationAccount,
      amount: Number(amount),
      currency: 'USD',
      sourceIp,
      location,
      transactionType: transactionType as TransactionType,
      status: evaluated.status,
      riskScore: evaluated.riskScore,
      riskLevel: evaluated.riskLevel,
      detectionMethod: evaluated.detectionMethod,
      isSimulated: true,
      explanation: evaluated.explanation,
      relatedEvents: [`EVENT-${txnId}`]
    };

    globalStore.transactions.unshift(newTxn);
    if (evaluated.riskScore >= 75) {
      globalStore.alerts.unshift({
        id: `ALT-${Math.floor(4000 + Math.random() * 5900)}`,
        title: `Ad-Hoc Anomaly: ${transactionType} (${destinationAccount})`,
        category: 'SUSPICIOUS_FINANCIAL',
        severity: evaluated.riskLevel,
        riskScore: evaluated.riskScore,
        status: 'NEW',
        detectionMethod: evaluated.detectionMethod,
        firstDetected: timestamp,
        lastObserved: timestamp,
        affectedEntity: `${sourceAccount} → ${destinationAccount}`,
        assignedAnalyst: null,
        transactionId: txnId,
        notes: [],
        evidence: [
          `Analyzed on-demand with Isolation Forest score ${evaluated.explanation.isolationForestScore}`,
          ...evaluated.explanation.rulesTriggered
        ],
        explanation: evaluated.explanation,
        relatedTransactions: [txnId],
        relatedLogs: [],
        investigationChecklist: [
          { id: 'CHK-1', task: 'Review ad-hoc submission details', completed: false }
        ]
      });
    }

    res.json(newTxn);
  });

  // 7. Toggle or trigger synthetic simulation
  app.post('/api/transactions/simulate', (req: Request, res: Response) => {
    const { action } = req.body;
    if (action === 'TOGGLE_AUTO') {
      globalStore.simulationActive = !globalStore.simulationActive;
      res.json({ simulationActive: globalStore.simulationActive });
      return;
    }

    const created = globalStore.generateSyntheticTransaction();
    res.json({ success: true, transaction: created, simulationActive: globalStore.simulationActive });
  });

  // 8. Alerts list & single alert
  app.get('/api/alerts', (req: Request, res: Response) => {
    const { status, severity, category } = req.query;
    let list = [...globalStore.alerts];

    if (status && status !== 'ALL') {
      list = list.filter(a => a.status === status);
    }
    if (severity && severity !== 'ALL') {
      list = list.filter(a => a.severity === severity);
    }
    if (category && category !== 'ALL') {
      list = list.filter(a => a.category === category);
    }

    res.json(list);
  });

  app.get('/api/alerts/:id', (req: Request, res: Response) => {
    const alert = globalStore.alerts.find(a => a.id === req.params.id);
    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    res.json(alert);
  });

  // 9. Patch Alert (Status, Notes, Assignment, Checklist)
  app.patch('/api/alerts/:id', (req: Request, res: Response) => {
    const { status, assignedAnalyst, noteText, completedChecklistId } = req.body;
    const updated = globalStore.updateAlert(req.params.id, {
      status,
      assignedAnalyst,
      noteText,
      completedChecklistId
    });

    if (!updated) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    res.json(updated);
  });

  // 10. Security Logs list
  app.get('/api/logs', (req: Request, res: Response) => {
    const { source, level, suspiciousOnly, search } = req.query;
    let logs = [...globalStore.logs];

    if (source && source !== 'ALL') {
      logs = logs.filter(l => l.source === source);
    }
    if (level && level !== 'ALL') {
      logs = logs.filter(l => l.level === level);
    }
    if (suspiciousOnly === 'true') {
      logs = logs.filter(l => l.isSuspicious);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      logs = logs.filter(l =>
        l.event.toLowerCase().includes(q) ||
        l.user.toLowerCase().includes(q) ||
        l.ip.includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    }

    res.json(logs);
  });

  // 11. Security Log Upload & Parser
  app.post('/api/logs/upload', (req: Request, res: Response) => {
    const { content, sourceName = 'UPLOADED_BATCH' } = req.body;

    if (!content || typeof content !== 'string') {
      res.status(400).json({ error: 'Log content must be a non-empty string.' });
      return;
    }

    const newLogs: any[] = [];
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

    lines.forEach((line, index) => {
      let event = line;
      let level: any = 'INFO';
      let user = 'svc_batch';
      let ip = '127.0.0.1';
      let isSuspicious = false;
      let riskScore = 15;
      let smfType: string | undefined = undefined;

      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const parsed = JSON.parse(line);
          event = parsed.event || parsed.message || line;
          level = parsed.level || 'INFO';
          user = parsed.user || parsed.username || 'sys_user';
          ip = parsed.ip || parsed.client_ip || '10.0.0.1';
        } catch {
          // fallback
        }
      } else if (line.includes(',')) {
        const parts = line.split(',');
        if (parts.length >= 4) {
          level = (parts[2]?.trim().toUpperCase() as any) || 'INFO';
          user = parts[3]?.trim() || 'user';
          ip = parts[4]?.trim() || '127.0.0.1';
          event = parts.slice(5).join(',') || line;
        }
      }

      const lower = event.toLowerCase();
      if (lower.includes('fail') || lower.includes('denied') || lower.includes('ich408i') || lower.includes('violation') || lower.includes('unauthorized')) {
        isSuspicious = true;
        level = 'WARN';
        riskScore = 75;
      }
      if (lower.includes('root') || lower.includes('parmlib') || lower.includes('exfiltrat') || lower.includes('overflow') || lower.includes('brute')) {
        isSuspicious = true;
        level = 'CRITICAL';
        riskScore = 92;
      }
      if (event.includes('SMF') || event.includes('RACF')) {
        smfType = 'SMF Type 80 (RACF Access)';
      }

      const logRecord = {
        id: `LOG-UP-${Date.now()}-${index}`,
        timestamp: new Date().toISOString(),
        source: (event.includes('RACF') || event.includes('SMF') ? 'RACF_SAF' : 'LINUX_AUTH') as any,
        level,
        event,
        user,
        ip,
        location: 'Enterprise Perimeter',
        details: `Parsed from uploaded log stream: ${sourceName}`,
        isSuspicious,
        riskScore,
        smfRecordType: smfType
      };

      newLogs.push(logRecord);
      globalStore.logs.unshift(logRecord);
    });

    globalStore.auditRecords.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: CURRENT_USER.username,
      role: CURRENT_USER.role,
      action: 'UPLOAD_SECURITY_LOGS',
      target: sourceName,
      details: `Parsed ${newLogs.length} log records; ${newLogs.filter(l => l.isSuspicious).length} suspicious events identified.`,
      ipAddress: '10.200.0.45'
    });

    res.json({
      success: true,
      recordsParsed: newLogs.length,
      suspiciousDetected: newLogs.filter(l => l.isSuspicious).length,
      logs: newLogs
    });
  });

  // 12. Trigger Scenario
  app.post('/api/demo/scenario', (_req: Request, res: Response) => {
    const results = globalStore.triggerScenario();
    res.json({
      success: true,
      scenario: 'Multi-Stage Cyber Heist Interception',
      steps: results,
      timestamp: globalStore.lastScenarioRunTime
    });
  });

  // 13. Audit logs
  app.get('/api/audit-logs', (_req: Request, res: Response) => {
    res.json(globalStore.auditRecords);
  });

  // 14. Analytics endpoint
  app.get('/api/analytics', (_req: Request, res: Response) => {
    const totalTxns = globalStore.transactions.length;
    const suspiciousTxns = globalStore.transactions.filter(t => t.riskScore >= 65).length;
    const totalAlerts = globalStore.alerts.length;
    const resolvedAlerts = globalStore.alerts.filter(a => a.status === 'RESOLVED').length;

    res.json({
      summary: {
        totalTransactionsAnalyzed: totalTxns,
        suspiciousDetected: suspiciousTxns,
        threatRatePct: totalTxns > 0 ? Number(((suspiciousTxns / totalTxns) * 100).toFixed(1)) : 0,
        totalAlerts,
        resolvedAlerts,
        resolutionRatePct: totalAlerts > 0 ? Number(((resolvedAlerts / totalAlerts) * 100).toFixed(1)) : 0,
        averageMTRMinutes: 14.8
      },
      severityBreakdown: [
        { name: 'Critical', count: globalStore.alerts.filter(a => a.severity === 'CRITICAL').length, fill: '#ef4444' },
        { name: 'High', count: globalStore.alerts.filter(a => a.severity === 'HIGH').length, fill: '#f97316' },
        { name: 'Medium', count: globalStore.alerts.filter(a => a.severity === 'MEDIUM').length, fill: '#eab308' },
        { name: 'Low', count: globalStore.alerts.filter(a => a.severity === 'LOW').length, fill: '#10b981' }
      ],
      rulesTriggeredRanking: [
        { rule: 'RULE_TXN_AMOUNT_DEVIATION', count: 28, description: 'Amount > 3.0 std dev above historical profile' },
        { rule: 'RULE_IMPOSSIBLE_TRAVEL_VELOCITY', count: 19, description: 'Geographic transit > 800 km/h commercial limit' },
        { rule: 'RULE_HIGH_RISK_DESTINATION_ENTITY', count: 15, description: 'Offshore unverified routing entity' },
        { rule: 'RULE_ZOS_RACF_VIOLATION_PARMLIB', count: 8, description: 'Unauthorized z/OS parameter dataset update' },
        { rule: 'RULE_BRUTE_FORCE_BURST_THRESHOLD', count: 12, description: '> 40 auth failures per 60s window' }
      ],
      volumeByHour: [
        { hour: '00:00', volume: 120, threats: 4 },
        { hour: '04:00', volume: 65, threats: 9 },
        { hour: '08:00', volume: 340, threats: 8 },
        { hour: '12:00', volume: 520, threats: 14 },
        { hour: '16:00', volume: 480, threats: 11 },
        { hour: '20:00', volume: 290, threats: 7 }
      ]
    });
  });

  // 15. WebSocket Server for Gemini Live API (gemini-3.8-live) Voice Conversations
  const wss = new WebSocketServer({ server, path: '/api/live-ws' });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Live API WS] Client connected to SentinelAI Voice SecOps');
    let geminiSession: any = null;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI();
        const currentSummary = globalStore.getDashboardSummary();
        const criticalAlerts = globalStore.alerts.filter(a => a.severity === 'CRITICAL');

        geminiSession = await ai.live.connect({
          model: 'gemini-3.8-live',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: `You are SentinelAI Voice SecOps Officer, an elite cyber threat operations advisor for the IBM Z Threat Detection Platform. You talk directly with security analysts and incident commanders via live two-way voice. You explain real-time transaction anomalies, IBM Z SMF records (Type 80 RACF violations, Type 110 CICS abends), Isolation Forest threat weights, and containment protocols. Speak crisply, authoritatively, and concisely.
Current DEFCON status: ${currentSummary.systemSecurityStatus}. Active critical alerts: ${criticalAlerts.length}. Most critical target: ${criticalAlerts[0]?.title || 'None'}. Recent suspicious transaction: ${globalStore.transactions.find(t => t.riskScore >= 75)?.id || 'None'}.`,
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
              if (audio) {
                clientWs.send(JSON.stringify({ type: 'audio', audio }));
              }
              if (text) {
                clientWs.send(JSON.stringify({ type: 'text', text }));
              }
              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ type: 'interrupted', interrupted: true }));
              }
            },
            onerror: (err: any) => {
              console.error('[Live API Session Error]', err);
              clientWs.send(JSON.stringify({ type: 'error', error: err?.message || 'Live session error' }));
            },
            onclose: () => {
              console.log('[Live API Session Closed]');
              clientWs.send(JSON.stringify({ type: 'closed', closed: true }));
            }
          }
        });

        clientWs.send(JSON.stringify({
          type: 'connected',
          model: 'gemini-3.8-live',
          message: 'Connected to Gemini 3.8 Live API voice session.'
        }));
      } catch (err: any) {
        console.error('[Live API Connection Failed]', err);
        clientWs.send(JSON.stringify({
          type: 'fallback',
          error: err?.message,
          message: 'Gemini Live API initialization error. Falling back to SecOps telemetry speech simulation.'
        }));
      }
    } else {
      clientWs.send(JSON.stringify({
        type: 'fallback',
        message: 'No GEMINI_API_KEY environment variable detected. Running in offline SecOps voice simulation mode.'
      }));
    }

    clientWs.on('message', async (data: Buffer | string) => {
      try {
        const msg = JSON.parse(data.toString());

        if (geminiSession) {
          if (msg.audio) {
            geminiSession.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' }
            });
          } else if (msg.text) {
            geminiSession.sendRealtimeInput({
              text: msg.text
            });
          }
        } else {
          // Fallback response for offline or simulated voice mode
          const query = (msg.text || 'status').toLowerCase();
          const summary = globalStore.getDashboardSummary();
          let reply = `SentinelAI SecOps Briefing: Current DEFCON status is ${summary.systemSecurityStatus}. We have analyzed ${summary.totalTransactions} transactions with a detection rate of ${summary.threatDetectionRate}%. ${summary.countsBySeverity.critical} critical threats are active.`;

          if (query.includes('alert') || query.includes('critical')) {
            const top = globalStore.alerts.find(a => a.severity === 'CRITICAL') || globalStore.alerts[0];
            reply = `Critical Incident Briefing: Incident ${top.id}, ${top.title}. Target is ${top.affectedEntity}. Risk score is ${top.riskScore} out of 100. Key rule: ${top.explanation.rulesTriggered[0] || 'Amount deviation'}. Recommended action: ${top.explanation.recommendations[0]}.`;
          } else if (query.includes('racf') || query.includes('mainframe') || query.includes('ibm')) {
            reply = `IBM Z Mainframe Status: RACF SAF monitor active on LPAR PRD1. SMF record types 80, 83, and 110 streaming normally at 1,420 records per second. CPACF hardware cryptography is fully operational.`;
          } else if (query.includes('wire') || query.includes('transaction')) {
            const highTxn = globalStore.transactions.find(t => t.riskScore >= 75) || globalStore.transactions[0];
            reply = `Suspicious Transaction Analysis: ${highTxn.id} for $${highTxn.amount.toLocaleString()} was flagged with risk score ${highTxn.riskScore}. Location is ${highTxn.location.city}. Reason: ${highTxn.explanation.summary}`;
          }

          clientWs.send(JSON.stringify({
            type: 'text',
            text: reply
          }));
        }
      } catch (e) {
        console.error('Error handling ws message:', e);
      }
    });

    clientWs.on('close', () => {
      console.log('[Live API WS] Client disconnected');
      if (geminiSession && typeof geminiSession.close === 'function') {
        try {
          geminiSession.close();
        } catch {
          // ignore
        }
      }
    });
  });

  // Vite or static client serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[SentinelAI] Server with Live API listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start SentinelAI server:', err);
  process.exit(1);
});
