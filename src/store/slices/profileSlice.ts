// User profile + onboarding status. v1 keeps everything in memory, seeded
// with mock data; swap the seed/actions for API calls (src/api/) when the
// backend lands.

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { MOCK_PROFILE } from '../../api/mockData';
import type { UserProfile } from '../../types';

interface ProfileState {
  onboarded: boolean;
  profile: UserProfile;
}

// Seeded as already-onboarded so the demo opens on the dashboard;
// Settings → "Replay onboarding" shows the first-launch flow.
const initialState: ProfileState = {
  onboarded: true,
  profile: MOCK_PROFILE,
};

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
});

export const { onboardingFinished, profileUpdated } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;
