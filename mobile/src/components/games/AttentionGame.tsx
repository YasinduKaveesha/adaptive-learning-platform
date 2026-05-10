import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import type { Item } from '../../types';
import AnswerGrid from './shared/AnswerGrid';

interface Props {
  item: Item;
  onAnswer: (choice: string) => void;
}

export default function AttentionGame({ item, onAnswer }: Props) {
  // Split "instruction\n\nthe content to count" if present
  const parts = item.question.split('\n\n');
  const instruction = parts[0];
  const contentLine = parts[1] ?? null;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.instructionLabel}>STAY FOCUSED</Text>
      </View>

      <Text style={styles.instruction}>{instruction}</Text>

      {contentLine && (
        <View style={styles.contentBox}>
          <Text style={styles.contentText}>{contentLine}</Text>
        </View>
      )}

      <AnswerGrid options={item.options} onAnswer={onAnswer} color={COLORS.attention} />
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
    color: COLORS.attention,
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

  contentBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.attention,
    padding: SPACING.md,
    alignItems: 'center',
  },
  contentText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A2E',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: 3,
    fontFamily: 'Poppins_800ExtraBold',
  },
});
