// Mic permission, speech recognition, persisted recording, and error handling.

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  type ExpoSpeechRecognitionErrorCode,
} from 'expo-speech-recognition';
import * as React from 'react';
import { Linking, Platform } from 'react-native';
import { createIdleLevels, normalizeVolumeLevel, shiftVolumeLevel } from '../../lib/voiceLevels';
import { ensureVoicePermissions, type VoicePermissionError } from '../../lib/voicePermissions';

export type VoiceInputError = VoicePermissionError;

interface UseMealVoiceInputOptions {
  onDismissAnalyseError?: () => void;
  onRecordingComplete?: (audioUri: string) => void;
}

interface UseMealVoiceInputResult {
  recording: boolean;
  requesting: boolean;
  processingRecording: boolean;
  voiceError: VoiceInputError | null;
  volumeLevels: number[];
  toggleRecording: () => Promise<void>;
  dismissVoiceError: () => void;
  openAppSettings: () => void;
}

function mapRecognitionError(
  code: ExpoSpeechRecognitionErrorCode,
  message: string,
): VoiceInputError | null {
  switch (code) {
    case 'aborted':
      return null;
    case 'not-allowed':
      return {
        message: 'Microphone access was denied. Enable it in Settings to record by voice.',
        openSettings: true,
      };
    case 'no-speech':
    case 'speech-timeout':
      return null;
    case 'audio-capture':
      return {
        message: "Couldn't access the microphone. Close other apps using it and try again.",
      };
    case 'interrupted':
      return { message: 'Recording was interrupted. Tap the mic to try again.' };
    case 'network':
      return {
        message: 'Voice recognition needs a network connection. Check your connection and try again.',
      };
    case 'service-not-allowed':
      return {
        message:
          Platform.OS === 'ios'
            ? 'Speech recognition is turned off. Enable Siri & Dictation in Settings.'
            : 'Speech recognition is unavailable. Install the Google app or enable voice services.',
        openSettings: Platform.OS === 'ios',
      };
    case 'language-not-supported':
      return { message: 'Speech recognition is not available for your language on this device.' };
    case 'busy':
      return { message: 'Speech recognition is busy. Wait a moment and try again.' };
    default:
      return { message: message || 'Something went wrong while recording. Please try again.' };
  }
}

export function useMealVoiceInput({
  onDismissAnalyseError,
  onRecordingComplete,
}: UseMealVoiceInputOptions): UseMealVoiceInputResult {
  const [recording, setRecording] = React.useState(false);
  const [requesting, setRequesting] = React.useState(false);
  const [processingRecording, setProcessingRecording] = React.useState(false);
  const [voiceError, setVoiceError] = React.useState<VoiceInputError | null>(null);
  const [volumeLevels, setVolumeLevels] = React.useState(() => createIdleLevels());
  const stopRequestedRef = React.useRef(false);

  useSpeechRecognitionEvent('start', () => {
    setRecording(true);
    setRequesting(false);
    setVoiceError(null);
    setVolumeLevels(createIdleLevels());
    stopRequestedRef.current = false;
  });

  useSpeechRecognitionEvent('end', () => {
    setRecording(false);
    setRequesting(false);
    setVolumeLevels(createIdleLevels());
  });

  useSpeechRecognitionEvent('audioend', (event) => {
    setProcessingRecording(false);

    if (!stopRequestedRef.current) return;
    stopRequestedRef.current = false;

    if (!event.uri) {
      setVoiceError({ message: 'Could not save the recording. Please try again.' });
      return;
    }

    onRecordingComplete?.(event.uri);
  });

  useSpeechRecognitionEvent('volumechange', (event) => {
    const level = normalizeVolumeLevel(event.value);
    setVolumeLevels((prev) => shiftVolumeLevel(prev, level));
  });

  useSpeechRecognitionEvent('error', (event) => {
    setRecording(false);
    setRequesting(false);
    setProcessingRecording(false);
    stopRequestedRef.current = false;
    const mapped = mapRecognitionError(event.error, event.message);
    if (mapped) setVoiceError(mapped);
  });

  React.useEffect(() => {
    return () => {
      void ExpoSpeechRecognitionModule.getStateAsync().then((state) => {
        if (state === 'recognizing' || state === 'starting') {
          ExpoSpeechRecognitionModule.abort();
        }
      });
    };
  }, []);

  const dismissVoiceError = React.useCallback(() => setVoiceError(null), []);

  const openAppSettings = React.useCallback(() => {
    void Linking.openSettings();
  }, []);

  const stopRecording = React.useCallback(() => {
    stopRequestedRef.current = true;
    setProcessingRecording(true);
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const startRecording = React.useCallback(async () => {
    setVoiceError(null);
    onDismissAnalyseError?.();

    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      setVoiceError({
        message:
          Platform.OS === 'ios'
            ? 'Speech recognition is not available. Enable Siri & Dictation in Settings.'
            : 'Speech recognition is not available on this device.',
        openSettings: Platform.OS === 'ios',
      });
      return;
    }

    if (!ExpoSpeechRecognitionModule.supportsRecording()) {
      setVoiceError({
        message: 'Voice recording is not supported on this device. Type your meal instead.',
      });
      return;
    }

    setRequesting(true);
    try {
      const permissionError = await ensureVoicePermissions();
      if (permissionError) {
        setVoiceError(permissionError);
        setRequesting(false);
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: false,
        continuous: true,
        volumeChangeEventOptions: {
          enabled: true,
          intervalMillis: 100,
        },
        recordingOptions: {
          persist: true,
          outputFileName: `meal-${Date.now()}.wav`,
        },
      });
    } catch {
      setVoiceError({ message: 'Could not start recording. Please try again.' });
      setRequesting(false);
    }
  }, [onDismissAnalyseError]);

  const toggleRecording = React.useCallback(async () => {
    if (recording) {
      stopRecording();
      return;
    }
    if (requesting || processingRecording) return;
    await startRecording();
  }, [recording, requesting, processingRecording, startRecording, stopRecording]);

  return {
    recording,
    requesting,
    processingRecording,
    voiceError,
    volumeLevels,
    toggleRecording,
    dismissVoiceError,
    openAppSettings,
  };
}
