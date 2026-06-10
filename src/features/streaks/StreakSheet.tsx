// Streak detail sheet: flame, count, milestone badges, confetti (home.jsx).

import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Confetti } from '../../components/Confetti';
import { Flame } from '../../components/Flame';
import { Icon } from '../../components/Icon';
import { Sheet } from '../../components/Sheet';
import { FONTS, useTheme } from '../../theme';
import { MILESTONES, nextMilestone } from './milestones';

export function StreakSheet({ open, onClose, streak }: { open: boolean; onClose: () => void; streak: number }) {
  const T = useTheme();
  const next = nextMilestone(streak);

  return (
    <Sheet open={open} onClose={onClose} maxHeightRatio={0.8}>
      <View>
        {open && <Confetti colors={['#FF8A3D', '#FFD24D', '#FF4D4D', T.accent.hi]} />}
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.flameCircle, { backgroundColor: T.dark ? '#331608' : '#FFE9DC' }]}>
            <Flame size={52} />
          </View>
          <Text style={[styles.count, { color: T.c.text }]}>{streak}</Text>
          <Text style={[styles.countSub, { color: T.c.sub }]}>day streak 🔥 keep it going</Text>
          <Text style={[styles.rule, { color: T.c.faint }]}>
            Hit all four macro targets within ±10% before midnight to extend your streak.
          </Text>

          <View style={styles.list}>
            {MILESTONES.map((m) => {
              const done = streak >= m.d;
              const isNext = next?.d === m.d;
              return (
                <View
                  key={m.d}
                  accessible
                  accessibilityLabel={`${m.name} badge, ${m.d}-day streak, ${done ? 'earned' : isNext ? `${m.d - streak} days to go` : 'locked'}`}
                  style={[
                    styles.badgeRow,
                    {
                      backgroundColor: isNext ? T.c.cardHi : T.c.sunken,
                      borderColor: isNext ? `${T.accent.mid}66` : T.c.hair,
                      opacity: done || isNext ? 1 : 0.55,
                    },
                  ]}
                >
                  <View style={[styles.badgeIcon, { backgroundColor: `${m.color}26` }]}>
                    <Icon name="star" size={20} color={m.color} stroke={2} />
                  </View>
                  <View style={styles.badgeBody}>
                    <Text style={[styles.badgeName, { color: T.c.text }]}>{m.name} Badge</Text>
                    <Text style={[styles.badgeDays, { color: T.c.faint }]}>{m.d}-day streak</Text>
                  </View>
                  {done ? (
                    <View style={[styles.doneCheck, { backgroundColor: T.status.ok }]}>
                      <Icon name="check" size={16} color="#fff" stroke={3} />
                    </View>
                  ) : isNext ? (
                    <Text style={[styles.toGo, { color: T.accent.mid }]}>{m.d - streak} to go</Text>
                  ) : (
                    <Text style={[styles.locked, { color: T.c.faint }]}>Locked</Text>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 22, paddingBottom: 30, alignItems: 'center' },
  flameCircle: {
    width: 96,
    height: 96,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  count: { fontSize: 46, fontFamily: FONTS.black, lineHeight: 50, fontVariant: ['tabular-nums'] },
  countSub: { fontSize: 15, fontFamily: FONTS.extrabold, marginBottom: 4 },
  rule: { fontSize: 13.5, fontFamily: FONTS.semibold, textAlign: 'center', maxWidth: 280, lineHeight: 20 },
  list: { width: '100%', marginTop: 22, gap: 10 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  badgeIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badgeBody: { flex: 1 },
  badgeName: { fontSize: 15, fontFamily: FONTS.extrabold },
  badgeDays: { fontSize: 12.5, fontFamily: FONTS.bold, fontVariant: ['tabular-nums'] },
  doneCheck: { width: 26, height: 26, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  toGo: { fontSize: 13, fontFamily: FONTS.extrabold, fontVariant: ['tabular-nums'] },
  locked: { fontSize: 12.5, fontFamily: FONTS.bold },
});
