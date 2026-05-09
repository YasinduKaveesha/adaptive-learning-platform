/**
 * Grade 5 Adaptive Cognitive Screening Screen
 * 
 * Orchestrates Grade 5 task-based screening with:
 *  - Adaptive difficulty selection
 *  - Category-based ability tracking
 *  - Real-time engagement metrics
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfidenceTracker from '../components/ConfidenceTracker';
import DomainProfileChart from '../components/DomainProfileChart';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { startGrade5Screening, submitGrade5Response } from '../services/api';
import type {
  AdaptiveTask,
  Grade5Category,
  Grade5SessionSnapshot,
  RootStackParamList,
} from '../types';
import Grade5TaskRenderer from '../components/Grade5TaskRenderer';

type Props = NativeStackScreenProps<RootStackParamList, 'Grade5Screening'>;

export default function Grade5ScreeningScreen({ route, navigation }: Props) {
  const { studentId, studentName, language } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session
  const sessionIdRef = useRef<string>('');
  const [currentTask, setCurrentTask] = useState<AdaptiveTask | null>(null);
  const itemDisplayedAtRef = useRef<number>(Date.now());

  // Live stats
  const [snapshot, setSnapshot] = useState<Grade5SessionSnapshot | null>(null);

  // ── Initialize session ────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await startGrade5Screening(studentId, language);
        if (cancelled) return;
        sessionIdRef.current = res.session_id;
        setCurrentTask(res.first_task);
        itemDisplayedAtRef.current = Date.now();
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? 'Failed to start screening.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Handle task response ──────────────────────────────────────────────────

  const handleTaskComplete = useCallback(
    async (isCorrect: boolean, hintUsed: boolean = false) => {
      if (!currentTask) return;

      const reactionMs = Math.max(200, Date.now() - itemDisplayedAtRef.current);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      try {
        const res = await submitGrade5Response(
          sessionIdRef.current,
          currentTask.task_id,
          isCorrect,
          reactionMs,
          0, // hesitation_count
          hintUsed,
        );

        setSnapshot(res.snapshot);

        if (res.stop) {
          navigation.replace('Grade5Results', {
            confidence: res.snapshot.confidence,
            categoryProfile: Object.entries(res.snapshot.category_profiles).reduce(
              (acc, [cat, ability]) => ({
                ...acc,
                [cat]: ability.percentile,
              }),
              {} as Record<Grade5Category, number>,
            ),
            snapshot: res.snapshot,
            stoppingReason: res.stop_reason,
            studentName,
            sessionId: sessionIdRef.current,
          });
        } else if (res.next_task) {
          setCurrentTask(res.next_task);
          itemDisplayedAtRef.current = Date.now();
        }
      } catch (e: any) {
        Alert.alert('Error', e.message ?? 'Network error — check server.');
      }
    },
    [currentTask, studentName, navigation],
  );

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Starting cognitive assessment…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !currentTask) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centred}>
          <Text style={styles.errorText}>{error ?? 'No task loaded.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const taskNum = (snapshot?.tasks_answered ?? 0) + 1;
  const categoryLabel = currentTask.category.replace(/_/g, ' ').toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.categoryBadge}>{categoryLabel}</Text>
        </View>
        <Text style={styles.taskCounter}>Task {taskNum}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Live stats */}
        {snapshot && (
          <View style={styles.statsContainer}>
            <ConfidenceTracker confidence={snapshot.confidence} />
            <DomainProfileChart
              profile={snapshot.category_profiles as any}
              label="Category Abilities"
            />
          </View>
        )}

        {/* Task content */}
        <View style={styles.taskContainer}>
          <Text style={styles.taskDifficulty}>{currentTask.difficulty.toUpperCase()}</Text>
          <Text style={styles.taskQuestion}>{currentTask.question}</Text>
          <View style={styles.taskContent}>
            <Grade5TaskRenderer
              task={currentTask}
              onComplete={handleTaskComplete}
              timeoutMs={currentTask.max_time_sec * 1000}
            />
          </View>
          {currentTask.metadata.hints_available && (
            <Text style={styles.hintText}>💡 Hint available if needed</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  topBar: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  studentName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  categoryBadge: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  taskCounter: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsContainer: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  taskContainer: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
  },
  taskDifficulty: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  taskQuestion: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 24,
  },
  taskContent: {
    marginVertical: SPACING.md,
  },
  hintText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  centred: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.danger,
    textAlign: 'center',
  },
});
