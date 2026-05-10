import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import type { Item } from '../../types';
import AnswerGrid from './shared/AnswerGrid';

interface Props {
  item: Item;
  onAnswer: (choice: string) => void;
}

export default function ReasoningGame({ item, onAnswer }: Props) {
  // Split into instruction + rules/premise block
  const parts = item.question.split('\n\n');
  const instruction = parts[0];
  const premiseBlock = parts.slice(1).join('\n\n') || null;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.emoji}>💡</Text>
        <Text style={styles.instructionLabel}>THINK IT THROUGH</Text>
      </View>

      <Text style={styles.instruction}>{instruction}</Text>

      {premiseBlock && (
        <View style={styles.premiseBox}>
          <Text style={styles.premiseText}>{premiseBlock}</Text>
        </View>
      )}

      <AnswerGrid options={item.options} onAnswer={onAnswer} color={COLORS.logical_reasoning} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },

  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emoji: { fontSize: 16 },
  instructionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B8960C',
    letterSpacing: 1.2,
    fontFamily: 'Poppins_800ExtraBold',
    textTransform: 'uppercase',
  },

  instruction: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    lineHeight: 26,
    fontFamily: 'Poppins_700Bold',
  },

  premiseBox: {
    backgroundColor: '#FFFDE7',
    borderRadius: RADIUS.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.logical_reasoning,
    padding: SPACING.md,
  },
  premiseText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#33290A',
    lineHeight: 24,
    fontFamily: 'Poppins_600SemiBold',
  },
});
