"""
IRT 2-Parameter Logistic (2PL) Model.

P(correct | θ, a, b) = 1 / (1 + exp(-a * (θ - b)))

θ  — student ability
a  — item discrimination
b  — item difficulty

Ability estimation uses Expected A Posteriori (EAP) with a standard
normal prior N(0, 1), evaluated on a fine grid [-4, 4].
"""

from typing import List, Dict, Tuple

import numpy as np

# Grid used for EAP estimation
_THETA_GRID = np.linspace(-4.0, 4.0, 801)


def p_correct(theta: float | np.ndarray, a: float, b: float) -> np.ndarray:
    """2PL probability of a correct response."""
    return 1.0 / (1.0 + np.exp(-a * (theta - b)))


def fisher_information(theta: float, a: float, b: float) -> float:
    """Fisher information of item (a, b) at ability θ."""
    p = p_correct(theta, a, b)
    return float(a ** 2 * p * (1.0 - p))


def estimate_ability(
    items: List[Dict],
    corrects: List[bool],
    prior_mean: float = 0.0,
    prior_std: float = 1.0,
) -> Tuple[float, float]:
    """
    EAP ability estimate given a list of items and binary correctness flags.

    Returns
    -------
    theta_hat : float   — posterior mean
    theta_std : float   — posterior standard deviation
    """
    if not items:
        return prior_mean, prior_std

    thetas = _THETA_GRID
    log_posterior = -0.5 * ((thetas - prior_mean) / prior_std) ** 2

    for item, correct in zip(items, corrects):
        a = item["irt_discrimination"]
        b = item["irt_difficulty"]
        p = np.clip(p_correct(thetas, a, b), 1e-9, 1.0 - 1e-9)
        if correct:
            log_posterior += np.log(p)
        else:
            log_posterior += np.log(1.0 - p)

    # Numerically stable normalisation
    log_posterior -= log_posterior.max()
    posterior = np.exp(log_posterior)
    posterior /= posterior.sum()

    theta_hat = float(np.dot(thetas, posterior))
    theta_var = float(np.dot((thetas - theta_hat) ** 2, posterior))
    theta_std = float(np.sqrt(theta_var))

    return theta_hat, theta_std


def ability_to_percentile(theta: float) -> int:
    """Convert IRT ability (θ) to a percentile score (0–100)."""
    from scipy.stats import norm  # local import keeps top-level import fast
    return int(round(norm.cdf(theta) * 100))
