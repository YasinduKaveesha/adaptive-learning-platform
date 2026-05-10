import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { RADIUS } from '../../../constants/theme';

interface Props {
  seconds?: number;
  itemKey: string;
  onExpire?: () => void;
}

export default function CountdownTimer({ seconds = 45, itemKey, onExpire }: Props) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const barAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Reset when question changes
  useEffect(() => {
    setTimeLeft(seconds);
    barAnim.setValue(1);
    pulseAnim.setValue(1);
    pulseLoop.current?.stop();
  }, [itemKey]);

  // Tick every second
  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    Animated.timing(barAnim, {
      toValue: (timeLeft - 1) / seconds,
      duration: 950,
      useNativeDriver: false,
    }).start();
    return () => clearTimeout(t);
  }, [timeLeft]);

  // Pulse loop for last 10 seconds
  useEffect(() => {
    if (timeLeft === 10) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 400, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    }
    if (timeLeft <= 0) {
      pulseLoop.current?.stop();
    }
  }, [timeLeft === 10, timeLeft <= 0]);

  const isWarning = timeLeft <= 20 && timeLeft > 10;
  const isDanger = timeLeft <= 10;

  const barColor = isDanger ? '#FF4B4B' : isWarning ? '#FF9600' : '#58CC6C';
  const bgColor = isDanger ? '#FFF0F0' : isWarning ? '#FFF3E0' : '#F0FBF1';
  const textColor = isDanger ? '#C62828' : isWarning ? '#E65100' : '#2E7D32';
  const emoji = isDanger ? '🔴' : isWarning ? '🟠' : '🟢';

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor, transform: [{ scale: isDanger ? pulseAnim : 1 }] },
      ]}
    >
      <Text style={[styles.timeText, { color: textColor }]}>
        {emoji} {timeLeft}s
      </Text>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: RADIUS.round,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignSelf: 'stretch',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '800',
    minWidth: 44,
    fontFamily: 'Poppins_700Bold',
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.round,
  },
});
