// Calorie + macro recommendation endpoint used during onboarding.

import { API_GOAL_LABEL } from '../lib/goals';
import type { MacroSet } from '../types';
import { API_BASE_URL, API_KEY } from './config';
import type { CalorieRecommendInputs, CalorieRecommendRequest, CalorieRecommendResponse } from './types';

function toMacroSet(res: CalorieRecommendResponse): MacroSet {
  if (!res.success || res.error || res.calories_intake == null || res.recommended_macros == null) {
    throw new Error(res.error_message ?? 'Could not calculate your targets. Please try again.');
  }
  const m = res.recommended_macros;
  return {
    kcal: res.calories_intake,
    protein: m.protein,
    carbs: m.carbohydrates,
    fat: m.fat,
    fibre: m.fiber,
  };
}

export async function fetchCalorieRecommend(inputs: CalorieRecommendInputs): Promise<MacroSet> {
  const body: CalorieRecommendRequest = {
    weight: inputs.weightKg,
    height: inputs.heightCm,
    goal: API_GOAL_LABEL[inputs.goalKey],
  };

  const response = await fetch(`${API_BASE_URL}/api/v1/calories/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const data = (await response.json()) as CalorieRecommendResponse;
  return toMacroSet(data);
}
