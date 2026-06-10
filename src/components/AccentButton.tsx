// Primary CTA button with accent gradient, ported from ui.jsx.

import * as React from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { FONTS, useTheme } from '../theme';
import { Icon, type IconName } from './Icon';

interface AccentButtonProps {
  children: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}

export function AccentButton({ children, onPress, disabled, icon, style }: AccentButtonProps) {
  const T = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={children}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled ? T.c.cardHi : T.accent.mid,
          shadowColor: disabled ? 'transparent' : T.accent.mid,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={20} color={disabled ? T.c.faint : T.accent.on} stroke={2.4} />}
      <Text style={[styles.label, { color: disabled ? T.c.faint : T.accent.on }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowOpacity: 0.45,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  label: { fontSize: 17, fontFamily: FONTS.black, letterSpacing: 0.2 },
});
