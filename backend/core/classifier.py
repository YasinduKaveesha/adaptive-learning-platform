"""
Tri-Group Classifier (Random Forest).

Classifies students into Group A / B / C based on:
  - Per-domain IRT ability estimates (4 features)
  - Multimodal behavioural features (3 features)

Trained at server startup on 1 000 synthetic students.
Group thresholds are based on overall ability (average across domains):
  Group A: overall θ < -0.5   (needs additional support)
  Group B: -0.5 ≤ overall θ < 0.5  (on track)
  Group C: overall θ ≥ 0.5    (advanced)

Labels use neutral identifiers as per ethics guidelines [Sonnet ethics].

Reference: [27] Tri-group classification with RF.
"""

from __future__ import annotations

from typing import Dict, List, Tuple

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

GROUP_LABELS = {0: "group_a", 1: "group_b", 2: "group_c"}
GROUP_LABEL_TO_INT = {v: k for k, v in GROUP_LABELS.items()}

FEATURE_NAMES = [
    "working_memory_theta",
    "pattern_recognition_theta",
    "attention_theta",
    "logical_reasoning_theta",
    "avg_reaction_time_ms",
    "avg_hesitation_count",
    "avg_engagement_score",
]


def _generate_synthetic_data(
    n_students: int = 1000, seed: int = 42
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate synthetic training data for the RF classifier.

    Domain abilities are correlated (r ≈ 0.5–0.6) as seen in cognitive
    assessment literature.  Behavioural features are deterministically
    linked to overall ability with added noise.
    """
    rng = np.random.default_rng(seed)

    # Correlated domain abilities
    cov = [
        [1.0, 0.55, 0.45, 0.60],
        [0.55, 1.0, 0.40, 0.50],
        [0.45, 0.40, 1.0, 0.42],
        [0.60, 0.50, 0.42, 1.0],
    ]
    thetas = rng.multivariate_normal(mean=[0, 0, 0, 0], cov=cov, size=n_students)

    overall = thetas.mean(axis=1)

    # Reaction time: slower for lower ability (range ~500–6000 ms)
    rt = 3500 - 600 * overall + rng.normal(0, 300, n_students)
    rt = np.clip(rt, 500, 8000)

    # Hesitation count: more hesitation at lower ability
    hes = np.maximum(0, 2.0 - 0.8 * overall + rng.normal(0, 0.4, n_students))

    # Engagement: higher for higher ability
    eng = np.clip(0.5 + 0.15 * overall + rng.normal(0, 0.08, n_students), 0.0, 1.0)

    X = np.column_stack([thetas, rt, hes, eng])

    # Group labels
    y = np.ones(n_students, dtype=int)  # group_b default
    y[overall < -0.5] = 0              # group_a
    y[overall >= 0.5] = 2              # group_c

    return X, y


class ScreeningClassifier:
    """Random Forest tri-group classifier."""

    def __init__(self) -> None:
        self._rf = RandomForestClassifier(
            n_estimators=150,
            max_depth=None,
            random_state=42,
            n_jobs=-1,
        )
        self._scaler = StandardScaler()
        self.trained = False

    # ------------------------------------------------------------------

    def train(self) -> None:
        X, y = _generate_synthetic_data()
        X_scaled = self._scaler.fit_transform(X)
        self._rf.fit(X_scaled, y)
        self.trained = True

    # ------------------------------------------------------------------

    def predict(
        self, feature_vector: List[float]
    ) -> Tuple[str, Dict[str, float]]:
        """
        Parameters
        ----------
        feature_vector : [wm_θ, pr_θ, att_θ, lr_θ,
                          avg_rt_ms, avg_hesitation, avg_engagement]

        Returns
        -------
        (classification_label, {group_a: p, group_b: p, group_c: p})
        """
        if not self.trained:
            # Prior: uniform before enough data
            return "group_b", {"group_a": 0.33, "group_b": 0.34, "group_c": 0.33}

        X = np.array(feature_vector, dtype=float).reshape(1, -1)
        X_scaled = self._scaler.transform(X)
        pred_int = int(self._rf.predict(X_scaled)[0])
        proba = self._rf.predict_proba(X_scaled)[0]

        label = GROUP_LABELS[pred_int]
        proba_dict = {GROUP_LABELS[i]: float(proba[i]) for i in range(3)}
        return label, proba_dict

    # ------------------------------------------------------------------

    def confidence(self, feature_vector: List[float]) -> float:
        """Return max class probability as classification confidence."""
        _, proba_dict = self.predict(feature_vector)
        return max(proba_dict.values())
