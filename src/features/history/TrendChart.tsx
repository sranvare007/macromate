// Macro trend bar chart with target reference line (history.jsx / PRD §5.4).

import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FONTS, useTheme } from '../../theme';
import type { DaySummary, MacroSet } from '../../types';

export interface MacroFilter {
  key: keyof MacroSet;
  label: string;
  unit: string;
}

export const MACRO_FILTERS: MacroFilter[] = [
  { key: 'kcal', label: 'Calories', unit: '' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'fibre', label: 'Fibre', unit: 'g' },
];

interface TrendChartProps {
  days: DaySummary[]; // oldest → newest
  macro: MacroFilter;
  target: number;
  color: string;
}

const CHART_HEIGHT = 168;

export function TrendChart({ days, macro, target, color }: TrendChartProps) {
  const T = useTheme();
  const vals = days.map((d) => d[macro.key]);
  const max = Math.max(target, ...vals) * 1.18;
  const targetPct = (target / max) * 100;
  const n = days.length;
  const gap = n <= 7 ? 8 : n <= 30 ? 3 : 1.5;
  const labelEvery = n <= 7 ? 1 : n <= 30 ? 5 : 15;
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / Math.max(1, n));

  return (
    <View
      accessible
      accessibilityLabel={`${macro.label} trend: average ${avg}${macro.unit} over ${n} days, target ${target}${macro.unit}`}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.avg, { color: T.c.text }]}>
            {avg}
            <Text style={[styles.avgUnit, { color: T.c.faint }]}>{macro.unit} avg</Text>
          </Text>
          <Text style={[styles.range, { color: T.c.faint }]}>over {n} days</Text>
        </View>
        <View style={styles.legend}>
          <View style={[styles.legendDash, { borderColor: T.c.faint }]} />
          <Text style={[styles.legendText, { color: T.c.sub }]}>
            Target {target}
            {macro.unit}
          </Text>
        </View>
      </View>

      <View style={styles.chart}>
        <View style={[styles.targetLine, { bottom: `${targetPct}%`, borderColor: T.c.hairHi }]} />
        {days.map((d, i) => {
          const h = Math.max(2, (d[macro.key] / max) * 100);
          return (
            <View key={i} style={[styles.barSlot, { marginLeft: i === 0 ? 0 : gap }]}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${h}%`,
                    backgroundColor: color,
                    opacity: d.met ? 1 : 0.42,
                    borderTopLeftRadius: n <= 30 ? 5 : 2,
                    borderTopRightRadius: n <= 30 ? 5 : 2,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.labels}>
        {days.map((d, i) => (
          <View key={i} style={[styles.labelSlot, { marginLeft: i === 0 ? 0 : gap }]}>
            {i % labelEvery === 0 && (
              <Text style={[styles.label, { color: T.c.faint }]} numberOfLines={1}>
                {d.day}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  avg: { fontSize: 30, fontFamily: FONTS.black, lineHeight: 33, fontVariant: ['tabular-nums'] },
  avgUnit: { fontSize: 15, fontFamily: FONTS.bold },
  range: { fontSize: 12.5, fontFamily: FONTS.bold, marginTop: 3 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDash: { width: 18, borderTopWidth: 2, borderStyle: 'dashed' },
  legendText: { fontSize: 12.5, fontFamily: FONTS.extrabold, fontVariant: ['tabular-nums'] },
  chart: {
    height: CHART_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 4,
  },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    zIndex: 2,
  },
  barSlot: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%' },
  labels: { flexDirection: 'row', marginTop: 8 },
  labelSlot: { flex: 1, alignItems: 'center' },
  label: { fontSize: 10.5, fontFamily: FONTS.bold, fontVariant: ['tabular-nums'] },
});
