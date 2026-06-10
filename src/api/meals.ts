// Meal-parsing endpoint wrapper — POST /api/v1/macros/analyze.

import { API_BASE_URL, API_KEY } from './config';
import type { MacrosAnalyzeResponse, ParsedItem, ParseMealRequest, ParseMealResponse } from './types';

function toParsedItems(res: MacrosAnalyzeResponse): ParsedItem[] {
  if (!res.success || res.error || !res.food_items?.length) {
    throw new Error(res.error_message ?? 'Could not analyse that meal. Please try again.');
  }

  return res.food_items.map((item) => ({
    food_name: item.name,
    portion_size: item.quantity,
    unit: '',
    calories: Math.round(item.macros.calories),
    protein_g: Math.round(item.macros.protein),
    carbs_g: Math.round(item.macros.carbohydrates),
    fat_g: Math.round(item.macros.fat),
    fibre_g: Math.round(item.macros.fiber),
    confidence_score: 1,
  }));
}

export async function parseMeal(req: ParseMealRequest): Promise<ParseMealResponse> {
  const text = req.text.trim();
  if (!text) {
    throw new Error('Tell us what you ate and we’ll work out the macros.');
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/macros/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ prompt: text }),
  });

  if (!response.ok) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const data = (await response.json()) as MacrosAnalyzeResponse;
  return { raw_input: text, items: toParsedItems(data) };
}

export const EXAMPLE_PROMPTS = [
  '200g grilled chicken and 200g rice',
  'Greek yogurt bowl with berries, honey and granola',
  'Double cheeseburger, medium fries and a diet coke',
];
