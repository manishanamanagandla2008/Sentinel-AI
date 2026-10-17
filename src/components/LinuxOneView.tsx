import React, { useState } from 'react';
import {
  Server,
  Cpu,
  ShieldCheck,
  Terminal,
  Zap,
  Lock,
  Layers,
  Leaf,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Info,
  RefreshCw,
  Globe,
  Radio,
  Flame
} from 'lucide-react';
import { soundFx } from '../lib/soundFx.ts';

export const LinuxOneView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'enclave' | 'terminal' | 'sustainability'>('architecture');
  const [terminalCommand, setTerminalCommand] = useState('uname -a');
  const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd: string; output: string }>>([
    {
      cmd: 'uname -a',
      output: 'Linux sentinel-linuxone-prd01 5.14.0-427.el9.s390x #1 SMP PREEMPT_DYNAMIC s390x s390x s390x GNU/Linux'
    },
    {
      cmd: 'lscpu',
      output: 'Architecture:           s390x\nCPU op-mode(s):        32-bit, 64-bit\nByte Order:            Big-Endian\nCPU(s):                32\nOn-line CPU(s) list:   0-31\nVendor ID:             IBM/S390\nMachine type:          3931 (IBM LinuxONE Emperor 4 / z16)\nModel name:            Integrated Facility for Linux (IFL)\nCPU MHz:               5200.000\nBogoMIPS:              26000.00\nHypervisor vendor:     KVM on z/VM\nVirtualization type:   full\nFlags:                 esan3 zarch stfle msa msa1 msa2 msa3 msa4 msa5 msa6 msa7 msa8 msa9 ldisp eimm dfp edat etf3eh highgprs te vx vxe vxd sie'
    }
  ]);
  const [attestationValid, setAttestationValid] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const executeCommand = (cmdToRun?: string) => {
    const cmd = (cmdToRun || terminalCommand).trim();
    if (!cmd) return;
    soundFx.playBlip(900);

    let output = '';
    const lower = cmd.toLowerCase();

    if (lower.includes('uname')) {
      output = 'Linux sentinel-linuxone-prd01 5.14.0-427.el9.s390x #1 SMP PREEMPT_DYNAMIC s390x s390x s390x GNU/Linux';
    } else if (lower.includes('lscpu')) {
      output = 'Architecture:           s390x\nByte Order:            Big-Endian (Standard mainframe network order)\nCPU(s):                32 IFL Cores @ 5.2 GHz\nVendor:                IBM LinuxONE Emperor 4 (Machine 3931)\nCryptographic Assist:  CPACF MSA1-9 Active\nVector Extensions:     SIMD 128-bit enabled for ML Isolation Forest acceleration';
    } else if (lower.includes('podman') || lower.includes('docker') || lower.includes('container')) {
      output = 'CONTAINER ID  IMAGE                               COMMAND               CREATED        STATUS            PORTS                   NAMES\n9a81f3b201c4  sentinel-ai-engine:s390x            "python3 -m engine"   2 hours ago    Up 2 hours        0.0.0.0:8000->8000/tcp  sentinel-ml-pod\n3c4109ea87d1  sentinel-smf-ingest:s390x           "node dist/server.js" 2 hours ago    Up 2 hours        0.0.0.0:3000->3000/tcp  sentinel-web-api\n87b92110cfa0  registry.redhat.io/rhel9/postgresql "postgres -D /data"   5 hours ago    Up 5 hours (SE)   0.0.0.0:5432->5432/tcp  sentinel-db-enclave';
    } else if (lower.includes('se-attestation') || lower.includes('secure') || lower.includes('enclave')) {
      output = '[+] Querying IBM Secure Execution Hardware Key Distribution...\n[+] Host Key Document (HKD) Fingerprint: SHA256:7a9f:3b41:e890:c12a:98f1:330b\n[+] Verifying against IBM zSystems Hardware Root CA...\n[+] Enclave Memory Encryption: AES-XTS-256 (Protected Key Mode)\n[+] Attestation Status: VERIFIED VALID. Hypervisor memory snooping prevented.';
    } else if (lower.includes('chzdev') || lower.includes('crypto')) {
      output = 'TYPE       ID           ON  PERS  NAMES\nap         08.0042      yes yes   card08/08.0042 (Crypto Express8S Accelerator)\nap         08.0043      yes yes   card08/08.0043 (Crypto Express8S CCA Coprocessor)\nqeth       0.0.1000     yes yes   enc1000 (OSA-Express7S 25GbE RoCE)';
    } else {
      output = `sentinel-sh: command executed successfully on s390x: ${cmd}\nTelemetry verified against IBM LinuxONE Emperor 4 system bus.`;
    }

    setTerminalHistory(prev => [...prev, { cmd, output }]);
    setTerminalCommand('');
  };

  const verifyEnclave = () => {
    setIsVerifying(true);
    soundFx.playRadarPing();
    setTimeout(() => {
      setIsVerifying(false);
      setAttestationValid(true);
      soundFx.playBlip(1200);
    }, 1200);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/60 p-6 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <Server className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold tracking-wider">IBM LINUXONE EMPEROR 4 & LINUX ON IBM Z (s390x)</span>
            </div>
            <h1 className="text-xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>LinuxONE Enterprise Resiliency Hub</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              SentinelAI leverages Linux on IBM Z (s390x) and Red Hat OpenShift, pairing enterprise Linux flexibility with mainframe scale, confidential computing via IBM Secure Execution, and Telum on-chip AI acceleration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/60 text-xs font-bold text-cyan-200 shadow-md">
              Arch: s390x (Big-Endian)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-xs font-bold text-emerald-300 shadow-md">
              Secure Execution: ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3.5 py-1.5 rounded-lg border transition-all ${
            activeTab === 'architecture'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          s390x Microservices Architecture
        </button>
        <button
          onClick={() => setActiveTab('enclave')}
          className={`px-3.5 py-1.5 rounded-lg border transition-all ${
            activeTab === 'enclave'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Secure Execution Enclaves (Confidential Computing)
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-3.5 py-1.5 rounded-lg border transition-all ${
            activeTab === 'terminal'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Live s390x Terminal Console
        </button>
        <button
          onClick={() => setActiveTab('sustainability')}
          className={`px-3.5 py-1.5 rounded-lg border transition-all ${
            activeTab === 'sustainability'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Workload Consolidation & Green IT (75% Energy Reduction)
        </button>
      </div>

      {/* Tab 1: Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-cyan-300">Container Runtime</span>
                <span className="text-[10px] text-emerald-400">Podman / OCI</span>
              </div>
              <div className="text-sm font-bold text-white">Red Hat OpenShift on s390x</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                SentinelAI detection pods run in containerized OCI images compiled for the native 64-bit s390x instruction set, sharing high-speed internal HiperSockets with z/OS LPARs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-cyan-300">IFL Processors</span>
                <span className="text-[10px] text-cyan-400">5.2 GHz High-Clock</span>
              </div>
              <div className="text-sm font-bold text-white">Dedicated Linux Compute Cores</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Integrated Facility for Linux (IFL) processors bypass z/OS MLC software licensing charges, delivering wire-speed parallel tree isolation at minimal operational TCO.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-cyan-300">Memory Bandwidth</span>
                <span className="text-[10px] text-emerald-400">32 TB RAIM Protected</span>
              </div>
              <div className="text-sm font-bold text-white">Redundant Array of Independent Memory</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                RAIM architecture detects and corrects entire DRAM channel failures dynamically without OS disruption, guaranteeing 99.999% availability for financial fraud scoring.
              </p>
            </div>
          </div>

          {/* Architecture Deployment Diagram */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>SentinelAI on IBM LinuxONE Multi-Tier Topology</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-cyan-400 uppercase font-bold">1. Ingress Layer</span>
                <div className="font-bold text-slate-200">OSA-Express 25GbE</div>
                <p className="text-[11px] text-slate-400">Direct RoCE v2 low-latency ingress from SWIFT and ISO 8583 payment networks.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/50 space-y-1">
                <span className="text-[10px] text-cyan-400 uppercase font-bold">2. Secure Enclave</span>
                <div className="font-bold text-cyan-300">Linux Secure Execution</div>
                <p className="text-[11px] text-slate-300">Financial transactions decrypted exclusively inside hardware-isolated KVM guest memory.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-cyan-400 uppercase font-bold">3. ML Inference</span>
                <div className="font-bold text-slate-200">Telum AI On-Chip</div>
                <p className="text-[11px] text-slate-400">Isolation Forest evaluation accelerated by SIMD vector units in &lt; 1 millisecond.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-cyan-400 uppercase font-bold">4. Sysplex Bridge</span>
                <div className="font-bold text-slate-200">HiperSockets Bridge</div>
                <p className="text-[11px] text-slate-400">Memory-to-memory communication with z/OS RACF & CICS with zero TCP/IP wire exposure.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Secure Execution Enclave */}
      {activeTab === 'enclave' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>IBM Secure Execution for Linux (Confidential Computing)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Hardware-enforced memory encryption preventing hypervisor root users from viewing unencrypted transaction memory
              </p>
            </div>

            <button
              onClick={verifyEnclave}
              disabled={isVerifying}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Checking Attestation...' : 'Verify Enclave Integrity'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span>Threat Vector Mitigated</span>
                <span className="text-[10px] text-rose-400 uppercase">Untrusted Host / Insider Risk</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                In traditional cloud virtualization, a rogue cloud administrator or compromised KVM hypervisor can execute <code className="text-cyan-300">gdb</code> or dump memory buffers to extract live credit card numbers, passwords, and wire balances.
              </p>
              <div className="p-2.5 rounded bg-slate-950 border border-rose-900/60 text-rose-300 text-[10px]">
                ✕ Vulnerability: Unencrypted guest memory accessible to root on host.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/60 space-y-2">
              <div className="flex items-center justify-between font-bold text-cyan-200">
                <span>IBM Secure Execution Defense</span>
                <span className="text-[10px] text-emerald-400 uppercase">Hardware Protected</span>
              </div>
              <p className="text-slate-200 leading-relaxed text-[11px]">
                The s390x ultravisor locks each guest memory page using hardware AES-XTS-256 keys derived from the CPU unique master key. Neither the KVM hypervisor nor hardware administrators can read guest RAM.
              </p>
              <div className="p-2.5 rounded bg-slate-950 border border-emerald-800 text-emerald-300 text-[10px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Zero-Trust: Memory opaque to host, hypervisor, and adjacent VMs.</span>
              </div>
            </div>
          </div>

          {/* Attestation Status Box */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Hardware Attestation Certificate:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>IBM zSystems Root CA Verified</span>
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300 overflow-x-auto space-y-1">
              <div>HKD Certificate Serial: <span className="text-cyan-300">0x3931-HKD-7A9F-B41E-8890</span></div>
              <div>Cryptographic Engine: <span className="text-cyan-300">Crypto Express8S (CCA Master Key Protected)</span></div>
              <div>Enclave Memory Pages: <span className="text-emerald-400">131,072 pages (512 MB) Sealed</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive s390x Terminal */}
      {activeTab === 'terminal' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>IBM LinuxONE s390x Diagnostic Console</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Quick Commands:</span>
              <button
                onClick={() => executeCommand('lscpu')}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-cyan-300"
              >
                lscpu
              </button>
              <button
                onClick={() => executeCommand('podman ps')}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-cyan-300"
              >
                podman ps
              </button>
              <button
                onClick={() => executeCommand('se-attestation --verify')}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-cyan-300"
              >
                se-attest
              </button>
              <button
                onClick={() => executeCommand('chzdev ap')}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-cyan-300"
              >
                chzdev ap
              </button>
            </div>
          </div>

          {/* Terminal Screen */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 min-h-[300px] max-h-[420px] overflow-y-auto space-y-3 text-xs">
            <div className="text-slate-500 text-[11px]">
              Connected to IBM LinuxONE Emperor 4 (PRD01) via secure TSO/SSH jump gate.
            </div>

            {terminalHistory.map((h, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <span className="text-slate-500">root@linuxone-prd01:~#</span>
                  <span>{h.cmd}</span>
                </div>
                <pre className="text-slate-300 text-[11px] whitespace-pre-wrap pl-4 leading-relaxed font-mono">
                  {h.output}
                </pre>
              </div>
            ))}
          </div>

          {/* Terminal Input */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-cyan-400 text-xs font-bold pl-2">#</span>
            <input
              type="text"
              value={terminalCommand}
              onChange={e => setTerminalCommand(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && executeCommand()}
              placeholder="Type Linux s390x command (e.g. lscpu, uname -a, podman ps, se-attestation)..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => executeCommand()}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              Run
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Sustainability & Workload Consolidation */}
      {activeTab === 'sustainability' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Green Computing: Workload Consolidation on IBM LinuxONE
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Replacing sprawling x86 server farms with a single energy-efficient LinuxONE Emperor 4 system
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl font-bold text-emerald-400">-75%</div>
              <div className="text-xs font-bold text-white mt-1">Energy Consumption</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Versus distributed x86 clusters</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl font-bold text-cyan-400">-50%</div>
              <div className="text-xs font-bold text-white mt-1">Data Center Floor Space</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Consolidates 20+ racks into 1 single footprint</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl font-bold text-amber-400">850 MT</div>
              <div className="text-xs font-bold text-white mt-1">Annual CO2 Avoidance</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Equivalent to planting 14,000 trees/yr</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-cyan-300">Why Financial Institutions Choose LinuxONE for AI Scoring:</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Cybersecurity and fraud detection models like SentinelAI demand continuous 24/7 inference across millions of transactions. While x86 servers require massive horizontal scale-out with excessive power, cooling, and network switch hops, a single IBM LinuxONE Emperor 4 system delivers vertical consolidation with sub-millisecond memory latency and zero-trust confidential computing out-of-the-box.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
