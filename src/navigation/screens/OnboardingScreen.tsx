// Onboarding screen wrapper — hosts the multi-step flow and writes the
// resulting profile to the store.

import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { OnboardingFlow } from '../../features/onboarding/OnboardingFlow';
import { onboardingFinished, selectProfile, useAppDispatch, useAppSelector } from '../../store';

export function OnboardingScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);

  return (
    <OnboardingFlow
      initialProfile={profile}
      onFinish={(p) => {
        dispatch(onboardingFinished(p));
        if (navigation.canGoBack()) navigation.goBack();
      }}
      onClose={navigation.canGoBack() ? () => navigation.goBack() : undefined}
    />
  );
}
