// Backend credentials loaded from .env (EXPO_PUBLIC_* — inlined by Expo Metro).

function requireEnv(name: 'EXPO_PUBLIC_API_BASE_URL' | 'EXPO_PUBLIC_API_KEY'): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env and set your API credentials.`);
  }
  return value;
}

export const API_BASE_URL = requireEnv('EXPO_PUBLIC_API_BASE_URL');
export const API_KEY = requireEnv('EXPO_PUBLIC_API_KEY');
