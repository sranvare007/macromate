// Read-only day detail (PRD §5.4): macros vs targets + collapsible meal sections.

import type { StaticScreenProps } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FlowHeader } from '../../components/FlowHeader';
import { Icon } from '../../components/Icon';
import { LinearMacro } from '../../components/MacroIndicators';
import { mealTypeColor } from '../../features/meals/MealCard';
import { sumMeals } from '../../lib/macros';
import { selectHistory, selectTargets, useAppSelector } from '../../store';
import { FONTS, useTheme } from '../../theme';
import type { Meal, MealType } from '../../types';

type Props = StaticScreenProps<{ dateKey: string }>;

const MEAL_ORDER: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function DaySection({ meal, defaultOpen }: { meal: Meal; defaultOpen: boolean }) {
  const T = useTheme();
  const [open, setOpen] = React.useState(defaultOpen);
  const dot = mealTypeColor(meal.type, T);
  return (
    <View style={[styles.section, { backgroundColor: T.c.card, borderColor: T.c.hair }]}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={`${meal.type} at ${meal.time}, ${meal.kcal} calories. ${open ? 'Collapse' : 'Expand'}`}
        style={styles.sectionHeader}
      >
        <View style={[styles.dot, { backgroundColor: dot }]} />
        <Text style={[styles.sectionType, { color: T.c.text }]}>{meal.type}</Text>
        <Text style={[styles.sectionTime, { color: T.c.faint }]}>{meal.time}</Text>
        <View style={{ flex: 1 }} />
        <Text style={[styles.sectionKcal, { color: T.c.text }]}>
          {meal.kcal}
          <Text style={[styles.sectionKcalUnit, { color: T.c.faint }]}> kcal</Text>
        </Text>
        <Icon
          name="chevD"
          size={17}
          color={T.c.faint}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {open && (
        <View style={styles.sectionItems}>
          <View style={[styles.divider, { backgroundColor: T.c.hair }]} />
          {meal.items.map((it, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.itemBody}>
                <Text style={[styles.itemName, { color: T.c.text }]}>{it.name}</Text>
                <Text style={[styles.itemQty, { color: T.c.faint }]}>{it.qty}</Text>
              </View>
              <View style={styles.itemMacros}>
                <Text style={[styles.itemMacro, { color: T.macros.protein }]}>{it.protein}p</Text>
                <Text style={[styles.itemMacro, { color: T.macros.carbs }]}>{it.carbs}c</Text>
                <Text style={[styles.itemMacro, { color: T.macros.fat }]}>{it.fat}f</Text>
              </View>
              <Text style={[styles.itemKcal, { color: T.c.text }]}>{it.kcal}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function DayDetailScreen({ route }: Props) {
  const T = useTheme();
  const navigation = useNavigation();
  const history = useAppSelector(selectHistory);
  const targets = useAppSelector(selectTargets);
  const day = history.find((d) => d.key === route.params.dateKey);

  if (!day) {
    return (
      <View style={[styles.root, { backgroundColor: T.c.bg }]}>
        <FlowHeader title="Day not found" onClose={() => navigation.goBack()} />
      </View>
    );
  }

  const meals = [...day.meals].sort((a, b) => MEAL_ORDER.indexOf(a.type) - MEAL_ORDER.indexOf(b.type));
  const totals = sumMeals(meals);

  return (
    <View style={[styles.root, { backgroundColor: T.c.bg }]}>
      <FlowHeader
        title={day.d === 0 ? 'Today' : day.label}
        subtitle={`${meals.length} meals · ${totals.kcal} kcal`}
        onClose={() => navigation.goBack()}
        right={
          <View
            style={[styles.metBadge, { backgroundColor: day.met ? `${T.status.ok}22` : `${T.c.faint}22` }]}
            accessible
            accessibilityLabel={`Targets ${day.met ? 'met' : 'missed'}`}
          >
            <Icon name={day.met ? 'check' : 'close'} size={18} color={day.met ? T.status.ok : T.c.faint} stroke={3} />
          </View>
        }
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={[styles.summaryCard, { backgroundColor: T.c.card, borderColor: T.c.hair }]}>
          <LinearMacro label="Calories" value={totals.kcal} max={targets.kcal} color={T.accent.hi} unit="" />
          <LinearMacro label="Protein" value={totals.protein} max={targets.protein} color={T.macros.protein} />
          <LinearMacro label="Carbs" value={totals.carbs} max={targets.carbs} color={T.macros.carbs} />
          <LinearMacro label="Fat" value={totals.fat} max={targets.fat} color={T.macros.fat} />
          <LinearMacro label="Fibre" value={totals.fibre} max={targets.fibre} color={T.macros.fibre} />
        </View>

        <Text style={[styles.mealsLabel, { color: T.c.faint }]}>MEALS</Text>
        <View style={styles.sections}>
          {meals.map((m, i) => (
            <DaySection key={`${m.type}-${i}`} meal={m} defaultOpen={i === 0} />
          ))}
        </View>

        <View style={styles.readOnly}>
          <Icon name="clock" size={15} color={T.c.faint} />
          <Text style={[styles.readOnlyText, { color: T.c.faint }]}>Historical days are read-only</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 4, paddingBottom: 24 },
  metBadge: { width: 34, height: 34, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 13, marginBottom: 14 },
  mealsLabel: { fontSize: 12.5, fontFamily: FONTS.extrabold, letterSpacing: 1, marginHorizontal: 4, marginBottom: 10, marginTop: 4 },
  sections: { gap: 10 },
  section: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  dot: { width: 10, height: 10, borderRadius: 99 },
  sectionType: { fontSize: 15.5, fontFamily: FONTS.extrabold },
  sectionTime: { fontSize: 12.5, fontFamily: FONTS.bold },
  sectionKcal: { fontSize: 15, fontFamily: FONTS.black, fontVariant: ['tabular-nums'] },
  sectionKcalUnit: { fontSize: 11, fontFamily: FONTS.bold },
  sectionItems: { paddingHorizontal: 15, paddingBottom: 12 },
  divider: { height: 1, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  itemBody: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 13.5, fontFamily: FONTS.bold },
  itemQty: { fontSize: 11.5, fontFamily: FONTS.semibold },
  itemMacros: { flexDirection: 'row', gap: 9 },
  itemMacro: { fontSize: 11.5, fontFamily: FONTS.extrabold, fontVariant: ['tabular-nums'] },
  itemKcal: { fontSize: 13, fontFamily: FONTS.extrabold, width: 46, textAlign: 'right', fontVariant: ['tabular-nums'] },
  readOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 14,
    paddingVertical: 8,
  },
  readOnlyText: { fontSize: 12.5, fontFamily: FONTS.bold },
});
