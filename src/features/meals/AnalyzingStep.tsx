// Loading state while the LLM parses the meal (PRD: design for 3–4 s latency).

import * as React from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { FONTS, useTheme } from '../../theme';

const STEPS = ['Reading your description', 'Identifying food items', 'Estimating portions', 'Calculating macros'];

function Spinner() {
  const T = useTheme();
  const spin = React.useRef(new Animated.Value(0)).current;
  const pulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true }),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    spinLoop.start();
    pulseLoop.start();
    return () => {
      spinLoop.stop();
      pulseLoop.stop();
    };
  }, [spin, pulse]);

  return (
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
      <Animated.View
        style={[
          styles.spinnerCore,
          {
            backgroundColor: T.accent.mid,
            shadowColor: T.accent.mid,
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] }) }],
          },
        ]}
      >
        <Icon name="sparkle" size={50} color={T.accent.on} />
      </Animated.View>
    </View>
  );
}

export function AnalyzingStep({ rawText }: { rawText: string }) {
  const T = useTheme();
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 480);
    return () => clearInterval(id);
  }, []);

  return (
    <View
      style={[styles.root, { backgroundColor: T.c.bg }]}
      accessible
      accessibilityLabel={`Analysing your meal. ${STEPS[step]}`}
    >
      <Spinner />
      <Text style={[styles.title, { color: T.c.text }]}>Analysing your meal</Text>
      <Text style={[styles.raw, { color: T.c.faint }]} numberOfLines={3}>
        “{rawText}”
      </Text>
      <View style={styles.steps}>
        {STEPS.map((s, i) => (
          <View key={s} style={[styles.stepRow, { opacity: i <= step ? 1 : 0.4 }]}>
            <View
              style={[
                styles.stepDot,
                { backgroundColor: i < step ? T.status.ok : i === step ? T.accent.mid : T.c.sunken },
              ]}
            >
              {i < step ? (
                <Icon name="check" size={15} color="#fff" stroke={3} />
              ) : (
                <View
                  style={[
                    styles.stepInner,
                    { backgroundColor: i === step ? '#fff' : T.c.faint, width: i === step ? 9 : 7, height: i === step ? 9 : 7 },
                  ]}
                />
              )}
            </View>
            <Text style={[styles.stepLabel, { color: i <= step ? T.c.text : T.c.faint }]}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  spinnerWrap: { width: 130, height: 130, marginBottom: 30 },
  spinnerRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 99,
    borderWidth: 3,
  },
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
  title: { fontSize: 22, fontFamily: FONTS.black, marginBottom: 6 },
  raw: {
    fontSize: 14,
    fontFamily: FONTS.boldItalic,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 21,
    marginBottom: 26,
  },
  steps: { gap: 11, width: '100%', maxWidth: 280 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  stepDot: { width: 24, height: 24, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  stepInner: { borderRadius: 99 },
  stepLabel: { fontSize: 14.5, fontFamily: FONTS.extrabold },
});
