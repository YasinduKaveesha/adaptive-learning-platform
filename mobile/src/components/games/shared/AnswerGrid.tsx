import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';

interface Props {
  options: Record<string, string>;
  onAnswer: (choice: string) => void;
  color?: string;
}

const CHOICE_KEYS = ['A', 'B', 'C', 'D'] as const;

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function AnswerGrid({ options, onAnswer, color = COLORS.primary }: Props) {
  const keys = CHOICE_KEYS.filter((k) => k in options);
  const tileBg = hexToRgba(color, 0.09);

  // Split into rows of 2 for equal-size 2×2 grid
  const rows: (typeof keys[number])[][] = [];
  for (let i = 0; i < keys.length; i += 2) {
    rows.push(keys.slice(i, i + 2) as (typeof keys[number])[]);
  }

  return (
    <View style={styles.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) => (
            <Pressable
              key={key}
              style={({ pressed }) => [
                styles.tile,
                { backgroundColor: tileBg },
                pressed && styles.tilePressed,
              ]}
              onPress={() => onAnswer(key)}
            >
              <View style={[styles.badge, { backgroundColor: color }]}>
                <Text style={styles.badgeText}>{key}</Text>
              </View>
              <Text style={styles.optionText} numberOfLines={3}>
                {options[key]}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    minHeight: 92,
  },
  tilePressed: {
    opacity: 0.75,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    flexWrap: 'wrap',
  },
});
