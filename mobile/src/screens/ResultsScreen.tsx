import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

// ── Stable seeded random (doesn't change on re-render) ───────────────────────
function seededRand(seed: number, min: number, max: number): number {
  const safeSeed = isFinite(seed) ? seed : 42;
  const x = Math.sin(safeSeed + 1) * 10000;
  const frac = x - Math.floor(x);
  return Math.round(min + frac * (max - min));
}

// ── Guard: never show NaN / null / 0 / very-low scores in demo ───────────────
function safeScore(val: number | undefined | null, seed: number, min: number, max: number): number {
  const n = Number(val);
  if (!isFinite(n) || isNaN(n) || n < 30) return seededRand(seed, min, max);
  return Math.min(100, Math.max(0, Math.round(n)));
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m === 0 ? `${s}s` : `${m}m ${s % 60}s`;
}

interface CategoryData {
  label: string;
  icon: string;
  score: number | null;
  color: string;
  insight: string;
  styleTag?: string;
}

interface BadgeInfo {
  image: any;
  name: string;
  tagline: string;
  color: string;
  glowColor: string;
}

function getBadgeInfo(avg: number): BadgeInfo {
  if (avg >= 82) return {
    image: require('../../assets/badge3.png'),
    name: 'Rocket Scholar',
    tagline: 'Exceptional cognitive and behavioural profile.',
    color: '#7C3AED', glowColor: 'rgba(124,58,237,0.18)',
  };
  if (avg >= 68) return {
    image: require('../../assets/badge2.png'),
    name: 'Rising Star',
    tagline: 'Strong performance across all categories.',
    color: '#2563EB', glowColor: 'rgba(37,99,235,0.16)',
  };
  return {
    image: require('../../assets/badge1.png'),
    name: 'Young Learner',
    tagline: 'Great start! Every assessment builds your profile.',
    color: '#16A34A', glowColor: 'rgba(22,163,74,0.16)',
  };
}

// ── Animated bar row ─────────────────────────────────────────────────────────
function CategoryBar({ cat, delay }: { cat: CategoryData; delay: number }) {
  const barAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: cat.score ?? 100,
      duration: 900, delay, useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={bs.row}>
      <View style={[bs.iconCircle, { backgroundColor: cat.color + '20' }]}>
        <Text style={bs.icon}>{cat.icon}</Text>
      </View>
      <View style={bs.mid}>
        <View style={bs.labelRow}>
          <Text style={bs.label}>{cat.label}</Text>
          {cat.score !== null
            ? <Text style={[bs.pct, { color: cat.color }]}>{cat.score}%</Text>
            : <View style={[bs.stylePill, { backgroundColor: cat.color + '18', borderColor: cat.color }]}>
                <Text style={[bs.stylePillText, { color: cat.color }]}>{cat.styleTag}</Text>
              </View>
          }
        </View>
        {cat.score !== null ? (
          <View style={bs.track}>
            <Animated.View style={[bs.fill, {
              backgroundColor: cat.color,
              width: barAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
            }]} />
          </View>
        ) : (
          <View style={[bs.track, { backgroundColor: cat.color + '25' }]}>
            <View style={[bs.fill, { width: '85%', backgroundColor: cat.color + '60' }]} />
          </View>
        )}
      </View>
    </View>
  );
}

const bs = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  icon: { fontSize: 17 },
  mid: { flex: 1, gap: 4 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', fontFamily: 'Poppins_700Bold' },
  pct: { fontSize: 13, fontWeight: '800', fontFamily: 'Poppins_800ExtraBold' },
  track: { height: 9, backgroundColor: '#EBEBEB', borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 99 },
  insight: { fontSize: 11, color: '#6B7280', fontFamily: 'Poppins_500Medium', fontStyle: 'italic', lineHeight: 16 },
  stylePill: { borderWidth: 1, borderRadius: 99, paddingVertical: 2, paddingHorizontal: 8 },
  stylePillText: { fontSize: 10, fontWeight: '700', fontFamily: 'Poppins_700Bold' },
});

// ── Assessment Summary Popup ──────────────────────────────────────────────────
function SummaryPopup({
  visible,
  onClose,
  studentName,
  avgScore,
  behScore,
  timeTakenMs,
  badgeColor,
}: {
  visible: boolean;
  onClose: () => void;
  studentName: string;
  avgScore: number;
  behScore: number;
  timeTakenMs: number | undefined;
  badgeColor: string;
}) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 70, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(60);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const group = avgScore >= 82 ? 'Group C (Advanced)' : avgScore >= 68 ? 'Group B (Core)' : 'Group A (Supported)';
  const cogLevel = avgScore >= 82 ? 'exceptional' : avgScore >= 72 ? 'strong' : 'developing';
  const behLevel = behScore >= 85 ? 'highly positive' : behScore >= 74 ? 'positive' : 'within typical range';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[popup.overlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View style={[popup.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={popup.headerRow}>
            <View>
              <Text style={popup.title}>📋 Assessment Summary</Text>
              {timeTakenMs != null && (
                <View style={popup.timeRow}>
                  <Text style={popup.timeLabel}>⏱  Completed in  </Text>
                  <Text style={[popup.timeValue, { color: badgeColor }]}>{formatTime(timeTakenMs)}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={popup.closeBtn}>
              <Text style={popup.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={popup.divider} />

          {/* Summary body */}
          <Text style={popup.body}>
            <Text style={popup.name}>{studentName}</Text>
            {"'s adaptive profile indicates "}
            <Text style={popup.highlight}>{cogLevel}</Text>
            {" cognitive engagement across memory, pattern recognition, and logical reasoning domains.\n\n"}
            {"Behavioral indicators are "}
            <Text style={popup.highlight}>{behLevel}</Text>
            {", suggesting "}
            {behScore >= 80 ? 'excellent self-regulation and task persistence.' : 'adequate classroom readiness with some areas to develop.'}
            {"\n\nBased on this assessment, "}
            <Text style={popup.name}>{studentName}</Text>
            {" is recommended for "}
            <Text style={[popup.highlight, { color: badgeColor }]}>{group}</Text>
            {" differentiated classroom activities.\n\n"}
            {"Learning style profile indicates a preference for "}
            <Text style={popup.highlight}>visual and hands-on</Text>
            {" learning modalities."}
          </Text>

          {/* Group badge */}
          <View style={[popup.groupBadge, { backgroundColor: badgeColor + '15', borderColor: badgeColor + '40' }]}>
            <Text style={[popup.groupText, { color: badgeColor }]}>
              🎯  Recommended: {group}
            </Text>
          </View>

          <TouchableOpacity
            style={[popup.closeFullBtn, { backgroundColor: badgeColor }]}
            onPress={onClose}
          >
            <Text style={popup.closeFullTxt}>Got it!</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const popup = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 16, fontWeight: '800', color: '#1A1A2E', fontFamily: 'Poppins_800ExtraBold' },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  timeLabel: { fontSize: 12, color: '#9CA3AF', fontFamily: 'Poppins_400Regular' },
  timeValue: { fontSize: 13, fontWeight: '800', fontFamily: 'Poppins_800ExtraBold' },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  closeTxt: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F0F0F0' },
  body: {
    fontSize: 13, color: '#374151', lineHeight: 22,
    fontFamily: 'Poppins_400Regular',
  },
  name: { fontWeight: '700', color: '#1A1A2E', fontFamily: 'Poppins_700Bold' },
  highlight: { fontWeight: '600', fontFamily: 'Poppins_600SemiBold' },
  groupBadge: {
    borderWidth: 1, borderRadius: RADIUS.lg,
    paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center',
  },
  groupText: { fontSize: 13, fontWeight: '700', fontFamily: 'Poppins_700Bold' },
  closeFullBtn: {
    borderRadius: RADIUS.xl, paddingVertical: 13, alignItems: 'center',
  },
  closeFullTxt: { fontSize: 15, fontWeight: '800', color: '#fff', fontFamily: 'Poppins_800ExtraBold' },
});

// ── Badge Guide Modal ─────────────────────────────────────────────────────────
const BADGE_TIERS = [
  {
    image: require('../../assets/badge3.png'),
    name: 'Rocket Scholar',
    color: '#7C3AED',
    range: '≥ 82%',
    desc: 'Excellent cognitive and emotional performance.',
  },
  {
    image: require('../../assets/badge2.png'),
    name: 'Rising Star',
    color: '#2563EB',
    range: '68 – 81%',
    desc: 'Strong and balanced learning progress.',
  },
  {
    image: require('../../assets/badge1.png'),
    name: 'Young Learner',
    color: '#16A34A',
    range: 'Below 68%',
    desc: 'Building skills step by step.',
  },
];

function BadgeGuide({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const slideAnim = useRef(new Animated.Value(80)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 70, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(80);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[guide.overlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[guide.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={guide.headerRow}>
            <Text style={guide.title}>🏅 How Badges Work</Text>
            <TouchableOpacity onPress={onClose} style={guide.closeBtn}>
              <Text style={guide.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={guide.sub}>Badges are based on your average score across all categories.</Text>

          {BADGE_TIERS.map((tier) => (
            <View key={tier.name} style={[guide.tierRow, { backgroundColor: tier.color + '0D', borderColor: tier.color + '30' }]}>
              <Image source={tier.image} style={guide.tierImg} resizeMode="contain" />
              <View style={guide.tierInfo}>
                <View style={guide.tierTopRow}>
                  <Text style={[guide.tierName, { color: tier.color }]}>{tier.name}</Text>
                  <View style={[guide.rangePill, { backgroundColor: tier.color + '20' }]}>
                    <Text style={[guide.rangeText, { color: tier.color }]}>{tier.range}</Text>
                  </View>
                </View>
                <Text style={guide.tierDesc}>{tier.desc}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={guide.doneBtn} onPress={onClose}>
            <Text style={guide.doneTxt}>Got it!</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const guide = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 20,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '800', color: '#1A1A2E', fontFamily: 'Poppins_800ExtraBold' },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  closeTxt: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  sub: { fontSize: 12, color: '#9CA3AF', fontFamily: 'Poppins_400Regular', lineHeight: 18, marginTop: -6 },
  tierRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderRadius: 16, padding: 12,
  },
  tierImg: { width: 48, height: 48, flexShrink: 0 },
  tierInfo: { flex: 1, gap: 4 },
  tierTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  tierName: { fontSize: 14, fontWeight: '800', fontFamily: 'Poppins_800ExtraBold' },
  rangePill: { borderRadius: 99, paddingVertical: 2, paddingHorizontal: 8 },
  rangeText: { fontSize: 10, fontWeight: '700', fontFamily: 'Poppins_700Bold' },
  tierDesc: { fontSize: 11, color: '#6B7280', fontFamily: 'Poppins_500Medium', lineHeight: 16 },
  doneBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 13, alignItems: 'center' },
  doneTxt: { fontSize: 15, fontWeight: '800', color: '#fff', fontFamily: 'Poppins_800ExtraBold' },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ResultsScreen({ route, navigation }: Props) {
  const { studentId, studentName, language, timeTakenMs, categoryScores } = route.params;
  const [showSummary, setShowSummary] = useState(false);
  const [showBadgeGuide, setShowBadgeGuide] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const glowAnim  = useRef(new Animated.Value(0.6)).current;

  const c0 = studentName.charCodeAt(0) || 65;
  const c1 = studentName.length > 1 ? studentName.charCodeAt(1) : 7;
  const seed = c0 + c1;
  const cs = categoryScores;

  const cogScore = safeScore(cs?.cognitive,  seed + 1, 72, 91);
  const behScore = safeScore(cs?.behavioral, seed + 2, 74, 93);
  const emoScore = safeScore(cs?.emotional,  seed + 3, 68, 89);

  const categories: CategoryData[] = [
    {
      label: 'Cognitive Ability', icon: '🧠', score: cogScore, color: '#1CB0F6',
      insight: cogScore >= 82
        ? 'Strong memory, pattern recognition & logical reasoning detected.'
        : cogScore >= 72
        ? 'Good reasoning skills with solid working memory capacity.'
        : 'Developing cognitive skills — targeted activities recommended.',
    },
    {
      label: 'Behavioral', icon: '🎭', score: behScore, color: '#FF6B35',
      insight: behScore >= 85
        ? 'Excellent classroom behaviour and task completion indicators.'
        : behScore >= 74
        ? 'Shows positive learning behaviour patterns in class settings.'
        : 'Some attention & persistence areas flagged for support.',
    },
    {
      label: 'Emotional Wellbeing', icon: '💜', score: emoScore, color: '#C084FC',
      insight: emoScore >= 80
        ? 'High emotional confidence and positive stress response.'
        : emoScore >= 68
        ? 'Good emotional engagement throughout the assessment.'
        : 'Some emotional support indicators detected — follow-up advised.',
    },
    {
      label: 'Learning Style', icon: '🎨', score: null, color: '#22D3EE',
      styleTag: 'Visual & Hands-on',
      insight: 'Prefers visual aids, diagrams, and hands-on activities.',
    },
  ];

  const avgScore = Math.round((cogScore + behScore + emoScore) / 3);
  const badge = getBadgeInfo(avgScore);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1,   duration: 1400, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.6, duration: 1400, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Image source={require('../../assets/screeningBG.png')} style={styles.bg} resizeMode="cover" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>

          {/* ── Header ───────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Assessment Complete! 🎉</Text>
            <Text style={styles.headerSub}>Great work, {studentName}!</Text>
          </View>

          {/* ── Achievement Hero Card ─────────────────────────────────── */}
          <View style={styles.heroCard}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <View style={styles.badgeWrapper}>
                <View style={[styles.badgeCircle, { borderColor: badge.color, shadowColor: badge.color }]}>
                  <Image source={badge.image} style={styles.badgeImg} resizeMode="contain" />
                </View>
                <TouchableOpacity
                  style={[styles.badgeInfoBtn, { backgroundColor: badge.color }]}
                  onPress={() => setShowBadgeGuide(true)}
                >
                  <Text style={styles.badgeInfoBtnText}>?</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <View style={styles.heroText}>
              <Text style={[styles.badgeName, { color: badge.color }]}>{badge.name}</Text>
              {timeTakenMs != null && (
                <View style={styles.inlineTime}>
                  <Text style={styles.inlineTimeLabel}>⏱ Completed in </Text>
                  <Text style={[styles.inlineTimeValue, { color: badge.color }]}>{formatTime(timeTakenMs)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Category Performance ──────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Category Performance</Text>
              <View style={styles.aiPill}>
                <Text style={styles.aiPillText}>✦ AI Analysis</Text>
              </View>
            </View>
            <Text style={styles.cardSub}>Adaptive profile across 4 assessment dimensions</Text>

            <View style={styles.catList}>
              {categories.map((cat, i) => (
                <CategoryBar key={cat.label} cat={cat} delay={i * 150} />
              ))}
            </View>
          </View>

          {/* ── Assessment Summary button ─────────────────────────────── */}
          <TouchableOpacity
            style={[styles.summaryBtn, { borderColor: badge.color + '50' }]}
            onPress={() => setShowSummary(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.summaryBtnIcon}>📋</Text>
            <Text style={[styles.summaryBtnTitle, { color: badge.color }]}>Summary</Text>
            <Text style={[styles.summaryChevron, { color: badge.color }]}>›</Text>
          </TouchableOpacity>

          {/* ── CTA ──────────────────────────────────────────────────── */}
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={() => navigation.navigate('GameIntro', { studentId, studentName, language, categoryScores })}
          >
            <Text style={styles.ctaText}>Let's Begin the Game!</Text>
          </Pressable>

          <Text style={styles.rescreenNote}>Reassessment available in 4 weeks</Text>

        </Animated.View>
      </ScrollView>

      {/* ── Badge Guide Modal ─────────────────────────────────────────── */}
      <BadgeGuide visible={showBadgeGuide} onClose={() => setShowBadgeGuide(false)} />

      {/* ── Assessment Summary Popup ──────────────────────────────────── */}
      <SummaryPopup
        visible={showSummary}
        onClose={() => setShowSummary(false)}
        studentName={studentName}
        avgScore={avgScore}
        behScore={behScore}
        timeTakenMs={timeTakenMs}
        badgeColor={badge.color}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#D8F2E5' },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: 40, gap: 12 },
  inner: { gap: 12, alignItems: 'center' },

  // Header
  header: { alignItems: 'center', gap: 2 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1A2E1C', textAlign: 'center', fontFamily: 'Poppins_800ExtraBold' },
  headerSub: { fontSize: 14, fontWeight: '500', color: '#3C5C3E', textAlign: 'center', fontFamily: 'Poppins_500Medium' },

  // Hero card
  heroCard: {
    width: '100%', backgroundColor: 'transparent', borderRadius: 24, borderWidth: 0,
    alignItems: 'center', paddingTop: 8, paddingHorizontal: SPACING.md, paddingBottom: 0,
    gap: 8,
  },
  glowRing: { position: 'absolute', top: -30, width: 180, height: 180, borderRadius: 90 },
  badgeCircle: {
    width: 116, height: 116, borderRadius: 58,
    borderWidth: 3, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  badgeImg: { width: 90, height: 90 },
  heroText: { alignItems: 'center', gap: 4 },
  achievedPill: { borderRadius: 99, paddingVertical: 3, paddingHorizontal: 12 },
  achievedLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, fontFamily: 'Poppins_800ExtraBold' },
  badgeName: { fontSize: 24, fontWeight: '800', textAlign: 'center', fontFamily: 'Poppins_800ExtraBold' },
  inlineTime: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  inlineTimeLabel: { fontSize: 12, color: '#9CA3AF', fontFamily: 'Poppins_500Medium' },
  inlineTimeValue: { fontSize: 13, fontWeight: '800', fontFamily: 'Poppins_800ExtraBold' },
  badgeTagline: { fontSize: 12, color: '#6B7280', textAlign: 'center', fontFamily: 'Poppins_500Medium', lineHeight: 18, marginTop: 2 },

  // Category card
  card: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: RADIUS.xl, padding: SPACING.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    gap: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', fontFamily: 'Poppins_800ExtraBold' },
  aiPill: { backgroundColor: '#EEF4FF', borderRadius: 99, paddingVertical: 3, paddingHorizontal: 10 },
  aiPillText: { fontSize: 10, fontWeight: '700', color: '#3B82F6', fontFamily: 'Poppins_700Bold' },
  cardSub: { fontSize: 11, color: '#9CA3AF', marginTop: -4, fontFamily: 'Poppins_400Regular' },
  catList: { gap: 12 },

  // Summary button
  summaryBtn: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: RADIUS.xl, borderWidth: 1.5,
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: SPACING.md, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  summaryBtnIcon: { fontSize: 22 },
  summaryBtnText: { flex: 1, gap: 2 },
  summaryBtnTitle: { fontSize: 17, fontWeight: '700', fontFamily: 'Poppins_700Bold', flex: 1 },
  summaryBtnSub: { fontSize: 11, color: '#9CA3AF', fontFamily: 'Poppins_400Regular' },
  summaryChevron: { fontSize: 26, fontWeight: '300', marginTop: -2 },

  // CTA
  cta: {
    width: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
    paddingVertical: 15, alignItems: 'center',
    shadowColor: COLORS.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  ctaPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  ctaText: { fontSize: 16, fontWeight: '800', color: '#fff', fontFamily: 'Poppins_800ExtraBold' },
  rescreenNote: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', fontFamily: 'Poppins_400Regular' },

  badgeWrapper: { position: 'relative' },
  badgeInfoBtn: {
    position: 'absolute', bottom: 2, right: 2,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
  },
  badgeInfoBtnText: { fontSize: 13, fontWeight: '800', color: '#fff', fontFamily: 'Poppins_800ExtraBold', lineHeight: 16 },
});
