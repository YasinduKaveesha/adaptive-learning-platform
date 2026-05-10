import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaygroundHub'>;
type GameId = 'TreasurePath' | 'PatternTrain' | 'MatchShadow';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Badge helpers (mirrors ResultsScreen) ─────────────────────────────────────

interface BadgeInfo {
  image: ReturnType<typeof require>;
  name: string;
  tagline: string;
  color: string;
  nextName: string;
  nextColor: string;
}

function getBadgeInfo(avg: number): BadgeInfo {
  if (avg >= 82) return {
    image: require('../../assets/badge3.png'),
    name: 'Rocket Scholar',
    tagline: 'Exceptional cognitive and behavioural profile.',
    color: '#7C3AED',
    nextName: 'Rocket Scholar',
    nextColor: '#7C3AED',
  };
  if (avg >= 68) return {
    image: require('../../assets/badge2.png'),
    name: 'Rising Star',
    tagline: 'Strong performance across all categories.',
    color: '#2563EB',
    nextName: 'Rocket Scholar',
    nextColor: '#7C3AED',
  };
  return {
    image: require('../../assets/badge1.png'),
    name: 'Young Learner',
    tagline: 'Great start! Every assessment builds your profile.',
    color: '#16A34A',
    nextName: 'Rising Star',
    nextColor: '#2563EB',
  };
}

function getBadgeProgress(avg: number): number {
  if (avg >= 82) return 100;
  if (avg >= 68) return Math.round(((avg - 68) / 14) * 100);
  return Math.round((avg / 68) * 100);
}

// ── Recommendation ────────────────────────────────────────────────────────────

function getRecommendedGame(
  scores?: { cognitive: number; behavioral: number; emotional: number }
): GameId {
  if (!scores) return 'TreasurePath';
  const { cognitive, behavioral, emotional } = scores;
  if (cognitive <= behavioral && cognitive <= emotional) return 'TreasurePath';
  if (behavioral <= cognitive && behavioral <= emotional) return 'PatternTrain';
  return 'MatchShadow';
}


// ── Path colors ──────────────────────────────────────────────────────────────

const PATH_COLOR = '#A57033';

// ── Level node positions (% of screen) ───────────────────────────────────────

const NODE_POSITIONS = [
  { yPct: 0.75, xOffset: -0.15 },
  { yPct: 0.62, xOffset: +0.18 },
  { yPct: 0.49, xOffset: -0.12 },
  { yPct: 0.36, xOffset: +0.16 },
  { yPct: 0.23, xOffset: -0.05 },
];

// ── Node labels ──────────────────────────────────────────────────────────────

const NODE_LABELS = [
  { emoji: '📋', name: 'Screening' },
  { emoji: '📚', name: 'Classroom' },
  { emoji: '🗺️', name: 'Treasure Path' },
  { emoji: '🚂', name: 'Pattern Train' },
  { emoji: '🔮', name: 'Match Shadow' },
];

// ── Curved path between nodes ─────────────────────────────────────────────────

function getNodeCenter(i: number) {
  const pos = NODE_POSITIONS[i];
  return {
    x: SCREEN_W / 2 + pos.xOffset * SCREEN_W,
    y: pos.yPct * SCREEN_H,
  };
}

// Quadratic bezier point at t
function bezierPoint(
  p0: { x: number; y: number },
  cp: { x: number; y: number },
  p1: { x: number; y: number },
  t: number,
) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * cp.x + t * t * p1.x,
    y: u * u * p0.y + 2 * u * t * cp.y + t * t * p1.y,
  };
}

const CURVE_SEGMENTS = 12;
const PATH_WIDTH = 10;

function CurvedPath({
  from,
  to,
  completed,
  opacity = 1,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  completed: boolean;
  opacity?: number;
}) {
  // Control point: offset horizontally in the middle to create a curve
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  // Curve away from the direction of travel for a nice S-feel
  const cpX = (from.x + to.x) / 2 + dx * 0.6;
  const cp = { x: cpX, y: midY };

  const pieces = [];
  for (let i = 0; i < CURVE_SEGMENTS; i++) {
    const t0 = i / CURVE_SEGMENTS;
    const t1 = (i + 1) / CURVE_SEGMENTS;
    const a = bezierPoint(from, cp, to, t0);
    const b = bezierPoint(from, cp, to, t1);

    const segDx = b.x - a.x;
    const segDy = b.y - a.y;
    const len = Math.sqrt(segDx * segDx + segDy * segDy) + 1; // +1 to avoid gaps
    const angle = Math.atan2(segDy, segDx) * (180 / Math.PI);

    pieces.push(
      <View
        key={i}
        style={{
          position: 'absolute',
          left: a.x - PATH_WIDTH / 2,
          top: a.y - PATH_WIDTH / 2,
          width: len,
          height: PATH_WIDTH,
          borderRadius: PATH_WIDTH / 2,
          backgroundColor: completed ? '#4CAF50' : PATH_COLOR,
          transform: [
            { translateX: 0 },
            { translateY: 0 },
            { rotate: `${angle}deg` },
          ],
          transformOrigin: 'left center' as any,
          opacity,
        }}
      />,
    );
  }

  return <>{pieces}</>;
}

// ── Badge Progress Popup ──────────────────────────────────────────────────────

function BadgePopup({
  visible,
  badge,
  avgScore,
  onClose,
}: {
  visible: boolean;
  badge: BadgeInfo;
  avgScore: number;
  onClose: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 8 }),
        Animated.timing(barAnim, {
          toValue: getBadgeProgress(avgScore) / 100,
          duration: 600,
          delay: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      slideAnim.setValue(40);
      fadeAnim.setValue(0);
      barAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={popup.overlay} onPress={onClose}>
        <Animated.View
          style={[popup.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Pressable onPress={() => {}}>
            {/* Badge image */}
            <View style={popup.badgeWrap}>
              <Image source={badge.image} style={popup.badgeImg} resizeMode="contain" />
            </View>

            {/* Name + tagline */}
            <Text style={[popup.badgeName, { color: badge.color }]}>{badge.name}</Text>
            <Text style={popup.tagline}>{badge.tagline}</Text>

            {/* Progress section */}
            <View style={popup.progressBox}>
              <Text style={popup.nextLabel}>Next: {badge.nextName}</Text>
              <View style={popup.barTrack}>
                <Animated.View
                  style={[
                    popup.barFill,
                    {
                      backgroundColor: badge.nextColor,
                      width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    },
                  ]}
                />
              </View>
              <Text style={popup.progressPct}>{getBadgeProgress(avgScore)}%</Text>
              <Text style={popup.hint}>Complete more activities to level up!</Text>
            </View>

            {/* Dismiss */}
            <Pressable
              style={[popup.dismissBtn, { backgroundColor: badge.color }]}
              onPress={onClose}
            >
              <Text style={popup.dismissText}>Awesome!</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// ── Locked tooltip ────────────────────────────────────────────────────────────

function LockedTooltip({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={styles.tooltip}>
      <Text style={styles.tooltipText}>Complete previous activities first!</Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function PlaygroundHubScreen({ navigation, route }: Props) {
  const { studentId, studentName, language, categoryScores } = route.params;

  const avgScore = categoryScores
    ? Math.round((categoryScores.cognitive + categoryScores.behavioral + categoryScores.emotional) / 3)
    : 55;

  const badge = getBadgeInfo(avgScore);
  const recommendedGame = getRecommendedGame(categoryScores);

  const [showBadgePopup, setShowBadgePopup] = useState(false);
  const [lockedTooltipIdx, setLockedTooltipIdx] = useState<number | null>(null);

  // Pulsing glow for badge ring
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  // Pulsing scale for active node
  const nodeScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(nodeScaleAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(nodeScaleAnim, { toValue: 1.0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  function navigateToRecommended() {
    navigation.navigate(recommendedGame, { studentId, studentName, language });
  }

  function handleNodePress(nodeIdx: number) {
    // Node 0 = completed (screening), Node 1 = active, rest = locked
    if (nodeIdx === 1) {
      navigateToRecommended();
    } else if (nodeIdx > 1) {
      setLockedTooltipIdx(nodeIdx);
      setTimeout(() => setLockedTooltipIdx(null), 1800);
    }
  }

  const initials = studentName?.charAt(0)?.toUpperCase() ?? '🦊';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Background map */}
      <Image source={require('../../assets/gamebg.png')} style={styles.bg} resizeMode="cover" />

      {/* ── Zone 1: Top Header ─────────────────────────────────────────── */}
      <View style={styles.topHeader}>
        {/* Avatar */}
        <Pressable style={styles.avatar} onPress={() => navigation.popToTop()}>
          <Text style={styles.avatarText}>{initials}</Text>
        </Pressable>

        {/* Greeting */}
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingName} numberOfLines={1}>Welcome back, {studentName}!</Text>
          <Text style={styles.greetingSub}>Your learning adventure continues!</Text>
        </View>

        {/* Badge button */}
        <Pressable onPress={() => setShowBadgePopup(true)}>
          <Animated.View
            style={[
              styles.badgeBtn,
              {
                borderColor: badge.color,
                shadowColor: badge.color,
                shadowOpacity: glowAnim,
              },
            ]}
          >
            <Image source={badge.image} style={styles.badgeImg} resizeMode="contain" />
          </Animated.View>
        </Pressable>
      </View>

      {/* ── Zone 2: Map area with path + level nodes ────────────────── */}
      <View style={styles.mapArea} pointerEvents="box-none">
        {/* Draw curved path segments between consecutive nodes */}
        {NODE_POSITIONS.map((_, i) => {
          if (i === NODE_POSITIONS.length - 1) return null;
          return (
            <CurvedPath
              key={`path-${i}`}
              from={getNodeCenter(i)}
              to={getNodeCenter(i + 1)}
              completed={i === 0}
            />
          );
        })}
        {/* Faded path from last node going upward (future) */}
        {(() => {
          const last = getNodeCenter(NODE_POSITIONS.length - 1);
          const future = { x: last.x + SCREEN_W * 0.12, y: last.y - SCREEN_H * 0.12 };
          return <CurvedPath from={last} to={future} completed={false} opacity={0.25} />;
        })()}

        {/* Draw nodes on top of path */}
        {NODE_POSITIONS.map((pos, i) => {
          const isCompleted = i === 0;
          const isActive = i === 1;
          const nodeSize = isActive ? 52 : isCompleted ? 44 : 38;
          const cx = SCREEN_W / 2 + pos.xOffset * SCREEN_W;
          const cy = pos.yPct * SCREEN_H;
          const label = NODE_LABELS[i];

          return (
            <View key={i} style={{ position: 'absolute', left: cx - nodeSize / 2, top: cy - nodeSize / 2, alignItems: 'center' }}>
              {isActive ? (
                <>
                  <Text style={[styles.sparkle, { top: -14, left: -10 }]}>✨</Text>
                  <Text style={[styles.sparkle, { top: -10, right: -12 }]}>✨</Text>
                  <Animated.View style={{ transform: [{ scale: nodeScaleAnim }] }}>
                    <Pressable
                      style={[styles.nodeActive, { width: nodeSize, height: nodeSize, borderRadius: nodeSize / 2 }]}
                      onPress={() => handleNodePress(i)}
                    >
                      <Text style={styles.nodeActiveEmoji}>{label.emoji}</Text>
                    </Pressable>
                  </Animated.View>
                  <Text style={styles.nodeLabel}>{label.name}</Text>
                </>
              ) : isCompleted ? (
                <>
                  <Pressable style={[styles.nodeCompleted, { width: nodeSize, height: nodeSize, borderRadius: nodeSize / 2 }]} onPress={() => handleNodePress(i)}>
                    <Text style={styles.nodeCompletedText}>✓</Text>
                  </Pressable>
                  <Text style={styles.nodeLabelSmall}>{label.name}</Text>
                </>
              ) : (
                <>
                  <Pressable style={[styles.nodeLocked, { width: nodeSize, height: nodeSize, borderRadius: nodeSize / 2 }]} onPress={() => handleNodePress(i)}>
                    <Text style={styles.nodeLockedText}>🔒</Text>
                  </Pressable>
                  <Text style={styles.nodeLabelSmall}>{label.name}</Text>
                  <LockedTooltip visible={lockedTooltipIdx === i} />
                </>
              )}
            </View>
          );
        })}
      </View>

      {/* ── Zone 3: Floating CTA ──────────────────────────────────────── */}
      <View style={styles.ctaBar}>
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.88 }]}
          onPress={() => navigation.navigate('Game1', { studentId, studentName, language })}
        >
          <Text style={styles.ctaText}>Continue Adventure  ▶</Text>
        </Pressable>
      </View>

      {/* Badge popup */}
      <BadgePopup
        visible={showBadgePopup}
        badge={badge}
        avgScore={avgScore}
        onClose={() => setShowBadgePopup(false)}
      />
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1E3D2F' },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },

  // Zone 1
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#1E3D2F',
  },
  greetingWrap: {
    flex: 1,
    gap: 1,
  },
  greetingName: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#1E3D2F',
  },
  greetingSub: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#4A6B52',
  },
  badgeBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 12, elevation: 6,
    flexShrink: 0,
  },
  badgeImg: { width: 34, height: 34 },

  // Zone 2
  mapArea: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },

  // Nodes
  nodeActive: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FFD900',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FFD900', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 16, elevation: 10,
  },
  nodeActiveText: { fontSize: 20, color: '#fff' },
  nodeActiveEmoji: { fontSize: 22 },
  nodeLabel: {
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginTop: 4,
    textAlign: 'center',
  },
  nodeLabelSmall: {
    fontSize: 9,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginTop: 3,
    textAlign: 'center',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 12,
    zIndex: 10,
  },
  nodeCompleted: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#2ECC71',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2ECC71', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4,
  },
  nodeCompletedText: { fontSize: 18, color: '#fff', fontFamily: 'Poppins_700Bold' },
  nodeLocked: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(206,130,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  nodeLockedText: { fontSize: 16 },

  // Tooltip
  tooltip: {
    position: 'absolute',
    top: 42,
    left: -50,
    width: 140,
    backgroundColor: 'rgba(30,61,47,0.92)',
    borderRadius: RADIUS.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tooltipText: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: '#fff',
    textAlign: 'center',
  },

  // Zone 3
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
    paddingBottom: 32,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  ctaBtn: {
    width: '80%',
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#fff',
    letterSpacing: 0.3,
  },
});

// ── Badge popup styles ─────────────────────────────────────────────────────────

const popup = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  badgeWrap: {
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeImg: { width: 80, height: 80 },
  badgeName: {
    fontSize: 20,
    fontFamily: 'Poppins_800ExtraBold',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  progressBox: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS.md,
    padding: 14,
    gap: 6,
    marginVertical: 4,
  },
  nextLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#9CA3AF',
  },
  barTrack: {
    height: 10,
    borderRadius: 99,
    backgroundColor: '#EBEBEB',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 99,
  },
  progressPct: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#6B7280',
    textAlign: 'right',
  },
  hint: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#9CA3AF',
  },
  dismissBtn: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  dismissText: {
    fontSize: 15,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#fff',
  },
});
