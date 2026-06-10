// Design tokens ported from the NutriTrack design files (theme.jsx).
// Default look: dark mode + lime accent.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';
import { useColorScheme } from 'react-native';

export interface Accent {
  key: 'lime' | 'cyan' | 'coral';
  label: string;
  hi: string;
  mid: string;
  deep: string;
  on: string;
  glow: string;
}

export const ACCENTS: Record<Accent['key'], Accent> = {
  lime: { key: 'lime', label: 'Lime', hi: '#A3E635', mid: '#84CC16', deep: '#65A30D', on: '#16270A', glow: 'rgba(163,230,53,0.45)' },
  cyan: { key: 'cyan', label: 'Cyan', hi: '#22D3EE', mid: '#06B6D4', deep: '#0891B2', on: '#04222B', glow: 'rgba(34,211,238,0.40)' },
  coral: { key: 'coral', label: 'Coral', hi: '#FB923C', mid: '#F97316', deep: '#EA580C', on: '#3A1605', glow: 'rgba(251,146,60,0.40)' },
};

// Macro identity colours (consistent across rings + bars)
export const MACRO_COLORS = {
  protein: '#FF5C7A',
  carbs: '#FFB020',
  fat: '#A78BFA',
  fibre: '#2DD4BF',
} as const;

export type MacroKey = keyof typeof MACRO_COLORS;

// App typeface (design theme.jsx: "'Nunito', -apple-system, …"). Static font
// files carry their weight in the family name, so styles set fontFamily only —
// never combine these with fontWeight or Android falls back to the system font.
export const FONTS = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  boldItalic: 'Nunito_700Bold_Italic',
  extrabold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

interface ThemeColors {
  appBg: string;
  bg: string;
  surface: string;
  card: string;
  cardHi: string;
  sunken: string;
  text: string;
  sub: string;
  faint: string;
  hair: string;
  hairHi: string;
  sheetBg: string;
  scrim: string;
  glass: string;
}

export interface Theme {
  mode: 'dark' | 'light';
  dark: boolean;
  accent: Accent;
  c: ThemeColors;
  macros: typeof MACRO_COLORS;
  // status (vs target) colours per PRD
  status: { ok: string; warn: string; over: string };
  radius: { card: number; chip: number; pill: number; sheet: number };
}

const DARK_COLORS: ThemeColors = {
  appBg: '#05070D',
  bg: '#0B1120',
  surface: '#0E1626',
  card: '#15203A',
  cardHi: '#1C2A49',
  sunken: '#0A1322',
  text: '#F3F6FC',
  sub: '#9FB0C9',
  faint: '#5E6F8C',
  hair: 'rgba(255,255,255,0.08)',
  hairHi: 'rgba(255,255,255,0.14)',
  sheetBg: '#0E1626',
  scrim: 'rgba(2,4,9,0.66)',
  glass: 'rgba(21,32,58,0.96)',
};

const LIGHT_COLORS: ThemeColors = {
  appBg: '#DDE3EC',
  bg: '#F4F6FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardHi: '#F4F6FA',
  sunken: '#EEF1F6',
  text: '#0E1626',
  sub: '#5A6A82',
  faint: '#9AA8BE',
  hair: 'rgba(14,22,38,0.09)',
  hairHi: 'rgba(14,22,38,0.14)',
  sheetBg: '#FFFFFF',
  scrim: 'rgba(15,23,42,0.34)',
  glass: 'rgba(255,255,255,0.96)',
};

export function buildTheme(mode: 'dark' | 'light', accentKey: Accent['key'] = 'lime'): Theme {
  const dark = mode === 'dark';
  return {
    mode,
    dark,
    accent: ACCENTS[accentKey],
    c: dark ? DARK_COLORS : LIGHT_COLORS,
    macros: MACRO_COLORS,
    status: { ok: '#22C55E', warn: '#F59E0B', over: '#EF4444' },
    radius: { card: 26, chip: 16, pill: 999, sheet: 34 },
  };
}

// status colour for a fill ratio (1 = at target); null → use identity colour
export function statusFor(ratio: number, T: Theme): string | null {
  if (ratio > 1.15) return T.status.over;
  if (ratio > 1.0) return T.status.warn;
  return null;
}

const ThemeContext = React.createContext<Theme>(buildTheme('dark'));

// User-selectable appearance: explicit light/dark or follow the OS.
export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_MODE_STORAGE_KEY = 'nutritrack.themeMode';

function isThemeMode(v: unknown): v is ThemeMode {
  return v === 'light' || v === 'dark' || v === 'system';
}

interface ThemeModeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = React.createContext<ThemeModeState>({ mode: 'system', setMode: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const [mode, setModeState] = React.useState<ThemeMode>('system');

  React.useEffect(() => {
    AsyncStorage.getItem(THEME_MODE_STORAGE_KEY)
      .then((stored) => {
        if (isThemeMode(stored)) setModeState(stored);
      })
      .catch(() => {}); // unreadable preference → stay on system
  }, []);

  const setMode = React.useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, next).catch(() => {});
  }, []);

  const resolved = mode === 'system' ? (scheme === 'light' ? 'light' : 'dark') : mode;
  const theme = React.useMemo(() => buildTheme(resolved, 'lime'), [resolved]);
  const modeValue = React.useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <ThemeModeContext.Provider value={modeValue}>
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </ThemeModeContext.Provider>
  );
}

export function useTheme(): Theme {
  return React.useContext(ThemeContext);
}

export function useThemeMode(): ThemeModeState {
  return React.useContext(ThemeModeContext);
}
