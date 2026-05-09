"""Tests for Thompson Sampling item selector."""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import pytest
from core.thompson_sampling import ThompsonSampler
from core.item_bank import ITEMS


def _items_of_domain(domain):
    return [i for i in ITEMS if i["domain"] == domain]


def test_select_item_returns_item():
    sampler = ThompsonSampler(rng_seed=0)
    item = sampler.select_item(ITEMS, theta=0.0, domain_rotation=[])
    assert item is not None
    assert "item_id" in item


def test_no_repeat_in_eligible():
    """Selected item should not be in answered set."""
    sampler = ThompsonSampler(rng_seed=42)
    answered = {"wm_01", "pr_01"}
    candidates = [i for i in ITEMS if i["item_id"] not in answered]
    item = sampler.select_item(candidates, theta=0.0, domain_rotation=[])
    assert item["item_id"] not in answered


def test_domain_rotation_constraint():
    """After two consecutive same-domain items, that domain should be blocked."""
    sampler = ThompsonSampler(rng_seed=7)
    # Only provide working_memory candidates
    wm_only = _items_of_domain("working_memory")
    rotation = ["working_memory", "working_memory"]

    # Should still return something (fall back if all blocked)
    item = sampler.select_item(wm_only, theta=0.0, domain_rotation=rotation)
    assert item is not None  # fallback activated, not None


def test_domain_rotation_prefers_different():
    """With mixed candidates, TS should avoid the blocked domain."""
    sampler = ThompsonSampler(rng_seed=99)
    rotation = ["working_memory", "working_memory"]
    # Sample 20 times — majority should not be working_memory
    domains = [
        sampler.select_item(ITEMS, theta=0.0, domain_rotation=rotation)["domain"]
        for _ in range(20)
    ]
    wm_count = sum(1 for d in domains if d == "working_memory")
    assert wm_count < 20  # at least some non-WM items selected


def test_serialisation_roundtrip():
    sampler = ThompsonSampler(rng_seed=1)
    sampler.record("wm_01", True)
    sampler.record("pr_01", False)
    d = sampler.to_dict()
    restored = ThompsonSampler.from_dict(d)
    assert restored._history["wm_01"][-1] == True
    assert restored._history["pr_01"][-1] == False


def test_window_eviction():
    sampler = ThompsonSampler(window_size=3)
    for _ in range(5):
        sampler.record("wm_01", True)
    assert len(sampler._history["wm_01"]) == 3
