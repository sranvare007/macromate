// Transient toast message. Domain events set their own copy via
// extraReducers so screens never compose toast text; auto-dismiss lives in
// listeners.ts.

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { mealAdded } from './mealsSlice';
import { onboardingFinished, profileUpdated } from './profileSlice';

interface ToastState {
  message: string | null;
}

const initialState: ToastState = {
  message: null,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    toastShown(state, action: PayloadAction<string>) {
      state.message = action.payload;
    },
    toastDismissed(state) {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(mealAdded, (state, action) => {
        state.message = `${action.payload.type} added · +${action.payload.kcal} kcal`;
      })
      .addCase(onboardingFinished, (state) => {
        state.message = 'Welcome to NutriTrack!';
      })
      .addCase(profileUpdated, (state) => {
        state.message = 'Targets recalculated';
      });
  },
});

export const { toastShown, toastDismissed } = toastSlice.actions;
export const toastReducer = toastSlice.reducer;
