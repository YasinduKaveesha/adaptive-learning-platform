import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
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
      <View style={styles.labelRow}>
        <Text style={styles.emoji}>👀</Text>
        <Text style={[styles.instructionLabel, { color: COLORS.working_memory }]}>
          STUDY CAREFULLY
        </Text>
      </View>

      <Text style={styles.prompt}>{item.study_prompt}</Text>

      {/* Sequence tiles */}
      <View style={[styles.sequenceBox, { marginTop: 8 }]}>
        <View style={styles.sequenceRow}>
          {item.study_items.map((val, idx) => (
            <React.Fragment key={idx}>
              <View style={[styles.chip, { backgroundColor: COLORS.working_memory }]}>
                <Text style={styles.chipText}>{val}</Text>
              </View>
              {idx < item.study_items.length - 1 && (
                <Text style={styles.arrow}>→</Text>
              )}
            </React.Fragment>
          ))}
        </View>
        <Text style={styles.hint}>✨ Remember the order!</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.readyBtn, { marginTop: 15 }, pressed && styles.readyBtnPressed]}
        onPress={onReady}
      >
        <Text style={styles.readyBtnText}>✅  I Remember!</Text>
      </Pressable>
    </>
  );
}

function AnswerPhase({ item, onAnswer }: { item: Item; onAnswer: (c: string) => void }) {
  const parts = item.question.split('\n\n');
  const instruction = parts[0];

  return (
    <>
      <View style={styles.labelRow}>
        <Text style={styles.emoji}>🤔</Text>
        <Text style={[styles.instructionLabel, { color: COLORS.working_memory }]}>NOW ANSWER</Text>
      </View>

      <View style={styles.questionBox}>
        <Text style={styles.questionText}>{instruction}</Text>
      </View>

      <AnswerGrid options={item.options} onAnswer={onAnswer} color={COLORS.working_memory} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },

  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emoji: { fontSize: 16 },
  instructionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontFamily: 'Poppins_800ExtraBold',
    textTransform: 'uppercase',
  },

  prompt: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins_600SemiBold',
  },

  sequenceBox: {
    backgroundColor: '#EDF7FF',
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.working_memory,
    padding: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  sequenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 54,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  chipText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'Poppins_800ExtraBold',
  },
  arrow: {
    fontSize: 18,
    color: COLORS.working_memory,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    color: '#5C85A0',
    fontStyle: 'italic',
    fontFamily: 'Poppins_500Medium',
  },

  readyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  readyBtnPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  readyBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'Poppins_800ExtraBold',
  },

  questionBox: {
    backgroundColor: '#EDF7FF',
    borderRadius: RADIUS.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.working_memory,
    padding: SPACING.md,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    lineHeight: 30,
    fontFamily: 'Poppins_700Bold',
  },
});
