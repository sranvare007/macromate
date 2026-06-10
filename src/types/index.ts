// Shared domain types — mirror the PRD data models (docs/PRD.md §Key Data Models).

export type GoalKey = 'lean_muscle' | 'bulk' | 'lose_weight' | 'gain_weight';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export type Sex = 'male' | 'female';

export interface UserProfile {
  name: string;
  email: string;
  goalKey: GoalKey;
  weightKg: number; // always stored metric
  heightCm: number; // always stored metric
  age: number;
  sex: Sex;
  streak: number;
  /** Server-computed targets; falls back to local formula when absent */
  targets?: MacroSet;
}

// Aggregate of the five tracked values
export interface MacroSet {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
}

export interface MealItem extends MacroSet {
  name: string;
  qty: string;
}

export interface Meal extends MacroSet {
  id: string;
  type: MealType;
  time: string;
  raw?: string;
  items: MealItem[];
}

// One day in the history list
export interface DaySummary extends MacroSet {
  d: number; // days ago (0 = today)
  key: string; // ISO date
  dow: string;
  day: number;
  month: string;
  year: number;
  label: string;
  shortLabel: string;
  met: boolean;
  meals: Meal[];
}

export interface GoalOption {
  key: GoalKey;
  title: string;
  tag: string;
  blurb: string;
  delta: string;
  protein: string;
}
