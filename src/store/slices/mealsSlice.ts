// Today's meal log. History is read-only in v1, so only today is mutable
// state; past days are derived in selectors.ts.

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { INITIAL_MEALS } from '../../api/mockData';
import type { Meal } from '../../types';

interface MealsState {
  today: Meal[]; // chronological
}

const initialState: MealsState = {
  today: INITIAL_MEALS,
};

const mealsSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    mealAdded(state, action: PayloadAction<Meal>) {
      state.today.push(action.payload);
    },
  },
});

export const { mealAdded } = mealsSlice.actions;
export const mealsReducer = mealsSlice.reducer;
