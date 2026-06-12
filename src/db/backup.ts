// Read-only snapshot of everything stored locally, for the GDPR "export my
// data" flow. Pairs with the wipe in src/store/listeners.ts (appDataCleared).

import type { UserProfile } from '../types';
import { loadHistory, type StoredDay } from './meals';
import { loadProfile } from './profile';

export interface DataExport {
  app: 'MacroMate';
  schemaVersion: 1;
  exportedAt: string; // ISO 8601
  onboarded: boolean;
  profile: UserProfile | null;
  days: StoredDay[]; // every logged day, newest first
}

export function exportAllData(): DataExport {
  const stored = loadProfile();
  return {
    app: 'MacroMate',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    onboarded: stored?.onboarded ?? false,
    profile: stored?.profile ?? null,
    days: loadHistory(), // no excludeDay → includes today
  };
}
