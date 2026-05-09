/**
 * Live confidence trajectory bar.
 *
 * Renders a segmented bar chart of per-item classification confidence,
 * with a threshold line at 0.90 (the PP1 stopping threshold).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

const THRESHOLD = 0.90;

interface Props {
  history: number[];   // confidence after each item
  maxItems?: number;
}

export default function ConfidenceTracker({ history, maxItems = 25 }: Props) {
  const latest = history.at(-1) ?? 0;
  const thresholdReached = latest >= THRESHOLD;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Classification Confidence</Text>
        <Text style={[styles.value, thresholdReached && styles.valueReached]}>
          {(latest * 100).toFixed(0)}%
        </Text>
      </View>

      {/* Bar chart */}
      <View style={styles.chartArea}>
        {/* Threshold guide line */}
        <View style={[styles.thresholdLine, { bottom: `${THRESHOLD * 100}%` as any }]} />

        {/* Confidence bars */}
        <View style={styles.barsRow}>
          {history.map((conf, i) => (
            <View key={i} style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${conf * 100}%` as any,
                    backgroundColor: barColor(conf),
                  },
                ]}
              />
            </View>
          ))}
          {/* Empty placeholder bars */}
          {Array.from({ length: Math.max(0, 8 - history.length) }).map((_, i) => (
            <View key={`ph-${i}`} style={styles.barWrapper}>
              <View style={styles.barPlaceholder} />
            </View>
          ))}
        </View>

        {/* Y-axis labels */}
        <View style={styles.yLabels}>
          <Text style={styles.yLabel}>100%</Text>
          <Text style={[styles.yLabel, { color: COLORS.confidenceThreshold }]}>90%</Text>
          <Text style={styles.yLabel}>50%</Text>
          <Text style={styles.yLabel}>0%</Text>
        </View>
      </View>

      <Text style={styles.caption}>
        {thresholdReached
          ? '✅ Threshold reached — session complete'
          : `${history.length} item${history.length !== 1 ? 's' : ''} answered · threshold at 90%`}
      </Text>
    </View>
  );
}

function barColor(conf: number): string {
  if (conf >= THRESHOLD) return COLORS.confidenceHigh;
  if (conf >= 0.65) return COLORS.confidenceMid;
  return COLORS.confidenceLow;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: { ...TYPOGRAPHY.label, color: COLORS.textSecondary },
  value: { ...TYPOGRAPHY.h2, color: COLORS.confidenceMid },
  valueReached: { color: COLORS.confidenceHigh },
  chartArea: {
    height: 110,
    flexDirection: 'row',
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  thresholdLine: {
    position: 'absolute',
    left: 0,
    right: 30,
    height: 1.5,
    backgroundColor: COLORS.confidenceThreshold,
    opacity: 0.6,
    zIndex: 2,
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    paddingRight: SPACING.sm,
  },
  barWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: RADIUS.sm,
    minHeight: 4,
  },
  barPlaceholder: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.sm,
  },
  yLabels: {
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  yLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textDisabled,
    fontSize: 9,
  },
  caption: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
