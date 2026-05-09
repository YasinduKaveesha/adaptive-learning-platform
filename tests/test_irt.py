"""Tests for IRT 2PL module."""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import numpy as np
import pytest
from core.irt import estimate_ability, fisher_information, p_correct, ability_to_percentile


def test_p_correct_at_difficulty():
    """At θ = b, P(correct) should be exactly 0.5."""
    assert abs(p_correct(1.0, a=1.5, b=1.0) - 0.5) < 1e-9


def test_p_correct_above_difficulty():
    """Higher ability → higher probability."""
    assert p_correct(2.0, 1.5, 0.0) > p_correct(0.0, 1.5, 0.0)


def test_p_correct_range():
    thetas = np.linspace(-4, 4, 100)
    p = p_correct(thetas, a=1.0, b=0.0)
    assert np.all(p > 0) and np.all(p < 1)


def test_fisher_information_symmetric():
    """Fisher info should be max at θ = b."""
    b = 0.5
    a = 1.5
    info_at_b = fisher_information(b, a, b)
    info_above = fisher_information(b + 1.0, a, b)
    info_below = fisher_information(b - 1.0, a, b)
    assert info_at_b >= info_above
    assert info_at_b >= info_below


def test_estimate_ability_empty():
    theta, std = estimate_ability([], [])
    assert theta == 0.0
    assert std == 1.0


def test_estimate_ability_all_correct():
    """All correct responses should shift θ positive."""
    items = [
        {"irt_difficulty": 0.0, "irt_discrimination": 1.5},
        {"irt_difficulty": 0.5, "irt_discrimination": 1.5},
        {"irt_difficulty": -0.3, "irt_discrimination": 1.5},
    ]
    corrects = [True, True, True]
    theta, _ = estimate_ability(items, corrects)
    assert theta > 0.0


def test_estimate_ability_all_wrong():
    """All wrong responses should shift θ negative."""
    items = [
        {"irt_difficulty": 0.0, "irt_discrimination": 1.5},
        {"irt_difficulty": 0.5, "irt_discrimination": 1.5},
    ]
    theta, _ = estimate_ability(items, [False, False])
    assert theta < 0.0


def test_estimate_ability_std_decreases_with_data():
    """More data should reduce posterior uncertainty."""
    items_1 = [{"irt_difficulty": 0.0, "irt_discrimination": 1.5}]
    items_3 = items_1 * 5
    _, std_1 = estimate_ability(items_1, [True])
    _, std_3 = estimate_ability(items_3, [True] * 5)
    assert std_3 < std_1


def test_ability_to_percentile_midpoint():
    pct = ability_to_percentile(0.0)
    assert pct == 50


def test_ability_to_percentile_bounds():
    assert ability_to_percentile(-3.0) < 5
    assert ability_to_percentile(3.0) > 95
