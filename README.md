# SentinelAI – Intelligent Cyber Threat Detection Platform
### IBM Z Datathon Project

> **"Detect Threats Before They Become Breaches."**

SentinelAI is a full-stack, enterprise-grade cybersecurity web platform engineered to detect, prioritize, and explain complex cyber threats across high-volume financial transaction networks and mainframe system environments.

---

## 🏛️ System Architecture

```
Transaction & System Logs (SWIFT / ACH / IBM Z SMF Types 80, 83, 110)
          ↓
Data Ingestion Layer (IBM Common Data Provider / Apache Kafka)
          ↓
Data Validation & Normalization (EBCDIC to ASCII, Schema Validation)
          ↓
AI Anomaly Detection Engine (scikit-learn Isolation Forest + Account Baselines)
          ↓
Risk Scoring & Rules Correlation (Hybrid ML Isolation + Deterministic Heuristics)
          ↓
Security Alert Generation (Triage, Severity Scoring, Automated Mitigation Holds)
          ↓
Analyst Dashboard & Investigation (Explainable AI, Forensic Checklists, Audit Trail)
```

---

## 🛡️ Core Capabilities

1. **Executive Security Operations Center (SOC)**
   - Real-time telemetry: Throughput, detection rate %, active critical threats, MTTR.
   - Interactive Recharts volume vs anomaly density timeline.
   - Severity distribution (Critical, High, Medium, Low) and threat vector categorization.

2. **Real-Time Transaction Stream**
   - High-throughput ingestion stream with live risk scoring (0-100).
   - Multi-parameter filtering (type, status, severity, full-text search).
   - "Analyze Custom TXN" workbench for on-demand anomaly evaluation.
   - Background transaction generator for realistic continuous simulations.

3. **AI Anomaly Detection & Explainable AI (XAI)**
   - **Isolation Forest Model**: Evaluates path lengths in 5D feature space (Amount Z-score, 15-minute velocity window, impossible travel speed, off-hours execution, offshore counterparty routing).
   - **Feature Attribution Weights**: SHAP-inspired positive/negative contribution weights explaining *why* an event was flagged.
   - **Interactive Feature Sliders**: Live tester demonstrating risk score adjustments in real-time.

4. **Security Log Analyzer**
   - Upload CSV, JSON, and TXT log files with client-side safe validation.
   - Built-in templates for IBM Z RACF SAF violations, SSH brute-force bursts, and database bulk exfiltrations.
   - Deep support for IBM z/OS System Management Facility (SMF) record types:
     - **SMF Type 80**: RACF access control processing (e.g. `ICH408I` violations).
     - **SMF Type 83**: Security audit and cryptographic coprocessor key updates.
     - **SMF Type 110**: CICS performance and transaction abend monitoring (`AICA`, `ASRA`).

5. **Voice SecOps Assistant (gemini-3.8-live Live API)**
   - Real-time, low-latency two-way voice conversations with Google Gemini 3.8 Live API (`gemini-3.8-live`).
   - 16kHz linear PCM microphone input streaming with 24kHz model output audio playback and waveform visualizer.
   - Live SecOps briefings: DEFCON status, transaction anomaly explanations, RACF violations, and automated containment recommendations.

6. **Threat Detection & Alerts Lifecycle**
   - Six threat vector classifications: Suspicious Financial, Brute-Force Login, Unauthorized Access, Account Compromise, System Activity, Data Exfiltration.
   - State machine: `NEW`, `INVESTIGATING`, `RESOLVED`, `FALSE_POSITIVE`.
   - In-place triage, analyst assignment, and forensic notes.

6. **Live Threat Activity Map**
   - Interactive global geographical coordinate projection.
   - Animated pulsing threat markers sized by risk severity.
   - Popups with localized forensic event cards and one-click drilldown.

7. **Incident Investigation Center & Immutable Audit Trail**
   - Comprehensive incident case management.
   - Correlated event timeline.
   - Interactive SOC investigation checklist with operator attribution.
   - Forensic dossier export to CSV or printable format.
   - Tamper-evident operator action audit log.

8. **IBM Z Mainframe Security Module**
   - Explains mainframe transaction monitoring, CPACF on-chip encryption, IBM Crypto Express8S HSMs, and Pervasive Encryption.
   - Blueprint for integration with **IBM watsonx** (watsonx.ai foundation models for automated incident summarization, watsonx.data, watsonx.governance).

9. **Multi-Stage Cyber Attack Scenario**
   - One-click attack simulator:
     - *Phase 1*: Perimeter port reconnaissance (Firewall).
     - *Phase 2*: Privilege escalation attempt on `SYS1.PARMLIB` (RACF SAF violation).
     - *Phase 3*: Unauthorized $145,000 offshore wire transfer intercepted and blocked by zero-trust automation.

---

## 💻 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide Icons.
- **Backend / API**: Node.js Express + Python FastAPI ML service with scikit-learn.
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
python python_engine/anomaly_detector.py

# Run automated unit test suite
pytest python_engine/test_detector.py
```

---

## 🔒 Demonstration & Safety Notice
All accounts, financial transactions, IP addresses, and mainframe identifiers in SentinelAI are synthetically generated for IBM Z Datathon evaluation. Real financial accounts are never accessed.
