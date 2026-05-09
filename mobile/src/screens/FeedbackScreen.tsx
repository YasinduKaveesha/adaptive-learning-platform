/**
 * Feedback Screen — Immediate feedback after each task
 * Shows whether correct, reaction time, and encouragement
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ANIMATIONS, COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Feedback'>;

export default function FeedbackScreen({ navigation, route }: Props) {
  const { isCorrect, reactionTimeMs, taskCategory, studentId, studentName, language, sessionId } = route.params;
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    // Auto-advance after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.navigate('Progress', {
        studentId,
        studentName,
        language,
        sessionId,
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [scaleAnim, navigation, studentId, studentName, language, sessionId]);

  const feedbackEmoji = isCorrect ? '✨' : '💪';
  const feedbackColor = isCorrect ? COLORS.success : COLORS.warning;
  const reactionTimeLabel = reactionTimeMs < 3000 ? 'Quick! ⚡' : 'Thoughtful 🤔';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.feedbackCard,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.feedbackBadge, { backgroundColor: feedbackColor }]}>
            <Text style={styles.feedbackEmoji}>{feedbackEmoji}</Text>
          </View>

          <Text style={styles.feedbackTitle}>{isCorrect ? 'Perfect!' : 'Good Effort'}</Text>
          <Text style={styles.feedbackMessage}>
            {isCorrect ? "You got it right! 🎉" : "That's okay! You're learning. 🌱"}
          </Text>

          {/* Stats */}
          <Card variant="glass" padding="md" style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Response Time</Text>
              <Text style={styles.statValue}>{reactionTimeLabel}</Text>
            </View>
            <View style={[styles.statRow, { borderTopWidth: 1, borderTopColor: COLORS.glassMedium, paddingTop: SPACING.md, marginTop: SPACING.md }]}>
              <Text style={styles.statLabel}>Category</Text>
              <Text style={styles.statValue}>{taskCategory}</Text>
            </View>
          </Card>

          {/* Next Task Button */}
          <Button
            title="Next →"
            onPress={() =>
              navigation.navigate('Progress', {
                studentId,
                studentName,
                language,
                sessionId,
              })
            }
            size="lg"
            fullWidth
            variant="primary"
          />
        </Animated.View>

        {/* Encouragement Footer */}
        <Text style={styles.encouragement}>
          {isCorrect ? '🚀 Keep up the great work!' : '📈 Learning is progress!'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackCard: {
    alignItems: 'center',
    gap: SPACING.lg,
    width: '100%',
  },
  feedbackBadge: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  feedbackEmoji: {
    fontSize: 52,
  },
  feedbackTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  feedbackMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statsCard: {
    width: '100%',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  statValue: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primary,
    fontWeight: '600',
  },
  encouragement: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});
