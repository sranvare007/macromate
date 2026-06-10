// Initial-letter avatar with the design's gradient fill and soft glow
// (linear-gradient 135° hi→deep + drop-shadow in the prototype). Drawn with
// SVG so the gradient and bloom render identically on iOS and Android.

import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, FeGaussianBlur, Filter, LinearGradient, Stop } from 'react-native-svg';
import { FONTS, useTheme } from '../theme';

// Extra canvas around the circle so the glow blur isn't clipped.
const GLOW_PAD = 24;

interface AccentAvatarProps {
  letter: string;
  size?: number;
  accessibilityLabel?: string;
}

export function AccentAvatar({ letter, size = 46, accessibilityLabel }: AccentAvatarProps) {
  const T = useTheme();
  const svgSize = size + GLOW_PAD * 2;
  const center = svgSize / 2;
  const r = size / 2;

  return (
    <View
      style={{ width: size, height: size }}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    >
      <Svg
        width={svgSize}
        height={svgSize}
        style={{ position: 'absolute', top: -GLOW_PAD, left: -GLOW_PAD }}
      >
        <Defs>
          <LinearGradient id="avatarGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={T.accent.hi} />
            <Stop offset="1" stopColor={T.accent.deep} />
          </LinearGradient>
        </Defs>
        <Filter id="avatarGlow" x="-60%" y="-60%" width="220%" height="220%">
          <FeGaussianBlur in="SourceGraphic" stdDeviation={8} />
        </Filter>
        <Circle cx={center} cy={center} r={r} fill={T.accent.mid} opacity={0.65} filter="url(#avatarGlow)" />
        <Circle cx={center} cy={center} r={r} fill="url(#avatarGradient)" />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={{ color: T.accent.on, fontFamily: FONTS.black, fontSize: size * 0.42 }}>{letter}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
