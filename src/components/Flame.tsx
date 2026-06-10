// Streak flame with gradient fill and gentle wobble, ported from ui.jsx.

import * as React from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export function Flame({ size = 22, animate = true }: { size?: number; animate?: boolean }) {
  const wobble = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!animate) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animate, wobble]);

  const rotate = wobble.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] });
  const scale = wobble.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.06, 1] });

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ rotate }, { scale }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="flameGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFD24D" />
            <Stop offset="0.5" stopColor="#FF8A3D" />
            <Stop offset="1" stopColor="#FF4D4D" />
          </LinearGradient>
        </Defs>
        <Path
          d="M12 2c.8 3.5-2.4 4.6-2.4 8a3.4 3.4 0 0 0 1 2.4c.3-1 .9-1.7 1.8-2.2-.4 1.6.6 2.2.6 3.4a1.5 1.5 0 0 1-3 .2c-1.2 3.6 1.4 6 3.4 6 2.6 0 5-2.1 5-5.2C18.4 9.4 12.8 7.5 12 2Z"
          fill="url(#flameGradient)"
        />
      </Svg>
    </Animated.View>
  );
}
