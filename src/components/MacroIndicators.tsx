// Small macro ring (home secondary row) and linear macro bar (day detail).

import * as React from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { FONTS, statusFor, useTheme } from '../theme';
import { Ring } from './Ring';

interface MacroProps {
  label: string;
  value: number;
  max: number;
  color: string;
  unit?: string;
  delay?: number;
}

export function MacroMini({ label, value, max, color, unit = 'g', delay = 0 }: MacroProps) {
  const T = useTheme();
  const ratio = max ? value / max : 0;
  const over = statusFor(ratio, T);
  const c = over ?? color;
  return (
    <View style={styles.miniWrap}>
      <Ring
        size={58}
        stroke={6}
        value={value}
        max={max}
        color={c}
        track={T.c.sunken}
        startDelay={delay}
        accessibilityLabel={`${label}: ${Math.round(value)} of ${max} ${unit}`}
      >
        <Text style={[styles.miniValue, { color: T.c.text }]}>{Math.round(value)}</Text>
      </Ring>
      <View style={styles.miniLabels}>
        <Text style={[styles.miniLabel, { color: T.c.text }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.miniSub, { color: over ?? T.c.faint }]} numberOfLines={1}>
          {Math.round(value)}/{max}
          {unit}
        </Text>
      </View>
    </View>
  );
}

export function LinearMacro({ label, value, max, color, unit = 'g', delay = 0 }: MacroProps) {
  const T = useTheme();
  const ratio = max ? value / max : 0;
  const over = statusFor(ratio, T);
  const c = over ?? color;
  const width = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(width, {
      toValue: Math.min(1, ratio),
      duration: 1000,
      delay,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: false,
    }).start();
  }, [ratio, delay, width]);

  return (
    <View
      style={styles.linearWrap}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${label}: ${Math.round(value)} of ${max} ${unit}`}
    >
      <View style={styles.linearHeader}>
        <Text style={[styles.linearLabel, { color: T.c.text }]}>{label}</Text>
        <Text style={[styles.linearValue, { color: T.c.sub }]}>
          <Text style={{ color: over ?? T.c.text }}>{Math.round(value)}</Text>
          <Text style={{ color: T.c.faint }}>
            {' '}
            / {max}
            {unit}
          </Text>
        </Text>
      </View>
      <View style={[styles.linearTrack, { backgroundColor: T.c.sunken }]}>
        <Animated.View
          style={[
            styles.linearFill,
            {
              backgroundColor: c,
              width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  miniWrap: { flex: 1, alignItems: 'center', gap: 7 },
  miniValue: { fontSize: 14, fontFamily: FONTS.extrabold, fontVariant: ['tabular-nums'] },
  miniLabels: { alignItems: 'center' },
  miniLabel: { fontSize: 12, fontFamily: FONTS.extrabold, letterSpacing: 0.2 },
  miniSub: { fontSize: 11, fontFamily: FONTS.bold, fontVariant: ['tabular-nums'] },
  linearWrap: { gap: 7 },
  linearHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  linearLabel: { fontSize: 13.5, fontFamily: FONTS.extrabold },
  linearValue: { fontSize: 13, fontFamily: FONTS.bold, fontVariant: ['tabular-nums'] },
  linearTrack: { height: 9, borderRadius: 99, overflow: 'hidden' },
  linearFill: { height: '100%', borderRadius: 99 },
});
