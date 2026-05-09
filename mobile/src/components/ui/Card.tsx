import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../constants/theme';

interface CardProps extends ViewProps {
  variant?: 'primary' | 'glass' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Card({
  variant = 'glass',
  padding = 'md',
  children,
  style,
  ...props
}: CardProps) {
  const styles = getStyles(variant, padding);

  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
}

function getStyles(variant: string, padding: string) {
  const paddings = {
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg,
  };

  const variants = {
    primary: {
      backgroundColor: COLORS.surface,
      borderRadius: RADIUS.lg,
      ...SHADOW.md,
    },
    glass: {
      backgroundColor: COLORS.glassLight,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: COLORS.glassMedium,
      backdropFilter: 'blur(10px)',
    },
    elevated: {
      backgroundColor: COLORS.surfaceLight,
      borderRadius: RADIUS.lg,
      ...SHADOW.lg,
    },
  };

  const variant_ = variants[variant as keyof typeof variants] || variants.glass;

  return {
    container: {
      ...variant_,
      padding: paddings[padding as keyof typeof paddings],
    },
  };
}
