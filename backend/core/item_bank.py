"""
Doctor-validated synthetic item bank supporting both legacy (16 items) and Grade 5 (40 items) tasks.
Legacy: 16 items across 4 cognitive domains (4 per domain) with IRT 2PL parameters.
Grade 5: 40 adaptive tasks (10 per category) with difficulty, adaptive_weight, and structured content.
"""

import json
import os
from typing import List, Dict, Optional

ITEMS: List[Dict] = [
    # ── WORKING MEMORY ────────────────────────────────────────────────────────
    {
        "item_id": "wm_01",
        "domain": "working_memory",
        "irt_difficulty": -1.0,
        "irt_discrimination": 1.5,
        "doctor_validated": True,
        "game_type": "sequence_recall",
        "study_prompt": "Study this number sequence carefully:",
        "study_content": "4  —  7  —  2  —  9",
        "study_items": ["4", "7", "2", "9"],
        "question": "What was the 3rd number?",
        "options": {"A": "2", "B": "4", "C": "7", "D": "9"},
        "correct": "A",
    },
    {
        "item_id": "wm_02",
        "domain": "working_memory",
        "irt_difficulty": -0.2,
        "irt_discrimination": 1.8,
        "doctor_validated": True,
        "game_type": "sequence_recall",
        "study_prompt": "Remember these colours in order:",
        "study_content": "Red  →  Blue  →  Green  →  Yellow",
        "study_items": ["Red", "Blue", "Green", "Yellow"],
        "question": "Which colour came 2nd?",
        "options": {"A": "Red", "B": "Blue", "C": "Green", "D": "Yellow"},
        "correct": "B",
    },
    {
        "item_id": "wm_03",
        "domain": "working_memory",
        "irt_difficulty": 0.6,
        "irt_discrimination": 1.6,
        "doctor_validated": True,
        "game_type": "sequence_recall",
        "study_prompt": "Remember these fruits in order:",
        "study_content": "Apple  →  Banana  →  Cherry  →  Grapes  →  Peach",
        "study_items": ["Apple", "Banana", "Cherry", "Grapes", "Peach"],
        "question": "Which fruit was at position 4?",
        "options": {"A": "Apple", "B": "Banana", "C": "Cherry", "D": "Grapes"},
        "correct": "D",
    },
    {
        "item_id": "wm_04",
        "domain": "working_memory",
        "irt_difficulty": 1.3,
        "irt_discrimination": 1.4,
        "doctor_validated": True,
        "game_type": "sequence_recall",
        "study_prompt": "Remember these letters in order:",
        "study_content": "K  —  B  —  P  —  Q  —  M  —  D",
        "study_items": ["K", "B", "P", "Q", "M", "D"],
        "question": "Which letter came 5th?",
        "options": {"A": "P", "B": "Q", "C": "M", "D": "D"},
        "correct": "C",
    },

    # ── PATTERN RECOGNITION ───────────────────────────────────────────────────
    {
        "item_id": "pr_01",
        "domain": "pattern_recognition",
        "irt_difficulty": -1.2,
        "irt_discrimination": 1.7,
        "doctor_validated": True,
        "game_type": "pattern_completion",
        "study_prompt": None,
        "study_content": None,
        "study_items": [],
        "question": "What comes next in the pattern?\n\n2  →  4  →  6  →  ?",
        "options": {"A": "7", "B": "8", "C": "9", "D": "10"},
        "correct": "B",
    },
    {
        "item_id": "pr_02",
        "domain": "pattern_recognition",
        "irt_difficulty": -0.4,
        "irt_discrimination": 1.9,
        "doctor_validated": True,
        "game_type": "pattern_completion",
        "study_prompt": None,
        "study_content": None,
        "study_items": [],
        "question": "What shape comes next?\n\n△  ○  □  △  ○  □  △  ○  ?",
        "options": {"A": "△", "B": "○", "C": "□", "D": "◇"},
        "correct": "C",
    },
    {
        "item_id": "pr_03",
        "domain": "pattern_recognition",
        "irt_difficulty": 0.7,
        "irt_discrimination": 1.5,
        "doctor_validated": True,
        "game_type": "pattern_completion",
        "study_prompt": None,
        "study_content": None,
        "study_items": [],
        "question": "Complete the number sequence:\n\n1  →  4  →  9  →  16  →  ?",
        "options": {"A": "20", "B": "24", "C": "25", "D": "36"},
        "correct": "C",
    },
    {
        "item_id": "pr_04",
        "domain": "pattern_recognition",
        "irt_difficulty": 1.5,
        "irt_discrimination": 1.3,
        "doctor_validated": True,
        "game_type": "pattern_completion",
        "study_prompt": None,
        "study_content": None,
        "study_items": [],
        "question": "Find the rule and complete:\n\n3  →  6  →  12  →  24  →  ?",
        "options": {"A": "36", "B": "42", "C": "48", "D": "30"},
        "correct": "C",
    },

    # ── ATTENTION ─────────────────────────────────────────────────────────────
    {
        "item_id": "att_01",
        "domain": "attention",
        "irt_difficulty": -1.1,
        "irt_discrimination": 1.6,
        "doctor_validated": True,
        "game_type": "count_targets",
        "study_prompt": None,
        "study_content": None,
        "study_items": [],
        "question": "How many FILLED stars (★) are there?\n\n★  ☆  ★  ☆  ★  ☆  ★",
        "options": {"A": "3", "B": "4", "C": "5", "D": "6"},
        "correct": "B",
    },
    {
        "item_id": "att_02",
        "domain": "attention",
        "irt_difficulty": -0.3,
        "irt_discrimination": 1.8,
        "doctor_validated": True,
        "game_type": "count_targets",
        "study_prompt": None,
        "study_content": None,
        "study_items": [],
        "question": "Count only the RED circles (R) below:\n\nR  B  R  G  R  B  G  R  B  R",
        "options": {"A": "4", "B": "5", "C": "6", "D": "3"},
        "correct": "B",
    },
    {
        "item_id": "att_03",
        "domain": "attention",
        "irt_difficulty": 0.5,
        "irt_discrimination": 1.7,
        "doctor_validated": True,
        "game_type": "find_odd",
        "study_prompt": None,
        "study_content": None,
        "study_items": [],
        "question": "Which letter appears only ONCE in this list?\n\nA  B  C  A  B  D  A  B  C  A",
        "options": {"A": "A", "B": "B", "C": "C", "D": "D"},
        "correct": "D",
    },
    {
        "item_id": "att_04",
        "domain": "attention",
        "irt_difficulty": 1.2,
        "irt_discrimination": 1.4,
        "doctor_validated": True,
        "game_type": "count_targets",
        "study_prompt": None,
        "study_content": None,
        "study_items": [],
        "question": "How many times does the number 7 appear?\n\n3  7  5  2  7  1  8  7  4  9  7  6  3  7  2  1",
        "options": {"A": "4", "B": "5", "C": "6", "D": "3"},
        "correct": "B",
    },

    # ── LOGICAL REASONING ─────────────────────────────────────────────────────
    {
        "item_id": "lr_01",
        "domain": "logical_reasoning",
        "irt_difficulty": -0.9,
        "irt_discrimination": 1.6,
        "doctor_validated": True,
        "game_type": "syllogism",
        "study_prompt": None,
        "study_content": None,
        "study_items": [],
        "question": "Using ONLY the rules below, what is true?\n\nRule 1: All birds can fly.\nRule 2: A penguin is a bird.",
        "options": {
            "A": "Penguins cannot fly",
            "B": "By the rules, penguins can fly",
            "C": "Penguins might fly",
            "D": "There is not enough information",
        },
        "correct": "B",
    },
    {
        "item_id": "lr_02",
        "domain": "logical_reasoning",
        "irt_difficulty": -0.1,
        "irt_discrimination": 1.9,
        "doctor_validated": True,
        "game_type": "analogy",
        "study_prompt": None,
        "study_content": None,
        "study_items": [],
        "question": "Complete the analogy:\n\nBook  :  Reading  ::  Fork  :  ?",
        "options": {"A": "Spoon", "B": "Kitchen", "C": "Eating", "D": "Plate"},
        "correct": "C",
    },
    {
        "item_id": "lr_03",
        "domain": "logical_reasoning",
        "irt_difficulty": 0.9,
        "irt_discrimination": 1.5,
        "doctor_validated": True,
        "game_type": "ordering",
        "study_prompt": None,
        "study_content": None,
        "study_items": [],
        "question": "Sara has MORE stickers than Tom.\nTom has MORE stickers than Lily.\n\nWho has the LEAST stickers?",
        "options": {"A": "Sara", "B": "Tom", "C": "Lily", "D": "They all have the same"},
        "correct": "C",
    },
    {
        "item_id": "lr_04",
        "domain": "logical_reasoning",
        "irt_difficulty": 1.4,
        "irt_discrimination": 1.3,
        "doctor_validated": True,
        "game_type": "time_reasoning",
        "study_prompt": None,
        "study_content": None,
        "study_items": [],
        "question": "Today is Monday. The trip is in exactly 3 days.\nTrips are never on Sunday.\n\nWhat day is the trip?",
        "options": {"A": "Wednesday", "B": "Thursday", "C": "Friday", "D": "Saturday"},
        "correct": "B",
    },
]

# Index for O(1) lookup
ITEMS_BY_ID: Dict[str, Dict] = {item["item_id"]: item for item in ITEMS}

# ── GRADE 5 ADAPTIVE TASK BANK ────────────────────────────────────────────────

def load_grade5_tasks() -> List[Dict]:
    """Load Grade 5 adaptive task bank from JSON file."""
    try:
        base_dir = os.path.dirname(os.path.dirname(__file__))
        task_file = os.path.join(base_dir, "data", "grade5_tasks.json")
        with open(task_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"⚠️ Warning: Could not load Grade 5 tasks: {e}")
        return []


# Load Grade 5 tasks once at module import
GRADE5_TASKS: List[Dict] = load_grade5_tasks()
GRADE5_TASKS_BY_ID: Dict[str, Dict] = {task["task_id"]: task for task in GRADE5_TASKS}

# Category mapping for Grade 5
GRADE5_TASKS_BY_CATEGORY: Dict[str, List[Dict]] = {}
for task in GRADE5_TASKS:
    category = task.get("category")
    if category not in GRADE5_TASKS_BY_CATEGORY:
        GRADE5_TASKS_BY_CATEGORY[category] = []
    GRADE5_TASKS_BY_CATEGORY[category].append(task)


# ── LOOKUP FUNCTIONS ──────────────────────────────────────────────────────────

def get_legacy_item(item_id: str) -> Optional[Dict]:
    """Get a legacy item by ID."""
    return ITEMS_BY_ID.get(item_id)


def get_grade5_task(task_id: str) -> Optional[Dict]:
    """Get a Grade 5 task by ID."""
    return GRADE5_TASKS_BY_ID.get(task_id)


def get_grade5_tasks_by_category(category: str) -> List[Dict]:
    """Get all Grade 5 tasks in a category (e.g., 'working_memory', 'attention')."""
    return GRADE5_TASKS_BY_CATEGORY.get(category, [])


def get_grade5_tasks_by_difficulty(difficulty: str) -> List[Dict]:
    """Get all Grade 5 tasks at a specific difficulty level (e.g., 'easy', 'medium', 'hard')."""
    return [task for task in GRADE5_TASKS if task.get("difficulty") == difficulty]


def get_grade5_tasks_by_category_and_difficulty(category: str, difficulty: str) -> List[Dict]:
    """Get Grade 5 tasks filtered by both category and difficulty."""
    return [
        task
        for task in GRADE5_TASKS
        if task.get("category") == category and task.get("difficulty") == difficulty
    ]


def get_grade5_stats() -> Dict:
    """Return statistics about the Grade 5 task bank."""
    stats = {
        "total_tasks": len(GRADE5_TASKS),
        "by_category": {},
        "by_difficulty": {},
        "avg_estimated_time_sec": 0,
        "avg_adaptive_weight": 0,
    }

    if GRADE5_TASKS:
        # Count by category
        for category in GRADE5_TASKS_BY_CATEGORY:
            stats["by_category"][category] = len(GRADE5_TASKS_BY_CATEGORY[category])

        # Count by difficulty
        difficulties = set(task.get("difficulty") for task in GRADE5_TASKS)
        for diff in difficulties:
            diff_tasks = get_grade5_tasks_by_difficulty(diff)
            stats["by_difficulty"][diff] = len(diff_tasks)

        # Calculate averages
        total_time = sum(task.get("estimated_time_sec", 0) for task in GRADE5_TASKS)
        stats["avg_estimated_time_sec"] = round(total_time / len(GRADE5_TASKS), 1)

        total_weight = sum(task.get("adaptive_weight", 0) for task in GRADE5_TASKS)
        stats["avg_adaptive_weight"] = round(total_weight / len(GRADE5_TASKS), 2)

    return stats

DOMAINS = ["working_memory", "pattern_recognition", "attention", "logical_reasoning"]
