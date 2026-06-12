// User profile + onboarding status, backed by SQLite. Initial state is
// hydrated from the database; writes are persisted by the listener middleware
// (src/store/listeners.ts).

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { loadProfile } from '../../db/profile';
import type { UserProfile } from '../../types';
import { appDataCleared } from '../actions';

interface ProfileState {
  onboarded: boolean;
  profile: UserProfile;
}

// Blank-slate profile used before onboarding completes. The onboarding flow
// collects weight, height and goal; the remaining fields keep the UI
// renderable until then and are overwritten on finish.
const DEFAULT_PROFILE: UserProfile = {
  name: 'You',
  email: '',
  goalKey: 'lean_muscle',
  weightKg: 70,
  heightCm: 170,
  age: 25,
  sex: 'male',
  streak: 0,
};

// Un-onboarded blank state: used on a fresh install and after a data wipe, so
// the app routes to the onboarding flow (gated in src/navigation/index.tsx).
const blankState = (): ProfileState => ({ onboarded: false, profile: DEFAULT_PROFILE });

// Hydrate from the database, falling back to the blank state when nothing is
// stored yet.
const initialState: ProfileState = loadProfile() ?? blankState();

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    onboardingFinished(state, action: PayloadAction<UserProfile>) {
      state.profile = action.payload;
      state.onboarded = true;
    },
    profileUpdated(state, action: PayloadAction<Partial<UserProfile>>) {
      const affectsTargets =
        'weightKg' in action.payload || 'heightCm' in action.payload || 'goalKey' in action.payload;
      if (affectsTargets && !('targets' in action.payload)) {
        delete state.profile.targets;
      }
      Object.assign(state.profile, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(appDataCleared, () => blankState());
  },
});

export const { onboardingFinished, profileUpdated } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;
