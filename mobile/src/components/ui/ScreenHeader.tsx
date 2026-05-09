import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  progress?: number; // 0-1
}

export function ScreenHeader({ title, subtitle, icon, progress }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {progress !== undefined && <ProgressBar progress={progress} />}
    </View>
  );
}

interface ProgressBarProps {
  progress: number; // 0-1
}

function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View style={styles.progressContainer}>
      <View
        style={[
          styles.progressBar,
          {
            width: `${progress * 100}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  icon: {
    fontSize: 40,
  },
  textContainer: {
    gap: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});
