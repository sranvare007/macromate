// Side effects that react to store actions (RTK listener middleware).

import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { mealAdded } from './slices/mealsSlice';
import { onboardingFinished, profileUpdated } from './slices/profileSlice';
import { toastDismissed, toastShown } from './slices/toastSlice';

export const listenerMiddleware = createListenerMiddleware();

const TOAST_DURATION_MS = 2400;

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
