"""Tests for the tri-group Random Forest classifier."""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import pytest
from core.classifier import ScreeningClassifier, GROUP_LABELS


@pytest.fixture(scope="module")
def trained_clf():
    clf = ScreeningClassifier()
    clf.train()
    return clf


def test_train_sets_flag(trained_clf):
    assert trained_clf.trained is True


def test_predict_returns_valid_label(trained_clf):
    # High ability across all domains → expect group_c
    features = [1.5, 1.3, 1.2, 1.4, 1200, 0.1, 0.90]
    label, proba = trained_clf.predict(features)
    assert label in GROUP_LABELS.values()
    assert abs(sum(proba.values()) - 1.0) < 1e-6


def test_high_ability_group_c(trained_clf):
    features = [2.0, 1.8, 1.9, 2.1, 900, 0.05, 0.95]
    label, _ = trained_clf.predict(features)
    assert label == "group_c"


def test_low_ability_group_a(trained_clf):
    features = [-2.0, -1.8, -1.9, -2.1, 6000, 3.5, 0.20]
    label, _ = trained_clf.predict(features)
    assert label == "group_a"


def test_medium_ability_group_b(trained_clf):
    features = [0.0, 0.1, -0.1, 0.05, 3000, 1.0, 0.55]
    label, _ = trained_clf.predict(features)
    assert label == "group_b"


def test_confidence_high_for_extreme_case(trained_clf):
    features = [2.5, 2.3, 2.4, 2.2, 700, 0.0, 0.98]
    conf = trained_clf.confidence(features)
    assert conf > 0.85


def test_untrained_classifier_returns_default():
    clf = ScreeningClassifier()
    label, proba = clf.predict([0.0] * 7)
    assert label == "group_b"
    assert "group_a" in proba
