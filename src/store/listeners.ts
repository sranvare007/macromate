// Side effects that react to store actions (RTK listener middleware):
// toast auto-dismiss + persisting writes to SQLite.

import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { clearMeals, insertMeal } from '../db/meals';
import { deleteProfile, saveProfile } from '../db/profile';
import { appDataCleared } from './actions';
import { mealAdded } from './slices/mealsSlice';
import { onboardingFinished, profileUpdated } from './slices/profileSlice';
import { toastDismissed, toastShown } from './slices/toastSlice';
import type { RootState } from './index';

export const listenerMiddleware = createListenerMiddleware();

const TOAST_DURATION_MS = 2400;

// Persist profile changes after the reducer has applied them.
listenerMiddleware.startListening({
  matcher: isAnyOf(onboardingFinished, profileUpdated),
  effect: (_action, api) => {
    const { profile } = api.getState() as RootState;
    saveProfile(profile.profile, profile.onboarded);
  },
});

// Persist each newly logged meal (and its items).
listenerMiddleware.startListening({
  actionCreator: mealAdded,
  effect: (action) => {
    insertMeal(action.payload);
  },
});

// Full data wipe: clear every meal and the profile from the database. The
// slices reset their in-memory state via extraReducers.
listenerMiddleware.startListening({
  actionCreator: appDataCleared,
  effect: () => {
    clearMeals();
    deleteProfile();
  },
});

// Auto-dismiss the toast after every action that shows one; a newer toast
// cancels the pending timer so it gets the full duration.
listenerMiddleware.startListening({
  matcher: isAnyOf(toastShown, mealAdded, onboardingFinished, profileUpdated),
  effect: async (_action, api) => {
    api.cancelActiveListeners();
    await api.delay(TOAST_DURATION_MS);
    api.dispatch(toastDismissed());
  },
});
