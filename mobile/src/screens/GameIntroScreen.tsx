import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Asset } from 'expo-asset';
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

type Props = NativeStackScreenProps<RootStackParamList, 'GameIntro'>;

interface Badge {
  icon: string;
  label: string;
}

const BADGES: Badge[] = [
  { icon: '🧠', label: 'Memory' },
  { icon: '⭐', label: 'Medium' },
  { icon: '🕒', label: '5 min' },
];

export default function GameIntroScreen({ navigation, route }: Props) {
  const { studentId, studentName, language } = route.params;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Preload all question images while user reads the intro
    Asset.loadAsync([
      require('../../assets/q1.png'),
      require('../../assets/Q2.png'),
      require('../../assets/Q3.png'),
      require('../../assets/Q4.png'),
      require('../../assets/Q5.png'),
    ]);
  }, []);

  function handleStartPress() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('Game1', { studentId, studentName, language });
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Full-screen background */}
      <Image
        source={require('../../assets/gamebg.png')}
        style={styles.bg}
        resizeMode="cover"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top bar ────────────────────────────────────────────────── */}
        <View style={styles.topbar}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.iconBtnText}>←</Text>
          </Pressable>
        </View>

        {/* ── Hero text ──────────────────────────────────────────────── */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Your First Adventure</Text>
          <Text style={styles.heroSub}>Based on your strengths, we picked this for you!</Text>
        </View>

        {/* ── Main card ──────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Image
            source={require('../../assets/quest1.png')}
            style={styles.cardBanner}
            resizeMode="cover"
          />

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Memory Quest</Text>
            <Text style={styles.cardSub}>Help the fox remember the treasure path!</Text>

            <View style={styles.badges}>
              {BADGES.map((b) => (
                <View key={b.label} style={styles.badge}>
                  <Text style={styles.badgeIcon}>{b.icon}</Text>
                  <Text style={styles.badgeText}>{b.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Primary CTA ────────────────────────────────────────────── */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%', marginTop: 160 }}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
            onPress={handleStartPress}
          >
            <Text style={styles.btnPrimaryText}>Play</Text>
          </Pressable>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#7dc95a',
  },
  bg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%', height: '100%',
  },

  scroll: {
    flexGrow: 1,
    padding: SPACING.md,
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  // Top bar
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBtnText: {
    fontSize: 18,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: RADIUS.round,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  langText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#1E3D2F',
  },

  // Hero
  hero: {
    gap: 6,
    marginTop: SPACING.xl,
    marginBottom: 30,
  },
  heroTitle: {
    fontSize: 30,
    fontFamily: 'Poppins_700Bold',
    color: '#1E3D2F',
    lineHeight: 38,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#4A6B52',
    lineHeight: 22,
  },

  // Card
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
  cardBanner: {
    width: '100%',
    height: 240,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  cardBody: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E3D2F',
  },
  cardSub: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    lineHeight: 22,
  },

  // Badges
  badges: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F6EE',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  badgeIcon: { fontSize: 14 },
  badgeText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#1E3D2F',
  },

  // Buttons
  btnOutline: {
    borderWidth: 2,
    borderColor: '#2ECC71',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnOutlineText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E3D2F',
  },
  btnPrimary: {
    backgroundColor: '#2ECC71',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },

  pressed: { opacity: 0.82 },
});
