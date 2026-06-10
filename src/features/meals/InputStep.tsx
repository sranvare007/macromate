// Add-meal input (unified text + inline voice variant from the design).

import * as React from 'react';
import {
  ActivityIndicator,
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
import type { ParsedItem } from '../../api/types';
import { AccentButton } from '../../components/AccentButton';
import { FlowHeader } from '../../components/FlowHeader';
import { Icon } from '../../components/Icon';
import { FONTS, useTheme } from '../../theme';
import type { MealType } from '../../types';
import { useMealVoiceInput } from './useMealVoiceInput';
import { Waveform } from './Waveform';

interface InputStepProps {
  mealType: MealType;
  initialText?: string;
  pendingItems?: ParsedItem[];
  error?: string;
  onClose: () => void;
  onAnalyse: (text: string) => void;
  onAnalyseAudio: (audioUri: string) => void;
  onOpenReview: (text: string, items: ParsedItem[]) => void;
  onDismissError?: () => void;
}

export function InputStep({
  mealType,
  initialText,
  pendingItems,
  error,
  onClose,
  onAnalyse,
  onAnalyseAudio,
  onOpenReview,
  onDismissError,
}: InputStepProps) {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = React.useState(initialText ?? '');

  React.useEffect(() => {
    if (initialText !== undefined) setText(initialText);
  }, [initialText]);

  const {
    recording,
    requesting,
    processingRecording,
    voiceError,
    volumeLevels,
    toggleRecording,
    dismissVoiceError,
    openAppSettings,
  } = useMealVoiceInput({
    onDismissAnalyseError: onDismissError,
    onRecordingComplete: onAnalyseAudio,
  });

  const handleTextChange = (value: string) => {
    setText(value);
    if (error) onDismissError?.();
    if (voiceError) dismissVoiceError();
  };

  const busy = recording || requesting || processingRecording;
  const voiceAnalyzed = pendingItems != null && pendingItems.length > 0;
  const canGo = text.trim().length > 2;
  const inputBorderColor = error ? T.status.over : recording ? T.accent.mid : T.c.hair;
  const bannerError = error ?? voiceError?.message;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: T.c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlowHeader
        title={`Add ${mealType}`}
        subtitle={voiceAnalyzed ? 'Edit the transcript if needed' : 'Describe it — AI does the macros'}
        onClose={onClose}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View
          style={[
            styles.inputCard,
            {
              backgroundColor: T.c.card,
              borderColor: inputBorderColor,
              borderWidth: error ? 1.5 : 1,
            },
          ]}
        >
          <TextInput
            value={text}
            onChangeText={handleTextChange}
            multiline
            autoFocus={!voiceAnalyzed}
            editable={!busy}
            placeholder="e.g. 2 scrambled eggs, 2 slices whole wheat toast, 1 cup black coffee"
            placeholderTextColor={T.c.faint}
            accessibilityLabel="Meal description"
            accessibilityHint={bannerError}
            style={[styles.input, { color: T.c.text }]}
          />
          {recording || processingRecording ? (
            <View style={[styles.listening, { backgroundColor: T.c.sunken }]}>
              <View style={styles.listeningWave}>
                <Waveform active={recording} levels={volumeLevels} color={T.accent.hi} />
              </View>
              <Text style={[styles.listeningLabel, { color: T.accent.mid }]}>
                {processingRecording
                  ? 'Saving your recording…'
                  : "Tap the mic when you're done speaking"}
              </Text>
            </View>
          ) : null}
        </View>

        {bannerError ? (
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={[styles.errorBanner, { backgroundColor: `${T.status.over}18` }]}
          >
            <Text style={[styles.errorText, { color: T.status.over }]}>{bannerError}</Text>
            {voiceError?.openSettings ? (
              <Pressable
                onPress={openAppSettings}
                accessibilityRole="button"
                accessibilityLabel="Open Settings to enable microphone access"
                style={styles.settingsLink}
              >
                <Text style={[styles.settingsLinkText, { color: T.status.over }]}>Open Settings</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {!voiceAnalyzed ? (
          <>
            <Text style={[styles.tryLabel, { color: T.c.faint }]}>TRY ONE OF THESE</Text>
            <View style={styles.chips}>
              {EXAMPLE_PROMPTS.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => handleTextChange(p)}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={`Use example: ${p}`}
                  style={[styles.chip, { borderColor: T.c.hair, backgroundColor: T.c.cardHi }]}
                >
                  <Text style={[styles.chipText, { color: T.c.sub }]}>{p}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { borderTopColor: T.c.hair, backgroundColor: T.c.bg, paddingBottom: Math.max(insets.bottom, 12) + 8 },
        ]}
      >
        <Pressable
          onPress={() => void toggleRecording()}
          disabled={requesting || processingRecording}
          accessibilityRole="button"
          accessibilityLabel={
            processingRecording
              ? 'Saving voice recording'
              : requesting
                ? 'Requesting microphone permission'
                : recording
                  ? 'Stop recording'
                  : 'Record meal by voice'
          }
          accessibilityHint={recording ? 'Stops voice recording and sends it for analysis' : undefined}
          style={[
            styles.micBtn,
            {
              backgroundColor: recording ? T.status.over : T.c.card,
              borderColor: recording ? T.status.over : T.c.hair,
              opacity: requesting ? 0.7 : 1,
            },
          ]}
        >
          {requesting ? (
            <ActivityIndicator color={T.accent.mid} />
          ) : (
            <Icon name="mic" size={24} color={recording ? '#fff' : T.accent.mid} stroke={2.2} />
          )}
        </Pressable>
        <View style={styles.cta}>
          {voiceAnalyzed ? (
            <AccentButton
              icon="check"
              disabled={busy}
              onPress={() => onOpenReview(text.trim() || 'Voice recording', pendingItems)}
            >
              Review parsed items
            </AccentButton>
          ) : (
            <AccentButton icon="sparkle" disabled={!canGo || busy} onPress={() => onAnalyse(text)}>
              Analyse meal
            </AccentButton>
          )}
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
  errorBanner: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, marginTop: 12, gap: 8 },
  errorText: { fontSize: 14, fontFamily: FONTS.bold, lineHeight: 21 },
  settingsLink: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  settingsLinkText: { fontSize: 14, fontFamily: FONTS.extrabold, textDecorationLine: 'underline' },
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
    gap: 8,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  listeningWave: { flex: 1, minWidth: 0 },
  listeningLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 11.5,
    fontFamily: FONTS.extrabold,
    lineHeight: 16,
  },
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
