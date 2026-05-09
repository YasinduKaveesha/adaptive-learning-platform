import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Asset } from 'expo-asset';
import React, { useEffect, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { ANIMATIONS, COLORS, RADIUS, SPACING } from '../constants/theme';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const [showNameForm, setShowNameForm] = useState(false);
  const [name, setName] = useState('');
  const fadeInAnim = React.useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();

  const bgImageUri = require('../../assets/bg-fit.png');
  const frameAspectRatio = 188 / 396;
  const frameWidth = Math.min(width - SPACING.md * 2, height * frameAspectRatio, 420);
  const frameHeight = frameWidth / frameAspectRatio;

  useEffect(() => {
    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: ANIMATIONS.normal,
      useNativeDriver: true,
    }).start();
    // Preload GameIntro + Game1 screen assets in the background
    Asset.loadAsync([
      require('../../assets/gamebg.png'),
      require('../../assets/quest1.png'),
    ]);
  }, [fadeInAnim]);

  const handleStart = () => {
    setShowNameForm(true);
  };

  const handleLetsGo = () => {
    const studentId = `demo_${Date.now()}`;
    navigation.navigate('Screening', {
      studentId,
      language: 'english',
      studentName: name.trim() || 'Student',
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.fullScreen, { opacity: fadeInAnim }]}>
        <Image source={bgImageUri} style={styles.backgroundImage} resizeMode="cover" />
        <View style={styles.artwork}>
          <View style={styles.heroCopy}>
            <Text style={styles.title}>
              Let's <Text style={styles.titleAccent}>learn</Text>
              {'\n'}and grow{'\n'}together!
            </Text>
            <Text style={styles.subtitle}>Fun cognitive activities that understand you and help you improve.</Text>
          </View>

          <View style={styles.actions}>
            {showNameForm ? (
              <>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Enter your name"
                  placeholderTextColor={COLORS.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
                <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]} onPress={handleLetsGo}>
                  <Text style={styles.primaryButtonText}>Let's go!</Text>
                </Pressable>
              </>
            ) : (
              <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]} onPress={handleStart}>
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fullScreen: {
    flex: 1,
  },
  artwork: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: '25%',
    paddingBottom: SPACING.xl,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  backgroundImage: {
    bottom: 0,
    height: '100%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
  heroCopy: {
    width: '78%',
  },
  title: {
    color: '#152219',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 31,
  },
  titleAccent: {
    color: '#179221',
  },
  subtitle: {
    color: '#1F2F27',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 14,
    marginTop: 10,
  },
  actions: {
    gap: 12,
    width: '100%',
  },
  nameInput: {
    backgroundColor: COLORS.surface,
    borderColor: 'rgba(21, 34, 25, 0.12)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    minHeight: 56,
    paddingHorizontal: 18,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#47BE20',
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '900',
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
