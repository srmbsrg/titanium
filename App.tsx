/**
 * Titanium — Carborundum AI field-service app.
 *
 * Standalone React Native app for trades techs: dispatch → work order →
 * time & materials → service-agreement sell → invoice → on-site payment,
 * with Carb-O-Comm voice and offline support, talking to the Manifold ERP.
 *
 * (The Loadstone hydration companion that briefly lived in App.tsx has been
 *  un-mounted; its modules remain under src/loadstone/ for a future split.)
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RootNavigator } from './src/navigation';
import { LoginScreen } from './src/screens/LoginScreen';
import { useTitaniumStore } from './src/store';

const queryClient = new QueryClient();

function App(): React.JSX.Element {
  const isAuthenticated = useTitaniumStore((s) => s.isAuthenticated);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {isAuthenticated ? <RootNavigator /> : <LoginScreen />}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
