"""
Unit test suite for SentinelAI Anomaly Detection and Risk Scoring.
Run with: PYTHONPATH=. python3 python_engine/test_detector.py
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from python_engine.anomaly_detector import SentinelAnomalyDetector
except ImportError:
    from anomaly_detector import SentinelAnomalyDetector


class TestSentinelAnomalyDetector(unittest.TestCase):

    def setUp(self):
        self.detector = SentinelAnomalyDetector()

    def test_normal_transaction_low_risk(self):
        txn = {
            "sourceAccount": "ACC-89104-US",
            "destinationAccount": "ACC-10294-US",
            "amount": 420.0,
            "lat": 40.7128,
            "lng": -74.006,
            "timestamp": "2026-10-16T14:30:00Z"
        }
        result = self.detector.score_transaction(txn)
        self.assertLess(result["riskScore"], 50)
        self.assertIn(result["severity"], ["LOW", "MEDIUM"])
        self.assertFalse(result["isAnomaly"])

    def test_extreme_amount_anomaly_flagged(self):
        txn = {
            "sourceAccount": "ACC-89104-US",
            "destinationAccount": "ACC-MULE-KY-999",
            "amount": 95000.0,
            "lat": 19.2869,
            "lng": -81.3674,
            "timestamp": "2026-10-16T02:15:00Z"
        }
        result = self.detector.score_transaction(txn)
        self.assertGreaterEqual(result["riskScore"], 65)
        self.assertIn(result["severity"], ["HIGH", "CRITICAL"])
        self.assertTrue(result["isAnomaly"])
        self.assertTrue(any("RULE_TXN_AMOUNT_DEVIATION" in r for r in result["rulesTriggered"]))

    def test_haversine_distance_computation(self):
        # NYC to London is roughly 5,570 km
        dist = SentinelAnomalyDetector.haversine_distance_km(40.7128, -74.006, 51.5074, -0.1278)
        self.assertTrue(5500 < dist < 5700)

    def test_explainable_factors_attribution(self):
        txn = {
            "sourceAccount": "ACC-89104-US",
            "destinationAccount": "ACC-SHELL-CH-88",
            "amount": 75000.0,
            "lat": 47.3769,
            "lng": 8.5417
        }
        result = self.detector.score_transaction(txn)
        self.assertGreaterEqual(len(result["contributingFactors"]), 1)
        self.assertIn("impact", result["contributingFactors"][0])
        self.assertIn("baseline", result["contributingFactors"][0])
        self.assertIn("observed", result["contributingFactors"][0])


if __name__ == "__main__":
    unittest.main()
