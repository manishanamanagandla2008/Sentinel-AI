import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  ArrowDown,
  ShieldCheck,
  Lock,
  Database,
  Terminal,
  FileCode2,
  Sparkles,
  ExternalLink,
  Info,
  Server,
  Zap,
  Activity,
  CheckCircle2
} from 'lucide-react';

export const IbmZModuleView: React.FC = () => {
  const [selectedSubsystem, setSelectedSubsystem] = useState<'telum' | 'cpacf' | 'hsm' | 'pervasive'>('telum');

  const subsystems = {
    telum: {
      name: 'IBM Telum / Telum II On-Chip AI Processor',
      badge: '32 TOPS On-Chip AI Inference',
      status: 'OPERATIONAL · ZERO LATENCY',
      desc: 'Dedicated on-chip neural processing unit directly connected to the memory cache, enabling transaction fraud scoring at wire speed (< 1ms per scoring) without sending data over external network links.',
      specs: [
        { label: 'Clock Frequency', val: '5.2 GHz' },
        { label: 'Inference Capacity', val: '300 Billion inferences/day' },
        { label: 'Cache Coherency', val: '32MB L2 per core, 256MB virtual L3' }
      ]
    },
    cpacf: {
      name: 'CPACF (Central Processor Assist for Crypto)',
      badge: 'Hardware Wire-Speed Encryption',
      status: 'ACTIVE · 100% COVERAGE',
      desc: 'Hardware instructions embedded directly into each z/Architecture execution unit. Accelerates AES-256-GCM, SHA-512, and cryptographic hashing at memory speed without consuming standard CP cycles.',
      specs: [
        { label: 'Throughput', val: '128 GB/s crypto bandwidth' },
        { label: 'Supported Ciphers', val: 'AES-128/192/256, SHA3, GHASH' },
        { label: 'Protected Key Mode', val: 'Hardware master key isolation' }
      ]
    },
    hsm: {
      name: 'Crypto Express8S (FIPS 140-3 Level 4 HSM)',
      badge: 'Post-Quantum Safe Cryptography',
      status: 'QUANTUM-SAFE ENCRYPTED',
      desc: 'Tamper-responsive PCIe cryptographic coprocessor executing quantum-safe algorithms (CRYSTALS-Dilithium & Kyber) alongside classic RSA-4096 and ECDSA for master key custody and zero-trust root of trust.',
      specs: [
        { label: 'Tamper Response', val: 'Zeroizes keys in < 5 nanoseconds' },
        { label: 'Certification', val: 'FIPS 140-3 Level 4 Physical' },
        { label: 'Quantum Readiness', val: 'NIST PQC Standards Implemented' }
      ]
    },
    pervasive: {
      name: 'z/OS Pervasive Encryption Architecture',
      badge: 'Policy-Based Data Set Encryption',
      status: 'PROTECTING ALL DATASETS',
      desc: 'Enterprise-wide encryption policy securing datasets, coupling facilities, and z/OS logs in flight and at rest without requiring application code changes or database schema modifications.',
      specs: [
        { label: 'Data Set Types', val: 'VSAM, Sequential, zFS, coupling' },
        { label: 'Key Governance', val: 'Integrated Cryptographic Service Facility (ICSF)' },
        { label: 'Auditing', val: 'SMF Type 83 Security Records' }
      ]
    }
  };

  const current = subsystems[selectedSubsystem];

  return (
    <div className="space-y-6 font-mono">
      {/* Disclaimer Banner */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <div>
          <span className="font-bold text-cyan-300">IBM Z INTEGRATION BLUEPRINT:</span> The architecture below demonstrates how SentinelAI connects with IBM z/OS environments via SMF log streams, IBM Common Data Provider (CDP), and watsonx APIs. Simulated testbed data is used for the IBM Z Datathon evaluation.
        </div>
      </div>

      {/* Hero Module Overview */}
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 space-y-2 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs text-cyan-400">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>ENTERPRISE MAINFRAME CYBER RESILIENCE SPECIFICATION</span>
        </div>
        <h1 className="text-xl lg:text-3xl font-bold text-white tracking-tight">
          IBM Z Mainframe Threat Detection Architecture
        </h1>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          IBM z16 mainframes process over 70% of global commercial banking transactions. SentinelAI bridges the gap between mission-critical z/OS transaction subsystems (CICS, IMS, DB2) and modern enterprise Security Operations Centers (SOC) using real-time anomaly detection.
        </p>
      </div>

      {/* Innovative Interactive IBM z16 Hardware Hologram Explorer */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">
              IBM z16 Hardware & Security Subsystem Matrix
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Select component to inspect hardware telemetry:</span>
        </div>

        {/* Subsystem Selectors */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(['telum', 'cpacf', 'hsm', 'pervasive'] as const).map(key => {
            const isSelected = selectedSubsystem === key;
            const item = subsystems[key];
            return (
              <button
                key={key}
                onClick={() => setSelectedSubsystem(key)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="text-[10px] text-cyan-400 font-bold uppercase">{key}</div>
                <div className="text-xs font-bold text-white truncate mt-0.5">{item.name.split('(')[0]}</div>
                <div className="text-[10px] text-emerald-400 truncate mt-1">✓ {item.status.split('·')[0]}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Hardware Details Display */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-cyan-300">{current.name}</h3>
              <p className="text-[11px] text-slate-400">{current.badge}</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold self-start sm:self-center">
              {current.status}
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            {current.desc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            {current.specs.map((spec, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{spec.label}</span>
                <span className="text-xs font-bold text-white font-mono mt-0.5 block">{spec.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Architecture Flow Diagram */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>SentinelAI End-to-End Ingestion & Detection Pipeline</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Architectural data flow from z/OS Sysplex to SecOps Analyst</p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            Pipeline v3.4-Z
          </span>
        </div>

        {/* Vertical Pipeline Flow Blocks */}
        <div className="flex flex-col items-center max-w-2xl mx-auto space-y-2 text-xs">
          {/* Step 1 */}
          <div className="w-full p-3.5 rounded-xl bg-slate-950 border border-blue-800/80 shadow-md">
            <div className="flex items-center justify-between font-bold text-cyan-300 mb-1">
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>1. Transaction and System Logs</span>
              </span>
              <span className="text-[10px] text-slate-400">SOURCE TIER</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Captures high-volume z/OS SMF records (Type 80 RACF, 83 Security, 110 CICS, 101 DB2), Linux on IBM Z audit logs, and ISO 8583 banking wire payments.
            </p>
          </div>

          <ArrowDown className="w-4 h-4 text-cyan-400 animate-bounce" />

          {/* Step 2 */}
          <div className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
              <span className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>2. Data Ingestion Layer</span>
              </span>
              <span className="text-[10px] text-slate-400">STREAMING</span>
            </div>
            <p className="text-[11px] text-slate-400">
              IBM Common Data Provider (CDP) for z Systems or Apache Kafka streaming cluster with TLS 1.3 mutual authentication.
            </p>
          </div>

          <ArrowDown className="w-4 h-4 text-cyan-400" />

          {/* Step 3 */}
          <div className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
              <span className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-cyan-400" />
                <span>3. Data Validation and Normalization</span>
              </span>
              <span className="text-[10px] text-slate-400">NORMALIZATION</span>
            </div>
            <p className="text-[11px] text-slate-400">
              EBCDIC-to-ASCII character set transcoding, field parsing, timestamp synchronization across Sysplex timer bounds, and schema validation.
            </p>
          </div>

          <ArrowDown className="w-4 h-4 text-cyan-400" />

          {/* Step 4 */}
          <div className="w-full p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/80 shadow-lg shadow-cyan-950/30">
            <div className="flex items-center justify-between font-bold text-cyan-300 mb-1">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-300" />
                <span>4. AI Anomaly Detection Engine</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-bold">CORE ML TIER</span>
            </div>
            <p className="text-[11px] text-cyan-100">
              Isolation Forest tree ensembles (150 estimators) combined with z-score account profiling, geo-velocity models, and SMF security violation heuristics.
            </p>
          </div>

          <ArrowDown className="w-4 h-4 text-cyan-400" />

          {/* Step 5 */}
          <div className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>5. Risk Scoring and Correlation</span>
              </span>
              <span className="text-[10px] text-slate-400">CALIBRATION</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Synthesizes ML isolation scores with deterministic security rules (e.g., unauthorized RACF access to SYS1.PARMLIB) to output 0-100 calibrated risk scores.
            </p>
          </div>

          <ArrowDown className="w-4 h-4 text-cyan-400" />

          {/* Step 6 */}
          <div className="w-full p-3.5 rounded-xl bg-slate-950 border border-rose-900/60 shadow-md">
            <div className="flex items-center justify-between font-bold text-rose-300 mb-1">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>6. Security Alert Generation</span>
              </span>
              <span className="text-[10px] text-slate-400">INCIDENT DISPATCH</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Triage categorization (Suspicious Financial, Privilege Escalation, Data Exfiltration), automated holds on outbound SWIFT wires, and SIEM forwarding.
            </p>
          </div>

          <ArrowDown className="w-4 h-4 text-cyan-400" />

          {/* Step 7 */}
          <div className="w-full p-3.5 rounded-xl bg-slate-950 border border-emerald-800/80 shadow-md">
            <div className="flex items-center justify-between font-bold text-emerald-300 mb-1">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>7. Analyst Dashboard and Investigation</span>
              </span>
              <span className="text-[10px] text-slate-400">PRESENTATION TIER</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live executive dashboards, explainable feature attributions, interactive forensic checklists, audit trails, and PDF/CSV dossier generation.
            </p>
          </div>
        </div>
      </div>

      {/* Potential IBM watsonx Integration */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-sm font-bold text-white">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Potential IBM watsonx AI Integration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-cyan-300">watsonx.ai Granite Models</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Granite code & reasoning foundation models synthesize hundreds of raw SMF records into executive incident summaries and root-cause timelines.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-cyan-300">watsonx.data Lakehouse</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Enables multi-year forensic threat hunting across petabytes of historical SMF and CICS archive logs using Presto query engines.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-cyan-300">watsonx.governance</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Automated model drift monitoring, bias detection, and compliance auditing for global financial regulatory agencies (OCC, Fed, ECB).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
