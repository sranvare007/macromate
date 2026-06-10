// Live voice waveform driven by speech-recognition volume metering.

import * as React from 'react';
import { StyleSheet, View } from 'react-native';

const MIN_BAR_HEIGHT = 6;
const MAX_BAR_HEIGHT = 28;

interface WaveformProps {
  active: boolean;
  color: string;
  levels: number[];
}

export function Waveform({ active, color, levels }: WaveformProps) {
  const peak = levels.length > 0 ? Math.max(...levels) : 0;
  const accessibilityLabel = active
    ? peak > 0.05
      ? 'Recording in progress, audio detected'
      : 'Recording in progress, waiting for audio'
    : 'Microphone idle';

  return (
    <View style={styles.clip} accessible accessibilityLabel={accessibilityLabel}>
      <View style={styles.row}>
      {levels.map((level, i) => {
        const height = active
          ? MIN_BAR_HEIGHT + level * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT)
          : MIN_BAR_HEIGHT;

        return (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height,
                backgroundColor: color,
                opacity: active ? 0.45 + level * 0.55 : 0.4,
              },
            ]}
          />
        );
      })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 32,
    width: '100%',
  },
  bar: { flex: 1, maxWidth: 4, minWidth: 1.5, borderRadius: 99 },
});
