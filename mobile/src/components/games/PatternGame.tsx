import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import type { Item } from '../../types';
import AnswerGrid from './shared/AnswerGrid';

interface Props {
  item: Item;
  onAnswer: (choice: string) => void;
}

export default function PatternGame({ item, onAnswer }: Props) {
  // Split into instruction + pattern sequence if separated by \n\n
  const parts = item.question.split('\n\n');
  const instruction = parts[0];
  const patternLine = parts[1] ?? null;

  // Parse "2  →  4  →  6  →  ?" into tokens
  const tokens: string[] = patternLine
    ? patternLine.split(/\s*[→\->]+\s*/).map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.emoji}>🧩</Text>
        <Text style={styles.instructionLabel}>FIND THE PATTERN</Text>
      </View>

      <Text style={styles.instruction}>{instruction}</Text>

      {tokens.length > 0 ? (
        <View style={styles.patternBox}>
          <View style={styles.tokensRow}>
            {tokens.map((token, idx) => {
              const isQuestion = token === '?';
              return (
                <React.Fragment key={idx}>
                  <View style={[styles.tokenChip, isQuestion && styles.tokenChipQuestion]}>
                    <Text style={[styles.tokenText, isQuestion && styles.tokenTextQuestion]}>
                      {token}
                    </Text>
                  </View>
                  {idx < tokens.length - 1 && (
                    <Text style={styles.arrow}>→</Text>
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>
      ) : (
        // fallback: render the whole question in a styled box
        <View style={styles.questionFallback}>
          <Text style={styles.questionText}>{item.question}</Text>
        </View>
      )}

      <AnswerGrid options={item.options} onAnswer={onAnswer} color={COLORS.pattern_recognition} />
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
    color: COLORS.pattern_recognition,
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

  patternBox: {
    backgroundColor: '#E8F6FF',
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.pattern_recognition,
    padding: SPACING.md,
    alignItems: 'center',
  },
  tokensRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tokenChip: {
    backgroundColor: COLORS.pattern_recognition,
    borderRadius: RADIUS.lg,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minWidth: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  tokenChipQuestion: {
    backgroundColor: '#fff',
    borderWidth: 2.5,
    borderColor: COLORS.pattern_recognition,
    borderStyle: 'dashed',
  },
  tokenText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'Poppins_800ExtraBold',
  },
  tokenTextQuestion: {
    color: COLORS.pattern_recognition,
  },
  arrow: {
    fontSize: 18,
    color: COLORS.pattern_recognition,
    fontWeight: '700',
  },

  questionFallback: {
    backgroundColor: '#E8F6FF',
    borderRadius: RADIUS.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.pattern_recognition,
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
