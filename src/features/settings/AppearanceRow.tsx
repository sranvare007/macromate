// Theme mode selector (Light / Dark / System) for the Settings screen,
// styled after the design's segmented unit toggles.

import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '../../components/Icon';
import { FONTS, useTheme, useThemeMode, type ThemeMode } from '../../theme';

const OPTIONS: { value: ThemeMode; label: string; icon: IconName }[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'sparkle' },
];

export function AppearanceRow() {
  const T = useTheme();
  const { mode, setMode } = useThemeMode();
  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: T.c.sunken }]}>
        <Icon name={mode === 'light' ? 'sun' : 'moon'} size={18} color={T.c.text} stroke={2.2} />
      </View>
      <Text style={[styles.title, { color: T.c.text }]}>Theme</Text>
      <View style={[styles.segmented, { backgroundColor: T.c.sunken }]} accessibilityRole="radiogroup">
        {OPTIONS.map((o) => {
          const selected = mode === o.value;
          return (
            <Pressable
              key={o.value}
              onPress={() => setMode(o.value)}
              accessibilityRole="radio"
              accessibilityLabel={`${o.label} theme`}
              accessibilityState={{ selected }}
              style={[styles.segment, selected && { backgroundColor: T.c.card }]}
            >
              <Icon name={o.icon} size={14} color={selected ? T.accent.mid : T.c.faint} stroke={2.2} />
              <Text style={[styles.segmentText, { color: selected ? T.c.text : T.c.faint }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 15,
    minHeight: 52,
  },
  iconBox: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 15.5, fontFamily: FONTS.bold },
  segmented: { flexDirection: 'row', gap: 3, padding: 3, borderRadius: 11 },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
    minHeight: 38,
  },
  segmentText: { fontSize: 12.5, fontFamily: FONTS.extrabold },
});
