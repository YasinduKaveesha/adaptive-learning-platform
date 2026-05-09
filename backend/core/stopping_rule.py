"""
Confidence-Aware Adaptive Stopping Rule.

A session terminates when any of the following is true:
  - Classification confidence ≥ CONFIDENCE_THRESHOLD  (primary)
  - Items answered ≥ MAX_ITEMS                         (safety cap)

A minimum floor of MIN_ITEMS prevents premature stopping.

Reference: [37] Bayesian stopping rule for adaptive assessment.
"""

from typing import Optional, Tuple

MIN_ITEMS: int = 5
MAX_ITEMS: int = 25
CONFIDENCE_THRESHOLD: float = 0.90  # 0.95 in full pilot; 0.90 for PP1 demo


def check_stopping_rule(
    n_items: int,
    confidence: float,
    min_items: int = MIN_ITEMS,
    max_items: int = MAX_ITEMS,
    threshold: float = CONFIDENCE_THRESHOLD,
) -> Tuple[bool, Optional[str]]:
    """
    Returns (should_stop, reason).

    reason is one of:
      "confidence_reached"  — primary stopping criterion
      "max_items"           — safety cap reached
      None                  — session should continue
    """
    if n_items < min_items:
        return False, None
    if confidence >= threshold:
        return True, "confidence_reached"
    if n_items >= max_items:
        return True, "max_items"
    return False, None
