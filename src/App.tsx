import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_700Bold_Italic,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import {
  DarkTheme,
  DefaultTheme,
  type Theme as NavTheme,
  useNavigationContainerRef,
} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
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

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

Sentry.init({
  dsn: 'https://76c7f6893623bd76a5be4d357d4a21da@o4508620159844352.ingest.de.sentry.io/4511545191759952',
  // Capture device/IP context with events. Set false if you'd rather not send PII.
  sendDefaultPii: true,
  // Sample 100% of performance traces for now; lower for production traffic.
  tracesSampleRate: 1.0,
  integrations: [navigationIntegration],
});

SplashScreen.preventAutoHideAsync();

const prefix = createURL('/');

function AppToast() {
  const toast = useAppSelector(selectToast);
  return <Toast message={toast} />;
}

function Root() {
  const T = useTheme();
  const navigationRef = useNavigationContainerRef();

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
        ref={navigationRef}
        theme={navTheme}
        linking={{
          enabled: 'auto',
          prefixes: [prefix],
        }}
        onReady={() => {
          navigationIntegration.registerNavigationContainer(navigationRef);
          SplashScreen.hideAsync();
        }}
      />
      <AppToast />
    </>
  );
}

function AppRoot() {
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

// Sentry.wrap enables touch/navigation breadcrumbs, profiling, and error boundary.
export const App = Sentry.wrap(AppRoot);
