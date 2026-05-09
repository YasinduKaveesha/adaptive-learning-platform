import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

interface DomainRow {
  label: string;
  icon: string;
  score: number;
  color: string;
}

export default function ResultsScreen({ route, navigation }: Props) {
  const { studentId, studentName, language } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  const domains: DomainRow[] = [
    { label: 'Memory',            icon: '🧠', score: Math.round(65 + Math.random() * 25), color: COLORS.working_memory },
    { label: 'Attention',         icon: '🎯', score: Math.round(60 + Math.random() * 30), color: COLORS.attention },
    { label: 'Reasoning',         icon: '💡', score: Math.round(55 + Math.random() * 35), color: COLORS.logical_reasoning },
    { label: 'Pattern Recognition', icon: '🧩', score: Math.round(62 + Math.random() * 28), color: COLORS.pattern_recognition },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <Image
        source={require('../../assets/screeningBG.png')}
        style={styles.bgImage}
        resizeMode="cover"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>

          {/* ── Header ─────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.title}>Screening Complete! 🎉</Text>
            <Text style={styles.subtitle}>Great job, {studentName}! You did amazing!</Text>
          </View>

          {/* ── Badge ──────────────────────────────────────────────── */}
          <Animated.View style={[styles.badgeWrap, { transform: [{ scale: scaleAnim }] }]}>
            <Image
              source={require('../../assets/badge2.png')}
              style={styles.badge}
              resizeMode="contain"
            />
          </Animated.View>

          {/* ── Motivational card ──────────────────────────────────── */}
          <View style={styles.motCard}>
            <Text style={styles.motIcon}>⭐</Text>
            <View style={styles.motText}>
              <Text style={styles.motTitle}>You are on the right track!</Text>
              <Text style={styles.motSub}>Keep learning and growing.</Text>
            </View>
          </View>

          {/* ── Per-domain performance ─────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Per-Domain Performance</Text>

            {domains.map((d) => (
              <View key={d.label} style={styles.domainRow}>
                <Text style={styles.domainIcon}>{d.icon}</Text>
                <View style={styles.domainMid}>
                  <Text style={styles.domainLabel}>{d.label}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${d.score}%`, backgroundColor: d.color }]} />
                  </View>
                </View>
                <Text style={[styles.domainPct, { color: d.color }]}>{d.score}%</Text>
              </View>
            ))}
          </View>

          {/* ── Rescreen notice ────────────────────────────────────── */}
          <View style={styles.rescreenCard}>
            <Text style={styles.rescreenIcon}>📅</Text>
            <View>
              <Text style={styles.rescreenTitle}>You can rescreen after 4 weeks</Text>
              <Text style={styles.rescreenSub}>Keep practicing and come back stronger!</Text>
            </View>
          </View>

          {/* ── CTA ────────────────────────────────────────────────── */}
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={() => navigation.navigate('GameIntro', { studentId, studentName, language })}
          >
            <Text style={styles.ctaText}>Let's Begin the Game!</Text>
          </Pressable>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#D8F2E5',
  },
  bgImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%', height: '100%',
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  inner: {
    gap: SPACING.md,
    alignItems: 'center',
  },

  // Header
  header: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A2E1C',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C5C3E',
    textAlign: 'center',
  },

  // Badge
  badgeWrap: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  badge: {
    width: 104,
    height: 104,
  },

  // Motivational card
  motCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  motIcon: { fontSize: 24 },
  motText: { gap: 2 },
  motTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2E1C',
  },
  motSub: {
    fontSize: 12,
    color: '#666',
  },

  // Domain performance card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    width: '100%',
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A2E1C',
    marginBottom: 4,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  domainIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  domainMid: { flex: 1, gap: 4 },
  domainLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3C3C3C',
  },
  barTrack: {
    height: 10,
    backgroundColor: '#EFEFEF',
    borderRadius: RADIUS.round,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: RADIUS.round,
  },
  domainPct: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 38,
    textAlign: 'right',
  },

  // Rescreen notice
  rescreenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  rescreenIcon: { fontSize: 24 },
  rescreenTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A2E1C',
  },
  rescreenSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // CTA button
  cta: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  ctaPressed: { opacity: 0.85 },
  ctaText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
});
