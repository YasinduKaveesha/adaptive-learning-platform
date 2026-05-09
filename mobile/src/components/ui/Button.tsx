import React from 'react';
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, RADIUS, SHADOW, SPACING, TYPOGRAPHY } from '../../constants/theme';

interface ButtonProps {
  onPress: (e: GestureResponderEvent) => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  fullWidth = false,
}: ButtonProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const styles = getStyles(variant, size, disabled, fullWidth);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
      >
        <View style={styles.content}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.text}>{title}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function getStyles(variant: string, size: string, disabled: boolean, fullWidth: boolean) {
  const baseStyle = {
    container: {
      borderRadius: RADIUS.lg,
      overflow: 'hidden' as const,
      opacity: disabled ? 0.5 : 1,
      width: fullWidth ? '100%' : 'auto',
    },
  };

  const variantStyles = {
    primary: {
      container: {
        ...baseStyle.container,
        backgroundColor: COLORS.primary,
        ...SHADOW.md,
      },
      content: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: SPACING.sm,
      },
      text: {
        ...TYPOGRAPHY.bodyMedium,
        color: COLORS.background,
        fontWeight: '600' as const,
      },
      icon: { fontSize: 18 },
    },
    secondary: {
      container: {
        ...baseStyle.container,
        backgroundColor: COLORS.surfaceLight,
      },
      content: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: SPACING.sm,
      },
      text: {
        ...TYPOGRAPHY.bodyMedium,
        color: COLORS.primary,
        fontWeight: '600' as const,
      },
      icon: { fontSize: 18, color: COLORS.primary },
    },
    outline: {
      container: {
        ...baseStyle.container,
        borderWidth: 2,
        borderColor: COLORS.primary,
        backgroundColor: 'transparent',
      },
      content: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: SPACING.sm,
      },
      text: {
        ...TYPOGRAPHY.bodyMedium,
        color: COLORS.primary,
        fontWeight: '600' as const,
      },
      icon: { fontSize: 18 },
    },
    ghost: {
      container: {
        ...baseStyle.container,
        backgroundColor: 'transparent',
      },
      content: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: SPACING.sm,
      },
      text: {
        ...TYPOGRAPHY.bodyMedium,
        color: COLORS.textPrimary,
        fontWeight: '500' as const,
      },
      icon: { fontSize: 18 },
    },
  };

  const sizeStyles = {
    sm: {
      container: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
      text: TYPOGRAPHY.bodySmall,
      icon: { fontSize: 14 },
    },
    md: {
      container: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
      text: TYPOGRAPHY.bodyMedium,
      icon: { fontSize: 18 },
    },
    lg: {
      container: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg },
      text: TYPOGRAPHY.h4,
      icon: { fontSize: 24 },
    },
  };

  const variant_ = variantStyles[variant as keyof typeof variantStyles] || variantStyles.primary;
  const size_ = sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.md;

  return {
    container: { ...variant_.container, ...size_.container },
    content: variant_.content,
    text: { ...variant_.text, ...size_.text },
    icon: { ...variant_.icon, ...size_.icon },
  };
}
