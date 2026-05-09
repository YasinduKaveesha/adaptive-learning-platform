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
  return (
    <View style={styles.container}>
      <Text style={styles.instructionLabel}>💡 Think it through</Text>

      <View style={styles.problemBox}>
        <Text style={styles.question}>{item.question}</Text>
      </View>

      <AnswerGrid options={item.options} onAnswer={onAnswer} color={COLORS.logical_reasoning} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },
  instructionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B8960C',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  problemBox: {
    backgroundColor: '#FFFDE7',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.logical_reasoning,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
});
