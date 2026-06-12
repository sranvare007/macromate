// Cross-slice actions handled by more than one reducer.

import { createAction } from '@reduxjs/toolkit';

// Full GDPR-style wipe: clears the profile and every logged meal. Each slice
// resets its state via extraReducers; the database is cleared in the listener
// middleware (src/store/listeners.ts).
export const appDataCleared = createAction('app/dataCleared');
