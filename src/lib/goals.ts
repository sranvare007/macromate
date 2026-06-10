// Goal options shown in onboarding and Settings (PRD §5.1 goal table).

import type { GoalKey, GoalOption } from '../types';

export const GOALS: GoalOption[] = [
  {
    key: 'lean_muscle',
    title: 'Increase Lean Muscle',
    tag: 'Lean bulk',
    blurb: 'High protein, slight surplus. Build muscle, minimise fat gain.',
    delta: '+250 kcal',
    protein: '≥ 2.0 g/kg',
  },
  {
    key: 'bulk',
    title: 'Muscles with Fat',
    tag: 'Aggressive bulk',
    blurb: 'Bigger surplus to maximise size and strength gains.',
    delta: '+450 kcal',
    protein: '≥ 1.8 g/kg',
  },
  {
    key: 'lose_weight',
    title: 'Lose Weight',
    tag: 'Cut',
    blurb: 'Calorie deficit with high protein to preserve muscle.',
    delta: '−500 kcal',
    protein: '≥ 1.6 g/kg',
  },
  {
    key: 'gain_weight',
    title: 'Increase Weight',
    tag: 'Gain',
    blurb: 'Balanced surplus for steady, general weight gain.',
    delta: '+300 kcal',
    protein: '≥ 1.6 g/kg',
  },
];

export const GOAL_LABEL: Record<GoalKey, string> = {
  lean_muscle: 'Increase Lean Muscle',
  bulk: 'Muscles with Fat',
  lose_weight: 'Lose Weight',
  gain_weight: 'Increase Weight',
};

/** Goal strings accepted by POST /api/v1/calories/recommend */
export const API_GOAL_LABEL: Record<GoalKey, string> = {
  lean_muscle: 'Increase lean muscles',
  bulk: 'Increase muscles with fat',
  lose_weight: 'Lose weight',
  gain_weight: 'Increase weight',
};

export const GOAL_ICON: Record<GoalKey, 'dumbbell' | 'bolt' | 'flame' | 'scale'> = {
  lean_muscle: 'dumbbell',
  bulk: 'bolt',
  lose_weight: 'flame',
  gain_weight: 'scale',
};
