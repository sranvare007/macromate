// Circular progress ring with animated sweep, ported from ui.jsx.
// Exposes its value to screen readers per the PRD accessibility requirements.

import * as React from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, FeGaussianBlur, Filter } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RingProps {
  size?: number;
  stroke?: number;
  value?: number;
  max?: number;
  color?: string;
  track?: string;
  glow?: boolean;
  startDelay?: number;
  accessibilityLabel?: string;
  children?: React.ReactNode;
}

// Extra canvas around the ring so the glow blur isn't clipped at the edges.
const GLOW_PAD = 28;

export function Ring({
  size = 200,
  stroke = 18,
  value = 0,
  max = 100,
  color = '#A3E635',
  track = 'rgba(255,255,255,0.08)',
  glow = false,
  startDelay = 0,
  accessibilityLabel,
  children,
}: RingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const shown = Math.min(1, Math.max(0, max ? value / max : 0));
  const progress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(progress, {
      toValue: shown,
      duration: 1100,
      delay: startDelay,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: false, // SVG props can't use the native driver
    }).start();
  }, [shown, startDelay, progress]);

  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circ, 0],
  });

  // With glow, the SVG canvas is padded and hangs over the layout box so the
  // blurred copy of the arc (the design's drop-shadow) can bleed outwards.
  const pad = glow ? GLOW_PAD : 0;
  const svgSize = size + pad * 2;
  const center = svgSize / 2;

  const arcProps = {
    cx: center,
    cy: center,
    r,
    fill: 'none',
    strokeLinecap: 'round',
    strokeDasharray: `${circ} ${circ}`,
    strokeDashoffset: dashOffset,
  } as const;

  return (
    <View
      style={{ width: size, height: size }}
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'progressbar' : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      <Svg
        width={svgSize}
        height={svgSize}
        style={{ position: 'absolute', top: -pad, left: -pad, transform: [{ rotate: '-90deg' }] }}
      >
        {glow && (
          <Filter id="ringGlow" x="-40%" y="-40%" width="180%" height="180%">
            <FeGaussianBlur in="SourceGraphic" stdDeviation={9} />
          </Filter>
        )}
        <Circle cx={center} cy={center} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        {glow && (
          <AnimatedCircle
            {...arcProps}
            stroke={color}
            strokeOpacity={0.7}
            strokeWidth={stroke + 4}
            filter="url(#ringGlow)"
          />
        )}
        <AnimatedCircle {...arcProps} stroke={color} strokeWidth={stroke} />
      </Svg>
      <View style={styles.center} pointerEvents="box-none">
        {children}
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
