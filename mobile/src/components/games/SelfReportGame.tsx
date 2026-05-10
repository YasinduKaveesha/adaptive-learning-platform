import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RADIUS, SPACING } from '../../constants/theme';
import type { Item } from '../../types';
import AnswerGrid from './shared/AnswerGrid';

interface Props {
  item: Item;
  onAnswer: (choice: string) => void;
  accentColor: string;
  accentBg: string;
  icon: string;
}

export default function SelfReportGame({ item, onAnswer, accentColor, accentBg, icon }: Props) {
  const isPreference = item.game_type === 'preference_pick';

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.emoji}>{icon}</Text>
        <Text style={[styles.instructionLabel, { color: accentColor }]}>
          {isPreference ? 'YOUR PREFERENCE' : 'WHAT DO YOU DO?'}
        </Text>
      </View>

      <View style={[styles.questionBox, { backgroundColor: accentBg, borderLeftColor: accentColor }]}>
        <Text style={styles.questionText}>{item.question}</Text>
      </View>

      {isPreference && (
        <View style={[styles.noWrongBadge, { backgroundColor: accentBg, borderColor: accentColor }]}>
          <Text style={[styles.noWrongText, { color: accentColor }]}>
            ✨ No right or wrong — just be honest!
          </Text>
        </View>
      )}

      <AnswerGrid options={item.options} onAnswer={onAnswer} color={accentColor} />
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
    letterSpacing: 1.2,
    fontFamily: 'Poppins_800ExtraBold',
    textTransform: 'uppercase',
  },

  questionBox: {
    borderLeftWidth: 4,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    lineHeight: 28,
    fontFamily: 'Poppins_700Bold',
  },

  noWrongBadge: {
    borderWidth: 1.5,
    borderRadius: RADIUS.round,
    paddingVertical: 5,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  noWrongText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
});
