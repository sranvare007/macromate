// Stacked goal cards (default variant from goal.jsx), shared by onboarding
// and the Settings goal screen.

import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { GOAL_ICON, GOALS } from '../../lib/goals';
import { FONTS, useTheme } from '../../theme';
import type { GoalKey } from '../../types';

interface GoalCardListProps {
  selected: GoalKey;
  onSelect: (key: GoalKey) => void;
  showMacroTags?: boolean;
}

export function GoalCardList({ selected, onSelect, showMacroTags = true }: GoalCardListProps) {
  const T = useTheme();
  return (
    <View style={styles.list}>
      {GOALS.map((goal) => {
        const on = goal.key === selected;
        return (
          <Pressable
            key={goal.key}
            onPress={() => onSelect(goal.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${goal.title}. ${goal.blurb}`}
            style={[
              styles.card,
              {
                borderColor: on ? T.accent.mid : T.c.hair,
                backgroundColor: on ? `${T.accent.mid}1A` : T.c.card,
              },
            ]}
          >
            <View
              style={[styles.iconBox, { backgroundColor: on ? T.accent.mid : T.c.sunken }]}
            >
              <Icon name={GOAL_ICON[goal.key]} size={26} color={on ? T.accent.on : T.c.sub} stroke={2.2} />
            </View>
            <View style={styles.body}>
              <Text style={[styles.title, { color: T.c.text }]}>{goal.title}</Text>
              <Text style={[styles.blurb, { color: T.c.sub }]}>{goal.blurb}</Text>
              {showMacroTags && (
                <View style={styles.tags}>
                  <View style={[styles.tag, { backgroundColor: `${T.accent.mid}1F` }]}>
                    <Text style={[styles.tagText, { color: T.accent.mid }]}>{goal.delta}</Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: `${T.macros.protein}1F` }]}>
                    <Text style={[styles.tagText, { color: T.macros.protein }]}>{goal.protein} protein</Text>
                  </View>
                </View>
              )}
            </View>
            <View
              style={[
                styles.radio,
                { borderColor: on ? T.accent.mid : T.c.hairHi, backgroundColor: on ? T.accent.mid : 'transparent' },
              ]}
            >
              {on && <Icon name="check" size={15} color={T.accent.on} stroke={3} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 2,
    borderRadius: 22,
    padding: 16,
  },
  iconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 16.5, fontFamily: FONTS.black },
  blurb: { fontSize: 13, fontFamily: FONTS.semibold, marginTop: 2, lineHeight: 18 },
  tags: { flexDirection: 'row', gap: 8, marginTop: 8 },
  tag: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 7 },
  tagText: { fontSize: 11.5, fontFamily: FONTS.extrabold, fontVariant: ['tabular-nums'] },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 99,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
