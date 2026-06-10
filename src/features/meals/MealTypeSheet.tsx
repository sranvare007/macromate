// Meal-type bottom sheet shown on FAB tap (PRD §5.3 step 1).

import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '../../components/Icon';
import { Sheet } from '../../components/Sheet';
import { FONTS, useTheme } from '../../theme';
import type { MealType } from '../../types';

const MEAL_TYPES: { type: MealType; icon: IconName; color: string; hint: string }[] = [
  { type: 'Breakfast', icon: 'egg', color: '#FFB020', hint: 'Start the day' },
  { type: 'Lunch', icon: 'sun', color: '#FF9F45', hint: 'Midday fuel' },
  { type: 'Dinner', icon: 'moon', color: '#A78BFA', hint: 'Evening meal' },
  { type: 'Snack', icon: 'leaf', color: '#2DD4BF', hint: 'Quick bite' },
];

interface MealTypeSheetProps {
  open: boolean;
  onClose: () => void;
  onPick: (type: MealType) => void;
}

export function MealTypeSheet({ open, onClose, onPick }: MealTypeSheetProps) {
  const T = useTheme();
  return (
    <Sheet open={open} onClose={onClose} maxHeightRatio={0.62}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: T.c.text }]}>Log a meal</Text>
        <Text style={[styles.subtitle, { color: T.c.faint }]}>What are you eating?</Text>
        <View style={styles.grid}>
          {MEAL_TYPES.map((m) => (
            <Pressable
              key={m.type}
              onPress={() => onPick(m.type)}
              accessibilityRole="button"
              accessibilityLabel={`Log ${m.type}`}
              style={({ pressed }) => [
                styles.tile,
                {
                  borderColor: T.c.hair,
                  backgroundColor: T.c.cardHi,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View style={[styles.tileIcon, { backgroundColor: `${m.color}22` }]}>
                <Icon name={m.icon} size={24} color={m.color} stroke={2.2} />
              </View>
              <View>
                <Text style={[styles.tileType, { color: T.c.text }]}>{m.type}</Text>
                <Text style={[styles.tileHint, { color: T.c.faint }]}>{m.hint}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 6, paddingHorizontal: 20, paddingBottom: 30 },
  title: { fontSize: 21, fontFamily: FONTS.black, marginBottom: 3 },
  subtitle: { fontSize: 14, fontFamily: FONTS.bold, marginBottom: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  tileIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tileType: { fontSize: 16, fontFamily: FONTS.black },
  tileHint: { fontSize: 12.5, fontFamily: FONTS.bold },
});
