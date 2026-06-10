// Custom floating tab bar with centre FAB, ported from app.jsx BottomNav.
// Tabs: Home · History · [FAB] · Streak (opens sheet) · Settings.

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '../components/Icon';
import { MealTypeSheet } from '../features/meals/MealTypeSheet';
import { StreakSheet } from '../features/streaks/StreakSheet';
import { selectProfile, useAppSelector } from '../store';
import { FONTS, useTheme } from '../theme';
import type { MealType } from '../types';

const TAB_META: Record<string, { icon: IconName; label: string }> = {
  Home: { icon: 'home', label: 'Home' },
  History: { icon: 'chart', label: 'History' },
  Settings: { icon: 'user', label: 'Settings' },
};

export function TabBar({ state, navigation, insets }: BottomTabBarProps) {
  const T = useTheme();
  const profile = useAppSelector(selectProfile);
  const [typeSheetOpen, setTypeSheetOpen] = React.useState(false);
  const [streakOpen, setStreakOpen] = React.useState(false);

  const pickMealType = (mealType: MealType) => {
    setTypeSheetOpen(false);
    // let the sheet's native modal dismiss before presenting the flow modal
    setTimeout(() => navigation.navigate('AddMeal', { mealType }), 300);
  };

  const tabButton = (routeName: string, index: number) => {
    const meta = TAB_META[routeName];
    const focused = state.index === index;
    const color = focused ? T.accent.mid : T.c.faint;
    return (
      <Pressable
        key={routeName}
        onPress={() => navigation.navigate(routeName)}
        accessibilityRole="tab"
        accessibilityLabel={meta.label}
        accessibilityState={{ selected: focused }}
        style={styles.tab}
      >
        <Icon name={meta.icon} size={24} color={color} stroke={focused ? 2.4 : 2} />
        <Text style={[styles.tabLabel, { color }]}>{meta.label}</Text>
      </Pressable>
    );
  };

  return (
    <>
      <View
        style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 16) }]}
        pointerEvents="box-none"
      >
        <View style={[styles.bar, { backgroundColor: T.c.glass, borderColor: T.c.hairHi }]}>
          {tabButton('Home', 0)}
          {tabButton('History', 1)}
          <View style={styles.fabGap} />
          <Pressable
            onPress={() => setStreakOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`Streak: ${profile.streak} days. Opens streak details`}
            style={styles.tab}
          >
            <Icon name="flame" size={24} color={T.c.faint} stroke={2} />
            <Text style={[styles.tabLabel, { color: T.c.faint }]}>Streak</Text>
          </Pressable>
          {tabButton('Settings', 2)}

          {/* FAB */}
          <Pressable
            onPress={() => setTypeSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Add meal"
            style={({ pressed }) => [
              styles.fab,
              {
                backgroundColor: T.accent.mid,
                borderColor: T.c.bg,
                shadowColor: T.accent.mid,
                transform: [{ translateX: -30 }, { scale: pressed ? 0.94 : 1 }],
              },
            ]}
          >
            <Icon name="plus" size={30} color={T.accent.on} stroke={2.6} />
          </Pressable>
        </View>
      </View>

      <MealTypeSheet open={typeSheetOpen} onClose={() => setTypeSheetOpen(false)} onPick={pickMealType} />
      <StreakSheet open={streakOpen} onClose={() => setStreakOpen(false)} streak={profile.streak} />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
  },
  bar: {
    height: 64,
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
    minHeight: 56,
  },
  tabLabel: { fontSize: 10.5, fontFamily: FONTS.extrabold },
  fabGap: { width: 64 },
  fab: {
    position: 'absolute',
    left: '50%',
    top: -18,
    width: 60,
    height: 60,
    borderRadius: 99,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
});
