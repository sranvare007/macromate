// Falling confetti burst for streak milestones, ported from ui.jsx.

import * as React from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

interface Bit {
  left: number; // percent
  delay: number;
  duration: number;
  color: string;
  w: number;
  h: number;
  rotate: string;
}

function ConfettiBit({ bit }: { bit: Bit }) {
  const fall = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fall, {
      toValue: 1,
      duration: bit.duration,
      delay: bit.delay,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fall, bit]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -14,
        left: `${bit.left}%`,
        width: bit.w,
        height: bit.h,
        borderRadius: 2,
        backgroundColor: bit.color,
        opacity: fall.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
        transform: [
          { translateY: fall.interpolate({ inputRange: [0, 1], outputRange: [0, 220] }) },
          { rotate: bit.rotate },
        ],
      }}
    />
  );
}

export function Confetti({ colors }: { colors: string[] }) {
  const bits = React.useMemo<Bit[]>(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 400,
        duration: 900 + Math.random() * 700,
        color: colors[i % colors.length],
        w: 5 + Math.random() * 5,
        h: 8 + Math.random() * 8,
        rotate: `${Math.round(Math.random() * 360)}deg`,
      })),
    // burst once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
      {bits.map((b, i) => (
        <ConfettiBit key={i} bit={b} />
      ))}
    </Animated.View>
  );
}
