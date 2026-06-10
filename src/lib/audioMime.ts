// MIME types for meal audio uploads (multipart form field `audio`).

export function mimeTypeForAudioUri(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'm4a':
      return 'audio/m4a';
    case 'mp4':
      return 'audio/mp4';
    case 'caf':
      return 'audio/x-caf';
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
    default:
      return 'audio/wav';
  }
}

export function filenameForAudioUri(uri: string, fallback = 'recording.wav'): string {
  const name = uri.split('/').pop();
  return name && name.length > 0 ? name : fallback;
}
