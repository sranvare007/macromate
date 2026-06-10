// Derived data lives here, never in the store: targets and history are
// memoised projections of profile + today's meals.

import { createSelector } from '@reduxjs/toolkit';
import { buildHistory } from '../api/mockData';
import { computeTargets, sumMeals } from '../lib/macros';
import type { DaySummary } from '../types';
import type { RootState } from './index';

export const selectOnboarded = (state: RootState) => state.profile.onboarded;
export const selectProfile = (state: RootState) => state.profile.profile;
export const selectTodayMeals = (state: RootState) => state.meals.today;
export const selectToast = (state: RootState) => state.toast.message;

export const selectTargets = createSelector(selectProfile, (profile) => profile.targets ?? computeTargets(profile));

// Generated history with today's slot replaced by the live meal log.
export const selectHistory = createSelector(
  selectTargets,
  selectTodayMeals,
  (targets, meals): DaySummary[] => {
    const h = buildHistory(targets);
    const totals = sumMeals(meals);
    const today: DaySummary = {
      ...h[0],
      ...totals,
      meals,
      met:
        totals.kcal >= targets.kcal * 0.85 &&
        totals.kcal <= targets.kcal * 1.12 &&
        totals.protein >= targets.protein * 0.9,
    };
    return [today, ...h.slice(1)];
  },
);
