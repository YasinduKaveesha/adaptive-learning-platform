/**
 * Progress Screen — Live assessment stats between tasks
 * Shows current ability estimates, confidence, and progress
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { ANIMATIONS, COLORS, DOMAIN_CONFIG, RADIUS, SHADOW, SPACING, TYPOGRAPHY } from '../constants/theme';
import { getGrade5Classification } from '../services/api';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>;

interface ProgressData {
  tasksAnswered: number;
  confidence: number;
  domainScores: {
    working_memory: number;
    attention: number;
    pattern_recognition: number;
    logical_reasoning: number;
  };
}

export default function ProgressScreen({ navigation, route }: Props) {
  const { studentId, studentName, language, sessionId } = route.params;
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const fadeInAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProgress();

    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: ANIMATIONS.normal,
      useNativeDriver: true,
    }).start();
  }, [sessionId]);

  async function loadProgress() {
    try {
      setLoading(true);
      // In a real app, this would fetch from the backend
      // For now, using mock data
      const mockData: ProgressData = {
        tasksAnswered: Math.floor(Math.random() * 12) + 1,
        confidence: Math.random() * 100,
        domainScores: {
          working_memory: Math.random() * 100,
          attention: Math.random() * 100,
          pattern_recognition: Math.random() * 100,
          logical_reasoning: Math.random() * 100,
        },
      };
      setProgress(mockData);
    } catch (err) {
      console.error('Error loading progress:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    if (!progress) return;

    // If confidence >= 90 or tasks >= 12, go to results
    if (progress.confidence >= 90 || progress.tasksAnswered >= 12) {
      navigation.replace('Results', {
        studentId,
        studentName,
        language,
        sessionId,
      });
    } else {
      // Otherwise, continue to next task
      navigation.replace('Task', {
        studentId,
        studentName,
        language,
        sessionId,
      });
    }
  }

  if (loading || !progress) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Calculating your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const shouldContinue = progress.confidence < 90 && progress.tasksAnswered < 12;
  const progressPercent = progress.tasksAnswered / 12;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeInAnim }]}>
          <ScreenHeader
            title="Your Progress"
            subtitle={`Task ${progress.tasksAnswered} of up to 12`}
            progress={progressPercent}
          />

          {/* Confidence Gauge */}
          <Card variant="elevated" padding="lg" style={styles.confidenceCard}>
            <Text style={styles.confidenceLabel}>Confidence Level</Text>
            <View style={styles.confidenceGaugeContainer}>
              <Animated.View
                style={[
                  styles.confidenceGauge,
                  {
                    width: `${progress.confidence}%`,
                    backgroundColor: getConfidenceColor(progress.confidence),
                  },
                ]}
              />
            </View>
            <Text style={styles.confidenceValue}>{Math.round(progress.confidence)}%</Text>
            <Text style={styles.confidenceStatus}>
              {progress.confidence >= 90
                ? '🎉 Excellent confidence!'
                : progress.confidence >= 70
                ? '👍 Good progress'
                : '🚀 Building confidence...'}
            </Text>
          </Card>

          {/* Domain Breakdown */}
          <Text style={styles.sectionTitle}>Cognitive Domains</Text>
          <View style={styles.domainsGrid}>
            {Object.entries(progress.domainScores).map(([domain, score]) => (
              <DomainCard key={domain} domain={domain as any} score={score} />
            ))}
          </View>

          {/* Next Step */}
          {shouldContinue ? (
            <Card variant="glass" padding="md" style={styles.nextStepCard}>
              <Text style={styles.nextStepText}>Ready for the next challenge? 🎮</Text>
            </Card>
          ) : (
            <Card variant="glass" padding="md" style={styles.completeCard}>
              <Text style={styles.completeText}>✨ Assessment Complete! View your results →</Text>
            </Card>
          )}

          {/* Action Button */}
          <Button
            title={shouldContinue ? 'Next Task' : 'View Results'}
            icon={shouldContinue ? '→' : '🏆'}
            onPress={handleContinue}
            size="lg"
            fullWidth
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DomainCard({ domain, score }: { domain: string; score: number }) {
  const config = DOMAIN_CONFIG[domain] || { label: domain, icon: '?', color: COLORS.textSecondary };

  return (
    <Card variant="glass" padding="md" style={styles.domainCard}>
      <Text style={styles.domainIcon}>{config.icon}</Text>
      <Text style={styles.domainName}>{config.shortLabel}</Text>
      <View style={styles.scoreBar}>
        <View
          style={[
            styles.scoreBarFill,
            {
              width: `${score}%`,
              backgroundColor: config.color,
            },
          ]}
        />
      </View>
      <Text style={styles.scoreText}>{Math.round(score)}%</Text>
    </Card>
  );
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return COLORS.success;
  if (confidence >= 70) return COLORS.primary;
  if (confidence >= 50) return COLORS.warning;
  return COLORS.error;
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  confidenceCard: {
    gap: SPACING.md,
  },
  confidenceLabel: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.textSecondary,
  },
  confidenceGaugeContainer: {
    height: 32,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  confidenceGauge: {
    height: '100%',
    borderRadius: RADIUS.md,
  },
  confidenceValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  confidenceStatus: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  domainsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  domainCard: {
    width: '48%',
    alignItems: 'center',
    gap: SPACING.sm,
    aspectRatio: 1,
    justifyContent: 'center',
  },
  domainIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  domainName: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  scoreBar: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    marginVertical: SPACING.xs,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: RADIUS.sm,
  },
  scoreText: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
  },
  nextStepCard: {
    marginVertical: SPACING.md,
  },
  nextStepText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  completeCard: {
    marginVertical: SPACING.md,
    backgroundColor: COLORS.glowGreen,
  },
  completeText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
});
