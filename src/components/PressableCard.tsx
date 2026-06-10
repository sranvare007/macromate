// Card wrapper with press-scale feedback, ported from ui.jsx.

import * as React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface PressableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function PressableCard({ children, onPress, style, accessibilityLabel }: PressableCardProps) {
  const T = useTheme();
  const base: ViewStyle = {
    backgroundColor: T.c.card,
    borderRadius: T.radius.card,
    borderWidth: 1,
    borderColor: T.c.hair,
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [base, { transform: [{ scale: pressed ? 0.985 : 1 }] }, style]}
    >
      {children}
    </Pressable>
  );
}
