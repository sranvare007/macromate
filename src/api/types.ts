// Request/response types for the MacroMate backend (docs/PRD.md §Backend API).

import type { GoalKey, MealType } from '../types';

// POST /api/v1/calories/recommend
export interface CalorieRecommendRequest {
  weight: number; // kg
  height: number; // cm
  goal: string;
}

export interface CalorieRecommendResponse {
  calories_intake: number | null;
  recommended_macros: {
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  } | null;
  success: boolean;
  error: boolean;
  error_message: string | null;
}

export interface CalorieRecommendInputs {
  weightKg: number;
  heightCm: number;
  goalKey: GoalKey;
}

// POST /api/v1/macros/analyze
export interface MacrosAnalyzeRequest {
  prompt: string;
}

export interface MacrosAnalyzeFoodItem {
  name: string;
  quantity: string;
  macros: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
}

export interface MacrosAnalyzeResponse {
  food_items: MacrosAnalyzeFoodItem[] | null;
  success: boolean;
  error: boolean;
  error_message: string | null;
  /** Present on analyze-audio responses. */
  transcript?: string | null;
}

// POST /api/meals/parse (client wrapper — calls /api/v1/macros/analyze)
export interface ParseMealRequest {
  meal_type: MealType;
  text: string;
}

// POST /api/v1/macros/analyze-audio (multipart form: audio file)
export interface ParseMealAudioRequest {
  meal_type: MealType;
  audioUri: string;
  transcript?: string;
}

export interface ParsedItem {
  food_name: string;
  portion_size: string;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fibre_g: number;
  confidence_score: number; // 0–1, low-confidence items flagged for review
}

export interface ParseMealResponse {
  raw_input: string;
  items: ParsedItem[];
}

// Discriminated union for all user-visible async work (AGENTS.md TypeScript rules)
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
