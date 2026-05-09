"""Tests for confidence-aware stopping rule."""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import pytest
from core.stopping_rule import check_stopping_rule


def test_no_stop_below_min_items():
    stop, reason = check_stopping_rule(n_items=3, confidence=0.99)
    assert stop is False
    assert reason is None


def test_stops_on_confidence():
    stop, reason = check_stopping_rule(n_items=6, confidence=0.92)
    assert stop is True
    assert reason == "confidence_reached"


def test_stops_on_max_items():
    stop, reason = check_stopping_rule(n_items=25, confidence=0.50)
    assert stop is True
    assert reason == "max_items"


def test_continues_below_threshold():
    stop, reason = check_stopping_rule(n_items=10, confidence=0.75)
    assert stop is False
    assert reason is None


def test_exact_min_boundary():
    # Exactly at min_items=5 with high confidence should stop
    stop, reason = check_stopping_rule(n_items=5, confidence=0.95)
    assert stop is True


def test_custom_threshold():
    stop, _ = check_stopping_rule(n_items=8, confidence=0.80, threshold=0.80)
    assert stop is True

    stop2, _ = check_stopping_rule(n_items=8, confidence=0.79, threshold=0.80)
    assert stop2 is False
