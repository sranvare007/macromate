// Settings list row + toggle, ported from settings.jsx.

import * as React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Icon, type IconName } from '../../components/Icon';
import { FONTS, useTheme } from '../../theme';

interface SettingsRowProps {
  icon?: IconName;
  title: string;
  detail?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
  chevron?: boolean;
}

export function SettingsRow({ icon, title, detail, onPress, danger, last, chevron = true }: SettingsRowProps) {
  const T = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={detail ? `${title}: ${detail}` : title}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: T.c.hair, borderBottomWidth: last ? 0 : 1, backgroundColor: pressed ? T.c.cardHi : 'transparent' },
      ]}
    >
      {icon && (
        <View style={[styles.iconBox, { backgroundColor: T.c.sunken }]}>
          <Icon name={icon} size={18} color={danger ? T.status.over : T.c.text} stroke={2.2} />
        </View>
      )}
      <Text style={[styles.title, { color: danger ? T.status.over : T.c.text }]}>{title}</Text>
      {detail ? <Text style={[styles.detail, { color: T.c.faint }]}>{detail}</Text> : null}
      {chevron && onPress ? <Icon name="chevR" size={16} color={T.c.faint} /> : null}
    </Pressable>
  );
}

interface ToggleRowProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}

export function ToggleRow({ icon, title, subtitle, value, onChange, last }: ToggleRowProps) {
  const T = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: T.c.hair, borderBottomWidth: last ? 0 : 1 }]}>
      <View style={[styles.iconBox, { backgroundColor: T.c.sunken }]}>
        <Icon name={icon} size={18} color={T.c.text} stroke={2.2} />
      </View>
      <View style={styles.toggleBody}>
        <Text style={[styles.title, { color: T.c.text, flex: 0 }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: T.c.faint }]}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: T.accent.mid, false: T.c.sunken }}
        thumbColor="#fff"
        accessibilityLabel={title}
      />
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  const T = useTheme();
  return <Text style={[styles.section, { color: T.c.faint }]}>{children.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 15,
    minHeight: 52,
  },
  iconBox: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 15.5, fontFamily: FONTS.bold },
  detail: { fontSize: 14.5, fontFamily: FONTS.bold, fontVariant: ['tabular-nums'] },
  toggleBody: { flex: 1 },
  subtitle: { fontSize: 12.5, fontFamily: FONTS.semibold },
  section: { fontSize: 12, fontFamily: FONTS.extrabold, letterSpacing: 1, paddingHorizontal: 6, paddingBottom: 9 },
});
