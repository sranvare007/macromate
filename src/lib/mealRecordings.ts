// Persist meal voice recordings under the app documents directory.

import { Directory, File, Paths } from 'expo-file-system';

const RECORDINGS_DIR = new Directory(Paths.document, 'meal-recordings');

function recordingFilename(sourceUri: string): string {
  const ext = sourceUri.split('.').pop()?.toLowerCase();
  const suffix = ext && /^[a-z0-9]+$/.test(ext) ? ext : 'wav';
  return `meal-${Date.now()}.${suffix}`;
}

/** Copies a cache recording to a stable app documents path and returns the new URI. */
export async function persistMealRecording(cacheUri: string): Promise<string> {
  if (!cacheUri) {
    throw new Error('No recording was saved. Please try again.');
  }

  if (!RECORDINGS_DIR.exists) {
    RECORDINGS_DIR.create({ intermediates: true, idempotent: true });
  }

  const dest = new File(RECORDINGS_DIR, recordingFilename(cacheUri));
  const source = new File(cacheUri);
  source.copy(dest);

  return dest.uri;
}
