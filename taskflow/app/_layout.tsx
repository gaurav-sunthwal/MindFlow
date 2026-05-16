import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from 'expo-splash-screen';
import { 
  useFonts, 
  Geist_400Regular, 
  Geist_500Medium, 
  Geist_600SemiBold 
} from '@expo-google-fonts/geist';

import Theme from '../constants/Theme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { TaskProvider } from '../context/TaskContext';
import { EventProvider } from '../context/EventContext';
import { NoteProvider } from '../context/NoteContext';
import { DocumentProvider } from '../context/DocumentContext';
import { ActivityProvider } from '../context/ActivityContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [loaded, error] = useFonts({
    'Geist-Regular': Geist_400Regular,
    'Geist-Medium': Geist_500Medium,
    'Geist-SemiBold': Geist_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    if (!loaded || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect away from the login page
      router.replace('/');
    }
  }, [isAuthenticated, segments, loaded, isLoading]);

  if ((!loaded && !error) || isLoading) {
    return null;
  }


  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Theme.colors.background },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ActivityProvider>
        <TaskProvider>
          <EventProvider>
            <NoteProvider>
              <DocumentProvider>
                <RootLayoutNav />
              </DocumentProvider>
            </NoteProvider>
          </EventProvider>
        </TaskProvider>
      </ActivityProvider>
    </AuthProvider>
  );
}
