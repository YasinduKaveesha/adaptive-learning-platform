import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
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

type Props = NativeStackScreenProps<RootStackParamList, 'TreasurePath'>;

type Phase = 'showing' | 'input' | 'feedback' | 'done';

const ARROWS = ['⬆️', '➡️', '⬇️', '⬅️'] as const;
type Arrow = typeof ARROWS[number];

const ROUND_LENGTHS = [3, 3, 4, 4, 5];
const TOTAL_ROUNDS = 5;

function generateSequence(length: number): Arrow[] {
  return Array.from({ length }, () => ARROWS[Math.floor(Math.random() * 4)]);
}

export default function TreasurePathScreen({ navigation, route }: Props) {
  const { studentId, studentName, language } = route.params;

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('showing');
  const [sequence, setSequence] = useState<Arrow[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [playerInput, setPlayerInput] = useState<Arrow[]>([]);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const flashAnim = useRef(new Animated.Value(1)).current;

  const startRound = useCallback((roundIdx: number) => {
    const seq = generateSequence(ROUND_LENGTHS[roundIdx]);
    setSequence(seq);
    setPlayerInput([]);
    setActiveIndex(-1);
    setLastCorrect(null);
    setPhase('showing');

    // Show arrows one by one
    let i = 0;
    const showNext = () => {
      if (i >= seq.length) {
        setTimeout(() => {
          setActiveIndex(-1);
          setPhase('input');
        }, 400);
        return;
      }
      setActiveIndex(i);
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      i++;
      setTimeout(showNext, 700);
    };
    setTimeout(showNext, 400);
  }, [flashAnim]);

  useEffect(() => {
    startRound(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleArrowPress(arrow: Arrow) {
    if (phase !== 'input') return;
    const newInput = [...playerInput, arrow];
    setPlayerInput(newInput);

    const idx = newInput.length - 1;
    const correct = newInput[idx] === sequence[idx];

    if (!correct) {
      // Wrong — show feedback, then next round
      setLastCorrect(false);
      setPhase('feedback');
      setTimeout(() => advanceRound(false), 1000);
      return;
    }

    if (newInput.length === sequence.length) {
      // Completed sequence correctly
      setLastCorrect(true);
      setPhase('feedback');
      setTimeout(() => advanceRound(true), 1000);
    }
  }

  function advanceRound(roundCorrect: boolean) {
    const newScore = roundCorrect ? score + 1 : score;
    const nextRound = round + 1;
    if (nextRound >= TOTAL_ROUNDS) {
      setScore(newScore);
      setPhase('done');
      setShowResult(true);
    } else {
      setScore(newScore);
      setRound(nextRound);
      startRound(nextRound);
    }
  }

  const maxLength = ROUND_LENGTHS[round];
  const progress = (round / TOTAL_ROUNDS) * 100;

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

      {/* Round label */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Treasure Path</Text>
        <Text style={styles.headerSub}>
          {phase === 'showing' ? 'Watch the sequence!' : phase === 'input' ? 'Repeat it!' : `Round ${round + 1} of ${TOTAL_ROUNDS}`}
        </Text>
      </View>

      {/* Sequence display */}
      <View style={styles.sequenceArea}>
        {sequence.map((arrow, i) => (
          <Animated.View
            key={i}
            style={[
              styles.sequenceCell,
              i === activeIndex && styles.sequenceCellActive,
              phase === 'input' && i < playerInput.length && {
                backgroundColor: playerInput[i] === sequence[i] ? '#D4EDDA' : '#FDDEDE',
              },
              { transform: [{ scale: i === activeIndex ? flashAnim : 1 }] },
            ]}
          >
            <Text style={styles.sequenceArrow}>
              {phase === 'showing' && i <= activeIndex ? arrow : phase === 'input' ? (i < playerInput.length ? playerInput[i] : '❓') : '❓'}
            </Text>
          </Animated.View>
        ))}
      </View>

      {/* Feedback banner */}
      {phase === 'feedback' && lastCorrect !== null && (
        <View style={[styles.feedbackBanner, { backgroundColor: lastCorrect ? '#58CC6C' : '#FF4B4B' }]}>
          <Text style={styles.feedbackText}>{lastCorrect ? '✅ Correct!' : '❌ Not quite!'}</Text>
        </View>
      )}

      {/* Arrow input buttons */}
      <View style={styles.arrowGrid}>
        {/* Top row: up */}
        <View style={styles.arrowRow}>
          <Pressable
            style={({ pressed }) => [styles.arrowBtn, { backgroundColor: '#1CB0F6' }, pressed && { opacity: 0.8 }]}
            onPress={() => handleArrowPress('⬆️')}
            disabled={phase !== 'input'}
          >
            <Text style={styles.arrowBtnText}>⬆️</Text>
          </Pressable>
        </View>
        {/* Middle row: left + right */}
        <View style={styles.arrowRow}>
          <Pressable
            style={({ pressed }) => [styles.arrowBtn, { backgroundColor: '#FF9600' }, pressed && { opacity: 0.8 }]}
            onPress={() => handleArrowPress('⬅️')}
            disabled={phase !== 'input'}
          >
            <Text style={styles.arrowBtnText}>⬅️</Text>
          </Pressable>
          <View style={styles.arrowBtnPlaceholder} />
          <Pressable
            style={({ pressed }) => [styles.arrowBtn, { backgroundColor: '#FF9600' }, pressed && { opacity: 0.8 }]}
            onPress={() => handleArrowPress('➡️')}
            disabled={phase !== 'input'}
          >
            <Text style={styles.arrowBtnText}>➡️</Text>
          </Pressable>
        </View>
        {/* Bottom row: down */}
        <View style={styles.arrowRow}>
          <Pressable
            style={({ pressed }) => [styles.arrowBtn, { backgroundColor: '#58CC6C' }, pressed && { opacity: 0.8 }]}
            onPress={() => handleArrowPress('⬇️')}
            disabled={phase !== 'input'}
          >
            <Text style={styles.arrowBtnText}>⬇️</Text>
          </Pressable>
        </View>
      </View>

      <PlaygroundResultPopup
        visible={showResult}
        score={score}
        total={TOTAL_ROUNDS}
        gameName="🗺️ Treasure Path Memory"
        metrics={[
          { label: 'Memory Span', value: `${maxLength} arrows` },
          { label: 'Reaction Speed', value: 'Good' },
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
    flex: 1,
    height: 8,
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
    paddingTop: 12,
    paddingBottom: 8,
    gap: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#1E3D2F',
  },
  headerSub: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#4A6B52',
  },

  sequenceArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 24,
    gap: 10,
  },
  sequenceCell: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  sequenceCellActive: {
    backgroundColor: '#fff',
    borderColor: COLORS.primary,
  },
  sequenceArrow: { fontSize: 28 },

  feedbackBanner: {
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },

  arrowGrid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
    gap: 12,
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  arrowBtn: {
    width: 76, height: 76, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  arrowBtnPlaceholder: { width: 76, height: 76 },
  arrowBtnText: { fontSize: 36 },
});
