// Macro math — single source of truth per AGENTS.md.
// Formulas from docs/PRD.md §Appendix: Mifflin-St Jeor BMR, TDEE multiplier,
// goal adjustments, fat = 25% kcal, carbs = remainder, fibre = 14 g / 1000 kcal.

import type { GoalKey, MacroSet, Meal, Sex } from '../types';

export const ACTIVITY_LIGHTLY_ACTIVE = 1.375; // v1 fixed default (PRD §5.1)

const GOAL_ADJ: Record<GoalKey, { kcal: number; proteinPerKg: number }> = {
  lean_muscle: { kcal: +250, proteinPerKg: 2.0 },
  bulk: { kcal: +450, proteinPerKg: 1.8 },
  lose_weight: { kcal: -500, proteinPerKg: 1.6 },
  gain_weight: { kcal: +300, proteinPerKg: 1.6 },
};

export interface TargetInputs {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  goalKey: GoalKey;
}

export function mifflinStJeorBmr({ weightKg, heightCm, age, sex }: Omit<TargetInputs, 'goalKey'>): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
}

export function computeTargets(inputs: TargetInputs): MacroSet {
  const tdee = mifflinStJeorBmr(inputs) * ACTIVITY_LIGHTLY_ACTIVE;
  const g = GOAL_ADJ[inputs.goalKey];
  const kcal = Math.round((tdee + g.kcal) / 10) * 10;
  const protein = Math.round(g.proteinPerKg * inputs.weightKg);
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const fibre = Math.round((14 * kcal) / 1000);
  return { kcal, protein, carbs, fat, fibre };
}

export const EMPTY_MACROS: MacroSet = { kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };

export function sumMeals(meals: readonly Pick<Meal, keyof MacroSet>[]): MacroSet {
  return meals.reduce<MacroSet>(
    (a, m) => ({
      kcal: a.kcal + m.kcal,
      protein: a.protein + m.protein,
      carbs: a.carbs + m.carbs,
      fat: a.fat + m.fat,
      fibre: a.fibre + m.fibre,
    }),
    { ...EMPTY_MACROS },
  );
}

// Streak rule (PRD §5.6): a day is "met" if all four macro targets are within ±10%.
export function dayMeetsTargets(totals: MacroSet, targets: MacroSet): boolean {
  const within = (v: number, t: number) => t > 0 && v >= t * 0.9 && v <= t * 1.1;
  return (
    within(totals.protein, targets.protein) &&
    within(totals.carbs, targets.carbs) &&
    within(totals.fat, targets.fat) &&
    within(totals.fibre, targets.fibre)
  );
}
