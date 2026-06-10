// Animated "crunching the numbers" body for the calculating step.

import * as React from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { FONTS, useTheme } from '../../theme';

export function CalculatingBody({ lines }: { lines: string[] }) {
  const T = useTheme();
  const [step, setStep] = React.useState(0);
  const spin = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(lines.length - 1, s + 1)), 480);
    return () => clearInterval(id);
  }, [lines.length]);

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  return (
    <View style={styles.root} accessible accessibilityLabel={`Calculating targets. ${lines[step]}`}>
      <View style={styles.spinnerWrap}>
        <Animated.View
          style={[
            styles.spinnerRing,
            {
              borderColor: T.c.hair,
              borderTopColor: T.accent.hi,
              transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
            },
          ]}
        />
        <View style={[styles.spinnerCore, { backgroundColor: T.accent.mid, shadowColor: T.accent.mid }]}>
          <Icon name="sparkle" size={50} color={T.accent.on} />
        </View>
      </View>
      <Text style={[styles.title, { color: T.c.text }]}>Crunching the numbers…</Text>
      <View style={styles.lines}>
        {lines.map((l, i) => (
          <View key={l} style={[styles.lineRow, { opacity: i <= step ? 1 : 0.4 }]}>
            <View
              style={[
                styles.lineDot,
                { backgroundColor: i < step ? T.status.ok : i === step ? T.accent.mid : T.c.sunken },
              ]}
            >
              {i < step ? (
                <Icon name="check" size={15} color="#fff" stroke={3} />
              ) : (
                <View
                  style={{
                    width: i === step ? 9 : 7,
                    height: i === step ? 9 : 7,
                    borderRadius: 99,
                    backgroundColor: i === step ? '#fff' : T.c.faint,
                  }}
                />
              )}
            </View>
            <Text style={[styles.lineLabel, { color: i <= step ? T.c.text : T.c.faint }]}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  spinnerWrap: { width: 130, height: 130, marginBottom: 30 },
  spinnerRing: { ...StyleSheet.absoluteFillObject, borderRadius: 99, borderWidth: 3 },
  spinnerCore: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    bottom: 14,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  title: { fontSize: 22, fontFamily: FONTS.black, marginBottom: 22 },
  lines: { gap: 11, width: '100%', maxWidth: 260 },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  lineDot: { width: 24, height: 24, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  lineLabel: { fontSize: 14.5, fontFamily: FONTS.extrabold },
});
