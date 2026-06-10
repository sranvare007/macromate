// Add-meal input (unified text + inline voice variant from the design).
// Voice is simulated word-by-word until the speech-to-text pipeline exists.

import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EXAMPLE_PROMPTS } from '../../api/meals';
import { AccentButton } from '../../components/AccentButton';
import { FlowHeader } from '../../components/FlowHeader';
import { Icon } from '../../components/Icon';
import { FONTS, useTheme } from '../../theme';
import type { MealType } from '../../types';
import { Waveform } from './Waveform';

const SAMPLE_TRANSCRIPT = '2 grilled chicken thighs, a baked sweet potato, and some sautéed spinach';

interface InputStepProps {
  mealType: MealType;
  initialText?: string;
  error?: string;
  onClose: () => void;
  onAnalyse: (text: string) => void;
  onDismissError?: () => void;
}

export function InputStep({
  mealType,
  initialText,
  error,
  onClose,
  onAnalyse,
  onDismissError,
}: InputStepProps) {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = React.useState(initialText ?? '');
  const [recording, setRecording] = React.useState(false);

  const handleTextChange = (value: string) => {
    setText(value);
    if (error) onDismissError?.();
  };

  // simulate live transcription while recording
  React.useEffect(() => {
    if (!recording) return;
    const words = SAMPLE_TRANSCRIPT.split(' ');
    let i = 0;
    setText('');
    const id = setInterval(() => {
      i++;
      setText(words.slice(0, i).join(' '));
      if (i >= words.length) {
        clearInterval(id);
        setTimeout(() => setRecording(false), 500);
      }
    }, 180);
    return () => clearInterval(id);
  }, [recording]);

  const canGo = text.trim().length > 2;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: T.c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlowHeader title={`Add ${mealType}`} subtitle="Describe it — AI does the macros" onClose={onClose} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View
          style={[
            styles.inputCard,
            {
              backgroundColor: T.c.card,
              borderColor: error ? T.status.over : recording ? T.accent.mid : T.c.hair,
              borderWidth: error ? 1.5 : 1,
            },
          ]}
        >
          <TextInput
            value={text}
            onChangeText={handleTextChange}
            multiline
            autoFocus
            placeholder="e.g. 2 scrambled eggs, 2 slices whole wheat toast, 1 cup black coffee"
            placeholderTextColor={T.c.faint}
            accessibilityLabel="Meal description"
            accessibilityHint={error}
            style={[styles.input, { color: T.c.text }]}
          />
          {recording && (
            <View style={[styles.listening, { backgroundColor: T.c.sunken }]}>
              <View style={styles.listeningWave}>
                <Waveform active color={T.accent.hi} bars={18} />
              </View>
              <Text style={[styles.listeningLabel, { color: T.accent.mid }]}>Listening…</Text>
            </View>
          )}
        </View>

        {error ? (
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={[styles.errorBanner, { backgroundColor: `${T.status.over}18` }]}
          >
            <Text style={[styles.errorText, { color: T.status.over }]}>{error}</Text>
          </View>
        ) : null}

        <Text style={[styles.tryLabel, { color: T.c.faint }]}>TRY ONE OF THESE</Text>
        <View style={styles.chips}>
          {EXAMPLE_PROMPTS.map((p) => (
            <Pressable
              key={p}
              onPress={() => handleTextChange(p)}
              accessibilityRole="button"
              accessibilityLabel={`Use example: ${p}`}
              style={[styles.chip, { borderColor: T.c.hair, backgroundColor: T.c.cardHi }]}
            >
              <Text style={[styles.chipText, { color: T.c.sub }]}>{p}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { borderTopColor: T.c.hair, backgroundColor: T.c.bg, paddingBottom: Math.max(insets.bottom, 12) + 8 },
        ]}
      >
        <Pressable
          onPress={() => setRecording((r) => !r)}
          accessibilityRole="button"
          accessibilityLabel={recording ? 'Stop recording' : 'Record meal by voice'}
          style={[
            styles.micBtn,
            { backgroundColor: recording ? T.status.over : T.c.card, borderColor: T.c.hair },
          ]}
        >
          <Icon name="mic" size={24} color={recording ? '#fff' : T.accent.mid} stroke={2.2} />
        </Pressable>
        <View style={styles.cta}>
          <AccentButton icon="sparkle" disabled={!canGo} onPress={() => onAnalyse(text)}>
            Analyse meal
          </AccentButton>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 4 },
  inputCard: { borderRadius: 24, padding: 16, minHeight: 180 },
  errorBanner: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, marginTop: 12 },
  errorText: { fontSize: 14, fontFamily: FONTS.bold, lineHeight: 21 },
  input: {
    minHeight: 120,
    fontSize: 18,
    fontFamily: FONTS.semibold,
    lineHeight: 27,
    textAlignVertical: 'top',
  },
  listening: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  listeningWave: { flex: 1 },
  listeningLabel: { fontSize: 12.5, fontFamily: FONTS.extrabold },
  tryLabel: { fontSize: 12.5, fontFamily: FONTS.extrabold, letterSpacing: 1, marginTop: 18, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 16 },
  chip: { borderWidth: 1, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 13 },
  chipText: { fontSize: 12.5, fontFamily: FONTS.bold, lineHeight: 17 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: 18,
    borderTopWidth: 1,
  },
  micBtn: {
    width: 56,
    height: 56,
    borderRadius: 99,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: { flex: 1 },
});
