import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'GameIntro'>;
type Mode = 'classroom' | 'playground' | null;

const MODES = [
  {
    id: 'classroom' as const,
    title: 'Classroom',
    titleColor: '#1D6FD8',
    accentColor: '#1D6FD8',
    image: require('../../assets/quest1.png'),
  },
  {
    id: 'playground' as const,
    title: 'Playground',
    titleColor: '#E05A00',
    accentColor: '#FF6B35',
    image: require('../../assets/playground.png'),
  },
];

function ModeCard({
  mode,
  selected,
  onSelect,
}: {
  mode: typeof MODES[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 2 }).start();

  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start();

  return (
    <Animated.View
      style={[
        styles.cardWrap,
        { transform: [{ scale: scaleAnim }] },
        selected && { shadowColor: mode.accentColor, shadowOpacity: 0.38, shadowRadius: 20, elevation: 12 },
      ]}
    >
      <Pressable
        style={[
          styles.card,
          selected && { borderColor: mode.accentColor, borderWidth: 2.5 },
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onSelect}
      >
        {/* Image fills remaining space above title */}
        <Image source={mode.image} style={styles.cardImage} resizeMode="cover" />

        {/* White title bar */}
        <View style={styles.cardFooter}>
          <Text style={[styles.cardTitle, { color: selected ? mode.titleColor : '#1E3D2F' }]}>
            {mode.title}
          </Text>

          {selected && (
            <View style={[styles.checkBadge, { backgroundColor: mode.accentColor }]}>
              <Text style={styles.checkText}>✓</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function GameIntroScreen({ navigation, route }: Props) {
  const { studentId, studentName, language, categoryScores } = route.params;
  const [selectedMode, setSelectedMode] = useState<Mode>(null);
  const playScaleAnim = useRef(new Animated.Value(1)).current;

  function handlePlayPress() {
    if (!selectedMode) return;
    Animated.sequence([
      Animated.timing(playScaleAnim, { toValue: 0.95, duration: 70, useNativeDriver: true }),
      Animated.timing(playScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      if (selectedMode === 'classroom') {
        navigation.navigate('Game1', { studentId, studentName, language });
      } else {
        // Determine recommended playground game from category scores
        const scores = categoryScores;
        let game: 'TreasurePath' | 'PatternTrain' | 'MatchShadow' = 'TreasurePath';
        if (scores) {
          const { cognitive, behavioral, emotional } = scores;
          if (cognitive <= behavioral && cognitive <= emotional) game = 'TreasurePath';
          else if (behavioral <= cognitive && behavioral <= emotional) game = 'PatternTrain';
          else game = 'MatchShadow';
        }
        navigation.navigate(game, { studentId, studentName, language });
      }
    });
  }

  const playEnabled = selectedMode !== null;

  return (
    <SafeAreaView style={styles.safe}>
      <Image source={require('../../assets/gamebg.png')} style={styles.bg} resizeMode="cover" />

      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <Pressable style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
      </View>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Your Activity</Text>
        <Text style={styles.headerSub}>Select a mode to begin</Text>
      </View>

      {/* ── Cards ─────────────────────────────────────────────────────── */}
      <View style={styles.cardsContainer}>
        {MODES.map((mode) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            selected={selectedMode === mode.id}
            onSelect={() => setSelectedMode(mode.id)}
          />
        ))}
      </View>

      {/* ── Fixed Play CTA — transparent, floats above bg ─────────────── */}
      <View style={styles.ctaBar}>
        <Animated.View style={{ transform: [{ scale: playScaleAnim }] }}>
          <Pressable
            style={[styles.playBtn, !playEnabled && styles.playBtnDisabled]}
            onPress={handlePlayPress}
            disabled={!playEnabled}
          >
            <Text style={[styles.playBtnText, !playEnabled && styles.playBtnTextDisabled]}>
              {playEnabled
                ? `▶  Play ${MODES.find(m => m.id === selectedMode)?.title}`
                : 'Select a mode to play'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E8F5EC' },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },

  // Top bar
  topBar: {
    paddingHorizontal: SPACING.md,
    paddingTop: 4,
    paddingBottom: 2,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: RADIUS.round,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
    alignSelf: 'flex-start',
  },
  backBtnText: { fontSize: 18, color: '#1E3D2F' },

  // Header
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#1E3D2F',
  },
  headerSub: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#4A6B52',
  },

  // Cards
  cardsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    gap: 12,
    paddingBottom: 8,
  },
  cardWrap: {
    flex: 1,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  card: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardImage: {
    flex: 1,
    width: '100%',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_800ExtraBold',
    letterSpacing: 0.3,
  },
  checkBadge: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  checkText: {
    fontSize: 15, color: '#fff', fontFamily: 'Poppins_800ExtraBold',
  },

  // CTA — no background, floats above scene
  ctaBar: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 28,
    paddingTop: 10,
  },
  playBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 7,
  },
  playBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    shadowOpacity: 0,
    elevation: 0,
  },
  playBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#fff',
    letterSpacing: 0.3,
  },
  playBtnTextDisabled: {
    color: '#4A6B52',
  },
});
