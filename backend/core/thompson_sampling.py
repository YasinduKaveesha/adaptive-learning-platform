"""
Non-stationary Windowed Thompson Sampling item selector.

At each step:
  1. For every candidate item, sample an exploration bonus from its Beta
     posterior (built from the last W responses to that item across sessions).
  2. Compute the Fisher information at the current θ estimate.
  3. Score = exploration_bonus × fisher_information.
  4. Return the candidate with the highest score, subject to the domain
     rotation constraint (no two consecutive items from the same domain).

References: [3] non-stationary TS, [2][6] IRT item information.
"""

from __future__ import annotations

from collections import deque
from typing import Deque, Dict, List, Optional, Tuple

import numpy as np

from .irt import fisher_information


class ThompsonSampler:
    """Windowed Thompson Sampling over an IRT-parameterised item bank."""

    def __init__(self, window_size: int = 10, rng_seed: Optional[int] = None):
        self.window_size = window_size
        self._rng = np.random.default_rng(rng_seed)
        # item_id → deque of bool (True = correct)
        self._history: Dict[str, Deque[bool]] = {}

    # ------------------------------------------------------------------
    # State update
    # ------------------------------------------------------------------

    def record(self, item_id: str, correct: bool) -> None:
        """Register a student response for the windowed posterior."""
        if item_id not in self._history:
            self._history[item_id] = deque(maxlen=self.window_size)
        self._history[item_id].append(correct)

    # ------------------------------------------------------------------
    # Posterior helpers
    # ------------------------------------------------------------------

    def _beta_params(self, item_id: str) -> Tuple[float, float]:
        """Return Beta(α, β) posterior parameters for an item."""
        history = self._history.get(item_id, deque())
        successes = sum(history)
        failures = len(history) - successes
        return 1.0 + successes, 1.0 + failures  # uniform prior Beta(1,1)

    # ------------------------------------------------------------------
    # Item selection
    # ------------------------------------------------------------------

    def select_item(
        self,
        candidates: List[Dict],
        theta: float,
        domain_rotation: List[str],
    ) -> Optional[Dict]:
        """
        Select the next item to administer.

        Parameters
        ----------
        candidates      : items not yet answered in this session
        theta           : current overall ability estimate
        domain_rotation : list of the last N domain labels answered
                          (used to enforce the rotation constraint)

        Returns
        -------
        Best item dict, or None if candidates is empty.
        """
        if not candidates:
            return None

        # Domain rotation: block the last domain if it appeared twice running
        blocked_domain: Optional[str] = None
        if len(domain_rotation) >= 2 and domain_rotation[-1] == domain_rotation[-2]:
            blocked_domain = domain_rotation[-1]

        eligible = [
            c for c in candidates if c["domain"] != blocked_domain
        ] or candidates  # fall back if every domain is blocked

        best_item: Optional[Dict] = None
        best_score: float = -1.0

        for item in eligible:
            alpha, beta = self._beta_params(item["item_id"])
            explore_bonus = float(self._rng.beta(alpha, beta))
            exploit = fisher_information(theta, item["irt_discrimination"], item["irt_difficulty"])
            score = explore_bonus * exploit

            if score > best_score:
                best_score = score
                best_item = item

        return best_item

    # ------------------------------------------------------------------
    # Serialisation (for session persistence)
    # ------------------------------------------------------------------

    def to_dict(self) -> Dict:
        return {
            "window_size": self.window_size,
            "history": {k: list(v) for k, v in self._history.items()},
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "ThompsonSampler":
        sampler = cls(window_size=data["window_size"])
        for item_id, history in data["history"].items():
            sampler._history[item_id] = deque(history, maxlen=data["window_size"])
        return sampler
