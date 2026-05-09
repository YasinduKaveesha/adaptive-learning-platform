"""Pydantic v2 request/response schemas — Component A public API."""

from __future__ import annotations

from typing import Dict, List, Optional
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


# ── Shared types ──────────────────────────────────────────────────────────────

class DomainAbility(BaseModel):
    theta: float = Field(description="IRT ability estimate")
    std: float = Field(description="Posterior standard deviation")
    percentile: int = Field(ge=0, le=100, description="Percentile (0–100)")
    items_answered: int = 0


class BehaviouralMetadata(BaseModel):
    avg_reaction_time_ms: int
    avg_hesitation_count: float
    avg_engagement_score: float


# ── Adaptive Task Schema (Grade 5) ────────────────────────────────────────────

class TaskMetadata(BaseModel):
    """Metadata for adaptive tasks including hints, scoring, and UI guidance."""
    hints_available: bool = False
    hint_texts: List[str] = []
    scoring_rules: str = ""
    example_ui_notes: str = ""
    source_inspiration: str = ""


class AdaptiveTaskSchema(BaseModel):
    """Schema for Grade 5 adaptive cognitive tasks."""
    task_id: str = Field(description="Unique task identifier (e.g., WM_001)")
    category: str = Field(description="Cognitive category: working_memory, attention, pattern_recognition, reasoning")
    difficulty: str = Field(description="Task difficulty: easy, medium, hard")
    task_type: str = Field(description="Task subtype (e.g., digit_span_forward, flanker_large)")
    question: str = Field(description="Task prompt/question presented to student")
    content: Dict = Field(description="Structured content (sequences, sequences, items, etc.)")
    correct_answer: Optional[object] = Field(description="Correct answer (can be int, str, list, etc.)")
    estimated_time_sec: int = Field(description="Estimated time in seconds")
    max_time_sec: int = Field(description="Maximum allowed time in seconds")
    adaptive_weight: float = Field(description="Difficulty weight for adaptive algorithm (0.3-0.95)")
    metadata: TaskMetadata = Field(description="Additional task metadata")


# ── Item representation (sent to mobile app) ─────────────────────────────────

class ItemSchema(BaseModel):
    item_id: str
    domain: str
    game_type: str
    study_prompt: Optional[str] = None
    study_content: Optional[str] = None
    study_items: List[str] = []
    question: str
    options: Dict[str, str]


# ── Screening session ─────────────────────────────────────────────────────────

class StartScreeningRequest(BaseModel):
    initiated_by: str = Field(description="teacher_id or 'self'")
    language_preference: str = Field(default="english", pattern="^(english|sinhala|tamil)$")
    context: str = Field(default="initial_screening")


class StartScreeningResponse(BaseModel):
    session_id: str
    student_id: str
    started_at: datetime
    expected_duration_minutes: int = 12
    first_item: ItemSchema
    language: str


# ── Response submission ───────────────────────────────────────────────────────

class SubmitResponseRequest(BaseModel):
    item_id: str
    correct: bool
    reaction_time_ms: int = Field(ge=0)
    hesitation_count: int = Field(ge=0, default=0)


class SessionSnapshot(BaseModel):
    items_answered: int
    overall_theta: float
    overall_std: float
    confidence: float
    domain_abilities: Dict[str, DomainAbility]
    confidence_history: List[float]


class SubmitResponseResponse(BaseModel):
    session_id: str
    response_recorded: bool
    snapshot: SessionSnapshot
    stop: bool
    stop_reason: Optional[str] = None
    next_item: Optional[ItemSchema] = None


# ── Classification output (API contract §3.1) ─────────────────────────────────

class ClassificationResponse(BaseModel):
    student_id: str
    classification: str = Field(description="group_a | group_b | group_c")
    confidence: float
    session_id: str
    screened_at: datetime
    valid_until: datetime
    doctor_reviewed: bool = False
    domain_profile: Dict[str, int] = Field(description="domain → percentile")
    behavioural_metadata: BehaviouralMetadata


# ── Grade 5 Screening Session (Adaptive) ──────────────────────────────────────

class StartGrade5ScreeningRequest(BaseModel):
    initiated_by: str = Field(description="teacher_id or 'self'")
    grade_level: int = Field(default=5, description="Student grade (e.g., 5)")
    language_preference: str = Field(default="english", pattern="^(english|sinhala|tamil)$")


class StartGrade5ScreeningResponse(BaseModel):
    session_id: str
    student_id: str
    started_at: datetime
    expected_duration_minutes: int = Field(description="Estimated session duration")
    first_task: AdaptiveTaskSchema
    language: str


class Grade5DemoTasksResponse(BaseModel):
    total_tasks: int = Field(description="Number of demo tasks returned")
    tasks_per_category: int = Field(description="Number of tasks sampled from each category")
    categories: List[str]
    tasks: List[AdaptiveTaskSchema]


class SubmitGrade5ResponseRequest(BaseModel):
    task_id: str
    correct: bool
    reaction_time_ms: int = Field(ge=0)
    hesitation_count: int = Field(ge=0, default=0)
    hint_used: bool = Field(default=False, description="Whether student used a hint")


class Grade5SessionSnapshot(BaseModel):
    tasks_answered: int
    overall_theta: float
    overall_std: float
    confidence: float
    category_profiles: Dict[str, DomainAbility]
    adaptive_difficulty_level: str = Field(description="Current adaptive difficulty: easy, medium, hard")
    confidence_history: List[float]


class SubmitGrade5ResponseResponse(BaseModel):
    session_id: str
    response_recorded: bool
    snapshot: Grade5SessionSnapshot
    stop: bool
    stop_reason: Optional[str] = None
    next_task: Optional[AdaptiveTaskSchema] = None


# ── Profile output (API contract §3.2) ────────────────────────────────────────

class ProfileResponse(BaseModel):
    student_id: str
    domain_profile: Dict[str, DomainAbility]
    screening_session_id: str
    computed_at: datetime


# ── Standard error (API contract §7) ─────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
    message: str
    trace_id: str
    timestamp: datetime
