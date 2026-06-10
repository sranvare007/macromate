// Add-meal flow (PRD §5.3): input → analysing → review & confirm.
// Presented as a full-screen modal with the meal type passed as a param.

import type { StaticScreenProps } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { parseMeal, parseMealAudio } from '../../api/meals';
import { persistMealRecording } from '../../lib/mealRecordings';
import type { ParsedItem } from '../../api/types';
import { AnalyzingStep } from '../../features/meals/AnalyzingStep';
import { InputStep } from '../../features/meals/InputStep';
import { ReviewStep } from '../../features/meals/ReviewStep';
import { nowLabel } from '../../lib/dates';
import { mealAdded, useAppDispatch } from '../../store';
import { useTheme } from '../../theme';
import type { MacroSet, MealItem, MealType } from '../../types';

type Props = StaticScreenProps<{ mealType: MealType }>;

type FlowState =
  | { step: 'input'; text?: string; error?: string; pendingItems?: ParsedItem[] }
  | { step: 'analyzing'; text: string }
  | { step: 'review'; text: string; items: ParsedItem[] };

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
        setFlow({
          step: 'input',
          text,
          error: e instanceof Error ? e.message : 'Something went wrong.',
        });
      }
    },
    [mealType],
  );

  const analyseAudio = React.useCallback(
    async (audioUri: string) => {
      setFlow({ step: 'analyzing', text: 'Voice recording' });
      try {
        const savedUri = await persistMealRecording(audioUri);
        const res = await parseMealAudio({
          meal_type: mealType,
          audioUri: savedUri,
        });
        setFlow({ step: 'input', text: res.raw_input, pendingItems: res.items });
      } catch (e) {
        setFlow({
          step: 'input',
          error: e instanceof Error ? e.message : 'Something went wrong.',
        });
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
      return (
        <InputStep
          mealType={mealType}
          initialText={flow.text}
          pendingItems={flow.pendingItems}
          error={flow.error}
          onClose={close}
          onAnalyse={analyse}
          onAnalyseAudio={analyseAudio}
          onOpenReview={(text, items) => setFlow({ step: 'review', text, items })}
          onDismissError={() => setFlow({ step: 'input', text: flow.text })}
        />
      );
    case 'analyzing':
      return (
        <View style={[styles.root, { backgroundColor: T.c.bg }]}>
          <AnalyzingStep rawText={flow.text} />
        </View>
      );
    case 'review':
      return <ReviewStep mealType={mealType} parsedItems={flow.items} onClose={close} onSave={save} />;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
