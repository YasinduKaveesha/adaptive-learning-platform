import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import type { Item } from '../../types';
import AnswerGrid from './shared/AnswerGrid';

interface Props {
  item: Item;
  onAnswer: (choice: string) => void;
}

export default function PatternGame({ item, onAnswer }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.instructionLabel}>🧩 What comes next?</Text>
      <Text style={styles.question}>{item.question}</Text>
      <AnswerGrid options={item.options} onAnswer={onAnswer} color={COLORS.pattern_recognition} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },
  instructionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.pattern_recognition,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  question: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 28,
  },
});
