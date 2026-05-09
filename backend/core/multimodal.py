"""
Multimodal Signal Aggregator.

Combines correctness, reaction time, and hesitation count into a single
engagement score (0.0 – 1.0).

In production the hesitation count comes from accelerometer + re-tap
detection on the mobile client.  For PP1 the client sends 0 and the
reaction time is the primary signal.

References: [10][12] multimodal capture in educational technology.
"""

from typing import List


def compute_engagement_score(
    reaction_time_ms: int,
    hesitation_count: int,
    correct: bool,
) -> float:
    """
    Single-item engagement score.

      reaction_time_ms : ms from item render to tap
      hesitation_count : number of pauses >2 s or re-taps
      correct          : whether the answer was correct
    """
    # Reaction-time score: fast is more engaged (normalised 500–8000 ms)
    rt_score = max(0.0, min(1.0, 1.0 - (reaction_time_ms - 500) / 7500))

    # Hesitation penalty
    hes_score = max(0.0, 1.0 - hesitation_count * 0.25)

    # Correctness contributes a small bonus
    correct_bonus = 0.15 if correct else 0.0

    engagement = 0.55 * rt_score + 0.30 * hes_score + 0.15 + correct_bonus
    return round(min(1.0, max(0.0, engagement)), 4)


def aggregate_session_features(
    reaction_times: List[int],
    hesitation_counts: List[int],
    engagement_scores: List[float],
) -> dict:
    """Compute session-level multimodal summary."""
    if not reaction_times:
        return {
            "avg_reaction_time_ms": 3000,
            "avg_hesitation_count": 0.0,
            "avg_engagement_score": 0.5,
        }
    import statistics as _s

    return {
        "avg_reaction_time_ms": int(_s.mean(reaction_times)),
        "avg_hesitation_count": round(_s.mean(hesitation_counts), 3),
        "avg_engagement_score": round(_s.mean(engagement_scores), 4),
    }
