/**
 * Loadstone — Structured Hydration companion app.
 *
 * Offline-first wellness companion for the Loadstone magnetic water flask.
 * (Built inside the Titanium RN repo; the legacy Carborundum field-app modules
 * under src/screens remain in the tree but are not mounted here.)
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LoadstoneApp } from './src/loadstone/LoadstoneApp';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LoadstoneApp />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
