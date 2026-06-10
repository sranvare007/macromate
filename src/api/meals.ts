// Meal-parsing endpoint wrappers — text and audio analyze routes.

import { filenameForAudioUri, mimeTypeForAudioUri } from '../lib/audioMime';
import { API_BASE_URL, API_KEY } from './config';
import type {
  MacrosAnalyzeResponse,
  ParsedItem,
  ParseMealAudioRequest,
  ParseMealRequest,
  ParseMealResponse,
} from './types';

type ReactNativeFormDataFile = {
  uri: string;
  name: string;
  type: string;
};

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

async function readMacrosAnalyzeResponse(response: Response): Promise<MacrosAnalyzeResponse> {
  let data: MacrosAnalyzeResponse;
  try {
    data = (await response.json()) as MacrosAnalyzeResponse;
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(data.error_message ?? 'Could not reach the server. Check your connection and try again.');
  }

  return data;
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

  const data = await readMacrosAnalyzeResponse(response);
  return { raw_input: text, items: toParsedItems(data) };
}

export async function parseMealAudio(req: ParseMealAudioRequest): Promise<ParseMealResponse> {
  const transcript = req.transcript?.trim() ?? '';
  const filename = filenameForAudioUri(req.audioUri);
  const formData = new FormData();
  const file: ReactNativeFormDataFile = {
    uri: req.audioUri,
    name: filename,
    type: mimeTypeForAudioUri(req.audioUri),
  };

  formData.append('audio', file as unknown as Blob);

  const response = await fetch(`${API_BASE_URL}/api/v1/macros/analyze-audio`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
    },
    body: formData,
  });

  const data = await readMacrosAnalyzeResponse(response);
  const raw_input = data.transcript?.trim() || transcript || 'Voice recording';
  return {
    raw_input,
    items: toParsedItems(data),
  };
}

export const EXAMPLE_PROMPTS = [
  '200g grilled chicken and 200g rice',
  'Greek yogurt bowl with berries, honey and granola',
  'Double cheeseburger, medium fries and a diet coke',
];
