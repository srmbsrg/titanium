/**
 * Titanium (Carbon) - Carborundum AI field-service app.
 *
 * Standalone React Native app for trades techs: dispatch -> work order ->
 * time & materials -> service-agreement sell -> invoice -> on-site payment,
 * with Carb-O-Comm voice and offline support, talking to the Manifold ERP.
 *
 * On boot we rehydrate the persisted auth session (AsyncStorage) before
 * deciding between the login gate and the app, so a signed-in tech is not
 * bounced back to the login screen on every restart. We also wire connectivity
 * (NetInfo -> store.setOnline) so mutating actions taken offline are queued and
 * flushed automatically on reconnect.
 *
 * (The Loadstone hydration companion that briefly lived in App.tsx has been
 *  un-mounted; its modules remain under src/loadstone/ for a future split.)
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RootNavigator } from './src/navigation';
import { LoginScreen } from './src/screens/LoginScreen';
import { useTitaniumStore, hydrateAuth } from './src/store';
import { initConnectivity } from './src/store/offline';

const queryClient = new QueryClient();

function App(): React.JSX.Element {
  const isAuthenticated = useTitaniumStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  // Rehydrate any persisted session once, before first render of the gate.
  useEffect(() => {
    hydrateAuth().finally(() => setHydrated(true));
  }, []);

  // Track connectivity and flush the offline queue on reconnect.
  useEffect(() => {
    const unsubscribe = initConnectivity();
    return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {!hydrated ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F2436' }}>
              <ActivityIndicator size="large" color="#FDBA74" />
            </View>
          ) : isAuthenticated ? (
            <RootNavigator />
          ) : (
            <LoginScreen />
          )}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;