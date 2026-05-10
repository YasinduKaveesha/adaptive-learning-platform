import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';

interface PlaygroundResultPopupProps {
  visible: boolean;
  score: number;
  total: number;
  gameName: string;
  metrics: { label: string; value: string }[];
  onHome: () => void;
}

export default function PlaygroundResultPopup({
  visible,
  score,
  total,
  gameName,
  metrics,
  onHome,
}: PlaygroundResultPopupProps) {
  const pct = Math.round((score / total) * 100);

  const overlayAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      overlayAnim.setValue(0);
      slideAnim.setValue(300);
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 6 }),
      ]).start();
    }
  }, [visible]);

  const handleHome = useCallback(() => {
    // Slide sheet down + fade overlay — navigate immediately so the
    // screen fade transition runs in parallel with the popup closing
    Animated.parallel([
      Animated.timing(overlayAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 300, duration: 300, useNativeDriver: true }),
    ]).start();
    // Navigate right away — the PlaygroundHub fade-in crossfades with this
    onHome();
  }, [onHome, overlayAnim, slideAnim]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Dark overlay — fades in/out */}
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />

      {/* Sheet slides up from bottom */}
      <Animated.View style={[styles.sheetWrap, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.spacer} />
        <View style={styles.sheet}>
          {/* Title */}
          <Text style={styles.gameName}>{gameName}</Text>

          {/* Score ring */}
          <View style={styles.scoreRing}>
            <Text style={styles.scoreNumber}>{score}/{total}</Text>
            <Text style={styles.scorePct}>{pct}%</Text>
          </View>

          {/* Metrics */}
          <View style={styles.metricsContainer}>
            {metrics.map((m, i) => (
              <View key={i} style={styles.metricRow}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={styles.metricValue}>{m.value}</Text>
              </View>
            ))}
          </View>

          {/* Button */}
          <Pressable
            style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.85 }]}
            onPress={handleHome}
          >
            <Text style={styles.nextBtnText}>🏠  Home</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    gap: 16,
  },
  gameName: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1E3D2F',
    textAlign: 'center',
  },
  scoreRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FBF1',
  },
  scoreNumber: {
    fontSize: 26,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#1E3D2F',
  },
  scorePct: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#4A6B52',
  },
  metricsContainer: {
    width: '100%',
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#F5F9F5',
    borderRadius: RADIUS.md,
  },
  metricLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#4A6B52',
  },
  metricValue: {
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
    color: '#1E3D2F',
  },
  nextBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
});
