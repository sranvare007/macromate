// Runtime mic / speech-recognition permission helpers for meal voice input.

import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import type { PermissionResponse } from 'expo-modules-core';
import { Platform } from 'react-native';

type SpeechPermissionResponse = PermissionResponse & { restricted?: boolean };

export interface VoicePermissionError {
  message: string;
  openSettings?: boolean;
}

function mapMicPermissionError(perms: PermissionResponse): VoicePermissionError {
  if (!perms.granted && !perms.canAskAgain) {
    return {
      message: 'Microphone access is required to record meals by voice. Enable it in Settings.',
      openSettings: true,
    };
  }
  return { message: 'Microphone access is required to record meals by voice.' };
}

function mapSpeechPermissionError(perms: SpeechPermissionResponse): VoicePermissionError {
  if (perms.restricted) {
    return {
      message:
        'Speech recognition is restricted on this device. Check Screen Time or parental controls in Settings.',
      openSettings: true,
    };
  }
  if (!perms.granted && !perms.canAskAgain) {
    return {
      message: 'Speech recognition access is required. Enable it in Settings.',
      openSettings: true,
    };
  }
  return { message: 'Speech recognition access is required to record meals by voice.' };
}

async function ensureMicrophonePermission(): Promise<VoicePermissionError | null> {
  let mic = await ExpoSpeechRecognitionModule.getMicrophonePermissionsAsync();
  if (!mic.granted) {
    mic = await ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync();
  }
  return mic.granted ? null : mapMicPermissionError(mic);
}

async function ensureIosSpeechPermission(): Promise<VoicePermissionError | null> {
  let speech = await ExpoSpeechRecognitionModule.getSpeechRecognizerPermissionsAsync();
  if (!speech.granted) {
    if (speech.restricted) {
      return mapSpeechPermissionError(speech);
    }
    speech = await ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync();
  }
  return speech.granted ? null : mapSpeechPermissionError(speech);
}

export async function ensureVoicePermissions(): Promise<VoicePermissionError | null> {
  if (Platform.OS === 'ios') {
    const speechError = await ensureIosSpeechPermission();
    if (speechError) return speechError;
  }

  return ensureMicrophonePermission();
}
