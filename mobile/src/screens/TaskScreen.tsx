/**
 * Task Screen - Duolingo-inspired Component A demo lesson flow.
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Grade5TaskRenderer from '../components/Grade5TaskRenderer';
import { ANIMATIONS, COLORS, DOMAIN_CONFIG, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { getGrade5DemoTasks, startGrade5Screening, submitGrade5Response } from '../services/api';
import type { AdaptiveTask, Grade5SessionSnapshot, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Task'>;

export default function TaskScreen({ route, navigation }: Props) {
  const { studentId, studentName, language, sessionId: existingSessionId, demoMode = false } = route.params;

  const [loading, setLoading] = useState(!existingSessionId || demoMode);
  const [error, setError] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<AdaptiveTask | null>(null);
  const [demoTasks, setDemoTasks] = useState<AdaptiveTask[]>([]);
  const [demoCorrectCount, setDemoCorrectCount] = useState(0);
  const [snapshot, setSnapshot] = useState<Grade5SessionSnapshot | null>(null);

  const sessionIdRef = useRef<string>(existingSessionId || '');
  const itemDisplayedAtRef = useRef<number>(Date.now());
  const taskNumberRef = useRef<number>(1);
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;

    async function initializeTask() {
      try {
        setLoading(true);

        if (demoMode) {
          const res = await getGrade5DemoTasks();
          if (cancelled) return;

          sessionIdRef.current = `demo_${Date.now()}`;
          setDemoTasks(res.tasks);
          setCurrentTask(res.tasks[0] ?? null);
          taskNumberRef.current = 1;
        } else if (!existingSessionId) {
          const res = await startGrade5Screening(studentId, language);
          if (cancelled) return;

          sessionIdRef.current = res.session_id;
          setCurrentTask(res.first_task);
          taskNumberRef.current = 1;
        }

        itemDisplayedAtRef.current = Date.now();
        Animated.timing(fadeInAnim, {
          toValue: 1,
          duration: ANIMATIONS.normal,
          useNativeDriver: true,
        }).start();
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message ?? 'Failed to start assessment.');
          console.error('Task init error:', e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initializeTask();

    return () => {
      cancelled = true;
    };
  }, [demoMode, existingSessionId, fadeInAnim, language, studentId]);

  const handleTaskComplete = useCallback(
    async (isCorrect: boolean, hintUsed: boolean = false) => {
      if (!currentTask) return;

      const reactionMs = Math.max(200, Date.now() - itemDisplayedAtRef.current);

      if (demoMode) {
        const answeredCount = taskNumberRef.current;
        const nextCorrectCount = demoCorrectCount + (isCorrect ? 1 : 0);
        setDemoCorrectCount(nextCorrectCount);

        if (answeredCount >= demoTasks.length) {
          navigation.replace('Results', {
            studentId,
            studentName,
            language,
            sessionId: sessionIdRef.current,
          });
          return;
        }

        taskNumberRef.current = answeredCount + 1;
        setCurrentTask(demoTasks[answeredCount]);
        itemDisplayedAtRef.current = Date.now();
        fadeInAnim.setValue(0);
        Animated.timing(fadeInAnim, {
          toValue: 1,
          duration: ANIMATIONS.fast,
          useNativeDriver: true,
        }).start();
        return;
      }

      try {
        Haptics.impactAsync(
          isCorrect
            ? Haptics.ImpactFeedbackStyle.Heavy
            : Haptics.ImpactFeedbackStyle.Medium,
        );

        const res = await submitGrade5Response(
          sessionIdRef.current,
          currentTask.task_id,
          isCorrect,
          reactionMs,
          0,
          hintUsed,
        );

        setSnapshot(res.snapshot);
        taskNumberRef.current = res.snapshot.tasks_answered + 1;

        navigation.replace('Feedback', {
          isCorrect,
          reactionTimeMs: reactionMs,
          taskCategory: DOMAIN_CONFIG[currentTask.category]?.shortLabel || 'Unknown',
          studentId,
          studentName,
          language,
          sessionId: sessionIdRef.current,
        });
      } catch (e: any) {
        console.error('Submit error:', e);
        Alert.alert('Error', e.message ?? 'Failed to submit response.');
      }
    },
    [currentTask, demoCorrectCount, demoMode, demoTasks, fadeInAnim, studentId, studentName, language, navigation],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#58CC02" />
          <Text style={styles.loadingText}>Preparing your challenge...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !currentTask) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load task.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const categoryConfig = DOMAIN_CONFIG[currentTask.category] ?? {
    color: COLORS.primary,
    icon: '*',
    shortLabel: currentTask.category.replace(/_/g, ' '),
  };
  const totalTasks = demoMode ? 8 : 12;
  const progressPercent = demoMode
    ? Math.min((taskNumberRef.current - 1) / totalTasks, 1)
    : Math.min((snapshot?.tasks_answered ?? taskNumberRef.current - 1) / totalTasks, 1);
  const difficultyColor = getDifficultyColor(currentTask.difficulty);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeInAnim }]}>
          <View style={styles.lessonTopBar}>
            <Text style={styles.closeButton}>x</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.max(progressPercent * 100, 8)}%` }]} />
            </View>
            <View style={styles.heartsBadge}>
              <Text style={styles.heartIcon}>♥</Text>
              <Text style={styles.heartCount}>3</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color + '18' }]}>
              <Text style={styles.categoryIcon}>{categoryConfig.icon}</Text>
              <Text style={[styles.categoryLabel, { color: categoryConfig.color }]}>
                {categoryConfig.shortLabel}
              </Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '18' }]}>
              <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                {currentTask.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.lessonBody}>
            <Text style={styles.taskCounterSmall}>
              Question {taskNumberRef.current}{demoMode ? ' of 8' : ''}
            </Text>
            <Text style={styles.question}>{currentTask.question}</Text>

            <View style={styles.taskRendererContainer}>
              <Grade5TaskRenderer
                task={currentTask}
                onComplete={handleTaskComplete}
                timeoutMs={currentTask.max_time_sec * 1000}
              />
            </View>

            {!demoMode && currentTask.metadata.hints_available && (
              <View style={styles.hintCard}>
                <Text style={styles.hintText}>Hint available if you get stuck</Text>
              </View>
            )}
          </View>

          <Text style={styles.footer}>
            {demoMode
              ? 'Demo mode: 8 questions, 2 from each Component A category.'
              : "Take your time - there's no rush. Trust your instincts!"}
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return '#58CC02';
    case 'medium':
      return '#FFB020';
    case 'hard':
      return '#FF4B4B';
    default:
      return COLORS.textSecondary;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  content: {
    flex: 1,
    gap: SPACING.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  errorText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.error,
    textAlign: 'center',
  },
  lessonTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  closeButton: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'center',
    width: 28,
  },
  progressTrack: {
    flex: 1,
    height: 14,
    borderRadius: RADIUS.round,
    backgroundColor: '#DDEFD3',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.round,
    backgroundColor: '#58CC02',
  },
  heartsBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'flex-end',
    minWidth: 42,
  },
  heartIcon: {
    color: '#FF3B30',
    fontSize: 23,
    fontWeight: '900',
  },
  heartCount: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '900',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryLabel: {
    ...TYPOGRAPHY.labelMedium,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
  },
  difficultyText: {
    ...TYPOGRAPHY.label,
    fontWeight: '900',
  },
  lessonBody: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  taskCounterSmall: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.textTertiary,
    fontWeight: '900',
    textAlign: 'center',
  },
  question: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 30,
    textAlign: 'center',
  },
  taskRendererContainer: {
    minHeight: 290,
    justifyContent: 'center',
  },
  hintCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  hintText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footer: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 'auto',
  },
});
