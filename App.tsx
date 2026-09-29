import React, { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/state/AppState';
import { SignalProvider } from './src/services/SignalPlayer';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Onboarding, Splash } from './src/screens/Onboarding';
function Content() {
  const { data, ready } = useApp();
  const [loaded, setLoaded] = useState(false);
  const onDone = useCallback(() => setLoaded(true), []);
  if (!loaded || !ready) return <Splash onDone={onDone} />;
  return data.onboarded ? (
    <SignalProvider>
      <AppNavigator />
    </SignalProvider>
  ) : (
    <Onboarding />
  );
}
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#100C26" />
        <AppProvider>
          <Content />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
