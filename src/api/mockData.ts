// Sample data standing in for GET /api/meals/today, GET /api/history and the
// user profile until the backend exists. Ported from the design prototype.

import { DOW, isoDate, MONTHS } from '../lib/dates';
import type { DaySummary, MacroSet, Meal, MealItem, MealType, UserProfile } from '../types';

export const MOCK_PROFILE: UserProfile = {
  name: 'Marcus',
  email: 'marcus@nutritrack.app',
  goalKey: 'lean_muscle',
  weightKg: 78,
  heightCm: 180,
  age: 27,
  sex: 'male',
  streak: 12,
};

type ItemRow = [name: string, qty: string, kcal: number, protein: number, carbs: number, fat: number, fibre: number];

function item([name, qty, kcal, protein, carbs, fat, fibre]: ItemRow): MealItem {
  return { name, qty, kcal, protein, carbs, fat, fibre };
}

function meal(type: MealType, time: string, rows: ItemRow[], id = `${type}-${time}`): Meal {
  const items = rows.map(item);
  const sum = (k: keyof MacroSet) => items.reduce((s, i) => s + i[k], 0);
  return {
    id,
    type,
    time,
    items,
    kcal: sum('kcal'),
    protein: sum('protein'),
    carbs: sum('carbs'),
    fat: sum('fat'),
    fibre: sum('fibre'),
  };
}

// Today's logged meals (mid-afternoon snapshot)
export const INITIAL_MEALS: Meal[] = [
  {
    ...meal('Breakfast', '7:32 AM', [
      ['Scrambled eggs', '4 large', 310, 28, 2, 22, 0],
      ['Whole wheat toast', '2 slices', 140, 8, 24, 2, 6],
      ['Black coffee', '1 cup', 0, 0, 0, 0, 0],
      ['Banana', '1 medium', 105, 1, 27, 0, 3],
    ], 'm1'),
    raw: '4 scrambled eggs, 2 slices whole wheat toast, black coffee, 1 banana',
  },
  {
    ...meal('Lunch', '12:45 PM', [
      ['Grilled chicken breast', '200 g', 330, 62, 0, 7, 0],
      ['White rice', '1 cup', 205, 4, 45, 0, 1],
      ['Broccoli', '1 cup', 30, 3, 6, 0, 2],
      ['Olive oil', '1 tbsp', 120, 0, 0, 14, 0],
    ], 'm2'),
    raw: '200g grilled chicken breast, 1 cup white rice, broccoli, olive oil',
  },
  {
    ...meal('Snack', '3:28 PM', [
      ['Whey protein', '1 scoop', 120, 24, 3, 1, 1],
      ['Almond milk', '1 cup', 60, 1, 8, 3, 0],
      ['Almonds', '1 oz', 165, 6, 6, 14, 4],
    ], 'm3'),
    raw: 'Whey protein shake with almond milk, handful of almonds',
  },
];

const BREAKFASTS: (() => Meal)[] = [
  () => meal('Breakfast', '7:32 AM', [
    ['Scrambled eggs', '4 large', 310, 28, 2, 22, 0],
    ['Whole wheat toast', '2 slices', 140, 8, 24, 2, 6],
    ['Black coffee', '1 cup', 0, 0, 0, 0, 0],
    ['Banana', '1 medium', 105, 1, 27, 0, 3],
  ]),
  () => meal('Breakfast', '7:10 AM', [
    ['Rolled oats', '1 cup', 150, 5, 27, 3, 4],
    ['Whey protein', '1 scoop', 120, 24, 3, 1, 1],
    ['Blueberries', '½ cup', 40, 1, 10, 0, 2],
    ['Peanut butter', '1 tbsp', 95, 4, 3, 8, 1],
  ]),
  () => meal('Breakfast', '8:05 AM', [
    ['Greek yogurt', '200 g', 130, 20, 8, 0, 0],
    ['Granola', '40 g', 180, 4, 30, 6, 4],
    ['Honey', '1 tbsp', 60, 0, 17, 0, 0],
    ['Strawberries', '½ cup', 25, 1, 6, 0, 2],
  ]),
  () => meal('Breakfast', '7:45 AM', [
    ['Bagel', '1 whole', 270, 9, 53, 2, 2],
    ['Eggs', '3 large', 215, 18, 1, 15, 0],
    ['Avocado', '½ medium', 120, 1, 6, 11, 5],
  ]),
];

const LUNCHES: (() => Meal)[] = [
  () => meal('Lunch', '12:45 PM', [
    ['Grilled chicken breast', '200 g', 330, 62, 0, 7, 0],
    ['White rice', '1 cup', 205, 4, 45, 0, 1],
    ['Broccoli', '1 cup', 30, 3, 6, 0, 2],
    ['Olive oil', '1 tbsp', 120, 0, 0, 14, 0],
  ]),
  () => meal('Lunch', '1:05 PM', [
    ['Whole wheat wrap', '1', 150, 5, 25, 3, 3],
    ['Turkey breast', '120 g', 135, 26, 1, 2, 0],
    ['Cheddar', '1 slice', 80, 5, 1, 6, 0],
    ['Veg & hummus', '¼ cup', 110, 4, 10, 6, 3],
  ]),
  () => meal('Lunch', '12:30 PM', [
    ['Baked salmon', '170 g', 350, 34, 0, 22, 0],
    ['Quinoa', '1 cup', 220, 8, 39, 4, 5],
    ['Asparagus', '6 spears', 30, 3, 5, 0, 3],
  ]),
  () => meal('Lunch', '1:20 PM', [
    ['Ground beef', '150 g', 290, 35, 0, 16, 0],
    ['Rice', '1 cup', 205, 4, 45, 0, 1],
    ['Black beans', '½ cup', 110, 7, 20, 0, 7],
    ['Salsa & cheese', '¼ cup', 120, 6, 5, 8, 1],
  ]),
];

const DINNERS: (() => Meal)[] = [
  () => meal('Dinner', '7:15 PM', [
    ['Grilled chicken thigh', '2 pieces', 320, 42, 0, 18, 0],
    ['Sweet potato, baked', '1 medium', 112, 2, 26, 0, 4],
    ['Spinach, sautéed', '1 cup', 62, 3, 4, 4, 2],
  ]),
  () => meal('Dinner', '7:40 PM', [
    ['Sirloin steak', '200 g', 430, 52, 0, 24, 0],
    ['Roast potatoes', '200 g', 180, 4, 38, 0, 4],
    ['Broccoli', '1 cup', 35, 3, 7, 0, 3],
  ]),
  () => meal('Dinner', '8:00 PM', [
    ['Pasta', '2 cups', 400, 14, 78, 4, 6],
    ['Beef bolognese', '1 cup', 280, 24, 12, 14, 3],
    ['Parmesan', '2 tbsp', 40, 4, 0, 3, 0],
  ]),
  () => meal('Dinner', '7:25 PM', [
    ['Tofu', '200 g', 180, 20, 6, 11, 2],
    ['Jasmine rice', '1 cup', 205, 4, 45, 0, 1],
    ['Stir-fry veg', '1 cup', 60, 4, 12, 0, 5],
    ['Teriyaki sauce', '2 tbsp', 80, 2, 10, 4, 1],
  ]),
];

const SNACKS: (() => Meal)[] = [
  () => meal('Snack', '3:28 PM', [
    ['Whey protein', '1 scoop', 120, 24, 3, 1, 1],
    ['Almond milk', '1 cup', 60, 1, 8, 3, 0],
    ['Almonds', '1 oz', 165, 6, 6, 14, 4],
  ]),
  () => meal('Snack', '4:10 PM', [
    ['Protein bar', '1 bar', 210, 20, 24, 7, 3],
    ['Apple', '1 medium', 95, 0, 25, 0, 4],
  ]),
  () => meal('Snack', '5:00 PM', [
    ['Cottage cheese', '200 g', 160, 22, 8, 4, 0],
    ['Mixed berries', '½ cup', 40, 1, 10, 0, 3],
  ]),
];

// 90 days of generated history, newest first. The "met" rule here is looser
// than the real streak rule so the demo chart shows a believable mix.
export function buildHistory(targets: MacroSet, baseDate: Date = new Date()): DaySummary[] {
  const out: DaySummary[] = [];
  for (let d = 0; d < 90; d++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - d);
    const meals: Meal[] = [
      BREAKFASTS[(d * 7 + 1) % BREAKFASTS.length](),
      LUNCHES[(d * 3 + 2) % LUNCHES.length](),
      DINNERS[(d * 5) % DINNERS.length](),
    ];
    if (d % 4 !== 0) meals.push(SNACKS[d % SNACKS.length]());
    const tot = (k: keyof MacroSet) => meals.reduce((s, m) => s + m[k], 0);
    const kcal = tot('kcal');
    const protein = tot('protein');
    const met = kcal >= targets.kcal * 0.85 && kcal <= targets.kcal * 1.12 && protein >= targets.protein * 0.9;
    out.push({
      d,
      key: isoDate(date),
      dow: DOW[date.getDay()],
      day: date.getDate(),
      month: MONTHS[date.getMonth()],
      year: date.getFullYear(),
      label: `${DOW[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
      shortLabel: `${date.getDate()} ${MONTHS[date.getMonth()]}`,
      kcal,
      protein,
      carbs: tot('carbs'),
      fat: tot('fat'),
      fibre: tot('fibre'),
      met,
      meals,
    });
  }
  return out;
}
