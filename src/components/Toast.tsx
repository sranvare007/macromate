// Confirmation toast pinned above the tab bar, ported from app.jsx.

import * as React from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { FONTS, useTheme } from '../theme';
import { Icon } from './Icon';

export function Toast({ message }: { message: string | null }) {
  const T = useTheme();
  const rise = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!message) return;
    rise.setValue(0);
    Animated.timing(rise, {
      toValue: 1,
      duration: 350,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();
  }, [message, rise]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.wrap,
        {
          opacity: rise,
          transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        },
      ]}
    >
      <View style={[styles.pill, { backgroundColor: T.dark ? '#1C2A49' : '#0E1626', borderColor: T.c.hairHi }]}>
        <View style={[styles.check, { backgroundColor: T.accent.hi }]}>
          <Icon name="check" size={14} color={T.accent.on} stroke={3} />
        </View>
        <Text style={styles.text} numberOfLines={1}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 120,
    alignItems: 'center',
    zIndex: 85,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 99,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 14.5, fontFamily: FONTS.extrabold, color: '#fff' },
});
