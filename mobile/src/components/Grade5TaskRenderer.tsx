/**
 * Grade5TaskRenderer — Renders adaptive cognitive tasks based on task type
 * 
 * Supports all Grade 5 task types:
 *  - Memory sequences (forward, backward, mixed)
 *  - Attention tasks (Flanker, Stroop, odd-one-out, count targets)
 *  - Pattern recognition (sequences, progressions)
 *  - Reasoning (analogies, syllogisms, transitive logic)
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import type { AdaptiveTask } from '../types';

interface Grade5TaskRendererProps {
  task: AdaptiveTask;
  onComplete: (isCorrect: boolean, hintUsed?: boolean) => void;
  timeoutMs: number;
}

function formatTaskValue(value: any): string {
  if (value && typeof value === 'object') {
    // If it has shape/number pair structure common in Grade 5 tasks
    if (value.shape && value.number) {
      return `${value.shape} ${value.number}`;
    }
    if (value.color && value.shape) {
      return `${value.color} ${value.shape}`;
    }
    // Fallback for object serialization
    return Object.entries(value).map(([k, v]) => `${v}`).join(' ');
  }
  return String(value);
}

/**
 * Renders memory sequence tasks with display & input phases
 */
function MemorySequenceTask({
  task,
  onComplete,
}: {
  task: AdaptiveTask;
  onComplete: (isCorrect: boolean) => void;
}) {
  const [phase, setPhase] = useState<'display' | 'input'>('display');
  const [displayIndex, setDisplayIndex] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const sequence = task.content.sequence || [];

  useEffect(() => {
    if (phase === 'display' && displayIndex < sequence.length) {
      const timer = setTimeout(() => {
        setDisplayIndex(displayIndex + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (phase === 'display' && displayIndex >= sequence.length) {
      setTimeout(() => setPhase('input'), 500);
    }
  }, [phase, displayIndex, sequence.length]);

  const handleInputSelection = (index: number) => {
    const newIndexes = [...selectedIndexes, index];
    setSelectedIndexes(newIndexes);

    if (newIndexes.length === sequence.length) {
      const newAnswer = newIndexes.map((selectedIndex) => sequence[selectedIndex]);
      const isCorrect = JSON.stringify(newAnswer) === JSON.stringify(sequence);
      onComplete(isCorrect);
    }
  };

  const handleUndo = () => {
    setSelectedIndexes(selectedIndexes.slice(0, -1));
  };

  if (phase === 'display') {
    return (
      <View style={styles.sequenceContainer}>
        <Text style={styles.displayLabel}>Watch carefully...</Text>
        {displayIndex < sequence.length && (
          <View style={styles.itemDisplay}>
            <Text style={styles.displayItem}>{formatTaskValue(sequence[displayIndex])}</Text>
          </View>
        )}
        <Text style={styles.progressText}>
          {displayIndex + 1} / {sequence.length}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Tap the sequence in order:</Text>
      <View style={styles.inputDisplay}>
        {selectedIndexes.map((selectedIndex, idx) => (
          <View key={idx} style={styles.inputItem}>
            <Text style={styles.inputItemText}>{formatTaskValue(sequence[selectedIndex])}</Text>
          </View>
        ))}
      </View>
      <View style={styles.optionGrid}>
        {sequence.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.optionButton,
              selectedIndexes.includes(idx) && styles.optionButtonSelected,
            ]}
            onPress={() => handleInputSelection(idx)}
            disabled={selectedIndexes.includes(idx)}
          >
            <Text style={styles.optionText}>{formatTaskValue(item)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedIndexes.length > 0 && (
        <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
          <Text style={styles.undoText}>← Undo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Renders pattern completion tasks
 */
function PatternTask({
  task,
  onComplete,
}: {
  task: AdaptiveTask;
  onComplete: (isCorrect: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const sequence = task.content.sequence || [];

  return (
    <View style={styles.patternContainer}>
      <View style={styles.patternDisplay}>
        {sequence.map((item, idx) => (
          <View key={idx} style={styles.patternItem}>
            <Text style={styles.patternItemText}>{String(item)}</Text>
          </View>
        ))}
        <View style={styles.questionMark}>
          <Text style={styles.questionMarkText}>?</Text>
        </View>
      </View>

      <Text style={styles.answerPrompt}>What comes next?</Text>

      <View style={styles.answerOptions}>
        <TouchableOpacity
          style={[styles.answerButton, selected === 'a' && styles.answerButtonSelected]}
          onPress={() => {
            setSelected('a');
            setTimeout(() => {
              const isCorrect = task.correct_answer?.toString() === String(sequence[0] + 2);
              onComplete(isCorrect);
            }, 300);
          }}
        >
          <Text style={styles.answerButtonText}>{String(sequence[0] + 2)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.answerButton, selected === 'b' && styles.answerButtonSelected]}
          onPress={() => {
            setSelected('b');
            setTimeout(() => onComplete(false), 300);
          }}
        >
          <Text style={styles.answerButtonText}>{String(task.correct_answer)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Renders multiple-choice reasoning tasks
 */
function ReasoningTask({
  task,
  onComplete,
}: {
  task: AdaptiveTask;
  onComplete: (isCorrect: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = ['Yes', 'No', 'Maybe', 'Not sure'];

  return (
    <View style={styles.reasoningContainer}>
      <View style={styles.reasoningContent}>
        <Text style={styles.reasoningText}>{task.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.optionBox,
              selected === option && styles.optionBoxSelected,
            ]}
            onPress={() => {
              setSelected(option);
              setTimeout(() => {
                const isCorrect = option === task.correct_answer;
                onComplete(isCorrect);
              }, 300);
            }}
          >
            <Text style={styles.optionBoxText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function GenericChoiceTask({
  task,
  onComplete,
}: {
  task: AdaptiveTask;
  onComplete: (isCorrect: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const correctAnswer = String(task.correct_answer);
  const contentValues = [
    ...(Array.isArray(task.content.items) ? task.content.items : []),
    ...(Array.isArray(task.content.sequence) ? task.content.sequence : []),
    ...(task.content.arrows ? [task.content.arrows] : []),
  ].map(String);
  const fallbackChoices = ['Yes', 'No', '3', '4', 'left', 'right', 'red', 'blue', 'square', 'circle'];
  const choices = [correctAnswer, ...contentValues, ...fallbackChoices]
    .filter((value, index, array) => value.trim().length > 0 && array.indexOf(value) === index)
    .slice(0, 4);

  while (choices.length < 4) {
    choices.push(`Option ${choices.length + 1}`);
  }

  const orderedChoices = choices.sort((a, b) => a.localeCompare(b));

  return (
    <View style={styles.reasoningContainer}>
      {contentValues.length > 0 && (
        <View style={styles.reasoningContent}>
          <Text style={styles.reasoningText}>{contentValues.join('   ')}</Text>
        </View>
      )}

      <View style={styles.optionsContainer}>
        {orderedChoices.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionBox,
              selected === option && styles.optionBoxSelected,
            ]}
            onPress={() => {
              setSelected(option);
              setTimeout(() => onComplete(option === correctAnswer), 300);
            }}
          >
            <Text style={styles.optionBoxText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/**
 * Main renderer dispatcher
 */
export default function Grade5TaskRenderer({
  task,
  onComplete,
  timeoutMs,
}: Grade5TaskRendererProps) {
  const isMemoryTask =
    task.task_type.includes('digit_span') ||
    task.task_type.includes('color_sequence') ||
    task.task_type.includes('shape_sequence') ||
    task.task_type.includes('mixed_sequence');

  // Auto-submit after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(false); // Mark as timeout/incomplete
    }, timeoutMs);
    return () => clearTimeout(timer);
  }, [timeoutMs, onComplete]);

  if (isMemoryTask) {
    return <MemorySequenceTask task={task} onComplete={onComplete} />;
  }

  return <GenericChoiceTask task={task} onComplete={onComplete} />;
}

const styles = StyleSheet.create({
  // ── Memory Sequence ──────────────────────────────────────────────────────

  sequenceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  displayLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: '#4B5563',
    marginBottom: SPACING.md,
    fontWeight: '800',
  },
  itemDisplay: {
    width: 132,
    height: 132,
    borderRadius: 28,
    backgroundColor: '#58CC02',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    shadowColor: '#3A9A00',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  displayItem: {
    ...TYPOGRAPHY.h1,
    color: COLORS.surface,
    fontWeight: '700',
  },
  progressText: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontWeight: '800',
  },

  inputContainer: {
    paddingVertical: SPACING.md,
  },
  inputLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: '#111827',
    marginBottom: SPACING.md,
    fontWeight: '900',
    textAlign: 'center',
  },
  inputDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#F7F7F7',
    borderRadius: RADIUS.lg,
    minHeight: 60,
  },
  inputItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#58CC02',
    borderRadius: RADIUS.lg,
  },
  inputItemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
  },

  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  optionButton: {
    width: '46%',
    minHeight: 76,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderBottomWidth: 6,
    borderBottomColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#E5F8D6',
    borderColor: '#58CC02',
    borderBottomColor: '#58CC02',
  },
  optionText: {
    ...TYPOGRAPHY.body,
    color: '#111827',
    fontWeight: '900',
    textAlign: 'center',
  },
  undoButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  undoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // ── Pattern Task ─────────────────────────────────────────────────────────

  patternContainer: {
    paddingVertical: SPACING.md,
  },
  patternDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  patternItem: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternItemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '700',
  },
  questionMark: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMarkText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },

  answerPrompt: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },

  answerOptions: {
    gap: SPACING.md,
  },
  answerButton: {
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  answerButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },

  // ── Reasoning Task ───────────────────────────────────────────────────────

  reasoningContainer: {
    paddingVertical: SPACING.md,
  },
  reasoningContent: {
    backgroundColor: '#F7F7F7',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  reasoningText: {
    ...TYPOGRAPHY.bodyMedium,
    color: '#111827',
    lineHeight: 22,
    fontWeight: '800',
    textAlign: 'center',
  },

  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  optionBox: {
    width: '46%',
    minHeight: 96,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderBottomWidth: 6,
    borderBottomColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionBoxSelected: {
    backgroundColor: '#E5F8D6',
    borderColor: '#58CC02',
    borderBottomColor: '#58CC02',
  },
  optionBoxText: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
    textAlign: 'center',
  },

  // ── Fallback ─────────────────────────────────────────────────────────────

  fallbackContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  fallbackText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  fallbackHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  continueButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
  },
  continueButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '700',
  },
});
