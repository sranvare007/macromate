// Goal selection modal (PRD §5.5) — same four options as onboarding;
// saving recalculates targets prospectively.

import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccentButton } from '../../components/AccentButton';
import { FlowHeader } from '../../components/FlowHeader';
import { GoalCardList } from '../../features/goals/GoalCardList';
import { profileUpdated, selectProfile, useAppDispatch, useAppSelector } from '../../store';
import { useTheme } from '../../theme';
import type { GoalKey } from '../../types';

export function GoalScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const [selected, setSelected] = React.useState<GoalKey>(profile.goalKey);

  const save = () => {
    dispatch(profileUpdated({ goalKey: selected }));
    navigation.goBack();
  };

  return (
    <View style={[styles.root, { backgroundColor: T.c.bg }]}>
      <FlowHeader title="Your goal" subtitle="Targets recalculate from today" onClose={() => navigation.goBack()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <GoalCardList selected={selected} onSelect={setSelected} />
      </ScrollView>
      <View
        style={[
          styles.footer,
          { borderTopColor: T.c.hair, backgroundColor: T.c.bg, paddingBottom: Math.max(insets.bottom, 14) + 12 },
        ]}
      >
        <AccentButton icon="check" onPress={save}>
          Update goal
        </AccentButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 4, paddingBottom: 16 },
  footer: { paddingTop: 12, paddingHorizontal: 18, borderTopWidth: 1 },
});
