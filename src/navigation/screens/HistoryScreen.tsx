// History screen (PRD §5.4): macro filter chips, trend chart, range selector,
// daily log list. Tapping a day opens the read-only DayDetail screen.

import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { PressableCard } from '../../components/PressableCard';
import { MACRO_FILTERS, TrendChart } from '../../features/history/TrendChart';
import { selectHistory, selectTargets, useAppSelector } from '../../store';
import { FONTS, useTheme } from '../../theme';
import type { DaySummary, MacroSet } from '../../types';

const RANGES = [
  { v: 7, label: '7 days' },
  { v: 30, label: '30 days' },
  { v: 90, label: '90 days' },
];

function macroColor(key: keyof MacroSet, T: ReturnType<typeof useTheme>): string {
  return key === 'kcal' ? T.accent.mid : T.macros[key];
}

function DayRow({ day, onPress }: { day: DaySummary; onPress: () => void }) {
  const T = useTheme();
  const title = day.d === 0 ? 'Today' : day.d === 1 ? 'Yesterday' : day.dow;
  return (
    <PressableCard
      onPress={onPress}
      accessibilityLabel={`${title} ${day.day} ${day.month}, ${day.kcal} calories, targets ${day.met ? 'met' : 'missed'}. Opens day detail`}
      style={styles.dayCard}
    >
      <View style={styles.dayRow}>
        <View style={[styles.dateBox, { backgroundColor: T.c.sunken }]}>
          <Text style={[styles.dateDay, { color: T.c.text }]}>{day.day}</Text>
          <Text style={[styles.dateMonth, { color: T.c.faint }]}>{day.month.toUpperCase()}</Text>
        </View>
        <View style={styles.dayBody}>
          <View style={styles.dayTitleRow}>
            <Text style={[styles.dayTitle, { color: T.c.text }]}>{title}</Text>
            <Text style={[styles.dayKcal, { color: T.c.text }]}>
              {day.kcal}
              <Text style={[styles.dayKcalUnit, { color: T.c.faint }]}> kcal</Text>
            </Text>
          </View>
          <View style={styles.dayMacros}>
            {(
              [
                ['p', day.protein, T.macros.protein],
                ['c', day.carbs, T.macros.carbs],
                ['f', day.fat, T.macros.fat],
                ['fb', day.fibre, T.macros.fibre],
              ] as const
            ).map(([l, v, c]) => (
              <Text key={l} style={[styles.dayMacro, { color: c }]}>
                {v}
                <Text style={{ color: T.c.faint, fontFamily: FONTS.semibold }}>{l}</Text>
              </Text>
            ))}
          </View>
        </View>
        <View
          style={[styles.metBadge, { backgroundColor: day.met ? `${T.status.ok}22` : `${T.c.faint}22` }]}
        >
          <Icon name={day.met ? 'check' : 'close'} size={15} color={day.met ? T.status.ok : T.c.faint} stroke={3} />
        </View>
      </View>
    </PressableCard>
  );
}

export function HistoryScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const history = useAppSelector(selectHistory);
  const targets = useAppSelector(selectTargets);
  const [macroKey, setMacroKey] = React.useState<keyof MacroSet>('kcal');
  const [range, setRange] = React.useState(7);

  const macro = MACRO_FILTERS.find((m) => m.key === macroKey) ?? MACRO_FILTERS[0];
  const slice = history.slice(0, range);
  const daysAsc = [...slice].reverse();
  const metCount = slice.filter((d) => d.met).length;
  const color = macroColor(macro.key, T);

  return (
    <View style={[styles.root, { backgroundColor: T.c.bg }]}>
      <FlatList
        data={slice}
        keyExtractor={(d) => d.key}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        ItemSeparatorComponent={() => <View style={{ height: 9 }} />}
        renderItem={({ item }) => (
          <DayRow day={item} onPress={() => navigation.navigate('DayDetail', { dateKey: item.key })} />
        )}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View>
              <Text style={[styles.title, { color: T.c.text }]}>History</Text>
              <Text style={[styles.subtitle, { color: T.c.faint }]}>
                <Text style={{ color: T.status.ok }}>{metCount}</Text> of {slice.length} days on target
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {MACRO_FILTERS.map((m) => {
                const active = m.key === macroKey;
                const c = macroColor(m.key, T);
                return (
                  <Pressable
                    key={m.key}
                    onPress={() => setMacroKey(m.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Show ${m.label} trend`}
                    style={[
                      styles.chip,
                      {
                        borderColor: active ? c : T.c.hair,
                        backgroundColor: active ? `${c}22` : T.c.card,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? c : T.c.sub }]}>{m.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={[styles.chartCard, { backgroundColor: T.c.card, borderColor: T.c.hair }]}>
              <TrendChart days={daysAsc} macro={macro} target={targets[macro.key]} color={color} />
            </View>

            <View style={styles.ranges}>
              {RANGES.map((r) => {
                const active = range === r.v;
                return (
                  <Pressable
                    key={r.v}
                    onPress={() => setRange(r.v)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Show last ${r.label}`}
                    style={[
                      styles.rangeBtn,
                      {
                        borderColor: active ? T.accent.mid : T.c.hair,
                        backgroundColor: active ? `${T.accent.mid}1F` : T.c.card,
                      },
                    ]}
                  >
                    <Text style={[styles.rangeText, { color: active ? T.accent.mid : T.c.sub }]}>{r.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.listHeader}>
              <Text style={[styles.listTitle, { color: T.c.text }]}>Daily log</Text>
              <Text style={[styles.listCount, { color: T.c.faint }]}>{slice.length} days</Text>
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 130 },
  headerBlock: { gap: 14, marginBottom: 14 },
  title: { fontSize: 30, fontFamily: FONTS.black, letterSpacing: -0.4 },
  subtitle: { fontSize: 13.5, fontFamily: FONTS.bold, marginTop: 1 },
  chips: { gap: 8, paddingBottom: 2 },
  chip: { borderWidth: 1, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, minHeight: 36, justifyContent: 'center' },
  chipText: { fontSize: 13.5, fontFamily: FONTS.extrabold },
  chartCard: { borderRadius: 26, borderWidth: 1, paddingVertical: 18, paddingHorizontal: 18 },
  ranges: { flexDirection: 'row', gap: 8 },
  rangeBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  rangeText: { fontSize: 13.5, fontFamily: FONTS.extrabold },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: -5,
  },
  listTitle: { fontSize: 18, fontFamily: FONTS.black },
  listCount: { fontSize: 13, fontFamily: FONTS.extrabold, fontVariant: ['tabular-nums'] },
  dayCard: { paddingVertical: 13, paddingHorizontal: 15, borderRadius: 22 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dateDay: { fontSize: 16, fontFamily: FONTS.black, lineHeight: 18, fontVariant: ['tabular-nums'] },
  dateMonth: { fontSize: 9.5, fontFamily: FONTS.extrabold },
  dayBody: { flex: 1, minWidth: 0 },
  dayTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayTitle: { fontSize: 14.5, fontFamily: FONTS.extrabold },
  dayKcal: { fontSize: 15, fontFamily: FONTS.black, fontVariant: ['tabular-nums'] },
  dayKcalUnit: { fontSize: 11, fontFamily: FONTS.bold },
  dayMacros: { flexDirection: 'row', gap: 13, marginTop: 3 },
  dayMacro: { fontSize: 11.5, fontFamily: FONTS.extrabold, fontVariant: ['tabular-nums'] },
  metBadge: { width: 26, height: 26, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
});
