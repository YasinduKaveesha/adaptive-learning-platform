// ── Shared TypeScript types for Component A mobile app ──────────────────────

export type Language = 'english' | 'sinhala' | 'tamil';

export type Domain =
  | 'working_memory'
  | 'pattern_recognition'
  | 'attention'
  | 'logical_reasoning'
  | 'behavioral'
  | 'emotional'
  | 'learning_preference';

export type GameType =
  | 'sequence_recall'
  | 'pattern_completion'
  | 'count_targets'
  | 'find_odd'
  | 'syllogism'
  | 'analogy'
  | 'ordering'
  | 'time_reasoning'
  | 'self_report'
  | 'preference_pick';

export type Classification = 'group_a' | 'group_b' | 'group_c';

export type StopReason = 'confidence_reached' | 'max_items' | null;

// ── Grade 5 Adaptive Task Types ───────────────────────────────────────────

export type Grade5Category = 'working_memory' | 'attention' | 'pattern_recognition' | 'reasoning';

export type Grade5Difficulty = 'easy' | 'medium' | 'hard';

export type Grade5TaskType =
  | 'digit_span_forward'
  | 'digit_span_backward'
  | 'color_sequence'
  | 'shape_sequence'
  | 'color_shape_sequence'
  | 'mixed_sequence'
  | 'mixed_complex_sequence'
  | 'odd_one_out'
  | 'count_target'
  | 'flanker_small'
  | 'flanker_large'
  | 'flanker_wide'
  | 'stroop'
  | 'stroop_shape'
  | 'find_targets'
  | 'color_select'
  | 'conjunction_search'
  | 'number_sequence_simple'
  | 'letter_sequence_skip'
  | 'color_pattern'
  | 'number_pair_pattern'
  | 'halving_sequence'
  | 'shape_alternation'
  | 'multiplying_sequence'
  | 'fibonacci_like'
  | 'difference_pattern'
  | 'square_backwards'
  | 'categorization'
  | 'syllogism'
  | 'analogy_simple'
  | 'analogy_shape'
  | 'analogy_conditional'
  | 'transitive_order'
  | 'transitive_min'
  | 'conditional_deduction'
  | 'multi_step_analogy'
  | 'quantifier_logic';

// ── Item returned by the API ──────────────────────────────────────────────────

export interface Item {
  item_id: string;
  domain: Domain;
  game_type: GameType;
  study_prompt: string | null;
  study_content: string | null;
  study_items: string[];
  question: string;
  options: Record<string, string>;
}

// ── Grade 5 Adaptive Task returned by the API ──────────────────────────────

export interface TaskMetadata {
  hints_available: boolean;
  hint_texts: string[];
  scoring_rules: string;
  example_ui_notes: string;
  source_inspiration: string;
}

export interface AdaptiveTask {
  task_id: string;
  category: Grade5Category;
  difficulty: Grade5Difficulty;
  task_type: Grade5TaskType;
  question: string;
  content: Record<string, any>;
  correct_answer: any;
  estimated_time_sec: number;
  max_time_sec: number;
  adaptive_weight: number;
  metadata: TaskMetadata;
}

// ── API response shapes ───────────────────────────────────────────────────────

export interface DomainAbility {
  theta: number;
  std: number;
  percentile: number;
  items_answered: number;
}

export interface SessionSnapshot {
  items_answered: number;
  overall_theta: number;
  overall_std: number;
  confidence: number;
  domain_abilities: Record<Domain, DomainAbility>;
  confidence_history: number[];
}

export interface Grade5SessionSnapshot {
  tasks_answered: number;
  overall_theta: number;
  overall_std: number;
  confidence: number;
  category_profiles: Record<Grade5Category, DomainAbility>;
  adaptive_difficulty_level: Grade5Difficulty;
  confidence_history: number[];
}

export interface StartScreeningResponse {
  session_id: string;
  student_id: string;
  started_at: string;
  expected_duration_minutes: number;
  first_item: Item;
  language: Language;
}

export interface SubmitResponseResponse {
  session_id: string;
  response_recorded: boolean;
  snapshot: SessionSnapshot;
  stop: boolean;
  stop_reason: StopReason;
  next_item: Item | null;
}

export interface StartGrade5ScreeningResponse {
  session_id: string;
  student_id: string;
  started_at: string;
  expected_duration_minutes: number;
  first_task: AdaptiveTask;
  language: Language;
}

export interface Grade5DemoTasksResponse {
  total_tasks: number;
  tasks_per_category: number;
  categories: Grade5Category[];
  tasks: AdaptiveTask[];
}

export interface SubmitGrade5ResponseResponse {
  session_id: string;
  response_recorded: boolean;
  snapshot: Grade5SessionSnapshot;
  stop: boolean;
  stop_reason: StopReason;
  next_task: AdaptiveTask | null;
}

export interface ClassificationResponse {
  student_id: string;
  classification: Classification;
  confidence: number;
  session_id: string;
  screened_at: string;
  valid_until: string;
  doctor_reviewed: boolean;
  domain_profile: Record<Domain, number>; // domain → percentile
  behavioural_metadata: {
    avg_reaction_time_ms: number;
    avg_hesitation_count: number;
    avg_engagement_score: number;
  };
}

// ── Navigation param types ────────────────────────────────────────────────────

export type RootStackParamList = {
  Welcome: undefined;
  Instructions: {
    studentId: string;
    language: Language;
    studentName: string;
  };
  Task: {
    studentId: string;
    language: Language;
    studentName: string;
    sessionId?: string;
    demoMode?: boolean;
  };
  Feedback: {
    isCorrect: boolean;
    reactionTimeMs: number;
    taskCategory: string;
    studentId: string;
    studentName: string;
    language: Language;
    sessionId: string;
  };
  Progress: {
    studentId: string;
    language: Language;
    studentName: string;
    sessionId: string;
  };
  Results: {
    studentId: string;
    language: Language;
    studentName: string;
    sessionId: string;
    timeTakenMs?: number;
    categoryScores?: {
      cognitive: number;
      behavioral: number;
      emotional: number;
      learningStyle: number | null;
    };
  };

  GameIntro: {
    studentId: string;
    studentName: string;
    language: string;
    categoryScores?: {
      cognitive: number;
      behavioral: number;
      emotional: number;
      learningStyle: number | null;
    };
  };

  Game1: {
    studentId: string;
    studentName: string;
    language: string;
  };

  Game1Results: {
    studentId: string;
    studentName: string;
    language: string;
    score: number;
    total: number;
    correctAnswers: boolean[];
  };

  PlaygroundHub: {
    studentId: string;
    studentName: string;
    language: string;
    categoryScores?: {
      cognitive: number;
      behavioral: number;
      emotional: number;
      learningStyle: number | null;
    };
  };

  TreasurePath: {
    studentId: string;
    studentName: string;
    language: string;
  };

  PatternTrain: {
    studentId: string;
    studentName: string;
    language: string;
  };

  MatchShadow: {
    studentId: string;
    studentName: string;
    language: string;
  };

  // Legacy routes (kept for backward compatibility)
  Screening: {
    studentId: string;
    language: Language;
    studentName: string;
  };
  Grade5Screening: {
    studentId: string;
    language: Language;
    studentName: string;
  };
  Grade5Results: {
    confidence: number;
    categoryProfile: Record<Grade5Category, number>;
    snapshot: Grade5SessionSnapshot;
    stoppingReason: StopReason;
    studentName: string;
    sessionId: string;
  };
};
