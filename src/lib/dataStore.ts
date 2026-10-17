import {
  Transaction,
  Alert,
  SecurityLog,
  AuditRecord,
  DashboardSummary,
  UserSession,
  LocationInfo
} from '../types/index.ts';
import { evaluateTransactionRisk } from './anomalyEngine.ts';

export const CURRENT_USER: UserSession = {
  username: 'sec_ops_lead',
  name: 'Marcus Vance, CISSP',
  role: 'ADMINISTRATOR',
  avatar: 'MV',
  lastLogin: '2026-10-16T21:15:00Z',
};

export const CITIES: LocationInfo[] = [
  { city: 'New York', country: 'United States', lat: 40.7128, lng: -74.006, region: 'North America' },
  { city: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, region: 'Europe' },
  { city: 'Frankfurt', country: 'Germany', lat: 50.1109, lng: 8.6821, region: 'Europe' },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, region: 'Asia Pacific' },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, region: 'Asia Pacific' },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, region: 'Oceania' },
  { city: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, region: 'South America' },
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, region: 'Middle East' },
  { city: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417, region: 'Europe' },
  { city: 'George Town', country: 'Cayman Islands', lat: 19.2869, lng: -81.3674, region: 'Caribbean' },
  { city: 'St. Petersburg', country: 'Russia', lat: 59.9343, lng: 30.3351, region: 'Eastern Europe' }
];

export class SentinelStore {
  transactions: Transaction[] = [];
  alerts: Alert[] = [];
  logs: SecurityLog[] = [];
  auditRecords: AuditRecord[] = [];
  simulationActive: boolean = true;
  lastScenarioRunTime: string | null = null;

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    const now = Date.now();

    // 1. Initial Logs (including IBM Z SMF records)
    this.logs = [
      {
        id: 'LOG-88102',
        timestamp: new Date(now - 120000).toISOString(),
        source: 'RACF_SAF',
        level: 'CRITICAL',
        event: 'RACF ICH408I USER(Z99ADMIN) INSUFFICIENT ACCESS AUTHORITY TO SYS1.PARMLIB',
        user: 'Z99ADMIN',
        ip: '192.168.1.105',
        location: 'Poughkeepsie, US',
        details: 'Unauthorized attempt to update z/OS system parameter library. SAF return code 08, RACF return code 08.',
        isSuspicious: true,
        riskScore: 92,
        smfRecordType: 'SMF Type 80 (RACF Processing)'
      },
      {
        id: 'LOG-88101',
        timestamp: new Date(now - 240000).toISOString(),
        source: 'LINUX_AUTH',
        level: 'WARN',
        event: 'Failed password for invalid user root from 185.220.101.5 port 49152 ssh2',
        user: 'root',
        ip: '185.220.101.5',
        location: 'St. Petersburg, Russia',
        details: 'Credential brute-force burst: 48 failed attempts detected within 60 seconds.',
        isSuspicious: true,
        riskScore: 84
      },
      {
        id: 'LOG-88100',
        timestamp: new Date(now - 450000).toISOString(),
        source: 'ZOS_SMF',
        level: 'WARN',
        event: 'SMF 110 SUBTYPE 1: CICS TRANSACTION CSQ4 ABEND CODE AICA EXECUTION EXCEEDED',
        user: 'CICSUSER1',
        ip: '10.200.4.12',
        location: 'Mainframe LPAR PRD1',
        details: 'CICS runaway task detected during high-volume batch settlement queue processing.',
        isSuspicious: true,
        riskScore: 68,
        smfRecordType: 'SMF Type 110 (CICS Monitoring)'
      },
      {
        id: 'LOG-88099',
        timestamp: new Date(now - 600000).toISOString(),
        source: 'API_GATEWAY',
        level: 'INFO',
        event: 'OAuth2 JWT token issued for client service-mesh-core',
        user: 'svc_settlement',
        ip: '10.240.0.18',
        location: 'Frankfurt, Germany',
        details: 'Standard mutual TLS handshake and bearer token issuance.',
        isSuspicious: false,
        riskScore: 8
      },
      {
        id: 'LOG-88098',
        timestamp: new Date(now - 800000).toISOString(),
        source: 'DATABASE_CORE',
        level: 'WARN',
        event: 'Bulk SELECT on Table CUSTOMER_PII without pagination filter limit',
        user: 'dba_readonly',
        ip: '10.200.12.88',
        location: 'New York, US',
        details: 'Query returned 145,000 sensitive records in single cursor fetch. Potential data exfiltration pattern.',
        isSuspicious: true,
        riskScore: 78
      },
      {
        id: 'LOG-88097',
        timestamp: new Date(now - 1200000).toISOString(),
        source: 'FIREWALL',
        level: 'INFO',
        event: 'Inbound TLS session established on port 443 with SNI gateway.fin-core.net',
        user: 'external_client',
        ip: '64.233.160.1',
        location: 'New York, US',
        details: 'Cipher suite TLS_AES_256_GCM_SHA384 handshake completed successfully.',
        isSuspicious: false,
        riskScore: 5
      }
    ];

    // 2. Initial Transactions
    const seedTxns: Array<{
      id: string;
      sourceAccount: string;
      destinationAccount: string;
      amount: number;
      type: any;
      city: string;
      country: string;
      lat: number;
      lng: number;
      region: string;
      ip: string;
      ageMinutes: number;
    }> = [
      {
        id: 'TXN-90218',
        sourceAccount: 'ACC-89104-US',
        destinationAccount: 'ACC-MULE-KY-999',
        amount: 84500,
        type: 'WIRE_TRANSFER',
        city: 'George Town',
        country: 'Cayman Islands',
        lat: 19.2869,
        lng: -81.3674,
        region: 'Caribbean',
        ip: '190.21.84.11',
        ageMinutes: 2
      },
      {
        id: 'TXN-90217',
        sourceAccount: 'ZOS-CICS-BATCH',
        destinationAccount: 'ACC-52019-DE',
        amount: 14200,
        type: 'MAINFRAME_BATCH',
        city: 'Frankfurt',
        country: 'Germany',
        lat: 50.1109,
        lng: 8.6821,
        region: 'Europe',
        ip: '10.200.4.12',
        ageMinutes: 5
      },
      {
        id: 'TXN-90216',
        sourceAccount: 'ACC-31405-SG',
        destinationAccount: 'ACC-89104-US',
        amount: 1150,
        type: 'API_PAYMENT',
        city: 'Singapore',
        country: 'Singapore',
        lat: 1.3521,
        lng: 103.8198,
        region: 'Asia Pacific',
        ip: '118.200.34.19',
        ageMinutes: 12
      },
      {
        id: 'TXN-90215',
        sourceAccount: 'ACC-89104-US',
        destinationAccount: 'ACC-SHELL-CH-88',
        amount: 62000,
        type: 'WIRE_TRANSFER',
        city: 'Zurich',
        country: 'Switzerland',
        lat: 47.3769,
        lng: 8.5417,
        region: 'Europe',
        ip: '194.26.29.110',
        ageMinutes: 18
      },
      {
        id: 'TXN-90214',
        sourceAccount: 'ACC-52019-DE',
        destinationAccount: 'ACC-31405-SG',
        amount: 820,
        type: 'ACH_TRANSFER',
        city: 'Frankfurt',
        country: 'Germany',
        lat: 50.1109,
        lng: 8.6821,
        region: 'Europe',
        ip: '82.165.197.1',
        ageMinutes: 24
      },
      {
        id: 'TXN-90213',
        sourceAccount: 'ACC-89104-US',
        destinationAccount: 'ACC-44910-US',
        amount: 450,
        type: 'CREDIT_PAYMENT',
        city: 'New York',
        country: 'United States',
        lat: 40.7128,
        lng: -74.006,
        region: 'North America',
        ip: '72.229.28.185',
        ageMinutes: 30
      },
      {
        id: 'TXN-90212',
        sourceAccount: 'ACC-77402-JP',
        destinationAccount: 'ACC-19204-JP',
        amount: 3200,
        type: 'ATM_WITHDRAWAL',
        city: 'Tokyo',
        country: 'Japan',
        lat: 35.6762,
        lng: 139.6503,
        region: 'Asia Pacific',
        ip: '133.242.18.9',
        ageMinutes: 45
      }
    ];

    this.transactions = seedTxns.map(item => {
      const ts = new Date(now - item.ageMinutes * 60000).toISOString();
      const loc: LocationInfo = {
        city: item.city,
        country: item.country,
        lat: item.lat,
        lng: item.lng,
        region: item.region
      };

      const evaluated = evaluateTransactionRisk({
        amount: item.amount,
        sourceAccount: item.sourceAccount,
        destinationAccount: item.destinationAccount,
        transactionType: item.type,
        sourceIp: item.ip,
        location: loc,
        timestamp: ts
      });

      return {
        id: item.id,
        timestamp: ts,
        sourceAccount: item.sourceAccount,
        destinationAccount: item.destinationAccount,
        amount: item.amount,
        currency: 'USD',
        sourceIp: item.ip,
        location: loc,
        transactionType: item.type,
        status: evaluated.status,
        riskScore: evaluated.riskScore,
        riskLevel: evaluated.riskLevel,
        detectionMethod: evaluated.detectionMethod,
        isSimulated: true,
        explanation: evaluated.explanation,
        relatedEvents: [`EVENT-${item.id.replace('TXN-', '')}`]
      };
    });

    // 3. Initial Alerts (Categorized per specification)
    this.alerts = [
      {
        id: 'ALT-3091',
        title: 'High-Value Offshore Wire Transfer Anomaly',
        category: 'SUSPICIOUS_FINANCIAL',
        severity: 'CRITICAL',
        riskScore: 94,
        status: 'NEW',
        detectionMethod: 'Isolation Forest (0.912) + Heuristic Rules Engine',
        firstDetected: new Date(now - 120000).toISOString(),
        lastObserved: new Date(now - 30000).toISOString(),
        affectedEntity: 'ACC-89104-US (Commercial Operating Acc)',
        assignedAnalyst: null,
        transactionId: 'TXN-90218',
        notes: [
          {
            id: 'NOT-1',
            author: 'System SentinelBot',
            authorRole: 'AUTOMATED_AGENT',
            timestamp: new Date(now - 100000).toISOString(),
            text: 'Automated hold placed on outbound SWIFT MT103 message queue due to extreme amount deviation (176x account baseline) and impossible physical velocity.'
          }
        ],
        evidence: [
          'Wire amount $84,500 exceeds 99.7th percentile of account historical baseline ($480).',
          'Geo-location switch from New York to George Town (KY) in 12 minutes (Impossible Velocity > 2,400 km/h).',
          'Beneficiary account matches unverified offshore high-risk entity pattern (ACC-MULE-KY-999).'
        ],
        explanation: {
          summary: 'Critical financial risk detected: single wire transaction amount deviated sharply from standard operational baseline with high-risk offshore destination routing.',
          contributingFactors: [
            {
              feature: 'Transaction Amount vs Historical Baseline',
              impact: 42,
              baseline: '$480 (±$150)',
              observed: '$84,500 (176x typical)',
              description: 'Transaction exceeds 99.7% of historical account baseline volume.'
            },
            {
              feature: 'Geographic Transit Velocity',
              impact: 32,
              baseline: 'New York, US',
              observed: 'George Town, Cayman Islands (2,450 km in 12 min)',
              description: 'Physical transit speed exceeds commercial aviation capabilities.'
            },
            {
              feature: 'Counterparty Risk Score',
              impact: 20,
              baseline: 'Domestic ACH vendor',
              observed: 'Offshore unverified shell entity',
              description: 'Destination flagged in internal high-risk routing database.'
            }
          ],
          rulesTriggered: [
            'RULE_TXN_AMOUNT_DEVIATION [Z=12.4]',
            'RULE_IMPOSSIBLE_TRAVEL_VELOCITY [2450 km/h]',
            'RULE_HIGH_RISK_DESTINATION_ENTITY'
          ],
          recommendations: [
            'Immediate freeze on outbound settlement wire queue.',
            'Direct phone confirmation with designated commercial treasury officer.',
            'Review concurrent SMF and RACF security logs on mainframe authorization server.'
          ],
          isolationForestScore: 0.912
        },
        relatedTransactions: ['TXN-90218', 'TXN-90215'],
        relatedLogs: ['LOG-88102', 'LOG-88098'],
        investigationChecklist: [
          { id: 'CHK-1', task: 'Halt outbound automated wire settlement', completed: true, completedAt: new Date(now - 110000).toISOString(), completedBy: 'SentinelAI Autopilot' },
          { id: 'CHK-2', task: 'Verify treasury officer signature and multi-factor approval', completed: false },
          { id: 'CHK-3', task: 'Analyze concurrent IBM Z RACF session logs for token hijacking', completed: false },
          { id: 'CHK-4', task: 'File FinCEN SAR draft if counterparty cannot be verified', completed: false }
        ]
      },
      {
        id: 'ALT-3090',
        title: 'IBM Z Mainframe RACF Privilege Escalation Attempt',
        category: 'UNAUTHORIZED_ACCESS',
        severity: 'HIGH',
        riskScore: 88,
        status: 'INVESTIGATING',
        detectionMethod: 'SMF Type 80 Real-Time Parser + Behavioral Baseline',
        firstDetected: new Date(now - 300000).toISOString(),
        lastObserved: new Date(now - 120000).toISOString(),
        affectedEntity: 'Mainframe LPAR PRD1 / USER(Z99ADMIN)',
        assignedAnalyst: 'Marcus Vance, CISSP',
        notes: [
          {
            id: 'NOT-2',
            author: 'Marcus Vance, CISSP',
            authorRole: 'ADMINISTRATOR',
            timestamp: new Date(now - 180000).toISOString(),
            text: 'Investigating z/OS console syslog. User Z99ADMIN attempted write access to SYS1.PARMLIB from non-whitelisted terminal. SAF code 08 returned.'
          }
        ],
        evidence: [
          'SMF Type 80 record logged violation for resource SYS1.PARMLIB.',
          'Terminal IP 192.168.1.105 is not an authorized Systems Programmer workstation.',
          'Two failed RACF authentication attempts preceded the dataset access request.'
        ],
        explanation: {
          summary: 'Unauthorized attempt to modify core z/OS system parameters by privileged ID from unexpected network segment.',
          contributingFactors: [
            {
              feature: 'RACF Security Access Failure (SAF RC=08)',
              impact: 50,
              baseline: 'Normal READ-ONLY access to approved datasets',
              observed: 'UPDATE request against SYS1.PARMLIB denied',
              description: 'Critical system parameter library protection triggered RACF violation.'
            },
            {
              feature: 'Source Terminal Network Segment',
              impact: 38,
              baseline: 'Sysprog VLAN 10.200.0.0/24',
              observed: 'General Office VLAN 192.168.1.105',
              description: 'Privileged operations are restricted to dedicated management console jumps.'
            }
          ],
          rulesTriggered: [
            'RULE_ZOS_RACF_VIOLATION_PARMLIB',
            'RULE_MAINFRAME_UNAUTHORIZED_TERMINAL'
          ],
          recommendations: [
            'Immediately suspend RACF user profile Z99ADMIN pending verification.',
            'Inspect TSO/E logon history and active VTAM sessions.',
            'Review SMF Type 83 (security audit) records for the past 6 hours.'
          ],
          isolationForestScore: 0.865
        },
        relatedTransactions: [],
        relatedLogs: ['LOG-88102'],
        investigationChecklist: [
          { id: 'CHK-5', task: 'Revoke RACF credentials for Z99ADMIN', completed: true, completedAt: new Date(now - 150000).toISOString(), completedBy: 'Marcus Vance' },
          { id: 'CHK-6', task: 'Isolate source workstation at switch port', completed: false },
          { id: 'CHK-7', task: 'Engage Systems Programming Incident On-Call', completed: false }
        ]
      },
      {
        id: 'ALT-3089',
        title: 'Distributed SSH / REST Brute-Force Credential Attack',
        category: 'BRUTE_FORCE_LOGIN',
        severity: 'MEDIUM',
        riskScore: 72,
        status: 'RESOLVED',
        detectionMethod: 'Sliding Window Failure Rate Classifier',
        firstDetected: new Date(now - 1200000).toISOString(),
        lastObserved: new Date(now - 600000).toISOString(),
        affectedEntity: 'Edge API Gateway (auth.sentinel.bank)',
        assignedAnalyst: 'Sarah Chen, SecOps',
        notes: [
          {
            id: 'NOT-3',
            author: 'Sarah Chen, SecOps',
            authorRole: 'SECURITY_ANALYST',
            timestamp: new Date(now - 650000).toISOString(),
            text: 'Automated IP drop rule deployed at perimeter firewall for IP range 185.220.101.0/24. 0 successful authentications.'
          }
        ],
        evidence: [
          '48 failed authentication attempts in 60 seconds from TOR exit node IP 185.220.101.5.',
          'Common dictionary usernames targeted (root, admin, svc_api, test).'
        ],
        explanation: {
          summary: 'High-frequency credential stuffing attack detected against edge authentication endpoints.',
          contributingFactors: [
            {
              feature: 'Authentication Failure Rate',
              impact: 60,
              baseline: '< 2 failures/min per IP',
              observed: '48 failures in 60s',
              description: 'Pattern matches automated dictionary attack script.'
            },
            {
              feature: 'IP Threat Intelligence Reputation',
              impact: 40,
              baseline: 'Clean corporate ISP',
              observed: 'Known TOR exit node / anonymizer proxy',
              description: 'Traffic originated from high-risk anonymity network.'
            }
          ],
          rulesTriggered: ['RULE_BRUTE_FORCE_BURST_THRESHOLD', 'RULE_TOR_EXIT_NODE_ORIGIN'],
          recommendations: ['Block origin IP subnet at border ingress.', 'Verify rate limiting policy on auth microservice.'],
          isolationForestScore: 0.742
        },
        relatedTransactions: [],
        relatedLogs: ['LOG-88101'],
        investigationChecklist: [
          { id: 'CHK-8', task: 'Null-route IP subnet at perimeter', completed: true, completedAt: new Date(now - 700000).toISOString(), completedBy: 'Sarah Chen' },
          { id: 'CHK-9', task: 'Confirm no successful token issuances', completed: true, completedAt: new Date(now - 680000).toISOString(), completedBy: 'Sarah Chen' }
        ]
      },
      {
        id: 'ALT-3088',
        title: 'Unusual Bulk Customer PII Data Extraction',
        category: 'DATA_EXFILTRATION',
        severity: 'HIGH',
        riskScore: 78,
        status: 'INVESTIGATING',
        detectionMethod: 'Database Query Baseline Anomaly Detector',
        firstDetected: new Date(now - 900000).toISOString(),
        lastObserved: new Date(now - 800000).toISOString(),
        affectedEntity: 'PostgreSQL Core Cluster / user: dba_readonly',
        assignedAnalyst: 'Marcus Vance, CISSP',
        notes: [
          {
            id: 'NOT-4',
            author: 'Marcus Vance, CISSP',
            authorRole: 'ADMINISTRATOR',
            timestamp: new Date(now - 750000).toISOString(),
            text: 'Examining connection pool logs. dba_readonly ran a non-indexed full table scan without application context headers.'
          }
        ],
        evidence: [
          '145,000 sensitive records extracted in single unpaged session.',
          'Query executed outside scheduled reporting batch window.'
        ],
        explanation: {
          summary: 'Bulk database extraction exceeded standard query volumes by 1,200%, showing indicators of internal data hoarding.',
          contributingFactors: [
            {
              feature: 'Extracted Row Volume',
              impact: 55,
              baseline: '< 500 rows / query',
              observed: '145,000 rows',
              description: 'Massive table dump containing customer identifiers.'
            },
            {
              feature: 'Query Timing',
              impact: 25,
              baseline: 'Business hours ETL window (02:00-04:00)',
              observed: 'Ad-hoc query during peak processing hours',
              description: 'Unexpected unmanaged query execution.'
            }
          ],
          rulesTriggered: ['RULE_BULK_DATABASE_EXTRACTION', 'RULE_PII_TABLE_UNFILTERED_ACCESS'],
          recommendations: ['Terminate active database connection.', 'Audit query log and disk writes.'],
          isolationForestScore: 0.795
        },
        relatedTransactions: [],
        relatedLogs: ['LOG-88098'],
        investigationChecklist: [
          { id: 'CHK-10', task: 'Terminate active database session', completed: true, completedAt: new Date(now - 780000).toISOString(), completedBy: 'Marcus Vance' },
          { id: 'CHK-11', task: 'Check local storage for unencrypted file writes', completed: false }
        ]
      }
    ];

    // 4. Initial Audit Records
    this.auditRecords = [
      {
        id: 'AUD-501',
        timestamp: new Date(now - 150000).toISOString(),
        user: 'marcus_vance',
        role: 'ADMINISTRATOR',
        action: 'REVOKE_RACF_ID',
        target: 'USER(Z99ADMIN)',
        details: 'Emergency credential suspension following ALT-3090 privilege escalation attempt.',
        ipAddress: '10.200.0.45'
      },
      {
        id: 'AUD-502',
        timestamp: new Date(now - 700000).toISOString(),
        user: 'sarah_chen',
        role: 'SECURITY_ANALYST',
        action: 'UPDATE_ALERT_STATUS',
        target: 'ALT-3089',
        details: 'Status changed from INVESTIGATING to RESOLVED with notes and IP mitigation.',
        ipAddress: '10.200.0.52'
      },
      {
        id: 'AUD-503',
        timestamp: new Date(now - 900000).toISOString(),
        user: 'system_autopilot',
        role: 'AUTOMATED_AGENT',
        action: 'BLOCK_TRANSACTION',
        target: 'TXN-90218',
        details: 'Automated hold placed on offshore transfer $84,500 due to risk score 94/100.',
        ipAddress: '127.0.0.1'
      }
    ];
  }

  // Generate synthetic transaction
  generateSyntheticTransaction(): Transaction {
    const isAnomaly = Math.random() < 0.22; // 22% chance of suspicious transaction for demo vitality
    const id = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const accounts = ['ACC-89104-US', 'ACC-52019-DE', 'ACC-31405-SG', 'ZOS-CICS-BATCH', 'ACC-77402-JP'];
    const destAccounts = isAnomaly
      ? ['ACC-MULE-KY-999', 'ACC-SHELL-CH-88', 'ACC-OFFSHORE-007', 'ACC-UNKNOWN-MULE']
      : ['ACC-10294-US', 'ACC-33104-EU', 'ACC-55190-SG', 'ACC-88120-JP', 'ACC-66124-US'];

    const src = accounts[Math.floor(Math.random() * accounts.length)];
    const dest = destAccounts[Math.floor(Math.random() * destAccounts.length)];
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const types: any[] = ['WIRE_TRANSFER', 'ACH_TRANSFER', 'CREDIT_PAYMENT', 'API_PAYMENT', 'MAINFRAME_BATCH', 'ATM_WITHDRAWAL'];
    const type = types[Math.floor(Math.random() * types.length)];

    let amount = Math.floor(50 + Math.random() * 950);
    if (isAnomaly) {
      amount = Math.floor(15000 + Math.random() * 95000);
    }

    const timestamp = new Date().toISOString();
    const evaluated = evaluateTransactionRisk({
      amount,
      sourceAccount: src,
      destinationAccount: dest,
      transactionType: type,
      sourceIp: `${Math.floor(Math.random() * 200 + 20)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      location: city,
      timestamp
    });

    const txn: Transaction = {
      id,
      timestamp,
      sourceAccount: src,
      destinationAccount: dest,
      amount,
      currency: 'USD',
      sourceIp: `${Math.floor(Math.random() * 200 + 20)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      location: city,
      transactionType: type,
      status: evaluated.status,
      riskScore: evaluated.riskScore,
      riskLevel: evaluated.riskLevel,
      detectionMethod: evaluated.detectionMethod,
      isSimulated: true,
      explanation: evaluated.explanation,
      relatedEvents: [`EVENT-${id.replace('TXN-', '')}`]
    };

    this.transactions.unshift(txn);
    if (this.transactions.length > 200) {
      this.transactions.pop();
    }

    // If critical or high risk, spawn an alert!
    if (evaluated.riskScore >= 75) {
      const alertId = `ALT-${Math.floor(3100 + Math.random() * 6900)}`;
      const newAlert: Alert = {
        id: alertId,
        title: `Anomaly Detected: High-Risk ${type.replace('_', ' ')} (${dest})`,
        category: 'SUSPICIOUS_FINANCIAL',
        severity: evaluated.riskLevel,
        riskScore: evaluated.riskScore,
        status: 'NEW',
        detectionMethod: evaluated.detectionMethod,
        firstDetected: timestamp,
        lastObserved: timestamp,
        affectedEntity: `${src} → ${dest}`,
        assignedAnalyst: null,
        transactionId: id,
        notes: [
          {
            id: `NOT-${Date.now()}`,
            author: 'SentinelAI Core Engine',
            authorRole: 'AUTOMATED_AGENT',
            timestamp,
            text: `Automated alert triggered from simulated transaction stream. Isolation score: ${evaluated.explanation.isolationForestScore}. Status: ${evaluated.status}`
          }
        ],
        evidence: [
          `Transaction amount $${amount.toLocaleString()} flagged with risk score ${evaluated.riskScore}/100.`,
          ...evaluated.explanation.rulesTriggered.map(r => `Rule triggered: ${r}`)
        ],
        explanation: evaluated.explanation,
        relatedTransactions: [id],
        relatedLogs: [],
        investigationChecklist: [
          { id: `CHK-${Date.now()}-1`, task: 'Review beneficiary entity registration', completed: false },
          { id: `CHK-${Date.now()}-2`, task: 'Confirm authorized channel MFA challenge', completed: false },
          { id: `CHK-${Date.now()}-3`, task: 'Execute risk review disposition', completed: false }
        ]
      };
      this.alerts.unshift(newAlert);
      if (this.alerts.length > 50) {
        this.alerts.pop();
      }
    }

    return txn;
  }

  // Trigger Multi-Stage Realistic Cyber Attack Scenario
  triggerScenario(): { step: string; message: string; alertId?: string }[] {
    const results: { step: string; message: string; alertId?: string }[] = [];
    const now = Date.now();

    // Step 1: Reconnaissance Port Scan
    const log1: SecurityLog = {
      id: `LOG-SCN-${Date.now()}-1`,
      timestamp: new Date(now).toISOString(),
      source: 'FIREWALL',
      level: 'WARN',
      event: 'TCP SYN Stealth Port Scan detected across ports 21, 22, 443, 1433, 50000',
      user: 'unknown_scanner',
      ip: '198.51.100.44',
      location: 'Frankfurt, Germany',
      details: 'Sequential port sweep of external facing mainframe connector proxies.',
      isSuspicious: true,
      riskScore: 65
    };
    this.logs.unshift(log1);
    results.push({ step: 'Phase 1: Reconnaissance', message: 'Perimeter port scan detected from IP 198.51.100.44' });

    // Step 2: Credential Stuffing & RACF violation
    const log2: SecurityLog = {
      id: `LOG-SCN-${Date.now()}-2`,
      timestamp: new Date(now + 2000).toISOString(),
      source: 'RACF_SAF',
      level: 'CRITICAL',
      event: 'RACF ICH408I USER(APPLSERV) INSUFFICIENT ACCESS AUTHORITY TO APF.AUTH.LOADLIB',
      user: 'APPLSERV',
      ip: '198.51.100.44',
      location: 'Mainframe LPAR PRD1',
      details: 'Compromised service account attempted to load unauthorized binary into APF library.',
      isSuspicious: true,
      riskScore: 95,
      smfRecordType: 'SMF Type 80 (RACF Processing)'
    };
    this.logs.unshift(log2);
    results.push({ step: 'Phase 2: Privilege Escalation', message: 'IBM Z RACF SAF violation on APF authorized library' });

    // Step 3: High Value Wire Transfer
    const txn = this.generateSyntheticTransaction();
    txn.amount = 145000;
    txn.sourceAccount = 'ACC-89104-US';
    txn.destinationAccount = 'ACC-MULE-KY-999';
    txn.status = 'BLOCKED';
    txn.riskScore = 98;
    txn.riskLevel = 'CRITICAL';
    txn.explanation.summary = 'SIMULATED SCENARIO: Multi-stage cyber heist intercepted. Credential abuse followed by $145,000 illicit offshore transfer attempt.';
    txn.explanation.rulesTriggered.push('RULE_APT_MULTI_STAGE_HEIST');
    txn.explanation.contributingFactors.unshift({
      feature: 'Preceding Security Log Violations',
      impact: 45,
      baseline: 'Zero RACF/SAF security violations in past 24 hours',
      observed: 'CRITICAL RACF violation 12 seconds prior to wire creation',
      description: 'Temporal correlation proves automated account takeover exploitation.'
    });

    const alertId = `ALT-SCN-${Math.floor(1000 + Math.random() * 9000)}`;
    const scenarioAlert: Alert = {
      id: alertId,
      title: 'CRITICAL: Multi-Stage Cyber Heist Intercepted (IBM Z Correlation)',
      category: 'ACCOUNT_COMPROMISE',
      severity: 'CRITICAL',
      riskScore: 98,
      status: 'NEW',
      detectionMethod: 'Hybrid Isolation Forest (0.985) + Multi-Log SMF Correlator',
      firstDetected: new Date().toISOString(),
      lastObserved: new Date().toISOString(),
      affectedEntity: 'ACC-89104-US & Mainframe APPLSERV',
      assignedAnalyst: null,
      transactionId: txn.id,
      notes: [
        {
          id: `NOT-${Date.now()}`,
          author: 'SentinelAI Correlation Engine',
          authorRole: 'AUTOMATED_AGENT',
          timestamp: new Date().toISOString(),
          text: 'Correlated event sequence: Port Scan (Firewall) -> RACF APF Security Violation (SMF Type 80) -> $145,000 offshore wire attempt. Immediate containment initiated.'
        }
      ],
      evidence: [
        'Correlated SMF Type 80 RACF security violation on LPAR PRD1.',
        'Wire transfer $145,000 initiated from blacklisted IP origin 198.51.100.44.',
        'Zero-trust policy automatically blocked transfer from reaching SWIFT gateway.'
      ],
      explanation: txn.explanation,
      relatedTransactions: [txn.id],
      relatedLogs: [log1.id, log2.id],
      investigationChecklist: [
        { id: 'CHK-SCN-1', task: 'Enforce immediate zero-trust perimeter block on IP 198.51.100.44', completed: true, completedAt: new Date().toISOString(), completedBy: 'Autopilot' },
        { id: 'CHK-SCN-2', task: 'Revoke and rotate APPLSERV z/OS RACF certificate & keys', completed: false },
        { id: 'CHK-SCN-3', task: 'Notify Chief Information Security Officer (CISO) and Treasury Team', completed: false },
        { id: 'CHK-SCN-4', task: 'Preserve SMF type 80, 83, and 110 records for forensic chain of custody', completed: false }
      ]
    };

    this.alerts.unshift(scenarioAlert);
    this.lastScenarioRunTime = new Date().toISOString();
    results.push({ step: 'Phase 3: Wire Exfiltration Blocked', message: `Transfer ${txn.id} ($145,000) automatically BLOCKED`, alertId });

    return results;
  }

  getDashboardSummary(): DashboardSummary {
    const totalTransactions = this.transactions.length;
    const suspiciousTransactions = this.transactions.filter(t => t.riskScore >= 65).length;
    const threatDetectionRate = totalTransactions > 0
      ? Number(((suspiciousTransactions / totalTransactions) * 100).toFixed(1))
      : 0;

    const criticalCount = this.alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
    let systemSecurityStatus: 'SECURE' | 'ELEVATED' | 'HIGH_ALERT' | 'COMPROMISED' = 'SECURE';
    if (criticalCount >= 2) {
      systemSecurityStatus = 'HIGH_ALERT';
    } else if (criticalCount === 1) {
      systemSecurityStatus = 'ELEVATED';
    }

    const countsBySeverity = {
      low: this.alerts.filter(a => a.severity === 'LOW').length,
      medium: this.alerts.filter(a => a.severity === 'MEDIUM').length,
      high: this.alerts.filter(a => a.severity === 'HIGH').length,
      critical: this.alerts.filter(a => a.severity === 'CRITICAL').length
    };

    const countsByStatus = {
      new: this.alerts.filter(a => a.status === 'NEW').length,
      investigating: this.alerts.filter(a => a.status === 'INVESTIGATING').length,
      resolved: this.alerts.filter(a => a.status === 'RESOLVED').length,
      falsePositive: this.alerts.filter(a => a.status === 'FALSE_POSITIVE').length
    };

    const categories: any[] = [
      { category: 'SUSPICIOUS_FINANCIAL', label: 'Suspicious Financial Activity' },
      { category: 'BRUTE_FORCE_LOGIN', label: 'Brute-Force & Credential Attacks' },
      { category: 'UNAUTHORIZED_ACCESS', label: 'Unauthorized Access / Privilege Escalation' },
      { category: 'ACCOUNT_COMPROMISE', label: 'Account Compromise Indicators' },
      { category: 'UNUSUAL_SYSTEM_ACTIVITY', label: 'Unusual Mainframe / System Activity' },
      { category: 'DATA_EXFILTRATION', label: 'Potential Data Exfiltration' }
    ];

    const threatsByCategory = categories.map(c => ({
      category: c.category,
      label: c.label,
      count: this.alerts.filter(a => a.category === c.category).length
    }));

    // Trends over 6 time windows
    const now = Date.now();
    const activityTrends = [
      { time: '15m ago', transactions: 42, anomalies: 3, avgRisk: 24 },
      { time: '12m ago', transactions: 58, anomalies: 5, avgRisk: 31 },
      { time: '9m ago', transactions: 74, anomalies: 4, avgRisk: 28 },
      { time: '6m ago', transactions: 63, anomalies: 6, avgRisk: 37 },
      { time: '3m ago', transactions: 89, anomalies: 9, avgRisk: 48 },
      { time: 'Current', transactions: Math.max(30, this.transactions.length), anomalies: suspiciousTransactions, avgRisk: Math.round(this.transactions.reduce((acc, t) => acc + t.riskScore, 0) / (this.transactions.length || 1)) }
    ];

    return {
      totalTransactions,
      suspiciousTransactions,
      threatDetectionRate,
      systemSecurityStatus,
      countsBySeverity,
      countsByStatus,
      threatsByCategory,
      recentAlerts: this.alerts.slice(0, 5),
      recentTransactions: this.transactions.slice(0, 8),
      activityTrends,
      lastUpdated: new Date().toISOString(),
      simulationActive: this.simulationActive,
      activeModel: {
        name: 'Sentinel-IsoForest-Z1',
        version: 'v3.4.1',
        algorithm: 'Isolation Forest (150 Estimators) + SMF Correlator',
        evaluatedSampleCount: 125000,
        aucRocSynthetic: 0.964,
        latencyMs: 14.2
      }
    };
  }

  updateAlert(id: string, updates: {
    status?: any;
    assignedAnalyst?: string | null;
    noteText?: string;
    completedChecklistId?: string;
  }): Alert | null {
    const alert = this.alerts.find(a => a.id === id);
    if (!alert) return null;

    if (updates.status) {
      alert.status = updates.status;
      this.auditRecords.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: CURRENT_USER.username,
        role: CURRENT_USER.role,
        action: 'UPDATE_ALERT_STATUS',
        target: alert.id,
        details: `Alert status updated to ${updates.status}`,
        ipAddress: '10.200.0.45'
      });
    }

    if (updates.assignedAnalyst !== undefined) {
      alert.assignedAnalyst = updates.assignedAnalyst;
      this.auditRecords.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: CURRENT_USER.username,
        role: CURRENT_USER.role,
        action: 'ASSIGN_ANALYST',
        target: alert.id,
        details: `Assigned analyst set to ${updates.assignedAnalyst || 'Unassigned'}`,
        ipAddress: '10.200.0.45'
      });
    }

    if (updates.noteText && updates.noteText.trim()) {
      alert.notes.unshift({
        id: `NOT-${Date.now()}`,
        author: CURRENT_USER.name,
        authorRole: CURRENT_USER.role,
        timestamp: new Date().toISOString(),
        text: updates.noteText.trim()
      });
    }

    if (updates.completedChecklistId) {
      const item = alert.investigationChecklist.find(c => c.id === updates.completedChecklistId);
      if (item) {
        item.completed = !item.completed;
        item.completedAt = item.completed ? new Date().toISOString() : undefined;
        item.completedBy = item.completed ? CURRENT_USER.name : undefined;
      }
    }

    return alert;
  }
}

export const globalStore = new SentinelStore();
