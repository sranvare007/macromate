// CRUD for the single local user profile (one row, id = 1).

import type { GoalKey, MacroSet, Sex, UserProfile } from '../types';
import { db } from './index';

interface ProfileRow {
  name: string;
  email: string;
  goal_key: string;
  weight_kg: number;
  height_cm: number;
  age: number;
  sex: string;
  streak: number;
  onboarded: number;
  daily_kcal: number | null;
  daily_protein_g: number | null;
  daily_carbs_g: number | null;
  daily_fat_g: number | null;
  daily_fibre_g: number | null;
}

function rowToTargets(row: ProfileRow): MacroSet | undefined {
  if (row.daily_kcal == null) return undefined;
  return {
    kcal: row.daily_kcal,
    protein: row.daily_protein_g ?? 0,
    carbs: row.daily_carbs_g ?? 0,
    fat: row.daily_fat_g ?? 0,
    fibre: row.daily_fibre_g ?? 0,
  };
}

export interface StoredProfile {
  profile: UserProfile;
  onboarded: boolean;
}

// Returns null on a fresh install (no profile row yet).
export function loadProfile(): StoredProfile | null {
  const row = db.getFirstSync<ProfileRow>('SELECT * FROM profile WHERE id = 1');
  if (!row) return null;

  const targets = rowToTargets(row);
  return {
    onboarded: row.onboarded === 1,
    profile: {
      name: row.name,
      email: row.email,
      goalKey: row.goal_key as GoalKey,
      weightKg: row.weight_kg,
      heightCm: row.height_cm,
      age: row.age,
      sex: row.sex as Sex,
      streak: row.streak,
      ...(targets ? { targets } : {}),
    },
  };
}

// Upsert the profile row. created_at is preserved across updates;
// targets_updated_at advances only when computed targets are present.
export function saveProfile(profile: UserProfile, onboarded: boolean): void {
  const t = profile.targets;
  const now = Date.now();
  db.runSync(
    `INSERT INTO profile (
       id, name, email, goal_key, weight_kg, height_cm, age, sex, streak, onboarded,
       daily_kcal, daily_protein_g, daily_carbs_g, daily_fat_g, daily_fibre_g,
       created_at, targets_updated_at
     ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       email = excluded.email,
       goal_key = excluded.goal_key,
       weight_kg = excluded.weight_kg,
       height_cm = excluded.height_cm,
       age = excluded.age,
       sex = excluded.sex,
       streak = excluded.streak,
       onboarded = excluded.onboarded,
       daily_kcal = excluded.daily_kcal,
       daily_protein_g = excluded.daily_protein_g,
       daily_carbs_g = excluded.daily_carbs_g,
       daily_fat_g = excluded.daily_fat_g,
       daily_fibre_g = excluded.daily_fibre_g,
       targets_updated_at = excluded.targets_updated_at`,
    [
      profile.name,
      profile.email,
      profile.goalKey,
      profile.weightKg,
      profile.heightCm,
      profile.age,
      profile.sex,
      profile.streak,
      onboarded ? 1 : 0,
      t?.kcal ?? null,
      t?.protein ?? null,
      t?.carbs ?? null,
      t?.fat ?? null,
      t?.fibre ?? null,
      now,
      t ? now : null,
    ],
  );
}

// Wipe the profile (e.g. account reset / GDPR delete). Meals are left intact;
// call clearMeals() too for a full reset.
export function deleteProfile(): void {
  db.runSync('DELETE FROM profile WHERE id = 1');
}
