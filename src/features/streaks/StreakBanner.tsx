// Persistent streak banner on the home screen (PRD §5.2).

import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Flame } from '../../components/Flame';
import { Icon } from '../../components/Icon';
import { PressableCard } from '../../components/PressableCard';
import { FONTS, useTheme } from '../../theme';
import { nextMilestone } from './milestones';

export function StreakBanner({ streak, onPress }: { streak: number; onPress: () => void }) {
  const T = useTheme();
  const next = nextMilestone(streak);
  const pct = next ? Math.min(100, ((streak - next.prev) / (next.d - next.prev)) * 100) : 100;
  const titleColor = T.dark ? '#FFCB8A' : '#C2410C';
  const subColor = T.dark ? '#E8A766' : '#EA580C';

  return (
    <PressableCard
      onPress={onPress}
      accessibilityLabel={`${streak} day streak. ${next ? `${next.d - streak} days to ${next.name} badge` : 'All badges earned'}. Opens streak details`}
      style={[
        styles.card,
        {
          backgroundColor: T.dark ? '#2F1810' : '#FFF0E2',
          borderColor: T.dark ? 'rgba(255,140,60,0.28)' : 'rgba(251,146,60,0.4)',
        },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.flameBox, { backgroundColor: T.dark ? 'rgba(255,140,60,0.18)' : '#fff' }]}>
          <Flame size={24} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.title, { color: titleColor }]}>{streak}-day streak</Text>
          <Text style={[styles.sub, { color: subColor }]}>
            {next ? `${next.d - streak} days to ${next.name} badge` : 'All badges earned!'}
          </Text>
          <View
            style={[
              styles.track,
              { backgroundColor: T.dark ? 'rgba(255,255,255,0.1)' : 'rgba(234,88,12,0.18)' },
            ]}
          >
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
        </View>
        <Icon name="chevR" size={18} color={subColor} />
      </View>
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 13, paddingHorizontal: 15, borderRadius: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flameBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  title: { fontSize: 19, fontFamily: FONTS.black, fontVariant: ['tabular-nums'] },
  sub: { fontSize: 12.5, fontFamily: FONTS.bold, marginTop: 1 },
  track: { height: 6, borderRadius: 99, marginTop: 7, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 99, backgroundColor: '#FF6B45' },
});
