import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_700Bold_Italic,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import { DarkTheme, DefaultTheme, type Theme as NavTheme } from '@react-navigation/native';
import { createURL } from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { Navigation } from './navigation';
import { Toast } from './components/Toast';
import { selectToast, store, useAppSelector } from './store';
import { ThemeProvider, useTheme } from './theme';

SplashScreen.preventAutoHideAsync();

const prefix = createURL('/');

function AppToast() {
  const toast = useAppSelector(selectToast);
  return <Toast message={toast} />;
}

function Root() {
  const T = useTheme();

  const navTheme: NavTheme = React.useMemo(() => {
    const base = T.dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: T.accent.mid,
        background: T.c.bg,
        card: T.c.surface,
        text: T.c.text,
        border: T.c.hair,
      },
    };
  }, [T]);

  return (
    <>
      <StatusBar barStyle={T.dark ? 'light-content' : 'dark-content'} />
      <Navigation
        theme={navTheme}
        linking={{
          enabled: 'auto',
          prefixes: [prefix],
        }}
        onReady={() => {
          SplashScreen.hideAsync();
        }}
      />
      <AppToast />
    </>
  );
}

export function App() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_700Bold_Italic,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  // On load failure, render anyway with system-font fallback rather than
  // hanging on the splash screen.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Root />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
