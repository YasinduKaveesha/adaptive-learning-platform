"""
Component A — Public REST API  (API Contract §3)

Endpoints:
  POST /students/{student_id}/screening/start
  POST /screening/sessions/{session_id}/respond
  GET  /students/{student_id}/classification
  GET  /students/{student_id}/profile
  POST /webhooks/classification-completed   (stub; fires to B & D)
"""

from __future__ import annotations

import uuid
import random
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request

from core.classifier import ScreeningClassifier
from core.irt import ability_to_percentile, estimate_ability
from core.item_bank import DOMAINS, ITEMS, ITEMS_BY_ID, get_grade5_task, get_grade5_tasks_by_category, get_grade5_tasks_by_category_and_difficulty, get_grade5_stats
from core.multimodal import aggregate_session_features, compute_engagement_score
from core.stopping_rule import check_stopping_rule
from models.schemas import (
    AdaptiveTaskSchema,
    BehaviouralMetadata,
    ClassificationResponse,
    DomainAbility,
    ItemSchema,
    ProfileResponse,
    SessionSnapshot,
    StartScreeningRequest,
    StartScreeningResponse,
    SubmitResponseRequest,
    SubmitResponseResponse,
    StartGrade5ScreeningRequest,
    StartGrade5ScreeningResponse,
    Grade5DemoTasksResponse,
    SubmitGrade5ResponseRequest,
    SubmitGrade5ResponseResponse,
    Grade5SessionSnapshot,
)
from store.session_store import (
    DomainState,
    ResponseRecord,
    SessionState,
    create_session,
    get_session,
    get_student,
    upsert_student,
)

router = APIRouter(tags=["screening"])


# ── Dependency: shared classifier instance ────────────────────────────────────

def get_classifier(request: Request) -> ScreeningClassifier:
    return request.app.state.classifier


# ── Helpers ───────────────────────────────────────────────────────────────────

def _item_to_schema(item: dict) -> ItemSchema:
    return ItemSchema(
        item_id=item["item_id"],
        domain=item["domain"],
        game_type=item["game_type"],
        study_prompt=item.get("study_prompt"),
        study_content=item.get("study_content"),
        study_items=item.get("study_items", []),
        question=item["question"],
        options=item["options"],
    )


def _build_feature_vector(session: SessionState) -> list[float]:
    """7-dim feature vector for the classifier."""
    domain_thetas = [session.domain_states[d].theta for d in DOMAINS]

    rt = [r.reaction_time_ms for r in session.responses]
    hes = [r.hesitation_count for r in session.responses]
    eng = [r.engagement_score for r in session.responses]
    mm = aggregate_session_features(rt, hes, eng)

    return domain_thetas + [
        mm["avg_reaction_time_ms"],
        mm["avg_hesitation_count"],
        mm["avg_engagement_score"],
    ]


def _select_next_item(session: SessionState) -> dict | None:
    available = [i for i in ITEMS if i["item_id"] not in session.answered_item_ids]
    if not available:
        return None

    overall_theta = sum(s.theta for s in session.domain_states.values()) / len(DOMAINS)
    return session.ts_sampler.select_item(available, overall_theta, session.domain_rotation)


def _snapshot(session: SessionState, confidence: float) -> SessionSnapshot:
    overall_theta = sum(s.theta for s in session.domain_states.values()) / len(DOMAINS)
    overall_std = sum(s.std for s in session.domain_states.values()) / len(DOMAINS)
    return SessionSnapshot(
        items_answered=len(session.responses),
        overall_theta=round(overall_theta, 4),
        overall_std=round(overall_std, 4),
        confidence=round(confidence, 4),
        domain_abilities={
            d: DomainAbility(
                theta=round(s.theta, 4),
                std=round(s.std, 4),
                percentile=ability_to_percentile(s.theta),
                items_answered=s.items_answered,
            )
            for d, s in session.domain_states.items()
        },
        confidence_history=[round(c, 4) for c in session.confidence_history],
    )


# ── POST /students/{student_id}/screening/start ───────────────────────────────

@router.post(
    "/students/{student_id}/screening/start",
    response_model=StartScreeningResponse,
    status_code=201,
)
def start_screening(
    student_id: str,
    body: StartScreeningRequest,
    clf: ScreeningClassifier = Depends(get_classifier),
) -> StartScreeningResponse:

    upsert_student(student_id, name=student_id, language=body.language_preference)
    session_id = str(uuid.uuid4())
    session = create_session(session_id, student_id, body.language_preference)

    # Select first item (θ = 0 prior)
    first = session.ts_sampler.select_item(ITEMS, 0.0, [])
    if first is None:
        raise HTTPException(status_code=500, detail="Item bank is empty.")

    return StartScreeningResponse(
        session_id=session_id,
        student_id=student_id,
        started_at=session.started_at,
        first_item=_item_to_schema(first),
        language=body.language_preference,
    )


# ── POST /screening/sessions/{session_id}/respond ────────────────────────────

@router.post(
    "/screening/sessions/{session_id}/respond",
    response_model=SubmitResponseResponse,
)
def submit_response(
    session_id: str,
    body: SubmitResponseRequest,
    clf: ScreeningClassifier = Depends(get_classifier),
) -> SubmitResponseResponse:

    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.status != "active":
        raise HTTPException(status_code=409, detail="Session is already completed.")

    item = ITEMS_BY_ID.get(body.item_id)
    if item is None:
        raise HTTPException(status_code=404, detail=f"Item '{body.item_id}' not found.")
    if body.item_id in session.answered_item_ids:
        raise HTTPException(status_code=409, detail="Item already answered in this session.")

    # Engagement score
    eng_score = compute_engagement_score(
        body.reaction_time_ms, body.hesitation_count, body.correct
    )

    # Record response
    session.responses.append(
        ResponseRecord(
            item_id=body.item_id,
            domain=item["domain"],
            correct=body.correct,
            reaction_time_ms=body.reaction_time_ms,
            hesitation_count=body.hesitation_count,
            engagement_score=eng_score,
            answered_at=datetime.now(timezone.utc),
        )
    )
    session.answered_item_ids.add(body.item_id)
    session.ts_sampler.record(body.item_id, body.correct)

    # Update domain rotation
    session.domain_rotation.append(item["domain"])
    if len(session.domain_rotation) > 3:
        session.domain_rotation.pop(0)

    # Update domain ability estimate
    ds: DomainState = session.domain_states[item["domain"]]
    ds.item_ids.append(body.item_id)
    ds.corrects.append(body.correct)
    ds.items_answered += 1
    domain_items = [ITEMS_BY_ID[iid] for iid in ds.item_ids]
    ds.theta, ds.std = estimate_ability(domain_items, ds.corrects)

    # Classifier confidence
    n_items = len(session.responses)
    feature_vector = _build_feature_vector(session)
    classification, proba_dict = clf.predict(feature_vector)
    confidence = max(proba_dict.values())
    session.confidence_history.append(confidence)

    # Stopping rule
    stop, stop_reason = check_stopping_rule(n_items, confidence)

    next_item_schema = None
    if stop:
        session.status = "completed"
        session.final_classification = classification
        session.final_confidence = confidence
        session.stopping_reason = stop_reason
        session.ended_at = datetime.now(timezone.utc)
    else:
        next_item = _select_next_item(session)
        if next_item is None:
            # All items exhausted
            stop, stop_reason = True, "max_items"
            session.status = "completed"
            session.final_classification = classification
            session.final_confidence = confidence
            session.stopping_reason = stop_reason
            session.ended_at = datetime.now(timezone.utc)
        else:
            next_item_schema = _item_to_schema(next_item)

    return SubmitResponseResponse(
        session_id=session_id,
        response_recorded=True,
        snapshot=_snapshot(session, confidence),
        stop=stop,
        stop_reason=stop_reason,
        next_item=next_item_schema,
    )


# ── GET /students/{student_id}/classification ─────────────────────────────────

@router.get(
    "/students/{student_id}/classification",
    response_model=ClassificationResponse,
)
def get_classification(student_id: str) -> ClassificationResponse:
    student = get_student(student_id)
    if student is None or student.latest_session_id is None:
        raise HTTPException(status_code=404, detail="No screening data for this student.")

    session = get_session(student.latest_session_id)
    if session is None or session.status != "completed":
        raise HTTPException(status_code=404, detail="No completed screening for this student.")

    rt = [r.reaction_time_ms for r in session.responses]
    hes = [r.hesitation_count for r in session.responses]
    eng = [r.engagement_score for r in session.responses]
    mm = aggregate_session_features(rt, hes, eng)

    return ClassificationResponse(
        student_id=student_id,
        classification=session.final_classification,
        confidence=round(session.final_confidence, 4),
        session_id=session.latest_session_id if hasattr(session, "latest_session_id") else student.latest_session_id,
        screened_at=session.ended_at,
        valid_until=session.ended_at + timedelta(days=21),
        doctor_reviewed=False,
        domain_profile={
            d: ability_to_percentile(s.theta)
            for d, s in session.domain_states.items()
        },
        behavioural_metadata=BehaviouralMetadata(**mm),
    )


# ── GET /students/{student_id}/profile ───────────────────────────────────────

@router.get("/students/{student_id}/profile", response_model=ProfileResponse)
def get_profile(student_id: str) -> ProfileResponse:
    student = get_student(student_id)
    if student is None or student.latest_session_id is None:
        raise HTTPException(status_code=404, detail="No screening data for this student.")

    session = get_session(student.latest_session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    return ProfileResponse(
        student_id=student_id,
        domain_profile={
            d: DomainAbility(
                theta=round(s.theta, 4),
                std=round(s.std, 4),
                percentile=ability_to_percentile(s.theta),
                items_answered=s.items_answered,
            )
            for d, s in session.domain_states.items()
        },
        screening_session_id=student.latest_session_id,
        computed_at=datetime.now(timezone.utc),
    )


# ── GRADE 5 ADAPTIVE TASK ENDPOINTS ───────────────────────────────────────────

def _task_to_schema(task: dict) -> AdaptiveTaskSchema:
    """Convert a Grade 5 task dict to AdaptiveTaskSchema."""
    from models.schemas import TaskMetadata
    
    metadata = task.get("metadata", {})
    return AdaptiveTaskSchema(
        task_id=task["task_id"],
        category=task["category"],
        difficulty=task["difficulty"],
        task_type=task["task_type"],
        question=task["question"],
        content=task.get("content", {}),
        correct_answer=task.get("correct_answer"),
        estimated_time_sec=task.get("estimated_time_sec", 15),
        max_time_sec=task.get("max_time_sec", 30),
        adaptive_weight=task.get("adaptive_weight", 0.5),
        metadata=TaskMetadata(
            hints_available=metadata.get("hints_available", False),
            hint_texts=metadata.get("hint_texts", []),
            scoring_rules=metadata.get("scoring_rules", ""),
            example_ui_notes=metadata.get("example_ui_notes", ""),
            source_inspiration=metadata.get("source_inspiration", ""),
        ),
    )


# ── POST /students/{student_id}/screening/grade5/start ─────────────────────────

@router.post(
    "/students/{student_id}/screening/grade5/start",
    response_model=StartGrade5ScreeningResponse,
    status_code=201,
)
def start_grade5_screening(
    student_id: str,
    body: StartGrade5ScreeningRequest,
) -> StartGrade5ScreeningResponse:
    """Start a Grade 5 adaptive cognitive screening session."""
    # Upsert student
    upsert_student(student_id, name=student_id, language=body.language_preference)
    
    session_id = str(uuid.uuid4())
    session = create_session(session_id, student_id, body.language_preference)
    
    # Select first task: start with medium difficulty (balanced approach)
    first_tasks = get_grade5_tasks_by_category_and_difficulty("working_memory", "medium")
    if not first_tasks:
        # Fallback: try easy
        first_tasks = get_grade5_tasks_by_category_and_difficulty("working_memory", "easy")
    
    if not first_tasks:
        raise HTTPException(status_code=500, detail="Grade 5 task bank is empty.")
    
    first_task = first_tasks[0]  # In production, use adaptive selection
    
    estimated_duration = 15  # Average ~15 min for 40 tasks
    
    return StartGrade5ScreeningResponse(
        session_id=session_id,
        student_id=student_id,
        started_at=session.started_at,
        expected_duration_minutes=estimated_duration,
        first_task=_task_to_schema(first_task),
        language=body.language_preference,
    )


# ── GET /task-bank/grade5/demo ───────────────────────────────────────────────

@router.get("/task-bank/grade5/demo", response_model=Grade5DemoTasksResponse)
def get_grade5_demo_tasks() -> Grade5DemoTasksResponse:
    """Return a demo set of 8 Grade 5 tasks: 2 random tasks per category."""
    categories = ["working_memory", "attention", "pattern_recognition", "reasoning"]
    rng = random.SystemRandom()
    demo_tasks = []

    for category in categories:
        category_tasks = list(get_grade5_tasks_by_category(category))
        if len(category_tasks) < 2:
            raise HTTPException(
                status_code=500,
                detail=f"Not enough Grade 5 tasks for category '{category}'.",
            )
        demo_tasks.extend(rng.sample(category_tasks, 2))

    rng.shuffle(demo_tasks)

    return Grade5DemoTasksResponse(
        total_tasks=len(demo_tasks),
        tasks_per_category=2,
        categories=categories,
        tasks=[_task_to_schema(task) for task in demo_tasks],
    )


# ── POST /screening/grade5/sessions/{session_id}/respond ───────────────────────

@router.post(
    "/screening/grade5/sessions/{session_id}/respond",
    response_model=SubmitGrade5ResponseResponse,
)
def submit_grade5_response(
    session_id: str,
    body: SubmitGrade5ResponseRequest,
) -> SubmitGrade5ResponseResponse:
    """Submit a response to a Grade 5 adaptive task."""
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.status != "active":
        raise HTTPException(status_code=409, detail="Session is already completed.")
    
    task = get_grade5_task(body.task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Task '{body.task_id}' not found.")
    if body.task_id in session.answered_item_ids:
        raise HTTPException(status_code=409, detail="Task already answered in this session.")
    
    # Compute engagement score
    eng_score = compute_engagement_score(
        body.reaction_time_ms, body.hesitation_count, body.correct
    )
    
    # Record response
    category = task.get("category")
    session.responses.append(
        ResponseRecord(
            item_id=body.task_id,
            domain=category,  # Use category as domain for Grade 5
            correct=body.correct,
            reaction_time_ms=body.reaction_time_ms,
            hesitation_count=body.hesitation_count,
            engagement_score=eng_score,
            answered_at=datetime.now(timezone.utc),
        )
    )
    session.answered_item_ids.add(body.task_id)
    session.ts_sampler.record(body.task_id, body.correct)
    
    # Update domain rotation (using category as domain)
    session.domain_rotation.append(category)
    if len(session.domain_rotation) > 3:
        session.domain_rotation.pop(0)
    
    # Update domain ability estimate
    if category not in session.domain_states:
        session.domain_states[category] = DomainState()
    
    ds = session.domain_states[category]
    ds.item_ids.append(body.task_id)
    ds.corrects.append(body.correct)
    ds.items_answered += 1
    
    # Estimate ability for this category
    category_tasks = [get_grade5_task(iid) for iid in ds.item_ids]
    category_tasks = [t for t in category_tasks if t is not None]
    ds.theta, ds.std = estimate_ability(category_tasks, ds.corrects)
    
    # Stopping rule
    n_items = len(session.responses)
    overall_theta = sum(s.theta for s in session.domain_states.values()) / max(len(session.domain_states), 1)
    
    # Simple confidence estimate (can be improved)
    confidence = 0.5 + (0.4 * min(n_items / 12, 1.0))  # Increases with items answered
    session.confidence_history.append(confidence)
    
    stop, stop_reason = check_stopping_rule(n_items, confidence)
    
    next_task_schema = None
    if stop:
        session.status = "completed"
        session.final_classification = "screened"
        session.final_confidence = confidence
        session.stopping_reason = stop_reason
        session.ended_at = datetime.now(timezone.utc)
    else:
        # Select next task adaptively
        current_difficulty = "medium"
        if overall_theta < -0.5:
            current_difficulty = "easy"
        elif overall_theta > 0.5:
            current_difficulty = "hard"
        
        # Get next category (rotate through categories)
        categories = ["working_memory", "attention", "pattern_recognition", "reasoning"]
        next_category = categories[n_items % len(categories)]
        
        next_tasks = get_grade5_tasks_by_category_and_difficulty(next_category, current_difficulty)
        if next_tasks:
            # Pick a task not yet answered
            available_next = [t for t in next_tasks if t["task_id"] not in session.answered_item_ids]
            if available_next:
                next_task_schema = _task_to_schema(available_next[0])
            else:
                # All tasks in difficulty/category exhausted, try other difficulties
                all_next = get_grade5_tasks_by_category_and_difficulty(next_category, "medium")
                available_next = [t for t in all_next if t["task_id"] not in session.answered_item_ids]
                if available_next:
                    next_task_schema = _task_to_schema(available_next[0])
        
        if next_task_schema is None:
            # All tasks exhausted
            stop, stop_reason = True, "max_tasks"
            session.status = "completed"
            session.final_classification = "screened"
            session.final_confidence = confidence
            session.stopping_reason = stop_reason
            session.ended_at = datetime.now(timezone.utc)
    
    overall_theta = sum(s.theta for s in session.domain_states.values()) / max(len(session.domain_states), 1)
    overall_std = sum(s.std for s in session.domain_states.values()) / max(len(session.domain_states), 1)
    
    snapshot = Grade5SessionSnapshot(
        tasks_answered=len(session.responses),
        overall_theta=round(overall_theta, 4),
        overall_std=round(overall_std, 4),
        confidence=round(confidence, 4),
        category_profiles={
            c: DomainAbility(
                theta=round(s.theta, 4),
                std=round(s.std, 4),
                percentile=ability_to_percentile(s.theta),
                items_answered=s.items_answered,
            )
            for c, s in session.domain_states.items()
        },
        adaptive_difficulty_level="medium",  # Can be computed from overall_theta
        confidence_history=[round(c, 4) for c in session.confidence_history],
    )
    
    return SubmitGrade5ResponseResponse(
        session_id=session_id,
        response_recorded=True,
        snapshot=snapshot,
        stop=stop,
        stop_reason=stop_reason,
        next_task=next_task_schema,
    )


# ── GET /task-bank/grade5/stats ──────────────────────────────────────────────

@router.get("/task-bank/grade5/stats")
def get_grade5_task_bank_stats() -> dict:
    """Get statistics about the Grade 5 task bank."""
    return get_grade5_stats()
