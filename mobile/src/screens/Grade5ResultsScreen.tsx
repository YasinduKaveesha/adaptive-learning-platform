/**
 * Grade 5 Cognitive Screening Results Screen
 * 
 * Displays:
 *  - Overall confidence
 *  - Category-wise ability percentiles
 *  - Performance summary
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Grade5Results'>;

export default function Grade5ResultsScreen({ route }: Props) {
  const { confidence, categoryProfile, snapshot, studentName, stoppingReason } = route.params;

  const getConfidenceLabel = (conf: number): string => {
    if (conf >= 0.9) return 'Very High Confidence';
    if (conf >= 0.75) return 'High Confidence';
    if (conf >= 0.6) return 'Moderate Confidence';
    return 'Low Confidence';
  };

  const getCategoryColor = (percentile: number): string => {
    if (percentile >= 80) return '#4CAF50'; // Green
    if (percentile >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getPerformanceLevel = (percentile: number): string => {
    if (percentile >= 80) return 'Advanced';
    if (percentile >= 60) return 'Proficient';
    return 'Developing';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.subtitle}>Cognitive Assessment Results</Text>
        </View>

        {/* Confidence Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Assessment Confidence</Text>
          <View style={styles.confidenceBox}>
            <Text style={styles.confidenceValue}>{Math.round(confidence * 100)}%</Text>
            <Text style={styles.confidenceLabel}>{getConfidenceLabel(confidence)}</Text>
          </View>
        </View>

        {/* Category Profiles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cognitive Domain Scores</Text>
          <View style={styles.categoriesContainer}>
            {Object.entries(categoryProfile).map(([category, percentile]) => {
              const color = getCategoryColor(percentile);
              const level = getPerformanceLevel(percentile);
              return (
                <View key={category} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>
                      {category.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    <Text style={[styles.percentile, { color }]}>
                      {Math.round(percentile)}th percentile
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(percentile, 100)}%`, backgroundColor: color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.levelText, { color }]}>{level}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Session Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Summary</Text>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tasks Completed:</Text>
              <Text style={styles.summaryValue}>{snapshot.tasks_answered}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Stopping Reason:</Text>
              <Text style={styles.summaryValue}>{stoppingReason || 'Completed'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Difficulty Level:</Text>
              <Text style={styles.summaryValue}>{snapshot.adaptive_difficulty_level}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Overall Ability:</Text>
              <Text style={styles.summaryValue}>{snapshot.overall_theta.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationBox}>
            {Object.entries(categoryProfile).map(([category, percentile]) => {
              let recommendation = '';
              if (percentile >= 80) {
                recommendation = `${category}: Consider advanced activities.`;
              } else if (percentile >= 60) {
                recommendation = `${category}: Continue with grade-level activities.`;
              } else {
                recommendation = `${category}: Consider additional support or scaffolding.`;
              }
              return (
                <Text key={category} style={styles.recommendationText}>
                  • {recommendation}
                </Text>
              );
            })}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Assessment completed. Results are valid until 21 days from today.
          </Text>
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
    paddingVertical: SPACING.lg,
  },

  header: {
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  studentName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },

  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontWeight: '700',
  },

  confidenceBox: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceValue: {
    ...TYPOGRAPHY.h1,
    color: COLORS.surface,
    fontWeight: '700',
  },
  confidenceLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    marginTop: SPACING.sm,
  },

  categoriesContainer: {
    gap: SPACING.md,
  },
  categoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  categoryName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  percentile: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },

  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    marginVertical: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.sm,
  },

  levelText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },

  summaryBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },

  recommendationBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  recommendationText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },

  footer: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
