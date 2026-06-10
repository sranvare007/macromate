// Expandable meal card for the home log (home.jsx).

import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { FONTS, useTheme, type Theme } from '../../theme';
import type { Meal, MealItem, MealType } from '../../types';

export function mealTypeColor(type: MealType, T: Theme): string {
  switch (type) {
    case 'Breakfast':
      return T.macros.carbs;
    case 'Lunch':
      return T.accent.mid;
    case 'Dinner':
      return T.macros.fat;
    case 'Snack':
      return T.macros.fibre;
  }
}

function ItemRow({ item }: { item: MealItem }) {
  const T = useTheme();
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemBody}>
        <Text style={[styles.itemName, { color: T.c.text }]}>{item.name}</Text>
        <Text style={[styles.itemQty, { color: T.c.faint }]}>{item.qty}</Text>
      </View>
      <View style={styles.itemMacros}>
        <Text style={[styles.itemMacro, { color: T.macros.protein }]}>
          {item.protein}
          <Text style={{ color: T.c.faint, fontFamily: FONTS.semibold }}>p</Text>
        </Text>
        <Text style={[styles.itemMacro, { color: T.macros.carbs }]}>
          {item.carbs}
          <Text style={{ color: T.c.faint, fontFamily: FONTS.semibold }}>c</Text>
        </Text>
        <Text style={[styles.itemMacro, { color: T.macros.fat }]}>
          {item.fat}
          <Text style={{ color: T.c.faint, fontFamily: FONTS.semibold }}>f</Text>
        </Text>
      </View>
      <Text style={[styles.itemKcal, { color: T.c.text }]}>{item.kcal}</Text>
    </View>
  );
}

export function MealCard({ meal }: { meal: Meal }) {
  const T = useTheme();
  const [open, setOpen] = React.useState(false);
  const dot = mealTypeColor(meal.type, T);
  return (
    <View style={[styles.card, { backgroundColor: T.c.card, borderColor: T.c.hair }]}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={`${meal.type} at ${meal.time}, ${meal.kcal} calories. ${open ? 'Collapse' : 'Expand'} item list`}
        style={styles.header}
      >
        <View style={[styles.typeBox, { backgroundColor: `${dot}22` }]}>
          <View style={[styles.typeDot, { backgroundColor: dot }]} />
        </View>
        <View style={styles.headerBody}>
          <View style={styles.headerTitleRow}>
            <Text style={[styles.type, { color: T.c.text }]}>{meal.type}</Text>
            <Text style={[styles.time, { color: T.c.faint }]}>{meal.time}</Text>
          </View>
          <Text style={[styles.summary, { color: T.c.sub }]} numberOfLines={1}>
            {meal.items.map((i) => i.name).join(' · ')}
          </Text>
        </View>
        <View style={styles.kcalCol}>
          <Text style={[styles.kcal, { color: T.c.text }]}>{meal.kcal}</Text>
          <Text style={[styles.kcalUnit, { color: T.c.faint }]}>kcal</Text>
        </View>
        <Icon
          name="chevD"
          size={18}
          color={T.c.faint}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {open && (
        <View style={styles.items}>
          <View style={[styles.divider, { backgroundColor: T.c.hair }]} />
          {meal.items.map((it, i) => (
            <ItemRow key={i} item={it} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 26, borderWidth: 1, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  typeBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  typeDot: { width: 12, height: 12, borderRadius: 99 },
  headerBody: { flex: 1, minWidth: 0 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  type: { fontSize: 16, fontFamily: FONTS.extrabold },
  time: { fontSize: 12.5, fontFamily: FONTS.bold },
  summary: { fontSize: 13, fontFamily: FONTS.semibold, marginTop: 1 },
  kcalCol: { alignItems: 'flex-end' },
  kcal: { fontSize: 16, fontFamily: FONTS.black, fontVariant: ['tabular-nums'] },
  kcalUnit: { fontSize: 11, fontFamily: FONTS.bold },
  items: { paddingHorizontal: 16, paddingBottom: 14 },
  divider: { height: 1, marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  itemBody: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 14, fontFamily: FONTS.bold },
  itemQty: { fontSize: 12, fontFamily: FONTS.semibold },
  itemMacros: { flexDirection: 'row', gap: 10 },
  itemMacro: { fontSize: 12, fontFamily: FONTS.extrabold, fontVariant: ['tabular-nums'] },
  itemKcal: { fontSize: 13.5, fontFamily: FONTS.extrabold, width: 54, textAlign: 'right', fontVariant: ['tabular-nums'] },
});
