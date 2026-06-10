// Live voice waveform (simulated levels), ported from addmeal.jsx.

import * as React from 'react';
import { StyleSheet, View } from 'react-native';

interface WaveformProps {
  active: boolean;
  color: string;
  bars?: number;
}

export function Waveform({ active, color, bars = 24 }: WaveformProps) {
  const [, force] = React.useReducer((x: number) => x + 1, 0);

  React.useEffect(() => {
    if (!active) return;
    const id = setInterval(force, 110);
    return () => clearInterval(id);
  }, [active]);

  return (
    <View style={styles.row} accessible accessibilityLabel={active ? 'Recording in progress' : 'Microphone idle'}>
      {Array.from({ length: bars }, (_, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            {
              height: active ? 10 + Math.random() * 28 : 6,
              backgroundColor: color,
              opacity: active ? 1 : 0.4,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 42,
  },
  bar: { width: 3.5, borderRadius: 99 },
});
