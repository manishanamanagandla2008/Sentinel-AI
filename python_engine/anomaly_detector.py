"""
SentinelAI - Python Machine Learning Anomaly Detection Engine
IBM Z Datathon Project

Provides Isolation Forest anomaly detection, multi-factor risk scoring,
and Explainable AI (XAI) feature attribution for financial transactions and system logs.
Works with scikit-learn/numpy when installed, or standard library statistical fallback.
"""

import math
import random
from datetime import datetime
from typing import Dict, List, Any, Optional

try:
    import numpy as np
    from sklearn.ensemble import IsolationForest
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    np = None


class SentinelAnomalyDetector:
    """
    Hybrid Anomaly Detection Pipeline combining scikit-learn Isolation Forest
    with heuristic domain rules and explainable feature attribution.
    """

    def __init__(self, contamination: float = 0.05, n_estimators: int = 100):
        self.contamination = contamination
        self.n_estimators = n_estimators
        self.model: Optional[Any] = None
        self.is_fitted = False
        
        # Synthetic baseline statistics for typical corporate accounts
        self.account_baselines = {
            "ACC-89104-US": {"mean": 480.0, "std": 150.0, "last_lat": 40.7128, "last_lng": -74.006},
            "ACC-52019-DE": {"mean": 850.0, "std": 220.0, "last_lat": 50.1109, "last_lng": 8.6821},
            "ACC-31405-SG": {"mean": 1200.0, "std": 400.0, "last_lat": 1.3521, "last_lng": 103.8198},
            "ZOS-CICS-BATCH": {"mean": 15000.0, "std": 3000.0, "last_lat": 41.7004, "last_lng": -73.921},
        }

        self._initialize_baseline_model()

    def _initialize_baseline_model(self):
        """Fit baseline synthetic training distribution if scikit-learn is present."""
        if not SKLEARN_AVAILABLE or np is None:
            return

        np.random.seed(42)
        normal_samples = np.column_stack([
            np.random.normal(0.2, 0.08, 1000),
            np.random.poisson(1.5, 1000),
            np.random.uniform(0, 100, 1000),
            np.random.binomial(1, 0.05, 1000),
            np.zeros(1000)
        ])

        anomaly_samples = np.column_stack([
            np.random.uniform(0.8, 1.0, 50),
            np.random.uniform(5, 12, 50),
            np.random.uniform(1200, 3000, 50),
            np.random.binomial(1, 0.7, 50),
            np.ones(50)
        ])

        training_data = np.vstack([normal_samples, anomaly_samples])
        self.model = IsolationForest(
            n_estimators=self.n_estimators,
            contamination=self.contamination,
            random_state=42
        )
        self.model.fit(training_data)
        self.is_fitted = True

    @staticmethod
    def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Compute geographic Haversine distance in kilometers."""
        radius = 6371.0
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (math.sin(d_lat / 2.0) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(d_lon / 2.0) ** 2)
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return radius * c

    def score_transaction(self, txn: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate single transaction against baseline profile, compute Isolation Forest
        score, rule activations, and explainable feature contributions.
        """
        account = txn.get("sourceAccount", "UNKNOWN")
        amount = float(txn.get("amount", 0.0))
        lat = float(txn.get("lat", 40.7128))
        lng = float(txn.get("lng", -74.006))
        dest = str(txn.get("destinationAccount", ""))

        baseline = self.account_baselines.get(account, {
            "mean": 500.0,
            "std": 200.0,
            "last_lat": lat,
            "last_lng": lng
        })

        # Feature 1: Amount Z-score
        z_score = max(0.0, (amount - baseline["mean"]) / max(1.0, baseline["std"]))

        # Feature 2: Geo-displacement speed
        dist_km = self.haversine_distance_km(baseline["last_lat"], baseline["last_lng"], lat, lng)
        time_delta_hours = 0.25  # default 15 minutes window assumption
        speed_kmh = dist_km / time_delta_hours

        # Feature 3: Destination risk
        is_high_risk_dest = any(token in dest for token in ["-KY", "-CH", "MULE", "SHELL", "999"])

        # Feature 4: Temporal execution
        txn_hour = 12
        if "timestamp" in txn:
            try:
                dt = datetime.fromisoformat(txn["timestamp"].replace("Z", "+00:00"))
                txn_hour = dt.hour
            except Exception:
                pass
        is_off_hours = 1 <= txn_hour <= 4

        # Model Anomaly Score
        iso_score = 0.15
        if self.is_fitted and self.model is not None and np is not None:
            feat_vector = np.array([[
                min(amount / 50000.0, 1.0),
                2.0,
                min(speed_kmh, 2500.0),
                1.0 if is_off_hours else 0.0,
                1.0 if is_high_risk_dest else 0.0
            ]])
            raw_decision = self.model.decision_function(feat_vector)[0]
            iso_score = float(max(0.05, min(0.98, 0.5 - (raw_decision * 1.5))))
        else:
            # Statistical multi-factor normalization fallback
            norm_amount = min(1.0, z_score / 6.0)
            norm_speed = min(1.0, speed_kmh / 1000.0)
            norm_dest = 0.5 if is_high_risk_dest else 0.0
            iso_score = min(0.98, max(0.05, (norm_amount * 0.45) + (norm_speed * 0.35) + norm_dest))

        # Collect Explainable Factors & Rules
        contributing_factors = []
        rules_triggered = []
        risk_points = iso_score * 50.0

        if z_score > 3.0:
            impact = min(40, round(z_score * 7))
            risk_points += impact
            rules_triggered.append(f"RULE_TXN_AMOUNT_DEVIATION [Z={z_score:.2f}]")
            contributing_factors.append({
                "feature": "Transaction Amount vs Historical Baseline",
                "impact": impact,
                "baseline": f"${baseline['mean']:,.2f}",
                "observed": f"${amount:,.2f} ({amount/baseline['mean']:.1f}x typical)",
                "description": "Transaction volume significantly exceeds normal statistical baseline."
            })

        if speed_kmh > 800.0 and dist_km > 500.0:
            impact = 30
            risk_points += impact
            rules_triggered.append(f"RULE_IMPOSSIBLE_TRAVEL_VELOCITY [{round(speed_kmh)} km/h]")
            contributing_factors.append({
                "feature": "Geographical Velocity",
                "impact": impact,
                "baseline": "Local terminal access",
                "observed": f"{round(dist_km)} km in 15 min ({round(speed_kmh)} km/h)",
                "description": "Displacement exceeds commercial aviation physical velocity limits."
            })

        if is_high_risk_dest:
            impact = 20
            risk_points += impact
            rules_triggered.append("RULE_HIGH_RISK_DESTINATION_ENTITY")
            contributing_factors.append({
                "feature": "Beneficiary Destination Entity",
                "impact": impact,
                "baseline": "Domestic verified account",
                "observed": f"Offshore shell/mule pattern: {dest}",
                "description": "Beneficiary account routes through unverified offshore entity."
            })

        final_risk = min(100, max(5, int(risk_points)))
        severity = "LOW"
        status = "COMPLETED"
        if final_risk >= 80:
            severity = "CRITICAL"
            status = "BLOCKED"
        elif final_risk >= 65:
            severity = "HIGH"
            status = "FLAGGED"
        elif final_risk >= 35:
            severity = "MEDIUM"
            status = "PENDING_REVIEW"

        return {
            "riskScore": final_risk,
            "severity": severity,
            "status": status,
            "isolationForestScore": round(iso_score, 3),
            "rulesTriggered": rules_triggered,
            "contributingFactors": contributing_factors,
            "isAnomaly": final_risk >= 65
        }


if __name__ == "__main__":
    detector = SentinelAnomalyDetector()
    test_txn = {
        "sourceAccount": "ACC-89104-US",
        "destinationAccount": "ACC-MULE-KY-999",
        "amount": 84500,
        "lat": 19.2869,
        "lng": -81.3674,
        "timestamp": datetime.utcnow().isoformat()
    }
    result = detector.score_transaction(test_txn)
    print("Test Transaction Evaluation Result:")
    print(f"Risk Score: {result['riskScore']}/100 ({result['severity']})")
    print(f"Isolation Forest Score: {result['isolationForestScore']}")
    print(f"Rules Triggered: {result['rulesTriggered']}")
