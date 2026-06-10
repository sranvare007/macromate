// Add-meal flow (PRD §5.3): input → analysing → review & confirm.
// Presented as a full-screen modal with the meal type passed as a param.

import type { StaticScreenProps } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { parseMeal } from '../../api/meals';
import type { ParsedItem } from '../../api/types';
import { AccentButton } from '../../components/AccentButton';
import { FlowHeader } from '../../components/FlowHeader';
import { AnalyzingStep } from '../../features/meals/AnalyzingStep';
import { InputStep } from '../../features/meals/InputStep';
import { ReviewStep } from '../../features/meals/ReviewStep';
import { nowLabel } from '../../lib/dates';
import { mealAdded, useAppDispatch } from '../../store';
import { FONTS, useTheme } from '../../theme';
import type { MacroSet, MealItem, MealType } from '../../types';

type Props = StaticScreenProps<{ mealType: MealType }>;

type FlowState =
  | { step: 'input' }
  | { step: 'analyzing'; text: string }
  | { step: 'review'; text: string; items: ParsedItem[] }
  | { step: 'error'; text: string; error: string };

export function AddMealScreen({ route }: Props) {
  const T = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const mealType = route.params.mealType;
  const [flow, setFlow] = React.useState<FlowState>({ step: 'input' });

  const close = () => navigation.goBack();

  const analyse = React.useCallback(
    async (text: string) => {
      setFlow({ step: 'analyzing', text });
      try {
        const res = await parseMeal({ meal_type: mealType, text });
        setFlow({ step: 'review', text, items: res.items });
      } catch (e) {
        setFlow({ step: 'error', text, error: e instanceof Error ? e.message : 'Something went wrong.' });
      }
    },
    [mealType],
  );

  const save = (items: MealItem[], totals: MacroSet) => {
    dispatch(mealAdded({
      id: `m${Date.now()}`,
      type: mealType,
      time: nowLabel(),
      raw: flow.step === 'review' ? flow.text : undefined,
      items,
      ...totals,
    }));
    navigation.goBack();
  };

  switch (flow.step) {
    case 'input':
      return <InputStep mealType={mealType} onClose={close} onAnalyse={analyse} />;
    case 'analyzing':
      return (
        <View style={[styles.root, { backgroundColor: T.c.bg }]}>
          <AnalyzingStep rawText={flow.text} />
        </View>
      );
    case 'review':
      return <ReviewStep mealType={mealType} parsedItems={flow.items} onClose={close} onSave={save} />;
    case 'error':
      return (
        <View style={[styles.root, { backgroundColor: T.c.bg }]}>
          <FlowHeader title="Couldn't analyse that" subtitle={mealType} onClose={close} />
          <View style={styles.errorBody}>
            <Text style={[styles.errorText, { color: T.c.sub }]}>{flow.error}</Text>
            <AccentButton icon="sparkle" onPress={() => analyse(flow.text)}>
              Try again
            </AccentButton>
          </View>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  errorBody: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 20 },
  errorText: { fontSize: 15.5, fontFamily: FONTS.bold, textAlign: 'center', lineHeight: 23 },
});
