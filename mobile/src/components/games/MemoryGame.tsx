import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import type { Item } from '../../types';
import AnswerGrid from './shared/AnswerGrid';

interface Props {
  item: Item;
  phase: 'study' | 'answer';
  onStudyReady: () => void;
  onAnswer: (choice: string) => void;
}

export default function MemoryGame({ item, phase, onStudyReady, onAnswer }: Props) {
  return (
    <View style={styles.container}>
      {phase === 'study' ? (
        <StudyPhase item={item} onReady={onStudyReady} />
      ) : (
        <AnswerPhase item={item} onAnswer={onAnswer} />
      )}
    </View>
  );
}

function StudyPhase({ item, onReady }: { item: Item; onReady: () => void }) {
  return (
    <>
      <Text style={styles.instructionLabel}>👀 Study carefully</Text>
      <Text style={styles.prompt}>{item.study_prompt}</Text>

      <View style={styles.sequenceRow}>
        {item.study_items.map((val, idx) => (
          <View key={idx} style={styles.chip}>
            <Text style={styles.chipText}>{val}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.hint}>Remember the order — you'll need it next!</Text>

      <Pressable
        style={({ pressed }) => [styles.readyBtn, pressed && styles.readyBtnPressed]}
        onPress={onReady}
      >
        <Text style={styles.readyBtnText}>✅  I Remember!</Text>
      </Pressable>
    </>
  );
}

function AnswerPhase({ item, onAnswer }: { item: Item; onAnswer: (c: string) => void }) {
  return (
    <>
      <Text style={styles.instructionLabel}>🤔 Now answer</Text>
      <Text style={styles.question}>{item.question}</Text>
      <AnswerGrid options={item.options} onAnswer={onAnswer} color={COLORS.primary} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },

  instructionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.working_memory,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  prompt: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  sequenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    backgroundColor: '#F5EEFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.working_memory,
  },
  chip: {
    backgroundColor: COLORS.working_memory,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minWidth: 52,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  hint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  readyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  readyBtnPressed: {
    opacity: 0.85,
  },
  readyBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  question: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 26,
  },
});
