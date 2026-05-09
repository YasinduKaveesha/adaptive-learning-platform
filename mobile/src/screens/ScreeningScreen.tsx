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
import { COLORS, DOMAIN_CONFIG, RADIUS, SPACING } from '../constants/theme';
import { startScreening, submitResponse } from '../services/api';
import type { Domain, DomainAbility, Item, RootStackParamList, SessionSnapshot } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Screening'>;
type GamePhase = 'study' | 'answer';

const DEMO_ITEMS: Item[] = [
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
  {
    item_id: 'att_01',
    domain: 'attention',
    game_type: 'count_targets',
    study_prompt: null,
    study_content: null,
    study_items: [],
    question: 'How many FILLED stars (★) are there?\n\n★  ☆  ★  ☆  ★  ☆  ★',
    options: { A: '3', B: '4', C: '5', D: '6' },
  },
  {
    item_id: 'lr_01',
    domain: 'logical_reasoning',
    game_type: 'syllogism',
    study_prompt: null,
    study_content: null,
    study_items: [],
    question: 'Using ONLY the rules below, what is true?\n\nRule 1: All birds can fly.\nRule 2: A penguin is a bird.',
    options: {
      A: 'Penguins cannot fly',
      B: 'By the rules, penguins can fly',
      C: 'Penguins might fly',
      D: 'There is not enough information',
    },
  },
  {
    item_id: 'wm_02',
    domain: 'working_memory',
    game_type: 'sequence_recall',
    study_prompt: 'Remember these colours in order:',
    study_content: 'Red  →  Blue  →  Green  →  Yellow',
    study_items: ['Red', 'Blue', 'Green', 'Yellow'],
    question: 'Which colour came 2nd?',
    options: { A: 'Red', B: 'Blue', C: 'Green', D: 'Yellow' },
  },
  {
    item_id: 'pr_02',
    domain: 'pattern_recognition',
    game_type: 'pattern_completion',
    study_prompt: null,
    study_content: null,
    study_items: [],
    question: 'What shape comes next?\n\n△  ○  □  △  ○  □  △  ○  ?',
    options: { A: '△', B: '○', C: '□', D: '◇' },
  },
  {
    item_id: 'att_02',
    domain: 'attention',
    game_type: 'count_targets',
    study_prompt: null,
    study_content: null,
    study_items: [],
    question: 'Count only the RED circles (R) below:\n\nR  B  R  G  R  B  G  R  B  R',
    options: { A: '4', B: '5', C: '6', D: '3' },
  },
  {
    item_id: 'lr_02',
    domain: 'logical_reasoning',
    game_type: 'analogy',
    study_prompt: null,
    study_content: null,
    study_items: [],
    question: 'Complete the analogy:\n\nBook  :  Reading  ::  Fork  :  ?',
    options: { A: 'Spoon', B: 'Kitchen', C: 'Eating', D: 'Plate' },
  },
];

const CORRECT_MAP: Record<string, string> = {
  wm_01: 'A', wm_02: 'B', wm_03: 'D', wm_04: 'C',
  pr_01: 'B', pr_02: 'C', pr_03: 'C', pr_04: 'C',
  att_01: 'B', att_02: 'B', att_03: 'D', att_04: 'B',
  lr_01: 'B', lr_02: 'C', lr_03: 'C', lr_04: 'B',
};

export default function ScreeningScreen({ route, navigation }: Props) {
  const { studentId, studentName, language } = route.params;
  const { height } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);

  const sessionIdRef = useRef<string>('');
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

  const handleAnswer = useCallback(
    async (choice: string) => {
      if (!currentItem) return;
      const reactionMs = Math.max(200, Date.now() - itemDisplayedAtRef.current);

      if (demoMode) {
        const nextIndex = demoIndex + 1;
        if (nextIndex >= DEMO_ITEMS.length) {
          navigation.replace('Results', { studentId, studentName, language, sessionId: sessionIdRef.current });
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
          navigation.replace('Results', { studentId, studentName, language, sessionId: sessionIdRef.current });
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

  const domainCfg = DOMAIN_CONFIG[currentItem.domain];
  const itemNum = demoMode ? demoIndex + 1 : (snapshot?.items_answered ?? 0) + 1;
  const totalItems = demoMode ? DEMO_ITEMS.length : 16;
  const progress = itemNum / totalItems;
  const cardHeight = height * 0.5;

  return (
    <SafeAreaView style={styles.safe}>
      <Image
        source={require('../../assets/screeningBG.png')}
        style={styles.bgImage}
        resizeMode="cover"
      />

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <Text style={styles.counter}>{itemNum}/{totalItems}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Domain badge ─────────────────────────────────────────────── */}
        <View style={[styles.domainBadge, { backgroundColor: domainCfg.bg }]}>
          <Text style={styles.domainIcon}>{domainCfg.icon}</Text>
          <Text style={[styles.domainLabel, { color: domainCfg.color }]}>
            {domainCfg.label.toUpperCase()}
          </Text>
        </View>

        {/* ── Question card ─────────────────────────────────────────────── */}
        <View style={[styles.questionCard, { height: cardHeight }]}>
          {currentItem.domain === 'working_memory' ? (
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
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
    backgroundColor: 'rgba(255,255,255,0.75)',
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
    backgroundColor: COLORS.primary,
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

  // Domain badge
  domainBadge: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
    borderRadius: RADIUS.round,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  domainIcon: {
    fontSize: 14,
  },
  domainLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // Question card
  questionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
});
