import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Game1'>;

interface Question {
  image: ReturnType<typeof require>;
  options: string[];
  correctIndex: number;
  vertical?: boolean;
}

const QUESTIONS: Question[] = [
  {
    image: require('../../assets/q1.png'),
    options: ['A & D', 'B & C', 'C & E'],
    correctIndex: 0, // A & D
  },
  {
    image: require('../../assets/Q2.png'),
    options: ['5', '7', '6'],
    correctIndex: 0, // 5
  },
  {
    image: require('../../assets/Q3.png'),
    options: ['A', 'B', 'C'],
    correctIndex: 2, // C
  },
  {
    image: require('../../assets/Q4.png'),
    options: ['A & D', 'B & C', 'B & D'],
    correctIndex: 2, // B & D
  },
  {
    image: require('../../assets/Q5.png'),
    options: ['450g, 550g, 500g', '450g, 650g, 600g', '600g, 800g, 750g'],
    correctIndex: 1, // 450g, 650g, 600g
    vertical: true,
  },
];

export default function Game1Screen({ navigation, route }: Props) {
  const { studentId, studentName, language } = route.params;
  const { width: screenWidth } = useWindowDimensions();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [nextVisible, setNextVisible] = useState(false);
  // keyed by question index so back+re-answer overwrites rather than appends
  const correctAnswersRef = useRef<Record<number, boolean>>({});

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const currentQ = QUESTIONS[questionIndex];
  const totalQuestions = QUESTIONS.length;
  const progress = questionIndex / totalQuestions;

  // Card is 80% of screen width.
  // Image is 3:4 (width:height) → bannerHeight = cardWidth × (4/3)
  // Same pattern as GameIntroScreen cardBanner but with a computed height.
  const cardWidth = screenWidth * 0.8;
  const bannerHeight = Math.round((cardWidth * 4) / 3);

  const handleOptionPress = useCallback(
    (optionIndex: number) => {
      if (selectedOption !== null) return;
      setSelectedOption(optionIndex);
      const correct = optionIndex === currentQ.correctIndex;
      correctAnswersRef.current[questionIndex] = correct;

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start(() => setNextVisible(true));
    },
    [selectedOption, currentQ, questionIndex, scaleAnim],
  );

  const handleBack = useCallback(() => {
    if (questionIndex === 0) {
      navigation.goBack();
      return;
    }
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setQuestionIndex((i) => i - 1);
      setSelectedOption(null);
      setNextVisible(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }, [questionIndex, navigation, fadeAnim]);

  const handleNext = useCallback(() => {
    const nextIndex = questionIndex + 1;
    if (nextIndex >= totalQuestions) {
      const answersArray = Array.from({ length: totalQuestions }, (_, i) => correctAnswersRef.current[i] ?? false);
      const finalScore = answersArray.filter(Boolean).length;
      navigation.replace('Game1Results', {
        studentId,
        studentName,
        language,
        score: finalScore,
        total: totalQuestions,
        correctAnswers: answersArray,
      });
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        setQuestionIndex(nextIndex);
        setSelectedOption(null);
        setNextVisible(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
    }
  }, [questionIndex, totalQuestions, navigation, studentId, studentName, language, fadeAnim]);

  function getOptionStyle(idx: number) {
    if (selectedOption === null) return styles.optionBtn;
    if (idx === currentQ.correctIndex) return [styles.optionBtn, styles.optionCorrect];
    if (idx === selectedOption) return [styles.optionBtn, styles.optionWrong];
    return [styles.optionBtn, styles.optionDim];
  }

  function getOptionTextStyle(idx: number) {
    if (selectedOption === null) return styles.optionText;
    if (idx === currentQ.correctIndex) return [styles.optionText, styles.optionTextCorrect];
    if (idx === selectedOption) return [styles.optionText, styles.optionTextWrong];
    return [styles.optionText, styles.optionTextDim];
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Full-screen background */}
      <Image source={require('../../assets/gamebg.png')} style={styles.bg} resizeMode="cover" />

      {/* ── Top bar with progress bar ─────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(progress * 100, 4)}%` }]} />
        </View>
        <Text style={styles.counter}>{questionIndex + 1}/{totalQuestions}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Question label ── */}
        <Text style={[styles.questionLabel, { width: cardWidth }]}>
          Question {questionIndex + 1}
        </Text>

        {/* ── Flexbox: 80% wide, height = width × (4/3) to match the 3:4 image ── */}
        <Animated.View style={[styles.card, { width: cardWidth, height: bannerHeight, opacity: fadeAnim }]}>
          <Image
            source={currentQ.image}
            style={styles.cardImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* ── Answer buttons (outside the image box) ── */}
        <Animated.View style={[styles.answerBox, { width: cardWidth, transform: [{ scale: scaleAnim }] }]}>
          {currentQ.vertical ? (
            /* Vertical stack for questions with long option text */
            currentQ.options.map((label, idx) => (
              <Pressable key={idx} style={[getOptionStyle(idx), styles.optionBtnFull]} onPress={() => handleOptionPress(idx)}>
                <Text style={getOptionTextStyle(idx)}>{label}</Text>
              </Pressable>
            ))
          ) : (
            /* Horizontal row for short options */
            <View style={styles.optionRow}>
              {currentQ.options.map((label, idx) => (
                <Pressable key={idx} style={getOptionStyle(idx)} onPress={() => handleOptionPress(idx)}>
                  <Text style={getOptionTextStyle(idx)}>{label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>

        {/* ── Back + Next buttons — appear after an answer is selected ── */}
        {nextVisible && (
          <View style={[styles.navRow, { width: cardWidth }]}>
            {questionIndex > 0 && (
              <Pressable style={styles.backBtn} onPress={handleBack}>
                <Text style={styles.backBtnText}>← Back</Text>
              </Pressable>
            )}
            <Pressable style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>
                {questionIndex === totalQuestions - 1 ? 'Done' : 'Next →'}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#D8F2E5',
  },
  bg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%', height: '100%',
  },

  // ── Top bar ───────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(238,249,239,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#777777',
    fontFamily: 'Poppins_700Bold',
  },
  progressTrack: {
    flex: 1,
    height: 14,
    borderRadius: RADIUS.round,
    backgroundColor: '#E5E5E5',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
  },
  counter: {
    fontSize: 12,
    fontFamily: 'Poppins_700Bold',
    color: '#777777',
    minWidth: 32,
    textAlign: 'right',
  },

  // ── Body ─────────────────────────────────────────────────────────────────
  body: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },

  // ── Card: 80% wide, height = width × (4/3) — exactly fits the 3:4 image ──
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },

  // ── Answer buttons below the card ─────────────────────────────────────────
  answerBox: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },

  // ── Question label ────────────────────────────────────────────────────────
  questionLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#1E3D2F',
    marginBottom: SPACING.sm,
  },

  // ── Back + Next row ───────────────────────────────────────────────────────
  navRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  backBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#1E3D2F',
  },
  nextBtn: {
    flex: 1,
    backgroundColor: '#2ECC71',
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },

  // ── Option rows ───────────────────────────────────────────────────────────
  optionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    height: 56,
  },
  // Full-width button for vertical layout (Q5 etc.)
  optionBtnFull: {
    width: '65%',
    alignSelf: 'center',
    flex: 0,
    height: 'auto' as any,
    paddingVertical: 20,
    paddingHorizontal: SPACING.sm,
  },
  optionBtn: {
    flex: 1,
    backgroundColor: '#2ECC71',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  optionCorrect: {
    backgroundColor: '#27AE60',
  },
  optionWrong: {
    backgroundColor: '#FF4B4B',
  },
  optionDim: {
    opacity: 0.45,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  optionTextCorrect: {
    color: '#FFFFFF',
  },
  optionTextWrong: {
    color: '#FFFFFF',
  },
  optionTextDim: {
    color: '#FFFFFF',
  },
});
