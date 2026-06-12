// CRUD for meals and their items. A meal is stored with a local `day` key
// (YYYY-MM-DD) so history can be grouped per calendar day; items cascade-delete
// with their meal.

import { dayKey } from '../lib/dates';
import type { Meal, MealItem, MealType } from '../types';
import { db } from './index';

interface MealRow {
  id: string;
  meal_type: string;
  day: string;
  time: string;
  logged_at: number;
  raw_input: string | null;
  total_kcal: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fibre_g: number;
}

interface ItemRow {
  meal_id: string;
  food_name: string;
  portion_size: string | null;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fibre_g: number;
}

// A persisted day of meals, newest day first; meals within a day are
// chronological. Targets-dependent fields (met %, summaries) are derived in
// selectors, not stored.
export interface StoredDay {
  day: string; // YYYY-MM-DD
  meals: Meal[];
}

function itemRowToItem(r: ItemRow): MealItem {
  return {
    name: r.food_name,
    qty: r.portion_size ?? '',
    kcal: r.kcal,
    protein: r.protein_g,
    carbs: r.carbs_g,
    fat: r.fat_g,
    fibre: r.fibre_g,
  };
}

function mealRowToMeal(r: MealRow, items: MealItem[]): Meal {
  return {
    id: r.id,
    type: r.meal_type as MealType,
    time: r.time,
    ...(r.raw_input ? { raw: r.raw_input } : {}),
    items,
    kcal: r.total_kcal,
    protein: r.total_protein_g,
    carbs: r.total_carbs_g,
    fat: r.total_fat_g,
    fibre: r.total_fibre_g,
  };
}

// Group item rows by meal id for O(1) lookup when assembling meals.
function itemsByMeal(): Map<string, MealItem[]> {
  const rows = db.getAllSync<ItemRow>('SELECT * FROM meal_items ORDER BY id ASC');
  const map = new Map<string, MealItem[]>();
  for (const r of rows) {
    const list = map.get(r.meal_id) ?? [];
    list.push(itemRowToItem(r));
    map.set(r.meal_id, list);
  }
  return map;
}

function itemsForMeal(mealId: string): MealItem[] {
  const rows = db.getAllSync<ItemRow>(
    'SELECT * FROM meal_items WHERE meal_id = ? ORDER BY id ASC',
    [mealId],
  );
  return rows.map(itemRowToItem);
}

// All meals logged on a given day, chronological.
export function getMealsForDay(day: string): Meal[] {
  const rows = db.getAllSync<MealRow>(
    'SELECT * FROM meals WHERE day = ? ORDER BY logged_at ASC',
    [day],
  );
  return rows.map((r) => mealRowToMeal(r, itemsForMeal(r.id)));
}

// All days with at least one meal, newest first. Pass `excludeDay` (typically
// today) to omit the live day that the store tracks separately.
export function loadHistory(excludeDay?: string): StoredDay[] {
  const rows = db.getAllSync<MealRow>('SELECT * FROM meals ORDER BY logged_at DESC');
  const items = itemsByMeal();

  const days: StoredDay[] = [];
  const byKey = new Map<string, StoredDay>();
  for (const r of rows) {
    if (r.day === excludeDay) continue;
    let entry = byKey.get(r.day);
    if (!entry) {
      entry = { day: r.day, meals: [] };
      byKey.set(r.day, entry);
      days.push(entry);
    }
    entry.meals.push(mealRowToMeal(r, items.get(r.id) ?? []));
  }
  // Rows arrive newest-first; reverse each day's meals back to chronological.
  for (const d of days) d.meals.reverse();
  return days;
}

// Insert (or replace) a meal and its items in one transaction. `loggedAt`
// defaults to now and determines the day the meal is filed under.
export function insertMeal(meal: Meal, loggedAt: number = Date.now()): void {
  const day = dayKey(new Date(loggedAt));
  db.withTransactionSync(() => {
    db.runSync(
      `INSERT OR REPLACE INTO meals (
         id, meal_type, day, time, logged_at, raw_input,
         total_kcal, total_protein_g, total_carbs_g, total_fat_g, total_fibre_g
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        meal.id,
        meal.type,
        day,
        meal.time,
        loggedAt,
        meal.raw ?? null,
        meal.kcal,
        meal.protein,
        meal.carbs,
        meal.fat,
        meal.fibre,
      ],
    );
    db.runSync('DELETE FROM meal_items WHERE meal_id = ?', [meal.id]);
    for (const it of meal.items) {
      db.runSync(
        `INSERT INTO meal_items (
           meal_id, food_name, portion_size, kcal, protein_g, carbs_g, fat_g, fibre_g
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [meal.id, it.name, it.qty, it.kcal, it.protein, it.carbs, it.fat, it.fibre],
      );
    }
  });
}

// Delete a meal; its items cascade.
export function deleteMeal(id: string): void {
  db.runSync('DELETE FROM meals WHERE id = ?', [id]);
}

// Remove every meal (and item, via cascade). Used for a full data reset.
export function clearMeals(): void {
  db.runSync('DELETE FROM meals');
}
