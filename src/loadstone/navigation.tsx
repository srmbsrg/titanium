/**
 * Loadstone — navigation.
 *
 *   RootTab (bottom tabs)
 *   ├── Home (native stack)
 *   │     ├── Dashboard
 *   │     └── History
 *   ├── Log
 *   ├── Protocol
 *   ├── Science
 *   └── Settings
 */

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { NavigationContainer, DefaultTheme, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { DashboardScreen } from './screens/DashboardScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { LogDrinkScreen } from './screens/LogDrinkScreen';
import { ProtocolScreen } from './screens/ProtocolScreen';
import { ScienceScreen } from './screens/ScienceScreen';
import { SettingsScreen } from './screens/SettingsScreen';

import { colors } from './theme';
import type { HomeStackParamList, RootTabParamList } from './navTypes';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const navTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.accent,
  headerTitleStyle: { color: colors.text },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
} as const;

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
    </HomeStack.Navigator>
  );
}

const TAB_ICONS: Record<keyof RootTabParamList, string> = {
  HomeTab: '💧',
  LogTab: '➕',
  ProtocolTab: '🧲',
  ScienceTab: '🔬',
  SettingsTab: '⚙️',
};

const TAB_LABELS: Record<keyof RootTabParamList, string> = {
  HomeTab: 'Home',
  LogTab: 'Log',
  ProtocolTab: 'Protocol',
  ScienceTab: 'Science',
  SettingsTab: 'Settings',
};

function TabIcon({ name, focused }: { name: keyof RootTabParamList; focused: boolean }) {
  return (
    <Text style={[styles.tabIcon, focused ? styles.tabIconActive : styles.tabIconInactive]}>
      {TAB_ICONS[name]}
    </Text>
  );
}

export function LoadstoneNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textFaint,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          tabBarLabel: TAB_LABELS[route.name],
          tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeNavigator} />
        <Tab.Screen name="LogTab" component={LogDrinkScreen} />
        <Tab.Screen name="ProtocolTab" component={ProtocolScreen} />
        <Tab.Screen name="ScienceTab" component={ScienceScreen} />
        <Tab.Screen name="SettingsTab" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIcon: { fontSize: 18 },
  tabIconActive: { opacity: 1 },
  tabIconInactive: { opacity: 0.5 },
});
