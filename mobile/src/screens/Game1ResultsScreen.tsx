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
import { RADIUS, SPACING } from '../constants/theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Game1Results'>;

const QUESTION_TITLES = [
  'Which two cups are the same?',
  'Count the slippers in the box',
  'At which point should drawing begin?',
  'Which two parts construct the image?',
  'Weights of substances A, B, and C',
];

const CONFETTI = ['🎉', '⭐', '🎊', '✨', '🌟', '🎈', '💫', '🎀'];

export default function Game1ResultsScreen({ route, navigation }: Props) {
  const { studentId, studentName, language, score, total, correctAnswers } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  const pct = Math.round((score / total) * 100);
  const isGood = score >= 4;
  const heading = pct === 100 ? 'Excellent!' : pct >= 60 ? 'Well Done!' : 'Keep Practising!';
  const headingColor = pct === 100 ? '#2ECC71' : pct >= 60 ? '#1CB0F6' : '#FF9600';
  const accuracy = pct === 100 ? 'Outstanding!' : pct >= 60 ? 'Good Job!' : 'Try Again!';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Background */}
      <Image source={require('../../assets/screeningBG.png')} style={styles.bg} resizeMode="cover" />
      <View style={styles.skyOverlay} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, gap: SPACING.md }}>

          {/* ── TOP BAR ─────────────────────────────────────────────── */}
          <View style={styles.topBar}>
            <Text style={styles.topTitle}>Results</Text>

            <View style={styles.scoreBadge}>
              <Text style={styles.scoreBadgeStar}>⭐</Text>
              <Text style={styles.scoreBadgeText}>{score}/{total}</Text>
            </View>
          </View>

          {/* ── CELEBRATION CARD ─────────────────────────────────────── */}
          <Animated.View
            style={[styles.celebCard, { transform: [{ scale: scaleAnim }, { translateY: cardAnim }] }]}
          >
            {isGood ? (
              <Image
                source={require('../../assets/fox_excellent.png')}
                style={styles.foxImage}
                resizeMode="contain"
              />
            ) : (
              <>
                {CONFETTI.map((c, i) => (
                  <Text
                    key={i}
                    style={[styles.confetti, {
                      top: 8 + (i % 3) * 18,
                      left: i < 4 ? 10 + i * 22 : undefined,
                      right: i >= 4 ? 10 + (i - 4) * 22 : undefined,
                      fontSize: 14 + (i % 3) * 4,
                    }]}
                  >
                    {c}
                  </Text>
                ))}
                <View style={styles.celebRow}>
                  <View style={styles.foxWrap}>
                    <Text style={styles.foxEmoji}>🦊</Text>
                    <Text style={styles.thumbsUp}>💪</Text>
                  </View>
                  <View style={styles.celebText}>
                    <Text style={[styles.celebHeading, { color: headingColor }]}>{heading}</Text>
                    <Text style={styles.celebSub}>
                      You completed all {total} questions.{'\n'}Keep going, {studentName}!
                    </Text>
                  </View>
                </View>
              </>
            )}
          </Animated.View>

          {/* ── QUESTION SUMMARY ─────────────────────────────────────── */}
          <View style={styles.summaryCard}>
            {QUESTION_TITLES.map((title, i) => {
              const correct = correctAnswers?.[i] ?? false;
              return (
                <View key={i}>
                  <View style={styles.summaryRow}>
                    <View style={styles.qNumCircle}>
                      <Text style={styles.qNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.qTitle} numberOfLines={1}>{title}</Text>
                    <View style={styles.qResult}>
                      <Text style={styles.qResultIcon}>{correct ? '✓' : '✗'}</Text>
                      <Text style={[styles.qResultLabel, { color: correct ? '#2ECC71' : '#FF4B4B' }]}>
                        {correct ? 'Correct' : 'Wrong'}
                      </Text>
                    </View>
                  </View>
                  {i < QUESTION_TITLES.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>

          {/* ── SCORE CARD ───────────────────────────────────────────── */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreLeft}>
              <Text style={styles.trophyEmoji}>🏆</Text>
              <Text style={styles.scoreCardLabel}>Your Score</Text>
              <Text style={styles.scoreCardValue}>{score} / {total}</Text>
            </View>

            <View style={styles.scoreDivider} />

            <View style={styles.scoreRight}>
              <Text style={styles.accuracyTitle}>Score</Text>
              <Text style={[styles.accuracyPct, { color: headingColor }]}>{pct}%</Text>
              <View style={[styles.accuracyBadge, { backgroundColor: headingColor + '22' }]}>
                <Text style={styles.accuracyBadgeStar}>⭐</Text>
                <Text style={[styles.accuracyBadgeText, { color: headingColor }]}>{accuracy}</Text>
              </View>
            </View>
          </View>

        </Animated.View>
      </ScrollView>

      {/* ── BOTTOM BUTTON — fixed at bottom ──────────────────────── */}
      <View style={styles.btnRow}>
        <Pressable
          style={({ pressed }) => [styles.nextBtn, { flex: 1 }, pressed && { opacity: 0.85 }]}
          onPress={() => navigation.navigate('PlaygroundHub', { studentId, studentName, language })}
        >
          <Text style={styles.nextBtnText}>🏠  Home</Text>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#C8EFF8' },
  bg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    width: '100%', height: '100%',
  },
  skyOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
    backgroundColor: 'rgba(200,239,248,0.55)',
  },

  scroll: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 100,
  },

  // ── Top bar ────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  homeBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.round,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  homeBtnIcon: { fontSize: 20 },
  topTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1E3D2F',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFD900',
    borderRadius: RADIUS.round,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#FFD900',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  scoreBadgeStar: { fontSize: 14 },
  scoreBadgeText: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: '#1E3D2F',
  },

  // ── Celebration card ───────────────────────────────────────────────────────
  celebCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  foxImage: {
    width: '100%',
    height: 200,
  },
  confetti: {
    position: 'absolute',
    opacity: 0.85,
  },
  celebRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  foxWrap: {
    alignItems: 'center',
    position: 'relative',
  },
  foxEmoji: { fontSize: 64 },
  thumbsUp: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    fontSize: 24,
  },
  celebText: { flex: 1, gap: 6 },
  celebHeading: {
    fontSize: 30,
    fontFamily: 'Poppins_800ExtraBold',
    lineHeight: 36,
  },
  celebSub: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    lineHeight: 20,
  },

  // ── Section ────────────────────────────────────────────────────────────────
  section: { gap: SPACING.sm },

  // ── Summary card ───────────────────────────────────────────────────────────
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 12,
  },
  qNumCircle: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.round,
    backgroundColor: '#EDFBEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qNumText: {
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
    color: '#2ECC71',
  },
  qTitle: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#3C3C3C',
  },
  qResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qResultIcon: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: '#2ECC71',
  },
  qResultLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
  },

  // ── Score card ─────────────────────────────────────────────────────────────
  scoreCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F9EE',
    borderRadius: 20,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreLeft: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  trophyEmoji: { fontSize: 28 },
  scoreCardLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#6B7280',
  },
  scoreCardValue: {
    fontSize: 22,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#1E3D2F',
    lineHeight: 28,
  },
  scoreDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#C6EDD3',
    marginHorizontal: SPACING.sm,
  },
  scoreRight: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  accuracyTitle: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#6B7280',
  },
  accuracyPct: {
    fontSize: 28,
    fontFamily: 'Poppins_800ExtraBold',
    lineHeight: 34,
  },
  accuracyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: RADIUS.round,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  accuracyBadgeStar: { fontSize: 12 },
  accuracyBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },

  // ── Bottom buttons ─────────────────────────────────────────────────────────
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  tryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tryBtnIcon: {
    fontSize: 18,
    color: '#2ECC71',
    fontFamily: 'Poppins_700Bold',
  },
  tryBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#1E3D2F',
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2ECC71',
    borderRadius: 18,
    paddingVertical: 16,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
  nextBtnIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
});
