/**
 * Live per-domain ability profile (horizontal progress bars).
 * Updates after each item response.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, DOMAIN_CONFIG, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import type { Domain, DomainAbility } from '../types';

interface Props {
  domainAbilities: Partial<Record<Domain, DomainAbility>>;
}

const DOMAIN_ORDER: Domain[] = [
  'working_memory',
  'pattern_recognition',
  'attention',
  'logical_reasoning',
];

export default function DomainProfileChart({ domainAbilities }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Domain Profile</Text>

      {DOMAIN_ORDER.map((domain) => {
        const ability = domainAbilities[domain];
        const percentile = ability?.percentile ?? 50;
        const itemsAnswered = ability?.items_answered ?? 0;
        const cfg = DOMAIN_CONFIG[domain];

        return (
          <View key={domain} style={styles.row}>
            <View style={styles.labelRow}>
              <Text style={styles.icon}>{cfg.icon}</Text>
              <Text style={styles.domainLabel}>{cfg.shortLabel}</Text>
              <Text style={[styles.percentile, { color: cfg.color }]}>
                {itemsAnswered > 0 ? `${percentile}th` : '—'}
              </Text>
            </View>

            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${percentile}%` as any,
                    backgroundColor: cfg.color,
                    opacity: itemsAnswered > 0 ? 1 : 0.25,
                  },
                ]}
              />
              {/* Median reference line */}
              <View style={styles.medianLine} />
            </View>
          </View>
        );
      })}

      <View style={styles.legend}>
        <Text style={styles.legendText}>Below avg</Text>
        <Text style={styles.legendText}>Average (50th)</Text>
        <Text style={styles.legendText}>Above avg</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  row: {
    marginBottom: SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: SPACING.xs,
  },
  icon: { fontSize: 14 },
  domainLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textPrimary,
    flex: 1,
  },
  percentile: {
    ...TYPOGRAPHY.label,
    fontSize: 11,
  },
  track: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.round,
  },
  medianLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: COLORS.textDisabled,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  legendText: {
    ...TYPOGRAPHY.small,
    fontSize: 9,
    color: COLORS.textDisabled,
  },
});
