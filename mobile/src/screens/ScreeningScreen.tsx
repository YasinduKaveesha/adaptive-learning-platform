import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AttentionGame from '../components/games/AttentionGame';
import MemoryGame from '../components/games/MemoryGame';
import PatternGame from '../components/games/PatternGame';
import ReasoningGame from '../components/games/ReasoningGame';
import SelfReportGame from '../components/games/SelfReportGame';
import CountdownTimer from '../components/games/shared/CountdownTimer';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { startScreening, submitResponse } from '../services/api';
import type { Domain, Item, RootStackParamList, SessionSnapshot } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Screening'>;
type GamePhase = 'study' | 'answer';

// ── Main category config (shown on the badge pill) ───────────────────────────
const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  cognitive: {
    label: 'COGNITIVE',
    icon: '🧠',
    color: '#1CB0F6',
    bg: '#E8F6FF',
  },
  behavioral: {
    label: 'BEHAVIORAL',
    icon: '🎭',
    color: '#FF6B35',
    bg: '#FFF1EC',
  },
  emotional: {
    label: 'EMOTIONAL',
    icon: '💜',
    color: '#C084FC',
    bg: '#FAF0FF',
  },
  learning_preference: {
    label: 'LEARNING STYLE',
    icon: '🎨',
    color: '#22D3EE',
    bg: '#F0FEFF',
  },
};

function getMainCategory(domain: Domain): keyof typeof CATEGORY_CONFIG {
  if (['working_memory', 'pattern_recognition', 'attention', 'logical_reasoning'].includes(domain)) {
    return 'cognitive';
  }
  return domain as keyof typeof CATEGORY_CONFIG;
}

// ── Demo items covering all 4 main categories ────────────────────────────────
const DEMO_ITEMS: Item[] = [
  // ── COGNITIVE ──
  {
    item_id: 'wm_01',
    domain: 'working_memory',
    game_type: 'sequence_recall',
    study_prompt: 'Study this number sequence carefully:',
    study_content: '4  —  7  —  2  —  9',
    study_items: ['4', '7', '2', '9'],
    question: 'What was the 3rd number?',
    options: { A: '2', B: '4', C: '7', D: '9' },
  },
  {
    item_id: 'pr_01',
    domain: 'pattern_recognition',
    game_type: 'pattern_completion',
    study_prompt: null,
    study_content: null,
    study_items: [],
    question: 'What comes next in the pattern?\n\n2  →  4  →  6  →  ?',
    options: { A: '7', B: '8', C: '9', D: '10' },
  },
  // ── BEHAVIORAL ──
  {
    item_id: 'bh_01',
    domain: 'behavioral',
    game_type: 'self_report',
    study_prompt: null,
    study_content: null,
    study_items: [],
    question: 'When your teacher tells the class to take out a book, what do you usually do?',
    options: {
      A: 'I take out my book right away',
      B: 'I take it out after a little while',
      C: 'I wait to see what my friends do first',
      D: 'I forget and the teacher has to remind me',
    },
  },
  {
    item_id: 'bh_04',
    domain: 'behavioral',
    game_type: 'self_report',
    study_prompt: null,
    study_content: null,
    study_items: [],
    question: "When your teacher explains something and you don't understand, what do you usually do?",
    options: {
      A: 'I raise my hand and ask the teacher to explain again',
      B: 'I ask a classmate quietly',
      C: 'I try to figure it out on my own',
      D: 'I leave it and hope I understand later',
    },
  },
  // ── EMOTIONAL ──
  {
    item_id: 'em_08',
    domain: 'emotional',
    game_type: 'self_report',
    study_prompt: null,
    study_content: null,
    study_items: [],
    question: 'How do you feel the night before a big test?',
    options: {
      A: 'A little nervous but mostly calm because I studied',
      B: 'Quite nervous and I check my notes a lot',
      C: 'Very worried and hard to sleep',
      D: "So worried that I feel sick or can't eat",
    },
  },
  {
    item_id: 'em_06',
    domain: 'emotional',
    game_type: 'self_report',
    study_prompt: null,
    study_content: null,
    study_items: [],
    question: 'When you make a small mistake in class (like spelling a word wrong), how do you feel?',
    options: {
      A: "It's okay — I learn from mistakes",
      B: 'A little embarrassed but it passes quickly',
      C: 'Quite embarrassed for a while',
      D: 'Very upset — I hate making mistakes',
    },
  },
  // ── LEARNING STYLE ──
  {
    item_id: 'lp_01',
    domain: 'learning_preference',
    game_type: 'preference_pick',
    study_prompt: null,
    study_content: null,
    study_items: [],
    question: 'When learning something new, what helps you the most?',
    options: {
      A: 'Seeing pictures, diagrams, or videos',
      B: 'Reading about it in a book or on paper',
      C: 'Listening to someone explain it',
      D: 'Trying it out with my hands',
    },
  },
  {
    item_id: 'lp_02',
    domain: 'learning_preference',
    game_type: 'preference_pick',
    study_prompt: null,
    study_content: null,
    study_items: [],
    question: 'Do you prefer working alone or with a group?',
    options: {
      A: 'I much prefer working alone',
      B: 'I slightly prefer working alone',
      C: 'I slightly prefer working in a group',
      D: 'I much prefer working in a group',
    },
  },
];

const CORRECT_MAP: Record<string, string> = {
  wm_01: 'A', wm_02: 'B', wm_03: 'D', wm_04: 'C',
  pr_01: 'B', pr_02: 'C', pr_03: 'C', pr_04: 'C',
  att_01: 'B', att_02: 'B', att_03: 'D', att_04: 'B',
  lr_01: 'B', lr_02: 'C', lr_03: 'C', lr_04: 'B',
  bh_01: 'A', bh_02: 'A', bh_03: 'A', bh_04: 'A', bh_05: 'A',
  bh_06: 'A', bh_07: 'A', bh_08: 'A', bh_09: 'A', bh_10: 'A',
  em_01: 'A', em_02: 'A', em_03: 'A', em_04: 'A', em_05: 'A',
  em_06: 'A', em_07: 'A', em_08: 'A', em_09: 'A', em_10: 'A',
  // lp items: 'X' means preference — any answer is accepted
};

export default function ScreeningScreen({ route, navigation }: Props) {
  const { studentId, studentName, language } = route.params;
  const { height } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);

  const sessionIdRef = useRef<string>('');
  const screeningStartRef = useRef<number>(Date.now());

  // Score tracker per main category
  const scorecardRef = useRef({
    cognitive:          { correct: 0, total: 0 },
    behavioral:         { correct: 0, total: 0 },
    emotional:          { correct: 0, total: 0 },
    learning_preference:{ total: 0 },
  });

  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('answer');
  const itemDisplayedAtRef = useRef<number>(Date.now());
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);

  function loadItem(item: Item) {
    setCurrentItem(item);
    const isMemory = item.domain === 'working_memory' && item.study_items.length > 0;
    setGamePhase(isMemory ? 'study' : 'answer');
    itemDisplayedAtRef.current = Date.now();
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await startScreening(studentId, language);
        if (cancelled) return;
        sessionIdRef.current = res.session_id;
        loadItem(res.first_item);
      } catch {
        if (cancelled) return;
        setDemoMode(true);
        sessionIdRef.current = `demo_${Date.now()}`;
        setDemoIndex(0);
        loadItem(DEMO_ITEMS[0]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleStudyReady = useCallback(() => {
    itemDisplayedAtRef.current = Date.now();
    setGamePhase('answer');
  }, []);

  function buildCategoryScores() {
    const s = scorecardRef.current;
    return {
      cognitive:   s.cognitive.total   > 0 ? Math.round((s.cognitive.correct   / s.cognitive.total)   * 100) : 70,
      behavioral:  s.behavioral.total  > 0 ? Math.round((s.behavioral.correct  / s.behavioral.total)  * 100) : 70,
      emotional:   s.emotional.total   > 0 ? Math.round((s.emotional.correct   / s.emotional.total)   * 100) : 70,
      learningStyle: s.learning_preference.total > 0 ? null : null,
    };
  }

  const handleAnswer = useCallback(
    async (choice: string) => {
      if (!currentItem) return;
      const reactionMs = Math.max(200, Date.now() - itemDisplayedAtRef.current);

      if (demoMode) {
        // Track scores
        const mainCat = getMainCategory(currentItem.domain);
        const correctAnswer = CORRECT_MAP[currentItem.item_id];
        const sc = scorecardRef.current;

        if (mainCat === 'cognitive') {
          sc.cognitive.total++;
          if (choice === correctAnswer) sc.cognitive.correct++;
        } else if (mainCat === 'behavioral') {
          sc.behavioral.total++;
          if (choice === correctAnswer) sc.behavioral.correct++;
        } else if (mainCat === 'emotional') {
          sc.emotional.total++;
          if (choice === correctAnswer) sc.emotional.correct++;
        } else if (mainCat === 'learning_preference') {
          sc.learning_preference.total++;
        }

        const nextIndex = demoIndex + 1;
        if (nextIndex >= DEMO_ITEMS.length) {
          navigation.replace('Results', {
            studentId,
            studentName,
            language,
            sessionId: sessionIdRef.current,
            timeTakenMs: Date.now() - screeningStartRef.current,
            categoryScores: buildCategoryScores(),
          });
        } else {
          setDemoIndex(nextIndex);
          loadItem(DEMO_ITEMS[nextIndex]);
        }
        return;
      }

      try {
        const correct = choice === CORRECT_MAP[currentItem.item_id];
        const res = await submitResponse(sessionIdRef.current, currentItem.item_id, correct, reactionMs, 0);
        setSnapshot(res.snapshot);
        if (res.stop) {
          navigation.replace('Results', {
            studentId,
            studentName,
            language,
            sessionId: sessionIdRef.current,
            timeTakenMs: Date.now() - screeningStartRef.current,
            categoryScores: buildCategoryScores(),
          });
        } else if (res.next_item) {
          loadItem(res.next_item);
        }
      } catch (e: any) {
        console.error('Submit error:', e);
      }
    },
    [currentItem, demoMode, demoIndex, studentId, studentName, language, navigation],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Getting your activities ready…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentItem) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centred}>
          <Text style={styles.errorText}>Oops! Could not load the question.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const mainCat = getMainCategory(currentItem.domain);
  const catCfg = CATEGORY_CONFIG[mainCat];
  const itemNum = demoMode ? demoIndex + 1 : (snapshot?.items_answered ?? 0) + 1;
  const totalItems = demoMode ? DEMO_ITEMS.length : 16;
  const progress = itemNum / totalItems;
  const cardHeight = height * 0.55;

  const isSelfReport = currentItem.game_type === 'self_report' || currentItem.game_type === 'preference_pick';

  return (
    <SafeAreaView style={styles.safe}>
      <Image
        source={require('../../assets/screeningBG.png')}
        style={styles.bgImage}
        resizeMode="cover"
      />

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: catCfg.color }]} />
        </View>

        <Text style={styles.counter}>{itemNum}/{totalItems}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Category badge ───────────────────────────────────────────── */}
        <View style={[styles.domainBadge, { backgroundColor: catCfg.bg, borderColor: catCfg.color }]}>
          <Text style={styles.domainIcon}>{catCfg.icon}</Text>
          <Text style={[styles.domainLabel, { color: catCfg.color }]}>
            {catCfg.label}
          </Text>
        </View>

        {/* ── Question card ─────────────────────────────────────────────── */}
        <View style={[styles.questionCard, { minHeight: cardHeight, borderTopColor: catCfg.color }]}>
          <CountdownTimer
            itemKey={currentItem.item_id + '_' + gamePhase}
            onExpire={() => handleAnswer('__timeout__')}
          />
          {isSelfReport ? (
            <SelfReportGame
              item={currentItem}
              onAnswer={handleAnswer}
              accentColor={catCfg.color}
              accentBg={catCfg.bg}
              icon={catCfg.icon}
            />
          ) : currentItem.domain === 'working_memory' ? (
            <MemoryGame item={currentItem} phase={gamePhase} onStudyReady={handleStudyReady} onAnswer={handleAnswer} />
          ) : currentItem.domain === 'pattern_recognition' ? (
            <PatternGame item={currentItem} onAnswer={handleAnswer} />
          ) : currentItem.domain === 'attention' ? (
            <AttentionGame item={currentItem} onAnswer={handleAnswer} />
          ) : (
            <ReasoningGame item={currentItem} onAnswer={handleAnswer} />
          )}
        </View>
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
  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    color: COLORS.error,
    textAlign: 'center',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '700',
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
  },
  counter: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    minWidth: 32,
    textAlign: 'right',
  },

  // Scroll
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: SPACING.lg,
  },

  // Category badge pill
  domainBadge: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
    borderRadius: RADIUS.round,
    borderWidth: 1.5,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  domainIcon: {
    fontSize: 15,
  },
  domainLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Question card
  questionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderTopWidth: 4,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
});
