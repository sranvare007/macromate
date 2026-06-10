// Weight / height edit sheet with unit toggle and steppers (settings.jsx).
// Stored values stay metric; unit toggle only changes the display.

import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AccentButton } from '../../components/AccentButton';
import { Icon } from '../../components/Icon';
import { Sheet } from '../../components/Sheet';
import { formatFtIn, kgToLb } from '../../lib/units';
import { FONTS, useTheme } from '../../theme';
import type { UserProfile } from '../../types';

type EditKind = 'weight' | 'height';

interface EditValueSheetProps {
  open: boolean;
  kind: EditKind;
  profile: UserProfile;
  onClose: () => void;
  onSave: (patch: Partial<UserProfile>) => void;
}

export function EditValueSheet({ open, kind, profile, onClose, onSave }: EditValueSheetProps) {
  const T = useTheme();
  const isWeight = kind === 'weight';
  const [unit, setUnit] = React.useState(isWeight ? 'kg' : 'cm');
  const [val, setVal] = React.useState(isWeight ? profile.weightKg : profile.heightCm);

  React.useEffect(() => {
    if (open) {
      setVal(isWeight ? profile.weightKg : profile.heightCm);
      setUnit(isWeight ? 'kg' : 'cm');
    }
  }, [open, isWeight, profile.weightKg, profile.heightCm]);

  const min = isWeight ? 40 : 140;
  const max = isWeight ? 160 : 210;
  const step = isWeight ? 0.5 : 1;

  const display = () => {
    if (isWeight) return unit === 'kg' ? `${val % 1 ? val.toFixed(1) : val}` : `${Math.round(kgToLb(val))}`;
    return unit === 'cm' ? `${Math.round(val)}` : formatFtIn(val);
  };
  const unitLabel = isWeight ? unit : unit === 'cm' ? 'cm' : '';
  const adjust = (d: number) => setVal((v) => Math.min(max, Math.max(min, +(v + d).toFixed(1))));

  return (
    <Sheet open={open} onClose={onClose} maxHeightRatio={0.64}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: T.c.text }]}>{isWeight ? 'Weight' : 'Height'}</Text>
          <View style={[styles.unitToggle, { backgroundColor: T.c.sunken }]}>
            {(isWeight ? ['kg', 'lb'] : ['cm', 'ft']).map((u) => (
              <Pressable
                key={u}
                onPress={() => setUnit(u)}
                accessibilityRole="button"
                accessibilityLabel={`Show in ${u}`}
                accessibilityState={{ selected: unit === u }}
                style={[styles.unitBtn, unit === u && { backgroundColor: T.c.card }]}
              >
                <Text style={[styles.unitText, { color: unit === u ? T.c.text : T.c.faint }]}>{u}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.stepperRow}>
          <Pressable
            onPress={() => adjust(-step)}
            accessibilityRole="button"
            accessibilityLabel="Decrease"
            style={[styles.stepBtn, { borderColor: T.c.hair, backgroundColor: T.c.card }]}
          >
            <Text style={[styles.stepSign, { color: T.c.text }]}>−</Text>
          </Pressable>
          <View style={styles.valueWrap}>
            <Text style={[styles.value, { color: T.c.text }]}>
              {display()}
              {unitLabel ? <Text style={[styles.valueUnit, { color: T.c.faint }]}> {unitLabel}</Text> : null}
            </Text>
          </View>
          <Pressable
            onPress={() => adjust(step)}
            accessibilityRole="button"
            accessibilityLabel="Increase"
            style={[styles.stepBtn, { borderColor: T.c.hair, backgroundColor: T.c.card }]}
          >
            <Text style={[styles.stepSign, { color: T.c.text }]}>+</Text>
          </Pressable>
        </View>

        <View style={styles.rangeLabels}>
          <Text style={[styles.rangeLabel, { color: T.c.faint }]}>{isWeight ? `${min} kg` : `${min} cm`}</Text>
          <Text style={[styles.rangeLabel, { color: T.c.faint }]}>{isWeight ? `${max} kg` : `${max} cm`}</Text>
        </View>

        <View style={[styles.note, { backgroundColor: `${T.accent.mid}14` }]}>
          <Icon name="sparkle" size={17} color={T.accent.mid} />
          <Text style={[styles.noteText, { color: T.c.sub }]}>
            Your daily targets will recalculate when you save.
          </Text>
        </View>

        <AccentButton icon="check" onPress={() => onSave(isWeight ? { weightKg: val } : { heightCm: val })}>
          Save & recalculate
        </AccentButton>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingHorizontal: 22, paddingBottom: 30 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  title: { fontSize: 21, fontFamily: FONTS.black },
  unitToggle: { flexDirection: 'row', gap: 3, padding: 3, borderRadius: 11 },
  unitBtn: { borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 },
  unitText: { fontSize: 13, fontFamily: FONTS.extrabold },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginVertical: 14,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 99,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepSign: { fontSize: 26, fontFamily: FONTS.extrabold, lineHeight: 30 },
  valueWrap: { minWidth: 140, alignItems: 'center' },
  value: { fontSize: 56, fontFamily: FONTS.black, lineHeight: 62, fontVariant: ['tabular-nums'] },
  valueUnit: { fontSize: 18, fontFamily: FONTS.extrabold },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  rangeLabel: { fontSize: 11.5, fontFamily: FONTS.bold, fontVariant: ['tabular-nums'] },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 13,
    marginBottom: 18,
  },
  noteText: { flex: 1, fontSize: 12.5, fontFamily: FONTS.bold },
});
