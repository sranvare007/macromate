// Settings (PRD §5.5): profile, body & goal editors, computed targets,
// notifications, account actions, replay onboarding.

import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccentAvatar } from '../../components/AccentAvatar';
import { Icon } from '../../components/Icon';
import { AppearanceRow } from '../../features/settings/AppearanceRow';
import { EditValueSheet } from '../../features/settings/EditValueSheet';
import { SectionLabel, SettingsRow, ToggleRow } from '../../features/settings/SettingsRow';
import { GOAL_LABEL } from '../../lib/goals';
import { formatFtIn, kgToLb } from '../../lib/units';
import { profileUpdated, selectProfile, selectTargets, useAppDispatch, useAppSelector } from '../../store';
import { FONTS, useTheme } from '../../theme';

export function SettingsScreen() {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const targets = useAppSelector(selectTargets);
  const [editKind, setEditKind] = React.useState<'weight' | 'height' | null>(null);
  const [notif, setNotif] = React.useState(true);

  const card = { backgroundColor: T.c.card, borderColor: T.c.hair };

  return (
    <View style={[styles.root, { backgroundColor: T.c.bg }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: T.c.text }]}>Settings</Text>

        {/* profile card */}
        <View style={[styles.profileCard, card]}>
          <AccentAvatar letter={profile.name[0]} size={56} accessibilityLabel={`Profile: ${profile.name}`} />
          <View style={styles.profileBody}>
            <Text style={[styles.profileName, { color: T.c.text }]}>{profile.name}</Text>
            <Text style={[styles.profileEmail, { color: T.c.faint }]} numberOfLines={1}>
              {profile.email}
            </Text>
          </View>
          <View style={[styles.streakPill, { backgroundColor: `${T.accent.mid}1F` }]}>
            <Icon name="flame" size={15} color={T.accent.mid} />
            <Text style={[styles.streakCount, { color: T.accent.mid }]}>{profile.streak}</Text>
          </View>
        </View>

        {/* body & goal */}
        <View>
          <SectionLabel>Body & goal</SectionLabel>
          <View style={[styles.card, card]}>
            <SettingsRow
              icon="scale"
              title="Weight"
              detail={`${profile.weightKg % 1 ? profile.weightKg.toFixed(1) : profile.weightKg} kg · ${Math.round(kgToLb(profile.weightKg))} lb`}
              onPress={() => setEditKind('weight')}
            />
            <SettingsRow
              icon="user"
              title="Height"
              detail={`${Math.round(profile.heightCm)} cm · ${formatFtIn(profile.heightCm)}`}
              onPress={() => setEditKind('height')}
            />
            <SettingsRow
              icon="dumbbell"
              title="Goal"
              detail={GOAL_LABEL[profile.goalKey]}
              onPress={() => navigation.navigate('Goal')}
              last
            />
          </View>
        </View>

        {/* daily targets (read-only, auto-refreshed) */}
        <View>
          <View style={styles.targetsLabelRow}>
            <SectionLabel>Daily targets</SectionLabel>
            <Text style={[styles.autoLabel, { color: T.accent.mid }]}>auto-calculated</Text>
          </View>
          <View style={[styles.targetsCard, card]}>
            <View style={styles.targetsKcalRow}>
              <Text style={[styles.targetsKcal, { color: T.c.text }]}>{targets.kcal}</Text>
              <Text style={[styles.targetsKcalUnit, { color: T.c.faint }]}>kcal / day</Text>
            </View>
            <View style={styles.targetsMacros}>
              {(
                [
                  ['Protein', targets.protein, T.macros.protein],
                  ['Carbs', targets.carbs, T.macros.carbs],
                  ['Fat', targets.fat, T.macros.fat],
                  ['Fibre', targets.fibre, T.macros.fibre],
                ] as const
              ).map(([label, value, color]) => (
                <View key={label} style={[styles.targetsMacro, { backgroundColor: T.c.sunken }]}>
                  <Text style={[styles.targetsMacroValue, { color }]}>
                    {value}
                    <Text style={[styles.targetsMacroUnit, { color: T.c.faint }]}>g</Text>
                  </Text>
                  <Text style={[styles.targetsMacroLabel, { color: T.c.faint }]}>{label.toUpperCase()}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.targetsNote, { borderTopColor: T.c.hair }]}>
              <Icon name="sparkle" size={15} color={T.c.faint} />
              <Text style={[styles.targetsNoteText, { color: T.c.faint }]}>
                Recalculated from today when you change weight, height or goal. Past days keep their old targets.
              </Text>
            </View>
          </View>
        </View>

        {/* appearance */}
        <View>
          <SectionLabel>Appearance</SectionLabel>
          <View style={[styles.card, card]}>
            <AppearanceRow />
          </View>
        </View>

        {/* notifications */}
        <View>
          <SectionLabel>Notifications</SectionLabel>
          <View style={[styles.card, card]}>
            <ToggleRow
              icon="clock"
              title="Daily reminder"
              subtitle="Nudge me to log my meals"
              value={notif}
              onChange={setNotif}
            />
            <SettingsRow
              icon="flame"
              title="Reminder time"
              detail={notif ? '8:00 PM' : 'Off'}
              onPress={notif ? () => {} : undefined}
              chevron={notif}
              last
            />
          </View>
        </View>

        {/* account */}
        <View>
          <SectionLabel>Account</SectionLabel>
          <View style={[styles.card, card]}>
            <SettingsRow icon="user" title="Email" detail={profile.email} onPress={() => {}} />
            <SettingsRow icon="keyboard" title="Change password" onPress={() => {}} />
            <SettingsRow icon="leaf" title="Export my data" onPress={() => {}} />
            <SettingsRow icon="arrowUp" title="Log out" onPress={() => {}} />
            <SettingsRow icon="trash" title="Delete account" onPress={() => {}} danger last />
          </View>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Onboarding')}
          accessibilityRole="button"
          accessibilityLabel="Replay onboarding"
          style={[styles.replay, { borderColor: T.c.hairHi }]}
        >
          <Icon name="sparkle" size={17} color={T.c.sub} />
          <Text style={[styles.replayText, { color: T.c.sub }]}>Replay onboarding</Text>
        </Pressable>
        <Text style={[styles.version, { color: T.c.faint }]}>NutriTrack · v1.0.0</Text>
      </ScrollView>

      <EditValueSheet
        open={editKind !== null}
        kind={editKind ?? 'weight'}
        profile={profile}
        onClose={() => setEditKind(null)}
        onSave={(patch) => {
          dispatch(profileUpdated(patch));
          setEditKind(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 130, gap: 22 },
  title: { fontSize: 30, fontFamily: FONTS.black, letterSpacing: -0.4, marginBottom: -8 },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  profileBody: { flex: 1, minWidth: 0 },
  profileName: { fontSize: 19, fontFamily: FONTS.black },
  profileEmail: { fontSize: 13, fontFamily: FONTS.bold },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 99,
  },
  streakCount: { fontSize: 13, fontFamily: FONTS.black, fontVariant: ['tabular-nums'] },
  targetsLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 6 },
  autoLabel: { fontSize: 11, fontFamily: FONTS.bold, paddingBottom: 9 },
  targetsCard: { borderRadius: 20, borderWidth: 1, padding: 16 },
  targetsKcalRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 14 },
  targetsKcal: { fontSize: 32, fontFamily: FONTS.black, fontVariant: ['tabular-nums'] },
  targetsKcalUnit: { fontSize: 14, fontFamily: FONTS.bold },
  targetsMacros: { flexDirection: 'row', gap: 8 },
  targetsMacro: { flex: 1, borderRadius: 13, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center' },
  targetsMacroValue: { fontSize: 17, fontFamily: FONTS.black, fontVariant: ['tabular-nums'] },
  targetsMacroUnit: { fontSize: 11, fontFamily: FONTS.black },
  targetsMacroLabel: { fontSize: 10.5, fontFamily: FONTS.extrabold, letterSpacing: 0.4, marginTop: 1 },
  targetsNote: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 13, paddingTop: 13, borderTopWidth: 1 },
  targetsNoteText: { flex: 1, fontSize: 12, fontFamily: FONTS.semibold, lineHeight: 16 },
  replay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    minHeight: 48,
  },
  replayText: { fontSize: 14, fontFamily: FONTS.extrabold },
  version: { textAlign: 'center', fontSize: 12, fontFamily: FONTS.bold, paddingBottom: 4, marginTop: -10 },
});
