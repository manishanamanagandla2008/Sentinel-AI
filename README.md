# SentinelAI – Intelligent Cyber Threat Detection Platform
### IBM Z & LinuxONE Datathon Project

> **"Detect Threats Before They Become Breaches."**

SentinelAI is a full-stack, enterprise-grade cybersecurity web platform engineered to detect, prioritize, and explain complex cyber threats across high-volume financial transaction networks, z/OS mainframes, and **IBM LinuxONE (s390x)** confidential computing environments.

---

## 🌐 Live Application Website

- **Website Preview**: [https://ais-pre-od525if4znr5y4elymxsqd-383790507625.asia-east1.run.app](https://ais-pre-od525if4znr5y4elymxsqd-383790507625.asia-east1.run.app)

---

## 🏛️ System Architecture

```
Transaction & System Logs (SWIFT / ACH / IBM Z SMF Types 80, 83, 110)
          ↓
Data Ingestion Layer (IBM Common Data Provider / Apache Kafka on s390x)
          ↓
Data Validation & Normalization (EBCDIC to ASCII, Schema Validation)
          ↓
IBM Secure Execution Enclave (Confidential Computing on LinuxONE)
          ↓
AI Anomaly Detection Engine (Isolation Forest + Telum On-Chip AI Accelerator)
          ↓
Risk Scoring & Rules Correlation (Hybrid ML Isolation + Deterministic Heuristics)
          ↓
Security Alert Generation (Triage, Severity Scoring, Automated Mitigation Holds)
          ↓
Analyst Dashboard & Investigation (Explainable AI, Voice SecOps, Audit Trail)
```

---

## 🛡️ Core Capabilities

1. **Executive Security Operations Center (SOC)**
   - Real-time telemetry: Throughput, detection rate %, active critical threats, MTTR.
   - Interactive Recharts volume vs. anomaly density timeline.
   - **Interactive Cyber Threat Radar**: Real-time polar arc with concentric perimeter defense rings.
   - **MITRE ATT&CK Kill-Chain Matrix**: Live mapping from Reconnaissance through Exfiltration.

2. **IBM LinuxONE & s390x Technology Hub**
   - **Enterprise Linux on s390x**: Powered by Red Hat Enterprise Linux 9.4 and Red Hat OpenShift on IBM LinuxONE Emperor 4 (Machine 3931).
   - **IBM Secure Execution for Linux**: Hardware-enforced memory isolation and confidential computing, preventing hypervisor administrators or compromised hosts from accessing unencrypted financial transaction memory.
   - **Integrated Facility for Linux (IFL)**: 32 high-clock 5.2 GHz processor cores with hardware SIMD vector extensions for wire-speed anomaly inference.
   - **Interactive s390x Diagnostic Terminal**: Run live commands (`lscpu`, `podman ps`, `se-attestation --verify`, `chzdev ap`, `uname -a`).
   - **Green Computing & Sustainability**: Consolidates 1,000+ distributed x86 servers into a single LinuxONE system, slashing data center power consumption by 75% and reducing 850 metric tons of $CO_2$ annually.

3. **Real-Time Transaction Stream**
   - High-throughput ingestion stream with live risk scoring (0-100).
   - Multi-parameter filtering (type, status, severity, full-text search).
   - "Analyze Custom TXN" workbench for on-demand anomaly evaluation.
   - Background transaction generator for continuous realistic simulations.

4. **AI Anomaly Detection & Explainable AI (XAI)**
   - **Isolation Forest Model**: Evaluates path lengths in 5D feature space (Amount Z-score, 15-minute velocity window, impossible travel speed, off-hours execution, offshore counterparty routing).
   - **Isolation Tree Mathematical Visualizer**: Interactive partitioning tree demonstrating why fraud isolates in short paths ($h(x)=3$) vs. normal clusters ($h(x)=11$).
   - **Feature Attribution Weights**: SHAP-inspired contribution weights explaining *why* an event was flagged.

5. **Security Log Analyzer & IBM Z SMF Telemetry**
   - Ingestion and parser for CSV, JSON lines, and TXT log streams.
   - Built-in templates for **IBM Z RACF SAF violations** (`ICH408I`), **Linux SSH brute-force bursts**, and **bulk PII data exfiltration**.
   - Deep support for IBM z/OS System Management Facility records:
     - **SMF Type 80**: RACF access control processing (e.g. `ICH408I` violations).
     - **SMF Type 83**: Security audit and cryptographic coprocessor key updates.
     - **SMF Type 110**: CICS performance and transaction abend monitoring (`AICA`, `ASRA`).

6. **Voice SecOps Assistant (gemini-3.8-live Live API)**
   - Real-time, low-latency two-way voice conversations with Google Gemini 3.8 Live API (`gemini-3.8-live`).
   - 16kHz linear PCM microphone input streaming with 24kHz model output audio playback and waveform visualizer.
   - Floating holographic launcher with Web Audio API cybernetic sound effects.

7. **Threat Detection & Alerts Lifecycle**
   - Six threat vector classifications: Suspicious Financial, Brute-Force Login, Unauthorized Access, Account Compromise, System Activity, Data Exfiltration.
   - State machine: `NEW`, `INVESTIGATING`, `RESOLVED`, `FALSE_POSITIVE`.
   - In-place triage, analyst assignment, and forensic notes.

8. **Live Threat Activity Map**
   - Interactive global geographical coordinate projection.
   - Animated pulsing threat markers sized by risk severity.
   - Popups with localized forensic event cards and one-click drilldown.

9. **Incident Investigation Center & Immutable Audit Trail**
   - Comprehensive incident case management.
   - Correlated event timeline.
   - Interactive SOC investigation checklist with operator attribution.
   - Forensic dossier export to CSV or printable format.
   - Tamper-evident operator action audit log.

10. **IBM Z Mainframe Security Module**
   - Explains mainframe transaction monitoring, CPACF on-chip encryption, IBM Crypto Express8S HSMs, and Pervasive Encryption.
   - Blueprint for integration with **IBM watsonx** (watsonx.ai foundation models for automated incident summarization, watsonx.data, watsonx.governance).

11. **Multi-Stage Cyber Attack Scenario**
   - One-click attack simulator:
     - *Phase 1*: Perimeter port reconnaissance (Firewall).
     - *Phase 2*: Privilege escalation attempt on `SYS1.PARMLIB` (RACF SAF violation).
     - *Phase 3*: Unauthorized $145,000 offshore wire transfer intercepted and blocked by zero-trust automation.

---

## 💻 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide Icons.
- **Mainframe & Linux Platforms**: IBM LinuxONE Emperor 4, Linux on IBM Z (s390x), Red Hat Enterprise Linux 9.4, Red Hat OpenShift, IBM z/OS 3.1 Sysplex.
- **Backend / API**: Node.js Express full-stack server + Python ML service with scikit-learn.
- **Machine Learning**: Isolation Forest tree ensembles, z-score statistical profiling, Haversine geo-velocity algorithms.
- **Dataset**: Synthetic banking transactions, Linux auth logs, and z/OS SMF records.

---

## 🚀 Running the Application Locally

### 1. Web Application (Frontend + Full-Stack Express Server)
```bash
# Install dependencies
npm install

# Start the full-stack development server (port 3000)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Python ML Anomaly Detection Engine & Tests
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the Python anomaly detector standalone
python3 python_engine/anomaly_detector.py

# Run automated unit test suite
python3 python_engine/test_detector.py
```

---

## 🔒 Demonstration & Safety Notice
All accounts, financial transactions, IP addresses, and mainframe identifiers in SentinelAI are synthetically generated for IBM Z Datathon evaluation. Real financial accounts are never accessed.
