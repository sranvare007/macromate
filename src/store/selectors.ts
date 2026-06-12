// Derived data lives here, never in the store: targets and history are
// memoised projections of profile + today's meals.

import { createSelector } from '@reduxjs/toolkit';
import { dateFromKey, dayKey, DOW, MONTHS } from '../lib/dates';
import { computeTargets, sumMeals } from '../lib/macros';
import type { DaySummary, MacroSet, Meal } from '../types';
import type { RootState } from './index';

export const selectOnboarded = (state: RootState) => state.profile.onboarded;
export const selectProfile = (state: RootState) => state.profile.profile;
export const selectTodayMeals = (state: RootState) => state.meals.today;
export const selectPastDays = (state: RootState) => state.meals.past;
export const selectToast = (state: RootState) => state.toast.message;

export const selectTargets = createSelector(selectProfile, (profile) => profile.targets ?? computeTargets(profile));

const MS_PER_DAY = 86_400_000;

function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((a - b) / MS_PER_DAY);
}

function daySummary(date: Date, meals: Meal[], targets: MacroSet, daysAgo: number): DaySummary {
  const totals = sumMeals(meals);
  return {
    d: daysAgo,
    key: dayKey(date),
    dow: DOW[date.getDay()],
    day: date.getDate(),
    month: MONTHS[date.getMonth()],
    year: date.getFullYear(),
    label: `${DOW[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
    shortLabel: `${date.getDate()} ${MONTHS[date.getMonth()]}`,
    ...totals,
    meals,
    met:
      totals.kcal >= targets.kcal * 0.85 &&
      totals.kcal <= targets.kcal * 1.12 &&
      totals.protein >= targets.protein * 0.9,
  };
}

// History = today's live log followed by the persisted past days, newest
// first. `met` is recomputed against current targets so historical days
// reflect the active goal.
export const selectHistory = createSelector(
  selectTargets,
  selectTodayMeals,
  selectPastDays,
  (targets, todayMeals, past): DaySummary[] => {
    const today = new Date();
    const head = daySummary(today, todayMeals, targets, 0);
    const rest = past.map((d) => {
      const date = dateFromKey(d.day);
      return daySummary(date, d.meals, targets, daysBetween(today, date));
    });
    return [head, ...rest];
  },
);
