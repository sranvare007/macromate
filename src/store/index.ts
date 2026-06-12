// Global app state (Redux Toolkit). Slices hold raw state only; derived
// values (targets, history) come from selectors.ts.

import { configureStore } from '@reduxjs/toolkit';
import { listenerMiddleware } from './listeners';
import { mealsReducer } from './slices/mealsSlice';
import { profileReducer } from './slices/profileSlice';
import { toastReducer } from './slices/toastSlice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    meals: mealsReducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { useAppDispatch, useAppSelector } from './hooks';
export * from './selectors';
export { appDataCleared } from './actions';
export { mealAdded } from './slices/mealsSlice';
export { onboardingFinished, profileUpdated } from './slices/profileSlice';
export { toastDismissed, toastShown } from './slices/toastSlice';
