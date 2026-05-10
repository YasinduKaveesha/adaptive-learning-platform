import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlaygroundResultPopup from '../components/games/shared/PlaygroundResultPopup';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MatchShadow'>;

interface Round {
  shadow: string;
  options: string[];
  correctIndex: number;
}

const ROUNDS: Round[] = [
  { shadow: '⭐', options: ['🔶', '⭐', '💎', '🔺'], correctIndex: 1 },
  { shadow: '💎', options: ['⭐', '🔺', '💎', '🔶'], correctIndex: 2 },
  { shadow: '🔶', options: ['💎', '🔶', '⭐', '🔺'], correctIndex: 1 },
  { shadow: '🔺', options: ['🔶', '⭐', '🔺', '💎'], correctIndex: 2 },
  { shadow: '⭐', options: ['🔺', '💎', '🔶', '⭐'], correctIndex: 3 },
];

export default function MatchShadowScreen({ navigation, route }: Props) {
  const { studentId, studentName, language } = route.params;

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentRound = ROUNDS[round];

  function handleOptionPress(idx: number) {
    if (selected !== null) return;
    setSelected(idx);

    const correct = idx === currentRound.correctIndex;
    const newScore = correct ? score + 1 : score;

    setTimeout(() => {
      if (round + 1 >= ROUNDS.length) {
        setScore(newScore);
        setShowResult(true);
      } else {
        setScore(newScore);
        setRound(round + 1);
        setSelected(null);
      }
    }, 900);
  }

  const progress = (round / ROUNDS.length) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      <Image source={require('../../assets/gamebg.png')} style={styles.bg} resizeMode="cover" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Pressable
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔮 Match the Shadow</Text>
        <Text style={styles.headerSub}>Which shape matches the shadow?  Round {round + 1}/{ROUNDS.length}</Text>
      </View>

      {/* Shadow display */}
      <View style={styles.shadowContainer}>
        <View style={styles.shadowCircle}>
          <Text style={styles.shadowEmoji}>{currentRound.shadow}</Text>
          <View style={styles.shadowOverlay} />
        </View>
        <Text style={styles.shadowLabel}>Find the match ↓</Text>
      </View>

      {/* Options grid */}
      <View style={styles.optionsGrid}>
        {currentRound.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === currentRound.correctIndex;
          let bg = 'rgba(255,255,255,0.9)';
          if (isSelected) bg = isCorrect ? '#58CC6C' : '#FF4B4B';
          else if (selected !== null && isCorrect) bg = '#58CC6C';

          return (
            <Pressable
              key={i}
              style={[styles.optionBtn, { backgroundColor: bg }]}
              onPress={() => handleOptionPress(i)}
              disabled={selected !== null}
            >
              <Text style={styles.optionEmoji}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      <PlaygroundResultPopup
        visible={showResult}
        score={score}
        total={ROUNDS.length}
        gameName="🔮 Match the Shadow"
        metrics={[
          { label: 'Visual Match', value: `${score * 20}%` },
          { label: 'Speed', value: 'Good' },
        ]}
        onHome={() => navigation.navigate('PlaygroundHub', { studentId, studentName, language })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E8F5EC' },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 8,
    gap: 12,
  },
  progressBarTrack: {
    flex: 1, height: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: RADIUS.round,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.round,
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: RADIUS.round,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: '#1E3D2F', fontFamily: 'Poppins_700Bold' },

  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#1E3D2F',
  },
  headerSub: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#4A6B52',
  },

  shadowContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  shadowCircle: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: '#1E3D2F',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  shadowEmoji: {
    fontSize: 64,
    opacity: 0.15,
  },
  shadowOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 65,
    backgroundColor: 'rgba(30,61,47,0.3)',
  },
  shadowLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#4A6B52',
  },

  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    gap: 16,
    flex: 1,
    alignContent: 'center',
  },
  optionBtn: {
    width: '42%',
    aspectRatio: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  optionEmoji: { fontSize: 44 },
});
