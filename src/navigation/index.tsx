// Navigation tree (React Navigation 7 static API): bottom tabs inside a
// native stack; flows (add meal, goal, day detail, onboarding) are
// full-screen modals.

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabBar } from './TabBar';
import { AddMealScreen } from './screens/AddMealScreen';
import { DayDetailScreen } from './screens/DayDetailScreen';
import { GoalScreen } from './screens/GoalScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { HomeScreen } from './screens/HomeScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const HomeTabs = createBottomTabNavigator({
  tabBar: (props) => <TabBar {...props} />,
  screenOptions: {
    headerShown: false,
  },
  screens: {
    Home: HomeScreen,
    History: HistoryScreen,
    Settings: SettingsScreen,
  },
});

const RootStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    HomeTabs: {
      screen: HomeTabs,
    },
    AddMeal: {
      screen: AddMealScreen,
      options: {
        presentation: 'fullScreenModal',
      },
    },
    Goal: {
      screen: GoalScreen,
      options: {
        presentation: 'fullScreenModal',
      },
    },
    DayDetail: {
      screen: DayDetailScreen,
      options: {
        presentation: 'fullScreenModal',
      },
    },
    Onboarding: {
      screen: OnboardingScreen,
      options: {
        presentation: 'fullScreenModal',
      },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);

type RootStackType = typeof RootStack;

declare module '@react-navigation/core' {
  interface RootNavigator extends RootStackType {}
}
