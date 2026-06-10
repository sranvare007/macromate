// Bottom sheet built on RN Modal with slide-up animation, ported from ui.jsx.

import * as React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeightRatio?: number;
}

export function Sheet({ open, onClose, children, maxHeightRatio = 0.88 }: SheetProps) {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: T.c.scrim }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: T.c.sheetBg,
              borderTopLeftRadius: T.radius.sheet,
              borderTopRightRadius: T.radius.sheet,
              borderColor: T.c.hairHi,
              maxHeight: `${Math.round(maxHeightRatio * 100)}%`,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <View style={styles.grabberRow}>
            <View style={[styles.grabber, { backgroundColor: T.c.hairHi }]} />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopWidth: 1, overflow: 'hidden' },
  grabberRow: { alignItems: 'center', paddingTop: 11, paddingBottom: 4 },
  grabber: { width: 40, height: 5, borderRadius: 99 },
});
