// Backend credentials loaded from .env (EXPO_PUBLIC_* — inlined by Expo Metro at build time).
//
// These are read lazily (not at module import) so that a missing/un-inlined value
// surfaces as a catchable error inside an API call — handled by each screen's error
// state — rather than throwing during startup and hard-crashing the native binary
// with no UI (e.g. a release/preview build where EXPO_PUBLIC_* wasn't inlined).

function requireEnv(name: 'EXPO_PUBLIC_API_BASE_URL' | 'EXPO_PUBLIC_API_KEY'): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env and set your API credentials.`);
  }
  return value;
}

export function apiBaseUrl(): string {
  return requireEnv('EXPO_PUBLIC_API_BASE_URL');
}

export function apiKey(): string {
  return requireEnv('EXPO_PUBLIC_API_KEY');
}
