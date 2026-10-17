export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
export type ThreatCategory = 
  | 'SUSPICIOUS_FINANCIAL'
  | 'BRUTE_FORCE_LOGIN'
  | 'UNAUTHORIZED_ACCESS'
  | 'ACCOUNT_COMPROMISE'
  | 'UNUSUAL_SYSTEM_ACTIVITY'
  | 'DATA_EXFILTRATION';

export type TransactionType = 
  | 'WIRE_TRANSFER'
  | 'CREDIT_PAYMENT'
  | 'ACH_TRANSFER'
  | 'ATM_WITHDRAWAL'
  | 'API_PAYMENT'
  | 'MAINFRAME_BATCH';

export type TransactionStatus = 'COMPLETED' | 'FLAGGED' | 'BLOCKED' | 'PENDING_REVIEW';

export interface LocationInfo {
  city: string;
  country: string;
  lat: number;
  lng: number;
  region: string;
}

export interface ContributingFactor {
  feature: string;
  impact: number; // percentage 0-100
  baseline: string;
  observed: string;
  description: string;
}

export interface ExplainableEvidence {
  summary: string;
  contributingFactors: ContributingFactor[];
  rulesTriggered: string[];
  recommendations: string[];
  isolationForestScore?: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  currency: string;
  sourceIp: string;
  location: LocationInfo;
  transactionType: TransactionType;
  status: TransactionStatus;
  riskScore: number;
  riskLevel: Severity;
  detectionMethod: string;
  isSimulated: boolean;
  explanation: ExplainableEvidence;
  relatedEvents?: string[];
}

export interface InvestigationNote {
  id: string;
  author: string;
  authorRole: string;
  timestamp: string;
  text: string;
}

export interface Alert {
  id: string;
  title: string;
  category: ThreatCategory;
  severity: Severity;
  riskScore: number;
  status: AlertStatus;
  detectionMethod: string;
  firstDetected: string;
  lastObserved: string;
  affectedEntity: string;
  assignedAnalyst: string | null;
  transactionId?: string;
  notes: InvestigationNote[];
  evidence: string[];
  explanation: ExplainableEvidence;
  relatedTransactions: string[];
  relatedLogs: string[];
  investigationChecklist: {
    id: string;
    task: string;
    completed: boolean;
    completedAt?: string;
    completedBy?: string;
  }[];
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  source: 'RACF_SAF' | 'ZOS_SMF' | 'LINUX_AUTH' | 'API_GATEWAY' | 'DATABASE_CORE' | 'FIREWALL';
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  event: string;
  user: string;
  ip: string;
  location: string;
  details: string;
  isSuspicious: boolean;
  riskScore: number;
  smfRecordType?: string; // e.g. SMF Type 80 (RACF Processing), SMF Type 110 (CICS)
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  target: string;
  details: string;
  ipAddress: string;
}

export interface DashboardSummary {
  totalTransactions: number;
  suspiciousTransactions: number;
  threatDetectionRate: number;
  systemSecurityStatus: 'SECURE' | 'ELEVATED' | 'HIGH_ALERT' | 'COMPROMISED';
  countsBySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  countsByStatus: {
    new: number;
    investigating: number;
    resolved: number;
    falsePositive: number;
  };
  threatsByCategory: {
    category: ThreatCategory;
    label: string;
    count: number;
  }[];
  recentAlerts: Alert[];
  recentTransactions: Transaction[];
  activityTrends: {
    time: string;
    transactions: number;
    anomalies: number;
    avgRisk: number;
  }[];
  lastUpdated: string;
  simulationActive: boolean;
  activeModel: {
    name: string;
    version: string;
    algorithm: string;
    evaluatedSampleCount: number;
    aucRocSynthetic: number;
    latencyMs: number;
  };
}

export interface UserSession {
  username: string;
  name: string;
  role: 'ADMINISTRATOR' | 'SECURITY_ANALYST';
  avatar: string;
  lastLogin: string;
}
