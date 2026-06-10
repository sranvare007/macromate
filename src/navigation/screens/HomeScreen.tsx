// Home dashboard (PRD §5.2): macro ring hero, streak banner, today's meals.

import * as React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccentAvatar } from '../../components/AccentAvatar';
import { MacroMini } from '../../components/MacroIndicators';
import { Ring } from '../../components/Ring';
import { MealCard } from '../../features/meals/MealCard';
import { StreakBanner } from '../../features/streaks/StreakBanner';
import { StreakSheet } from '../../features/streaks/StreakSheet';
import { greeting } from '../../lib/dates';
import { sumMeals } from '../../lib/macros';
import { selectProfile, selectTargets, selectTodayMeals, useAppSelector } from '../../store';
import { FONTS, statusFor, useTheme, type MacroKey } from '../../theme';

const MACROS_META: { key: MacroKey; label: string }[] = [
  { key: 'protein', label: 'Protein' },
  { key: 'carbs', label: 'Carbs' },
  { key: 'fat', label: 'Fat' },
  { key: 'fibre', label: 'Fibre' },
];

function HeroRing() {
  const T = useTheme();
  const meals = useAppSelector(selectTodayMeals);
  const targets = useAppSelector(selectTargets);
  const consumed = sumMeals(meals);
  const remaining = Math.max(0, targets.kcal - consumed.kcal);
  const ratio = consumed.kcal / targets.kcal;
  const over = statusFor(ratio, T);
  return (
    <View style={[styles.heroCard, { backgroundColor: T.c.card, borderColor: T.c.hair }]}>
      <View style={styles.heroRingWrap}>
        <Ring
          size={224}
          stroke={20}
          value={consumed.kcal}
          max={targets.kcal}
          color={over ?? T.accent.hi}
          track={T.c.sunken}
          glow
          accessibilityLabel={`Calories: ${consumed.kcal} of ${targets.kcal}. ${remaining} remaining`}
        >
          <Text style={[styles.heroLabel, { color: T.c.sub }]}>REMAINING</Text>
          <Text style={[styles.heroValue, { color: T.c.text }]}>{remaining}</Text>
          <Text style={[styles.heroTarget, { color: T.c.faint }]}>of {targets.kcal} kcal</Text>
          <View style={[styles.eatenPill, { backgroundColor: T.c.sunken }]}>
            <Text style={[styles.eatenValue, { color: over ?? T.accent.mid }]}>{consumed.kcal}</Text>
            <Text style={[styles.eatenLabel, { color: T.c.faint }]}>eaten</Text>
          </View>
        </Ring>
      </View>
      <View style={styles.miniRow}>
        {MACROS_META.map((m, i) => (
          <MacroMini
            key={m.key}
            label={m.label}
            value={consumed[m.key]}
            max={targets[m.key]}
            color={T.macros[m.key]}
            delay={250 + i * 120}
          />
        ))}
      </View>
    </View>
  );
}

export function HomeScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useAppSelector(selectProfile);
  const meals = useAppSelector(selectTodayMeals);
  const [streakOpen, setStreakOpen] = React.useState(false);

  return (
    <View style={[styles.root, { backgroundColor: T.c.bg }]}>
      <FlatList
        data={meals}
        keyExtractor={(m) => m.id}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        ItemSeparatorComponent={() => <View style={{ height: 11 }} />}
        renderItem={({ item }) => <MealCard meal={item} />}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.greetRow}>
              <View>
                <Text style={[styles.greet, { color: T.c.faint }]}>{greeting()},</Text>
                <Text style={[styles.name, { color: T.c.text }]}>{profile.name}</Text>
              </View>
              <AccentAvatar letter={profile.name[0]} size={46} accessibilityLabel={`Profile: ${profile.name}`} />
            </View>

            <StreakBanner streak={profile.streak} onPress={() => setStreakOpen(true)} />
            <HeroRing />

            <View style={styles.mealsHeader}>
              <Text style={[styles.mealsTitle, { color: T.c.text }]}>Today's meals</Text>
              <Text style={[styles.mealsCount, { color: T.c.faint }]}>{meals.length} logged</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.empty, { backgroundColor: T.c.card, borderColor: T.c.hair }]}>
            <Text style={[styles.emptyTitle, { color: T.c.text }]}>No meals yet</Text>
            <Text style={[styles.emptyText, { color: T.c.faint }]}>
              Tap + and tell us what you ate — AI does the rest.
            </Text>
          </View>
        }
      />
      <StreakSheet open={streakOpen} onClose={() => setStreakOpen(false)} streak={profile.streak} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 130 },
  headerBlock: { gap: 16, marginBottom: 16 },
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  greet: { fontSize: 13.5, fontFamily: FONTS.bold },
  name: { fontSize: 26, fontFamily: FONTS.black, letterSpacing: -0.3 },
  heroCard: {
    borderRadius: 26,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroRingWrap: { alignItems: 'center' },
  heroLabel: { fontSize: 13, fontFamily: FONTS.extrabold, letterSpacing: 1 },
  heroValue: { fontSize: 52, fontFamily: FONTS.black, lineHeight: 56, marginTop: 2, fontVariant: ['tabular-nums'] },
  heroTarget: { fontSize: 14, fontFamily: FONTS.bold },
  eatenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 11,
    borderRadius: 99,
    marginTop: 8,
  },
  eatenValue: { fontSize: 13, fontFamily: FONTS.extrabold, fontVariant: ['tabular-nums'] },
  eatenLabel: { fontSize: 12, fontFamily: FONTS.bold },
  miniRow: { flexDirection: 'row', gap: 6, marginTop: 22, width: '100%' },
  mealsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: -5,
  },
  mealsTitle: { fontSize: 18, fontFamily: FONTS.black },
  mealsCount: { fontSize: 13, fontFamily: FONTS.extrabold, fontVariant: ['tabular-nums'] },
  empty: { borderRadius: 26, borderWidth: 1, padding: 24, alignItems: 'center', gap: 6 },
  emptyTitle: { fontSize: 16, fontFamily: FONTS.black },
  emptyText: { fontSize: 13.5, fontFamily: FONTS.semibold, textAlign: 'center' },
});
