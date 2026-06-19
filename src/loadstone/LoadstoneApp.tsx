/**
 * LoadstoneApp — top-level Loadstone component.
 *
 * Hydrates persisted state from AsyncStorage on mount, shows a brief splash
 * while loading, then renders the tab navigator.
 */

import React, { useEffect } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';

import { LoadstoneNavigator } from './navigation';
import { useLoadstone } from './store';
import { colors } from './theme';

export function LoadstoneApp() {
  const ready = useLoadstone((s) => s.ready);
  const hydrate = useLoadstone((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <Text style={styles.wordmark}>LOADSTONE</Text>
        <ActivityIndicator color={colors.accent} style={styles.spinner} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <LoadstoneNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 5,
  },
  spinner: { marginTop: 24 },
});
