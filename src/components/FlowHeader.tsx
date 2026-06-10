// Modal flow header (close button + title), ported from addmeal.jsx.

import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS, useTheme } from '../theme';
import { Icon } from './Icon';

interface FlowHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  right?: React.ReactNode;
}

export function FlowHeader({ title, subtitle, onClose, right }: FlowHeaderProps) {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.row, { paddingTop: insets.top + 8 }]}>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={[styles.closeBtn, { borderColor: T.c.hair, backgroundColor: T.c.card }]}
      >
        <Icon name="close" size={20} color={T.c.sub} stroke={2.4} />
      </Pressable>
      <View style={styles.titles}>
        <Text style={[styles.title, { color: T.c.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: T.c.faint }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 99,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { flex: 1, minWidth: 0 },
  title: { fontSize: 18, fontFamily: FONTS.black, lineHeight: 21 },
  subtitle: { fontSize: 13, fontFamily: FONTS.bold },
});
