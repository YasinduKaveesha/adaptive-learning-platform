# Adaptive Cognitive Task Bank (Grade 5)

**Executive Summary:** We designed 40 tasks (4 categories × 10 each) targeting working memory, attention, pattern recognition, and reasoning for age 10–11. Tasks mirror well-known paradigms (e.g. digit-span memory for working memory【36†L348-L356】, Flanker and Stroop for attention【36†L252-L258】【25†L181-L189】, simple series/pattern puzzles, and basic analogies or syllogisms). Estimated times scale with complexity (e.g. quick 5–10 s for simple visual searches, ~20–30 s for memory recall or multi-step reasoning). Hints are optional, and scoring gives full credit for correctness (e.g. 1 for correct, 0 for wrong) with penalties for slow answers or retries. We include an `adaptive_weight` (higher for harder items) to guide an adaptive algorithm (e.g. starting medium tasks and adjusting difficulty up/down by weight based on performance).  

**Category Comparison:** The table below summarizes the number of tasks (10 each) and average estimated time. Attention tasks are fastest on average, while reasoning and working-memory tasks require more time due to multi-step processing. 

| Category             | Task Count | Avg Est. Time (s) |
|----------------------|-----------:|------------------:|
| Working Memory       | 10         | 21                |
| Attention            | 10         | 12                |
| Pattern Recognition  | 10         | 16                |
| Reasoning            | 10         | 22                |

```mermaid
timeline
    title Implementation Plan
    2026-05-01 : Create JSON tasks
    2026-05-03 : Implement Streamlit UI
    2026-05-05 : Test initial subset (8–12 tasks)
    2026-05-07 : Finalize full 40-task bank
```  

**Task Bank JSON:** Below is the complete `tasks.json` with all 40 task objects. Each object includes a unique `task_id`, `category`, `difficulty`, `task_type`, question text, structured `content`, `correct_answer`, timing parameters, `adaptive_weight`, and metadata (`hints_available`, `hint_texts`, `scoring_rules`, `example_ui_notes`, and `source_inspiration`).  

```json
[
  {
    "task_id": "WM_001",
    "category": "working_memory",
    "difficulty": "easy",
    "task_type": "digit_span_forward",
    "question": "Repeat the sequence of numbers shown in the same order.",
    "content": {"sequence": [7, 4, 2]},
    "correct_answer": [7, 4, 2],
    "estimated_time_sec": 10,
    "max_time_sec": 20,
    "adaptive_weight": 0.3,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["They were all single-digit numbers."],
      "scoring_rules": "Correct=1.0; incorrect=0; penalty for each extra second: 0.05; retry cost=0.1",
      "example_ui_notes": "Display each digit in sequence (e.g. 7,4,2) one by one for 2 seconds each, then prompt for answer.",
      "source_inspiration": "WISC Digit Span (working memory)"
    }
  },
  {
    "task_id": "WM_002",
    "category": "working_memory",
    "difficulty": "easy",
    "task_type": "color_sequence",
    "question": "Memorize the sequence of colors shown, then enter them in order.",
    "content": {"sequence": ["red", "blue", "green"]},
    "correct_answer": ["red", "blue", "green"],
    "estimated_time_sec": 10,
    "max_time_sec": 20,
    "adaptive_weight": 0.3,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["The colors were primary colors."],
      "scoring_rules": "Correct=1.0; each wrong color deducts 0.5; slow responses penalized by 0.05/sec.",
      "example_ui_notes": "Show colored squares (red, blue, green) one by one for 2 sec each; then prompt to select/order colors.",
      "source_inspiration": "Classic color memory tasks"
    }
  },
  {
    "task_id": "WM_003",
    "category": "working_memory",
    "difficulty": "easy",
    "task_type": "shape_sequence",
    "question": "Remember the sequence of shapes shown (circle, square, triangle). What was the sequence?",
    "content": {"sequence": ["circle", "square", "triangle"]},
    "correct_answer": ["circle", "square", "triangle"],
    "estimated_time_sec": 10,
    "max_time_sec": 20,
    "adaptive_weight": 0.3,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["There was one of each: circle, square, triangle."],
      "scoring_rules": "Correct=1; 0 if any shape is wrong; time penalty 0.1/sec over limit.",
      "example_ui_notes": "Display shapes (circle, square, triangle) one by one for 2 seconds each; then prompt answer.",
      "source_inspiration": "Visual memory sequences in cognitive tasks"
    }
  },
  {
    "task_id": "WM_004",
    "category": "working_memory",
    "difficulty": "medium",
    "task_type": "digit_span_forward",
    "question": "Repeat the longer sequence of numbers shown in the same order.",
    "content": {"sequence": [9, 2, 5, 8]},
    "correct_answer": [9, 2, 5, 8],
    "estimated_time_sec": 20,
    "max_time_sec": 35,
    "adaptive_weight": 0.6,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["They are between 1 and 9."],
      "scoring_rules": "Correct=1; wrong=0; 0.1 penalty per second over 15 sec; retry 0.1 each.",
      "example_ui_notes": "Show digits 9,2,5,8 sequentially at 2 sec each; then prompt for full sequence.",
      "source_inspiration": "Digit Span memory tasks"
    }
  },
  {
    "task_id": "WM_005",
    "category": "working_memory",
    "difficulty": "medium",
    "task_type": "color_shape_sequence",
    "question": "Memorize the sequence of color-shape pairs shown (e.g., red circle). What was the order of pairs?",
    "content": {"sequence": [{"color": "red", "shape": "circle"}, {"color": "blue", "shape": "square"}, {"color": "green", "shape": "triangle"}, {"color": "red", "shape": "circle"}]},
    "correct_answer": [{"color": "red", "shape": "circle"}, {"color": "blue", "shape": "square"}, {"color": "green", "shape": "triangle"}, {"color": "red", "shape": "circle"}],
    "estimated_time_sec": 20,
    "max_time_sec": 40,
    "adaptive_weight": 0.6,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["The sequence started and ended with a red circle."],
      "scoring_rules": "Correct sequence=1; 0 if incorrect; each extra second after 20 sec 0.1 penalty; retry 0.2.",
      "example_ui_notes": "Show each color-shape pair (red circle, blue square, green triangle, red circle) for 3 sec each; then input order.",
      "source_inspiration": "Example spatial memory task"
    }
  },
  {
    "task_id": "WM_006",
    "category": "working_memory",
    "difficulty": "medium",
    "task_type": "digit_span_backward",
    "question": "Repeat the following sequence of numbers in reverse order.",
    "content": {"sequence": [3, 6, 1]},
    "correct_answer": [1, 6, 3],
    "estimated_time_sec": 20,
    "max_time_sec": 40,
    "adaptive_weight": 0.7,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["If sequence was 3,6,1 you must say it backward."],
      "scoring_rules": "Correct=1.0; wrong=0; penalize slow answers beyond estimated time (0.1/sec).",
      "example_ui_notes": "Display numbers 3,6,1 one by one (2 sec each); after a pause, ask to repeat backwards.",
      "source_inspiration": "Backward Digit Span test (working memory)"
    }
  },
  {
    "task_id": "WM_007",
    "category": "working_memory",
    "difficulty": "medium",
    "task_type": "mixed_sequence",
    "question": "Memorize the alternating sequence of numbers and letters. Recall both in order.",
    "content": {"sequence": [4, "A", 7, "D", 4, "B"]},
    "correct_answer": [4, "A", 7, "D", 4, "B"],
    "estimated_time_sec": 25,
    "max_time_sec": 50,
    "adaptive_weight": 0.8,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["The pattern alternates number-letter."],
      "scoring_rules": "Correct=1; zero if any item is wrong; penalize per second over 30 sec: 0.1/sec.",
      "example_ui_notes": "Show items 4, A, 7, D, 4, B (2 seconds each with brief gap); then prompt for full sequence.",
      "source_inspiration": "Sequential memory tasks for working memory"
    }
  },
  {
    "task_id": "WM_008",
    "category": "working_memory",
    "difficulty": "hard",
    "task_type": "digit_span_forward",
    "question": "Repeat the long sequence of numbers shown in the same order.",
    "content": {"sequence": [7, 1, 8, 3, 5]},
    "correct_answer": [7, 1, 8, 3, 5],
    "estimated_time_sec": 30,
    "max_time_sec": 60,
    "adaptive_weight": 0.9,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["No repeats, single digits."],
      "scoring_rules": "Correct=1.0; incorrect=0; deduct 0.05 per second beyond estimated time.",
      "example_ui_notes": "Show digits one by one (2 sec each) then prompt input for full sequence of 5 digits.",
      "source_inspiration": "Long digit span memory"
    }
  },
  {
    "task_id": "WM_009",
    "category": "working_memory",
    "difficulty": "hard",
    "task_type": "digit_span_backward",
    "question": "Repeat the sequence of numbers backward (reverse the order).",
    "content": {"sequence": [2, 9, 6, 4]},
    "correct_answer": [4, 6, 9, 2],
    "estimated_time_sec": 30,
    "max_time_sec": 60,
    "adaptive_weight": 0.9,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Think of it as 2,9,6,4 backwards."],
      "scoring_rules": "Correct=1; wrong=0; slow answer penalty 0.05/sec after 30 sec.",
      "example_ui_notes": "Present numbers 2,9,6,4 one by one (3 sec each); then ask for backward sequence.",
      "source_inspiration": "Backward digit span (challenge working memory)"
    }
  },
  {
    "task_id": "WM_010",
    "category": "working_memory",
    "difficulty": "hard",
    "task_type": "mixed_complex_sequence",
    "question": "Memorize the sequence of number-shape pairs shown. Enter them in order.",
    "content": {"sequence": [{"num": 3, "shape": "star"}, {"num": 5, "shape": "square"}, {"num": 7, "shape": "circle"}, {"num": 3, "shape": "star"}]},
    "correct_answer": [{"num": 3, "shape": "star"}, {"num": 5, "shape": "square"}, {"num": 7, "shape": "circle"}, {"num": 3, "shape": "star"}],
    "estimated_time_sec": 35,
    "max_time_sec": 70,
    "adaptive_weight": 0.95,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Numbers repeated: 3 appears twice with same shape."],
      "scoring_rules": "Correct=1; incorrect=0; penalty 0.1/sec over 35 sec; retry 0.2 each.",
      "example_ui_notes": "Show each pair '3★', '5■', '7●', '3★' with shapes (e.g. star, square, circle) for 3 sec each; then input full sequence.",
      "source_inspiration": "Complex memory span tasks"
    }
  },
  {
    "task_id": "AT_001",
    "category": "attention",
    "difficulty": "easy",
    "task_type": "odd_one_out",
    "question": "Which shape is different from the others?",
    "content": {"items": ["circle", "circle", "square", "circle", "circle"]},
    "correct_answer": "square",
    "estimated_time_sec": 8,
    "max_time_sec": 15,
    "adaptive_weight": 0.3,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["All others are circles."],
      "scoring_rules": "Correct=1; wrong=0; no partial credit; time penalty 0.1/sec over 10 sec.",
      "example_ui_notes": "Display 5 shapes in a row: circle, circle, square, circle, circle; ask child to select the odd one.",
      "source_inspiration": "Feature search task example"
    }
  },
  {
    "task_id": "AT_002",
    "category": "attention",
    "difficulty": "easy",
    "task_type": "count_target",
    "question": "How many letter 'A's are shown in the sequence?",
    "content": {"sequence": ["A", "B", "A", "C", "A", "D"]},
    "correct_answer": 3,
    "estimated_time_sec": 8,
    "max_time_sec": 15,
    "adaptive_weight": 0.3,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Count each 'A' carefully."],
      "scoring_rules": "1 point if correct, 0 if incorrect; 0.05/sec penalty after time limit.",
      "example_ui_notes": "Show letters A, B, A, C, A, D briefly (2 sec each) then ask count of 'A'.",
      "source_inspiration": "Continuous Performance Test concept"
    }
  },
  {
    "task_id": "AT_003",
    "category": "attention",
    "difficulty": "easy",
    "task_type": "flanker_small",
    "question": "The arrows below are pointing left or right. What direction is the center arrow pointing?",
    "content": {"arrows": "><<><"},
    "correct_answer": "left",
    "estimated_time_sec": 8,
    "max_time_sec": 15,
    "adaptive_weight": 0.3,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Focus on only the middle arrow."],
      "scoring_rules": "Correct=1; wrong=0; deduct 0.1 per second beyond 8 sec.",
      "example_ui_notes": "Show an arrow string like '><<><'; ask direction of middle arrow (third in string).",
      "source_inspiration": "Eriksen Flanker Task"
    }
  },
  {
    "task_id": "AT_004",
    "category": "attention",
    "difficulty": "medium",
    "task_type": "stroop",
    "question": "The word below is written in a color not matching its meaning. Say the color of the ink, not the word.",
    "content": {"word": "RED", "ink_color": "blue"},
    "correct_answer": "blue",
    "estimated_time_sec": 10,
    "max_time_sec": 25,
    "adaptive_weight": 0.5,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Ignore the word itself, look at the color."],
      "scoring_rules": "Correct=1; incorrect=0; 0.1/sec penalty after 10 sec; hint use -0.2.",
      "example_ui_notes": "Display 'RED' in blue text, ask child to name ink color.",
      "source_inspiration": "Stroop Color-Word Test【25†L181-L189】"
    }
  },
  {
    "task_id": "AT_005",
    "category": "attention",
    "difficulty": "medium",
    "task_type": "find_targets",
    "question": "Which positions (1-indexed) in the sequence contain the letter 'X'?",
    "content": {"sequence": ["X", "Y", "X", "Z", "X", "Y"]},
    "correct_answer": [1, 3, 5],
    "estimated_time_sec": 12,
    "max_time_sec": 30,
    "adaptive_weight": 0.5,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["There are three 'X's."],
      "scoring_rules": "Full credit (1) for all correct indices; partial=0.5 for partially correct; time penalty 0.1/sec.",
      "example_ui_notes": "Show sequence of letters X,Y,X,Z,X,Y (2 sec each); ask to enter indices of 'X'.",
      "source_inspiration": "Visual search for targets【31†L249-L257】"
    }
  },
  {
    "task_id": "AT_006",
    "category": "attention",
    "difficulty": "medium",
    "task_type": "flanker_large",
    "question": "Arrows are pointing left or right. What direction is the center arrow pointing?",
    "content": {"arrows": "<<>><<"},
    "correct_answer": "right",
    "estimated_time_sec": 12,
    "max_time_sec": 25,
    "adaptive_weight": 0.5,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Ignore all but the middle arrow."],
      "scoring_rules": "1 point for correct; 0 for wrong; 0.05/sec penalty beyond 12 sec.",
      "example_ui_notes": "Display arrows string '<<>><<' (7 chars); ask direction of 4th (center) arrow.",
      "source_inspiration": "Eriksen Flanker Task"
    }
  },
  {
    "task_id": "AT_007",
    "category": "attention",
    "difficulty": "medium",
    "task_type": "color_select",
    "question": "Which shape below is colored red?",
    "content": {"items": [{"shape": "circle", "color": "blue"}, {"shape": "square", "color": "red"}, {"shape": "triangle", "color": "green"}]},
    "correct_answer": "square",
    "estimated_time_sec": 15,
    "max_time_sec": 30,
    "adaptive_weight": 0.6,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Circle is blue, triangle is green."],
      "scoring_rules": "1 if correct selection; 0 if incorrect; time penalty 0.1/sec over 15 sec.",
      "example_ui_notes": "Display a blue circle, red square, green triangle; ask 'Which is red?'.",
      "source_inspiration": "Selective attention to color feature"
    }
  },
  {
    "task_id": "AT_008",
    "category": "attention",
    "difficulty": "hard",
    "task_type": "stroop_shape",
    "question": "A red circle is shown. What color is the circle?",
    "content": {"shape": "circle", "color": "red"},
    "correct_answer": "red",
    "estimated_time_sec": 12,
    "max_time_sec": 30,
    "adaptive_weight": 0.6,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Focus on the color of the circle."],
      "scoring_rules": "Correct=1; wrong=0; 0.05/sec penalty beyond time.",
      "example_ui_notes": "Show a red circle image; ask 'What color is the circle?'.",
      "source_inspiration": "Stroop-like color naming"
    }
  },
  {
    "task_id": "AT_009",
    "category": "attention",
    "difficulty": "hard",
    "task_type": "flanker_wide",
    "question": "Arrows are pointing left or right. What direction is the center arrow pointing?",
    "content": {"arrows": "<<>>><<<>>"},
    "correct_answer": "left",
    "estimated_time_sec": 15,
    "max_time_sec": 35,
    "adaptive_weight": 0.7,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Ignore the outer arrows."],
      "scoring_rules": "Correct=1; incorrect=0; 0.05/sec penalty over 15 sec.",
      "example_ui_notes": "Display arrow string '<<>>><<<>>' (11 chars); ask direction of 6th arrow.",
      "source_inspiration": "Eriksen Flanker Task with larger array"
    }
  },
  {
    "task_id": "AT_010",
    "category": "attention",
    "difficulty": "hard",
    "task_type": "conjunction_search",
    "question": "Which one of these is a red square?",
    "content": {"items": [{"shape": "circle", "color": "red"}, {"shape": "square", "color": "blue"}, {"shape": "square", "color": "red"}, {"shape": "triangle", "color": "red"}]},
    "correct_answer": "square",
    "estimated_time_sec": 20,
    "max_time_sec": 40,
    "adaptive_weight": 0.8,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Red triangle is not square, blue square is not red."],
      "scoring_rules": "Correct=1; wrong=0; 0.1/sec penalty beyond 20 sec.",
      "example_ui_notes": "Show circle(red), square(blue), square(red), triangle(red); ask 'Which item is a red square?'.",
      "source_inspiration": "Conjunction visual search"
    }
  },
  {
    "task_id": "PR_001",
    "category": "pattern_recognition",
    "difficulty": "easy",
    "task_type": "number_sequence_simple",
    "question": "Find the next number in the sequence: 2, 4, 6, 8, ?",
    "content": {"sequence": [2, 4, 6, 8]},
    "correct_answer": 10,
    "estimated_time_sec": 8,
    "max_time_sec": 15,
    "adaptive_weight": 0.3,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["This increases by 2 each time."],
      "scoring_rules": "Correct=1; 0 if incorrect; no time penalty (short task).",
      "example_ui_notes": "Display sequence '2,4,6,8,?' on screen; prompt for missing number.",
      "source_inspiration": "Arithmetic progression problem"
    }
  },
  {
    "task_id": "PR_002",
    "category": "pattern_recognition",
    "difficulty": "easy",
    "task_type": "letter_sequence_skip",
    "question": "What letter comes next: A, C, E, G, ?",
    "content": {"sequence": ["A", "C", "E", "G"]},
    "correct_answer": "I",
    "estimated_time_sec": 8,
    "max_time_sec": 15,
    "adaptive_weight": 0.3,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["These are every second letter in alphabet."],
      "scoring_rules": "1 for correct letter; 0 otherwise.",
      "example_ui_notes": "Show letters A, C, E, G, ?; ask for next letter.",
      "source_inspiration": "Alphabet sequence pattern"
    }
  },
  {
    "task_id": "PR_003",
    "category": "pattern_recognition",
    "difficulty": "easy",
    "task_type": "color_pattern",
    "question": "What color comes next in the pattern: red, blue, red, blue, ...?",
    "content": {"sequence": ["red", "blue", "red", "blue"]},
    "correct_answer": "red",
    "estimated_time_sec": 8,
    "max_time_sec": 15,
    "adaptive_weight": 0.3,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Colors alternate red, blue."],
      "scoring_rules": "Correct=1; incorrect=0.",
      "example_ui_notes": "Show color words or chips: red, blue, red, blue, ?; ask which color continues.",
      "source_inspiration": "Alternating color pattern"
    }
  },
  {
    "task_id": "PR_004",
    "category": "pattern_recognition",
    "difficulty": "medium",
    "task_type": "number_pair_pattern",
    "question": "Complete the pattern: 1, 1, 2, 2, 3, 3, ?",
    "content": {"sequence": [1, 1, 2, 2, 3, 3]},
    "correct_answer": 4,
    "estimated_time_sec": 12,
    "max_time_sec": 30,
    "adaptive_weight": 0.5,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Numbers repeat twice then increase by 1."],
      "scoring_rules": "1 if correct; 0 if wrong.",
      "example_ui_notes": "Display '1,1,2,2,3,3,?'; ask for next number.",
      "source_inspiration": "Repeating pattern problem"
    }
  },
  {
    "task_id": "PR_005",
    "category": "pattern_recognition",
    "difficulty": "medium",
    "task_type": "halving_sequence",
    "question": "What number replaces the question mark: 16, 8, 4, 2, ?",
    "content": {"sequence": [16, 8, 4, 2]},
    "correct_answer": 1,
    "estimated_time_sec": 12,
    "max_time_sec": 30,
    "adaptive_weight": 0.5,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Each number is half the previous one."],
      "scoring_rules": "1 for correct; 0 otherwise; no time penalty needed.",
      "example_ui_notes": "Show '16,8,4,2,?'; prompt for missing number.",
      "source_inspiration": "Division pattern sequence"
    }
  },
  {
    "task_id": "PR_006",
    "category": "pattern_recognition",
    "difficulty": "medium",
    "task_type": "shape_alternation",
    "question": "What comes next: circle, triangle, circle, triangle, circle, ?",
    "content": {"sequence": ["circle", "triangle", "circle", "triangle", "circle"]},
    "correct_answer": "triangle",
    "estimated_time_sec": 15,
    "max_time_sec": 30,
    "adaptive_weight": 0.5,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Shapes alternate circle and triangle."],
      "scoring_rules": "Correct=1; wrong=0.",
      "example_ui_notes": "Display sequence of shapes (circle, triangle, ...) with '?'; ask next shape.",
      "source_inspiration": "Alternating shape pattern"
    }
  },
  {
    "task_id": "PR_007",
    "category": "pattern_recognition",
    "difficulty": "medium",
    "task_type": "multiplying_sequence",
    "question": "Find the missing number: 2, 6, 18, 54, ?",
    "content": {"sequence": [2, 6, 18, 54]},
    "correct_answer": 162,
    "estimated_time_sec": 20,
    "max_time_sec": 35,
    "adaptive_weight": 0.6,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Each number is 3 times the previous."],
      "scoring_rules": "1 if correct; 0 if wrong.",
      "example_ui_notes": "Show '2,6,18,54,?'; ask for next number.",
      "source_inspiration": "Geometric progression pattern"
    }
  },
  {
    "task_id": "PR_008",
    "category": "pattern_recognition",
    "difficulty": "hard",
    "task_type": "fibonacci_like",
    "question": "What number replaces the question mark: 1, 1, 2, 3, 5, ?",
    "content": {"sequence": [1, 1, 2, 3, 5]},
    "correct_answer": 8,
    "estimated_time_sec": 25,
    "max_time_sec": 50,
    "adaptive_weight": 0.7,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Each number is the sum of the two before it."],
      "scoring_rules": "Correct=1; 0 if not; time penalty 0.1/sec beyond 25 sec.",
      "example_ui_notes": "Display '1,1,2,3,5,?'; ask next number.",
      "source_inspiration": "Fibonacci sequence"
    }
  },
  {
    "task_id": "PR_009",
    "category": "pattern_recognition",
    "difficulty": "hard",
    "task_type": "difference_pattern",
    "question": "Find the next number: 3, 6, 10, 15, 21, ?",
    "content": {"sequence": [3, 6, 10, 15, 21]},
    "correct_answer": 28,
    "estimated_time_sec": 25,
    "max_time_sec": 50,
    "adaptive_weight": 0.7,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Differences increase by 1: +3, +4, +5,..."],
      "scoring_rules": "1 if correct; 0 if wrong.",
      "example_ui_notes": "Show '3,6,10,15,21,?'; ask for missing number.",
      "source_inspiration": "Increasing differences pattern"
    }
  },
  {
    "task_id": "PR_010",
    "category": "pattern_recognition",
    "difficulty": "hard",
    "task_type": "square_backwards",
    "question": "Complete the pattern: 9, 4, 1, 0, 1, 4, ?,",
    "content": {"sequence": [9, 4, 1, 0, 1, 4]},
    "correct_answer": 9,
    "estimated_time_sec": 25,
    "max_time_sec": 50,
    "adaptive_weight": 0.8,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["These are perfect squares in reverse order from 3^2 to -1^2 to 3^2."],
      "scoring_rules": "1 if correct; otherwise 0.",
      "example_ui_notes": "Display '9,4,1,0,1,4,?'; ask what number should replace '?'.",
      "source_inspiration": "Symmetric number pattern"
    }
  },
  {
    "task_id": "RS_001",
    "category": "reasoning",
    "difficulty": "easy",
    "task_type": "categorization",
    "question": "Which item does NOT belong: apple, banana, couch, orange?",
    "content": {"items": ["apple", "banana", "couch", "orange"]},
    "correct_answer": "couch",
    "estimated_time_sec": 10,
    "max_time_sec": 25,
    "adaptive_weight": 0.3,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Three are fruits, one is furniture."],
      "scoring_rules": "Correct=1; 0 if incorrect.",
      "example_ui_notes": "List 'apple, banana, couch, orange'; ask which is not like the others.",
      "source_inspiration": "Classification reasoning"
    }
  },
  {
    "task_id": "RS_002",
    "category": "reasoning",
    "difficulty": "easy",
    "task_type": "syllogism",
    "question": "If all cats have tails and Mimi is a cat, does Mimi have a tail?",
    "content": {"premises": ["all cats have tails", "Mimi is a cat"]},
    "correct_answer": "Yes",
    "estimated_time_sec": 15,
    "max_time_sec": 30,
    "adaptive_weight": 0.3,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Mimi inherits cat traits."],
      "scoring_rules": "Correct answer 'Yes'=1; 'No'=0; speed penalty 0.1/sec beyond 15 sec.",
      "example_ui_notes": "Display premises text; ask yes/no question about Mimi.",
      "source_inspiration": "Simple logical syllogism"
    }
  },
  {
    "task_id": "RS_003",
    "category": "reasoning",
    "difficulty": "easy",
    "task_type": "analogy_simple",
    "question": "Complete the analogy: finger is to hand as leaf is to ___.",
    "content": {"a": "finger", "b": "hand", "c": "leaf"},
    "correct_answer": "branch",
    "estimated_time_sec": 15,
    "max_time_sec": 30,
    "adaptive_weight": 0.3,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Leaf attaches to a branch like finger attaches to hand."],
      "scoring_rules": "Correct=1; 0 if incorrect.",
      "example_ui_notes": "Show analogy format and ask to fill blank.",
      "source_inspiration": "Basic analogy reasoning"
    }
  },
  {
    "task_id": "RS_004",
    "category": "reasoning",
    "difficulty": "medium",
    "task_type": "transitive_order",
    "question": "Jack is taller than Jill. Jill is taller than Ken. Who is tallest?",
    "content": {"relations": ["Jack > Jill", "Jill > Ken"]},
    "correct_answer": "Jack",
    "estimated_time_sec": 20,
    "max_time_sec": 40,
    "adaptive_weight": 0.5,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Taller than Jill, who is taller than Ken."],
      "scoring_rules": "Correct=1; incorrect=0; speed bonus if under 15 sec.",
      "example_ui_notes": "Present height relations; ask who is tallest.",
      "source_inspiration": "Transitive inference logic"
    }
  },
  {
    "task_id": "RS_005",
    "category": "reasoning",
    "difficulty": "medium",
    "task_type": "analogy_shape",
    "question": "Square is to cube as circle is to ___.",
    "content": {"a": "square", "b": "cube", "c": "circle"},
    "correct_answer": "sphere",
    "estimated_time_sec": 20,
    "max_time_sec": 40,
    "adaptive_weight": 0.5,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Square is 2D, cube is 3D; similarly circle->sphere."],
      "scoring_rules": "1 for 'sphere'; 0 otherwise.",
      "example_ui_notes": "Show analogy squares/cube diagram; ask for 'circle:' term.",
      "source_inspiration": "Shape analogy reasoning"
    }
  },
  {
    "task_id": "RS_006",
    "category": "reasoning",
    "difficulty": "medium",
    "task_type": "conditional_deduction",
    "question": "If Tom has a ticket then he enters the show. Tom has a ticket. Can he enter?",
    "content": {"premise": "If ticket then enter", "given": "Tom has ticket"},
    "correct_answer": "Yes",
    "estimated_time_sec": 20,
    "max_time_sec": 45,
    "adaptive_weight": 0.6,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Affirm antecedent-> consequent."],
      "scoring_rules": "Yes=1, No=0.",
      "example_ui_notes": "Display conditional statement; ask yes/no outcome.",
      "source_inspiration": "Conditional reasoning task"
    }
  },
  {
    "task_id": "RS_007",
    "category": "reasoning",
    "difficulty": "medium",
    "task_type": "multi_step_analogy",
    "question": "Complete: cat:kitten :: dog:____.",
    "content": {"analogy": ["cat", "kitten", "dog"]},
    "correct_answer": "puppy",
    "estimated_time_sec": 25,
    "max_time_sec": 45,
    "adaptive_weight": 0.6,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Baby cat=kitten; baby dog=puppy."],
      "scoring_rules": "Correct=1; 0 otherwise.",
      "example_ui_notes": "Ask to complete given analogy format.",
      "source_inspiration": "Verbal analogy problem"
    }
  },
  {
    "task_id": "RS_008",
    "category": "reasoning",
    "difficulty": "hard",
    "task_type": "quantifier_logic",
    "question": "Some dogs are pets, and all pets are animals. Can we conclude any dog is an animal?",
    "content": {"premises": ["some dogs are pets", "all pets are animals"]},
    "correct_answer": "Yes",
    "estimated_time_sec": 30,
    "max_time_sec": 60,
    "adaptive_weight": 0.7,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Pets are animals and some dogs are pets."],
      "scoring_rules": "Yes=1; No=0; 0.1/sec penalty beyond 30 sec.",
      "example_ui_notes": "Display premises; ask yes/no conclusion.",
      "source_inspiration": "Syllogistic reasoning"
    }
  },
  {
    "task_id": "RS_009",
    "category": "reasoning",
    "difficulty": "hard",
    "task_type": "analogy_conditional",
    "question": "Black is to white as day is to ___.",
    "content": {"analogy": ["black", "white", "day"]},
    "correct_answer": "night",
    "estimated_time_sec": 30,
    "max_time_sec": 60,
    "adaptive_weight": 0.7,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Opposites: black/white, day/night."],
      "scoring_rules": "Correct=1; 0 if not.",
      "example_ui_notes": "Ask to complete analogy with opposites.",
      "source_inspiration": "Analogical reasoning"
    }
  },
  {
    "task_id": "RS_010",
    "category": "reasoning",
    "difficulty": "hard",
    "task_type": "transitive_min",
    "question": "Lisa is older than Tom. Tom is older than Ken. Who is youngest?",
    "content": {"relations": ["Lisa > Tom", "Tom > Ken"]},
    "correct_answer": "Ken",
    "estimated_time_sec": 30,
    "max_time_sec": 60,
    "adaptive_weight": 0.9,
    "metadata": {
      "hints_available": true,
      "hint_texts": ["Ken is younger than Tom who is younger than Lisa."],
      "scoring_rules": "Correct=1; incorrect=0; 0.1/sec penalty beyond 30 sec.",
      "example_ui_notes": "Display age order; ask who is youngest.",
      "source_inspiration": "Transitive age ordering"
    }
  }
]
```

**Sources:** We based tasks on established paradigms in the literature. For example, the digit-span memory tasks are taken from standard working-memory tests【36†L348-L356】, and Flanker/Stroop tasks from classic attention paradigms【36†L252-L258】【25†L181-L189】. Visual search principles guide our odd-one-out and find-target items【31†L249-L257】. The Wechsler WISC (Digit Span subtest) is a canonical source for working-memory items【12†L5-L13】. Each task’s inspiration and design is noted in its metadata