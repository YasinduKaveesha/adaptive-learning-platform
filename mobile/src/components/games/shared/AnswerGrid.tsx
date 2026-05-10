import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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

function AnswerButton({
  letterKey,
  text,
  color,
  tileBg,
  borderColor,
  onAnswer,
}: {
  letterKey: string;
  text: string;
  color: string;
  tileBg: string;
  borderColor: string;
  onAnswer: (k: string) => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const elevAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true, speed: 60, bounciness: 2 }),
      Animated.timing(elevAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 12 }),
      Animated.timing(elevAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = () => {
    onAnswer(letterKey);
  };

  return (
    <Animated.View style={[styles.tileWrap, { transform: [{ scale: scaleAnim }], flex: 1 }]}>
      <Pressable
        style={[styles.tile, { backgroundColor: tileBg, borderColor }]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        {/* Letter badge */}
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{letterKey}</Text>
        </View>
        {/* Answer text */}
        <Text style={styles.optionText}>
          {text}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function AnswerGrid({ options, onAnswer, color = COLORS.primary }: Props) {
  const keys = CHOICE_KEYS.filter((k) => k in options);
  const tileBg = hexToRgba(color, 0.08);
  const borderColor = hexToRgba(color, 0.22);

  // Use single-column layout when any answer is long
  const isLong = keys.some((k) => (options[k] ?? '').length > 30);

  if (isLong) {
    return (
      <View style={styles.grid}>
        {keys.map((key) => (
          <AnswerButton
            key={key}
            letterKey={key}
            text={options[key]}
            color={color}
            tileBg={tileBg}
            borderColor={borderColor}
            onAnswer={onAnswer}
          />
        ))}
      </View>
    );
  }

  const rows: (typeof keys[number])[][] = [];
  for (let i = 0; i < keys.length; i += 2) {
    rows.push(keys.slice(i, i + 2) as (typeof keys[number])[]);
  }

  return (
    <View style={styles.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) => (
            <AnswerButton
              key={key}
              letterKey={key}
              text={options[key]}
              color={color}
              tileBg={tileBg}
              borderColor={borderColor}
              onAnswer={onAnswer}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: SPACING.sm },
  row: { flexDirection: 'row', gap: SPACING.sm },
  tileWrap: {
    borderRadius: RADIUS.xl,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 12,
    minHeight: 80,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'Poppins_800ExtraBold',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 20,
    fontFamily: 'Poppins_600SemiBold',
  },
});
