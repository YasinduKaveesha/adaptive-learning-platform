"""
In-memory session and student store (PP1 prototype).

Phase 3 will replace this with SQLite (local-first) + Firestore sync.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional

from core.thompson_sampling import ThompsonSampler


@dataclass
class ResponseRecord:
    item_id: str
    domain: str
    correct: bool
    reaction_time_ms: int
    hesitation_count: int
    engagement_score: float
    answered_at: datetime


@dataclass
class DomainState:
    theta: float = 0.0
    std: float = 1.0
    items_answered: int = 0
    item_ids: List[str] = field(default_factory=list)
    corrects: List[bool] = field(default_factory=list)


@dataclass
class SessionState:
    session_id: str
    student_id: str
    language: str
    started_at: datetime
    responses: List[ResponseRecord] = field(default_factory=list)
    answered_item_ids: set = field(default_factory=set)
    domain_states: Dict[str, DomainState] = field(default_factory=dict)
    ts_sampler: ThompsonSampler = field(default_factory=ThompsonSampler)
    domain_rotation: List[str] = field(default_factory=list)
    confidence_history: List[float] = field(default_factory=list)
    # Final outputs (set on session completion)
    status: str = "active"  # active | completed
    final_classification: Optional[str] = None
    final_confidence: Optional[float] = None
    stopping_reason: Optional[str] = None
    ended_at: Optional[datetime] = None


@dataclass
class StudentRecord:
    student_id: str
    name: str
    language: str
    session_ids: List[str] = field(default_factory=list)
    latest_session_id: Optional[str] = None


# ── Singleton in-memory stores ────────────────────────────────────────────────

_sessions: Dict[str, SessionState] = {}
_students: Dict[str, StudentRecord] = {}


def create_session(
    session_id: str,
    student_id: str,
    language: str,
) -> SessionState:
    from core.item_bank import DOMAINS

    state = SessionState(
        session_id=session_id,
        student_id=student_id,
        language=language,
        started_at=datetime.now(timezone.utc),
        domain_states={d: DomainState() for d in DOMAINS},
    )
    _sessions[session_id] = state

    # Register student if new
    if student_id not in _students:
        _students[student_id] = StudentRecord(
            student_id=student_id,
            name=student_id,
            language=language,
        )
    _students[student_id].session_ids.append(session_id)
    _students[student_id].latest_session_id = session_id

    return state


def get_session(session_id: str) -> Optional[SessionState]:
    return _sessions.get(session_id)


def get_student(student_id: str) -> Optional[StudentRecord]:
    return _students.get(student_id)


def upsert_student(student_id: str, name: str, language: str) -> StudentRecord:
    if student_id not in _students:
        _students[student_id] = StudentRecord(
            student_id=student_id, name=name, language=language
        )
    return _students[student_id]
