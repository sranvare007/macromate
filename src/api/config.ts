// Backend credentials from .env (EXPO_PUBLIC_* — inlined by Expo/Babel at build time).
//
// IMPORTANT: these MUST be accessed as static member expressions
// (process.env.EXPO_PUBLIC_FOO) so babel-preset-expo can replace them with the
// literal value at build time. A computed access (process.env[name]) is NOT
// inlined and resolves to undefined in release/export bundles — it only appears
// to work in dev because the Expo dev runtime populates process.env at runtime.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

// Read lazily so a missing value surfaces as a catchable error inside an API call
// (handled by each screen's error state) rather than crashing at startup.
function required(value: string | undefined, name: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`Missing ${name}. Copy .env.example to .env and set your API credentials.`);
  }
  return trimmed;
}

export function apiBaseUrl(): string {
  return required(API_BASE_URL, 'EXPO_PUBLIC_API_BASE_URL');
}

export function apiKey(): string {
  return required(API_KEY, 'EXPO_PUBLIC_API_KEY');
}
