// Meal log, backed by SQLite. `today` is the live, mutable list; `past` holds
// previously logged days (read-only in v1) hydrated from the database at
// startup. History is derived in selectors.ts.

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getMealsForDay, loadHistory, type StoredDay } from '../../db/meals';
import { dayKey } from '../../lib/dates';
import type { Meal } from '../../types';
import { appDataCleared } from '../actions';

interface MealsState {
  today: Meal[]; // chronological
  past: StoredDay[]; // newest day first
}

const todayKey = dayKey();

const initialState: MealsState = {
  today: getMealsForDay(todayKey),
  past: loadHistory(todayKey),
};

const mealsSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    mealAdded(state, action: PayloadAction<Meal>) {
      state.today.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(appDataCleared, (state) => {
      state.today = [];
      state.past = [];
    });
  },
});

export const { mealAdded } = mealsSlice.actions;
export const mealsReducer = mealsSlice.reducer;
