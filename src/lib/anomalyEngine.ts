import {
  Transaction,
  ExplainableEvidence,
  ContributingFactor,
  Severity,
  TransactionType,
  LocationInfo
} from '../types/index.ts';

// Account baseline memory to track velocity, geo-movement, and historical averages
export interface AccountProfile {
  accountNumber: string;
  historicalAvgAmount: number;
  historicalStdDev: number;
  lastTxnTime: number; // ms timestamp
  lastLocation: LocationInfo;
  recentTxnCountWindow: number; // count in last 15 min
}

export const KNOWN_ACCOUNT_PROFILES: Record<string, AccountProfile> = {
  'ACC-89104-US': {
    accountNumber: 'ACC-89104-US',
    historicalAvgAmount: 480,
    historicalStdDev: 150,
    lastTxnTime: Date.now() - 3600000,
    lastLocation: { city: 'New York', country: 'United States', lat: 40.7128, lng: -74.006, region: 'North America' },
    recentTxnCountWindow: 1,
  },
  'ACC-52019-DE': {
    accountNumber: 'ACC-52019-DE',
    historicalAvgAmount: 850,
    historicalStdDev: 220,
    lastTxnTime: Date.now() - 7200000,
    lastLocation: { city: 'Frankfurt', country: 'Germany', lat: 50.1109, lng: 8.6821, region: 'Europe' },
    recentTxnCountWindow: 2,
  },
  'ACC-31405-SG': {
    accountNumber: 'ACC-31405-SG',
    historicalAvgAmount: 1200,
    historicalStdDev: 400,
    lastTxnTime: Date.now() - 5400000,
    lastLocation: { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, region: 'Asia Pacific' },
    recentTxnCountWindow: 1,
  },
  'ZOS-CICS-BATCH': {
    accountNumber: 'ZOS-CICS-BATCH',
    historicalAvgAmount: 15000,
    historicalStdDev: 3000,
    lastTxnTime: Date.now() - 1800000,
    lastLocation: { city: 'Poughkeepsie', country: 'United States', lat: 41.7004, lng: -73.921, region: 'IBM Z Sysplex' },
    recentTxnCountWindow: 12,
  }
};

// Calculate Haversine distance in kilometers between two geo-coordinates
export function calculateGeoDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Isolation Forest Path Length calculation approximation
// In a tree ensemble, anomalous points have significantly shorter path lengths to isolation
function computeIsolationForestScore(features: {
  amountZScore: number;
  velocityScore: number;
  geoSpeedKmh: number;
  isOffHours: boolean;
  isHighRiskDest: boolean;
}): number {
  // Normalize individual components
  const normZ = Math.min(features.amountZScore / 5, 1.0);
  const normVel = Math.min(features.velocityScore / 8, 1.0);
  const normGeo = Math.min(features.geoSpeedKmh / 900, 1.0); // 900 km/h is max commercial aircraft speed
  const normOff = features.isOffHours ? 0.35 : 0.0;
  const normDest = features.isHighRiskDest ? 0.45 : 0.0;

  // Composite anomaly feature vector norm
  const weightedSum = (normZ * 0.35) + (normVel * 0.25) + (normGeo * 0.25) + (normOff * 0.05) + (normDest * 0.10);
  
  // Exponential scaling modeled on isolation tree average depth (h(x) / c(n))
  const isolationScore = Math.min(Math.max(weightedSum * 1.15, 0.02), 0.99);
  return Number(isolationScore.toFixed(3));
}

export function evaluateTransactionRisk(params: {
  amount: number;
  sourceAccount: string;
  destinationAccount: string;
  transactionType: TransactionType;
  sourceIp: string;
  location: LocationInfo;
  timestamp: string;
}): {
  riskScore: number;
  riskLevel: Severity;
  detectionMethod: string;
  explanation: ExplainableEvidence;
  status: 'COMPLETED' | 'FLAGGED' | 'BLOCKED' | 'PENDING_REVIEW';
} {
  const profile = KNOWN_ACCOUNT_PROFILES[params.sourceAccount] || {
    accountNumber: params.sourceAccount,
    historicalAvgAmount: 500,
    historicalStdDev: 200,
    lastTxnTime: Date.now() - 3600000,
    lastLocation: params.location,
    recentTxnCountWindow: 1,
  };

  const txnTimeMs = new Date(params.timestamp).getTime() || Date.now();
  const hours = new Date(txnTimeMs).getHours();
  const isOffHours = hours >= 1 && hours <= 4; // 1 AM to 4 AM

  // 1. Amount Z-Score
  const amountDiff = params.amount - profile.historicalAvgAmount;
  const zScore = Math.max(0, amountDiff / (profile.historicalStdDev || 1));

  // 2. Velocity Score (burst transactions)
  const timeDeltaHours = Math.max(0.01, (txnTimeMs - profile.lastTxnTime) / 3600000);
  const velocityScore = profile.recentTxnCountWindow;

  // 3. Geo-Velocity (Impossible Travel)
  const distanceKm = calculateGeoDistanceKm(
    profile.lastLocation.lat,
    profile.lastLocation.lng,
    params.location.lat,
    params.location.lng
  );
  const travelSpeedKmh = distanceKm / timeDeltaHours;

  // 4. Destination Risk Flagging
  const isHighRiskDest = 
    params.destinationAccount.includes('-KY') || 
    params.destinationAccount.includes('-CH') || 
    params.destinationAccount.includes('MULE') ||
    params.destinationAccount.includes('SHELL') ||
    params.destinationAccount.endsWith('999');

  // Compute Isolation Forest score
  const isoScore = computeIsolationForestScore({
    amountZScore: zScore,
    velocityScore,
    geoSpeedKmh: travelSpeedKmh,
    isOffHours,
    isHighRiskDest
  });

  // Collect contributing factors for Explainable AI
  const factors: ContributingFactor[] = [];
  const rulesTriggered: string[] = [];
  let baseScore = isoScore * 60; // 0-60 points from ML model

  // Rule 1: Extreme Amount Spike
  if (zScore > 3.0 || params.amount > profile.historicalAvgAmount * 5) {
    const impact = Math.min(38, Math.round(zScore * 8));
    baseScore += impact;
    rulesTriggered.push(`RULE_TXN_AMOUNT_DEVIATION [Z=${zScore.toFixed(2)}]`);
    factors.push({
      feature: 'Transaction Amount vs Historical Baseline',
      impact,
      baseline: `$${profile.historicalAvgAmount.toLocaleString()} (±$${profile.historicalStdDev})`,
      observed: `$${params.amount.toLocaleString()} (${(params.amount / profile.historicalAvgAmount).toFixed(1)}x typical)`,
      description: 'Transaction exceeds 99.7% of historical account baseline volume.'
    });
  }

  // Rule 2: Impossible Geo-Travel Speed
  if (travelSpeedKmh > 800 && distanceKm > 1000) {
    const impact = 30;
    baseScore += impact;
    rulesTriggered.push(`RULE_IMPOSSIBLE_TRAVEL_VELOCITY [${Math.round(travelSpeedKmh)} km/h]`);
    factors.push({
      feature: 'Geographic Displacement Velocity',
      impact,
      baseline: `${profile.lastLocation.city}, ${profile.lastLocation.country}`,
      observed: `${params.location.city}, ${params.location.country} (${Math.round(distanceKm)} km in ${(timeDeltaHours * 60).toFixed(0)} min)`,
      description: `Travel velocity of ${Math.round(travelSpeedKmh)} km/h exceeds commercial aircraft thresholds (max 850 km/h).`
    });
  }

  // Rule 3: Velocity Surge / Burst Processing
  if (velocityScore >= 5) {
    const impact = 18;
    baseScore += impact;
    rulesTriggered.push(`RULE_HIGH_FREQUENCY_BURST [${velocityScore} txns / 15m]`);
    factors.push({
      feature: 'Rapid Transaction Burst Frequency',
      impact,
      baseline: '≤ 2 transactions / 15 minutes',
      observed: `${velocityScore} transactions / 15 minutes`,
      description: 'Abnormal burst frequency indicates potential automated credential script or rapid fund drainage.'
    });
  }

  // Rule 4: Offshore High-Risk Destination
  if (isHighRiskDest) {
    const impact = 15;
    baseScore += impact;
    rulesTriggered.push('RULE_HIGH_RISK_DESTINATION_ENTITY');
    factors.push({
      feature: 'Counterparty Account Risk Profile',
      impact,
      baseline: 'Domestic verified counterparty',
      observed: `Unregistered offshore entity (${params.destinationAccount})`,
      description: 'Destination account matches known laundering transit hub or unverified correspondent routing.'
    });
  }

  // Rule 5: Off-hours execution
  if (isOffHours && params.amount > 2000) {
    const impact = 10;
    baseScore += impact;
    rulesTriggered.push('RULE_OFF_HOURS_EXECUTION');
    factors.push({
      feature: 'Temporal Execution Window',
      impact,
      baseline: '08:00 - 20:00 local business hours',
      observed: `${hours.toString().padStart(2, '0')}:${new Date(txnTimeMs).getMinutes().toString().padStart(2, '0')} local time`,
      description: 'High-value transaction initiated during dormant nighttime maintenance window.'
    });
  }

  // Final risk score clamping
  const finalRiskScore = Math.min(100, Math.max(4, Math.round(baseScore)));

  // Determine Severity and Status
  let riskLevel: Severity = 'LOW';
  let status: 'COMPLETED' | 'FLAGGED' | 'BLOCKED' | 'PENDING_REVIEW' = 'COMPLETED';

  if (finalRiskScore >= 80) {
    riskLevel = 'CRITICAL';
    status = 'BLOCKED';
  } else if (finalRiskScore >= 65) {
    riskLevel = 'HIGH';
    status = 'FLAGGED';
  } else if (finalRiskScore >= 35) {
    riskLevel = 'MEDIUM';
    status = 'PENDING_REVIEW';
  } else {
    riskLevel = 'LOW';
    status = 'COMPLETED';
  }

  // Generate automated analyst actionable checklist
  const recommendations: string[] = [];
  if (finalRiskScore >= 65) {
    recommendations.push('Immediate hold placed on outbound correspondent settlement queue.');
    recommendations.push('Trigger out-of-band biometric/SMS step-up authentication challenge to registered account holder.');
    recommendations.push('Cross-reference destination account against OFAC and FinCEN suspicious entity lists.');
    recommendations.push('Inspect concurrent RACF/SMF system session logs for credential reuse or privilege escalation.');
  } else if (finalRiskScore >= 35) {
    recommendations.push('Flag transaction for tier-1 security analyst queue inspection.');
    recommendations.push('Monitor subsequent counterparty activity for next 24 hours.');
  } else {
    recommendations.push('Standard straight-through transaction processing approved.');
  }

  const detectionMethod = rulesTriggered.length > 0
    ? `Isolation Forest (Score ${isoScore}) + Rules Engine (${rulesTriggered.length} rules hit)`
    : `Isolation Forest Baseline (Score ${isoScore})`;

  // Build plain-language Explainable AI summary
  let summary = '';
  if (finalRiskScore >= 65) {
    summary = `High-risk transaction detected: amount of $${params.amount.toLocaleString()} is ${factors[0]?.observed || 'unusually elevated'}, `;
    if (travelSpeedKmh > 800) {
      summary += `with impossible geographical transit between ${profile.lastLocation.city} and ${params.location.city}, `;
    }
    summary += `triggering ${rulesTriggered.length} risk policy heuristics.`;
  } else if (finalRiskScore >= 35) {
    summary = `Moderate deviation detected from baseline activity profile. Behavioral features warrant secondary analyst verification.`;
  } else {
    summary = `Transaction conforms to historical account behavior parameters and normal geographical velocity bounds.`;
  }

  // Update profile
  profile.lastLocation = params.location;
  profile.lastTxnTime = txnTimeMs;
  profile.recentTxnCountWindow = Math.min(15, profile.recentTxnCountWindow + 1);

  return {
    riskScore: finalRiskScore,
    riskLevel,
    detectionMethod,
    status,
    explanation: {
      summary,
      contributingFactors: factors,
      rulesTriggered,
      recommendations,
      isolationForestScore: isoScore
    }
  };
}
