/**
 * Instructions Screen — Quick onboarding before assessment starts
 * Explains what to expect and builds excitement
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { Animated, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { ANIMATIONS, COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Instructions'>;

interface InstructionItem {
  icon: string;
  title: string;
  description: string;
}

const INSTRUCTIONS: InstructionItem[] = [
  {
    icon: '🧩',
    title: 'Adaptive Challenges',
    description: 'Each puzzle adjusts to your level—starting easy, ramping up intelligently.',
  },
  {
    icon: '⏱️',
    title: 'Timed Sessions',
    description: 'Work at your own pace. Tasks have soft limits but no hard pressure.',
  },
  {
    icon: '🎯',
    title: 'Focus Areas',
    description: 'We test memory, attention, pattern recognition, and logical reasoning.',
  },
  {
    icon: '📊',
    title: 'Instant Feedback',
    description: "After each task, you'll see how you performed and get real-time insights.",
  },
];

export default function InstructionsScreen({ navigation, route }: Props) {
  const { studentId, studentName, language } = route.params;
  const fadeInAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: ANIMATIONS.normal,
      useNativeDriver: true,
    }).start();
  }, [fadeInAnim]);

  function handleBegin() {
    navigation.navigate('Task', {
      studentId,
      studentName,
      language,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeInAnim }]}>
          <ScreenHeader title="Ready to Begin?" subtitle={`Hi, ${studentName}! Here's what to expect:`} icon="🚀" />

          {/* Instructions */}
          <View style={styles.instructionsGrid}>
            {INSTRUCTIONS.map((item, index) => (
              <Card key={index} variant="glass" padding="md" style={styles.instructionCard}>
                <Text style={styles.instructionIcon}>{item.icon}</Text>
                <Text style={styles.instructionTitle}>{item.title}</Text>
                <Text style={styles.instructionText}>{item.description}</Text>
              </Card>
            ))}
          </View>

          {/* Quick Tips */}
          <Card variant="elevated" padding="lg">
            <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
            <View style={styles.tipsList}>
              {[
                "Take your time — there's no rush",
                "If you're unsure, take your best guess",
                "You'll see your results immediately after completion",
                "The assessment adapts to your performance in real-time",
              ].map((tip, i) => (
                <View key={i} style={styles.tipItem}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Duration Info */}
          <Card variant="glass" padding="md" style={styles.durationCard}>
            <View style={styles.durationContent}>
              <Text style={styles.durationIcon}>⏱️</Text>
              <View style={styles.durationText}>
                <Text style={styles.durationTitle}>Expected Duration</Text>
                <Text style={styles.durationDesc}>12–15 minutes total (adapts based on your responses)</Text>
              </View>
            </View>
          </Card>

          {/* CTA Button */}
          <Button title="Start Assessment" icon="✨" onPress={handleBegin} size="lg" fullWidth />

          {/* Footer */}
          <Text style={styles.footerText}>Your responses help us understand your cognitive strengths and tailor recommendations for you.</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  content: {
    gap: SPACING.lg,
  },
  instructionsGrid: {
    gap: SPACING.md,
  },
  instructionCard: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  instructionIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  instructionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  instructionText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  tipsTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  tipsList: {
    gap: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  tipBullet: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    marginTop: 2,
  },
  tipText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
  },
  durationCard: {
    marginVertical: SPACING.md,
  },
  durationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  durationIcon: {
    fontSize: 32,
  },
  durationText: {
    flex: 1,
    gap: SPACING.xs,
  },
  durationTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  durationDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  footerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
