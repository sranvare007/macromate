// Review & confirm parsed items: adjust quantity, delete, save (PRD §5.3 step 4).

import * as React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ParsedItem } from '../../api/types';
import { AccentButton } from '../../components/AccentButton';
import { FlowHeader } from '../../components/FlowHeader';
import { Icon } from '../../components/Icon';
import { FONTS, useTheme } from '../../theme';
import type { MacroSet, MealItem, MealType } from '../../types';

const LOW_CONFIDENCE = 0.88;

interface ReviewItem extends ParsedItem {
  mult: number;
}

interface ReviewStepProps {
  mealType: MealType;
  parsedItems: ParsedItem[];
  onClose: () => void;
  onSave: (items: MealItem[], totals: MacroSet) => void;
}

function scaled(it: ReviewItem): MacroSet {
  return {
    kcal: Math.round(it.calories * it.mult),
    protein: Math.round(it.protein_g * it.mult),
    carbs: Math.round(it.carbs_g * it.mult),
    fat: Math.round(it.fat_g * it.mult),
    fibre: Math.round(it.fibre_g * it.mult),
  };
}

export function ReviewStep({ mealType, parsedItems, onClose, onSave }: ReviewStepProps) {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = React.useState<ReviewItem[]>(parsedItems.map((it) => ({ ...it, mult: 1 })));

  const totals = items.reduce<MacroSet>(
    (a, it) => {
      const s = scaled(it);
      return {
        kcal: a.kcal + s.kcal,
        protein: a.protein + s.protein,
        carbs: a.carbs + s.carbs,
        fat: a.fat + s.fat,
        fibre: a.fibre + s.fibre,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 },
  );

  const setMult = (index: number, delta: number) =>
    setItems((arr) =>
      arr.map((it, j) => (j === index ? { ...it, mult: Math.max(0.25, +(it.mult + delta).toFixed(2)) } : it)),
    );
  const remove = (index: number) => setItems((arr) => arr.filter((_, j) => j !== index));

  const formatQty = (it: ReviewItem) => (it.unit ? `${it.portion_size} · ${it.unit}` : it.portion_size);

  const save = () => {
    const mealItems: MealItem[] = items.map((it) => ({
      name: it.food_name,
      qty: formatQty(it),
      ...scaled(it),
    }));
    onSave(mealItems, totals);
  };

  const macroPill = (label: string, value: number, color: string) => (
    <View style={styles.totalPill} key={label}>
      <Text style={[styles.totalPillValue, { color }]}>
        {value}
        <Text style={[styles.totalPillUnit, { color: T.c.faint }]}>g</Text>
      </Text>
      <Text style={[styles.totalPillLabel, { color: T.c.faint }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: T.c.bg }]}>
      <FlowHeader title="Review & confirm" subtitle={`${mealType} · AI parsed ${items.length} items`} onClose={onClose} />
      <FlatList
        data={items}
        keyExtractor={(it, index) => `${it.food_name}-${index}`}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={[styles.hint, { backgroundColor: `${T.accent.mid}1A`, borderColor: `${T.accent.mid}40` }]}>
            <Icon name="sparkle" size={18} color={T.accent.mid} />
            <Text style={[styles.hintText, { color: T.c.sub }]}>
              Tweak quantities or remove items, then save.
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 11 }} />}
        renderItem={({ item: it, index: i }) => {
          const s = scaled(it);
          return (
            <View style={[styles.itemCard, { backgroundColor: T.c.card, borderColor: T.c.hair }]}>
              <View style={styles.itemTop}>
                <View style={styles.itemBody}>
                  <Text style={[styles.itemName, { color: T.c.text }]}>{it.food_name}</Text>
                  <Text style={[styles.itemQty, { color: T.c.faint }]}>{formatQty(it)}</Text>
                  {it.confidence_score < LOW_CONFIDENCE && (
                    <View style={[styles.lowConf, { backgroundColor: `${T.status.warn}22` }]}>
                      <View style={[styles.lowConfDot, { backgroundColor: T.status.warn }]} />
                      <Text style={[styles.lowConfText, { color: T.status.warn }]}>Low confidence · check</Text>
                    </View>
                  )}
                </View>
                <Pressable
                  onPress={() => remove(i)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${it.food_name}`}
                  style={[styles.deleteBtn, { backgroundColor: T.c.sunken }]}
                >
                  <Icon name="trash" size={17} color={T.c.faint} />
                </Pressable>
              </View>
              <View style={styles.itemBottom}>
                <View style={[styles.stepper, { backgroundColor: T.c.sunken }]}>
                  <Pressable
                    onPress={() => setMult(i, -0.25)}
                    accessibilityRole="button"
                    accessibilityLabel={`Decrease ${it.food_name} quantity`}
                    style={styles.stepperBtn}
                  >
                    <Text style={[styles.stepperSign, { color: T.c.sub }]}>−</Text>
                  </Pressable>
                  <Text style={[styles.stepperValue, { color: T.c.text }]}>{it.mult}×</Text>
                  <Pressable
                    onPress={() => setMult(i, 0.25)}
                    accessibilityRole="button"
                    accessibilityLabel={`Increase ${it.food_name} quantity`}
                    style={styles.stepperBtn}
                  >
                    <Text style={[styles.stepperSign, { color: T.c.sub }]}>+</Text>
                  </Pressable>
                </View>
                <View style={styles.itemMacros}>
                  <Text style={[styles.itemMacro, { color: T.macros.protein }]}>
                    {s.protein}
                    <Text style={{ color: T.c.faint, fontFamily: FONTS.semibold }}>p</Text>
                  </Text>
                  <Text style={[styles.itemMacro, { color: T.macros.carbs }]}>
                    {s.carbs}
                    <Text style={{ color: T.c.faint, fontFamily: FONTS.semibold }}>c</Text>
                  </Text>
                  <Text style={[styles.itemMacro, { color: T.macros.fat }]}>
                    {s.fat}
                    <Text style={{ color: T.c.faint, fontFamily: FONTS.semibold }}>f</Text>
                  </Text>
                  <Text style={[styles.itemKcal, { color: T.c.text }]}>{s.kcal}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      <View
        style={[
          styles.footer,
          {
            backgroundColor: T.c.surface,
            borderTopColor: T.c.hair,
            paddingBottom: Math.max(insets.bottom, 12) + 8,
          },
        ]}
      >
        <View style={styles.totalsRow}>
          <View style={styles.totalKcal}>
            <Text style={[styles.totalLabel, { color: T.c.faint }]}>MEAL TOTAL</Text>
            <Text style={[styles.totalValue, { color: T.c.text }]}>
              {totals.kcal} <Text style={[styles.totalUnit, { color: T.c.faint }]}>kcal</Text>
            </Text>
          </View>
          <View style={styles.totalPills}>
            {macroPill('PROTEIN', totals.protein, T.macros.protein)}
            {macroPill('CARBS', totals.carbs, T.macros.carbs)}
            {macroPill('FAT', totals.fat, T.macros.fat)}
            {macroPill('FIBRE', totals.fibre, T.macros.fibre)}
          </View>
        </View>
        <AccentButton icon="check" onPress={save} disabled={items.length === 0}>
          Looks good — Save meal
        </AccentButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingHorizontal: 18, paddingTop: 4, paddingBottom: 16 },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  hintText: { flex: 1, fontSize: 13, fontFamily: FONTS.bold, lineHeight: 18 },
  itemCard: { borderRadius: 20, borderWidth: 1, padding: 14 },
  itemTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  itemBody: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 15.5, fontFamily: FONTS.extrabold },
  itemQty: { fontSize: 12.5, fontFamily: FONTS.bold, marginTop: 1 },
  lowConf: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    marginTop: 7,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  lowConfDot: { width: 6, height: 6, borderRadius: 99 },
  lowConfText: { fontSize: 11, fontFamily: FONTS.extrabold },
  deleteBtn: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  itemBottom: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: 11, padding: 3 },
  stepperBtn: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  stepperSign: { fontSize: 20, fontFamily: FONTS.black },
  stepperValue: { minWidth: 38, textAlign: 'center', fontSize: 14, fontFamily: FONTS.black, fontVariant: ['tabular-nums'] },
  itemMacros: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 13 },
  itemMacro: { fontSize: 13, fontFamily: FONTS.extrabold, fontVariant: ['tabular-nums'] },
  itemKcal: { fontSize: 14, fontFamily: FONTS.black, minWidth: 44, textAlign: 'right', fontVariant: ['tabular-nums'] },
  footer: { paddingTop: 14, paddingHorizontal: 18, borderTopWidth: 1 },
  totalsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 13 },
  totalKcal: { flex: 1 },
  totalLabel: { fontSize: 11, fontFamily: FONTS.extrabold, letterSpacing: 0.5 },
  totalValue: { fontSize: 26, fontFamily: FONTS.black, fontVariant: ['tabular-nums'] },
  totalUnit: { fontSize: 15, fontFamily: FONTS.bold },
  totalPills: { flex: 1.4, flexDirection: 'row', gap: 4 },
  totalPill: { flex: 1, alignItems: 'center' },
  totalPillValue: { fontSize: 17, fontFamily: FONTS.black, fontVariant: ['tabular-nums'] },
  totalPillUnit: { fontSize: 11, fontFamily: FONTS.black },
  totalPillLabel: { fontSize: 10.5, fontFamily: FONTS.extrabold, letterSpacing: 0.5 },
});
