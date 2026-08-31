/**
 * Titanium — Root navigation
 *
 * Structure:
 *   RootTabNavigator (bottom tabs)
 *   ├── Jobs (stack) — today's jobs, detail, work orders, complete, payment
 *   ├── Dispatch (stack) — incoming job queue
 *   ├── Customers (stack) — searchable customer list
 *   └── Equipment (stack) — all equipment
 *
 *   CarbCommScreen — global voice modal (overlays all tabs)
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { JobDetailScreen } from '../screens/JobDetailScreen';
import { WorkOrderScreen } from '../screens/WorkOrderScreen';
import { JobCompleteScreen } from '../screens/JobCompleteScreen';
import { JobPaymentScreen } from '../screens/JobPaymentScreen';
import { DispatchScreen } from '../screens/DispatchScreen';
import { CustomerListScreen } from '../screens/CustomerListScreen';
import { CustomerScreen } from '../screens/CustomerScreen';
import { EquipmentListScreen } from '../screens/EquipmentListScreen';
import { EquipmentScreen } from '../screens/EquipmentScreen';
import { HowToScreen } from '../screens/HowToScreen';
import { UpsellScreen } from '../screens/UpsellScreen';
import { CarbCommScreen } from '../screens/CarbCommScreen';

import type {
  JobsStackParamList,
  CustomersStackParamList,
  EquipmentStackParamList,
  DispatchStackParamList,
  RootTabParamList,
} from '../types/navigation';

const JobsStack = createNativeStackNavigator<JobsStackParamList>();
const CustomersStack = createNativeStackNavigator<CustomersStackParamList>();
const EquipmentStack = createNativeStackNavigator<EquipmentStackParamList>();
const DispatchStack = createNativeStackNavigator<DispatchStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const BRAND = '#1D4ED8';
const BRAND_ORANGE = '#FDBA74';

function JobsNavigator() {
  return (
    <JobsStack.Navigator
      screenOptions={{ headerTintColor: BRAND, headerBackTitle: 'Back' }}
    >
      <JobsStack.Screen name="Home" component={HomeScreen} options={{ title: "Today's Jobs" }} />
      <JobsStack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job Details' }} />
      <JobsStack.Screen
        name="WorkOrder"
        component={WorkOrderScreen}
        options={({ route }) => ({
          title: route.params.workOrderId ? 'Work Order' : 'New Work Order',
        })}
      />
      <JobsStack.Screen name="JobComplete" component={JobCompleteScreen} options={{ title: 'Complete Job' }} />
      <JobsStack.Screen name="JobPayment" component={JobPaymentScreen} options={{ title: 'Collect Payment' }} />
    </JobsStack.Navigator>
  );
}

function DispatchNavigator() {
  return (
    <DispatchStack.Navigator
      screenOptions={{ headerTintColor: BRAND, headerBackTitle: 'Back' }}
    >
      <DispatchStack.Screen name="DispatchList" component={DispatchScreen} options={{ title: 'Dispatch Queue' }} />
      <DispatchStack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job Details' }} />
    </DispatchStack.Navigator>
  );
}

function CustomersNavigator() {
  return (
    <CustomersStack.Navigator
      screenOptions={{ headerTintColor: BRAND, headerBackTitle: 'Back' }}
    >
      <CustomersStack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: 'Customers' }} />
      <CustomersStack.Screen name="CustomerDetail" component={CustomerScreen} options={{ title: 'Customer' }} />
      <CustomersStack.Screen name="EquipmentDetail" component={EquipmentScreen} options={{ title: 'Equipment' }} />
    </CustomersStack.Navigator>
  );
}

function EquipmentNavigator() {
  return (
    <EquipmentStack.Navigator
      screenOptions={{ headerTintColor: BRAND, headerBackTitle: 'Back' }}
    >
      <EquipmentStack.Screen name="EquipmentList" component={EquipmentListScreen} options={{ title: 'Equipment' }} />
      <EquipmentStack.Screen name="EquipmentDetail" component={EquipmentScreen} options={{ title: 'Equipment Details' }} />
    </EquipmentStack.Navigator>
  );
}

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Jobs: '📋',
    Dispatch: '📡',
    Customers: '👥',
    Equipment: '🔧',
    HowTo: '📘',
    Upsell: '💲',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? '●'}
    </Text>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: BRAND,
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: { borderTopColor: '#E5E7EB' },
          tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        })}
      >
        <Tab.Screen name="Jobs" component={JobsNavigator} />
        <Tab.Screen name="Dispatch" component={DispatchNavigator} />
        <Tab.Screen name="Customers" component={CustomersNavigator} />
        <Tab.Screen name="Equipment" component={EquipmentNavigator} />
        <Tab.Screen
          name="HowTo"
          component={HowToScreen}
          options={{ tabBarLabel: 'How-To' }}
        />
        <Tab.Screen
          name="Upsell"
          component={UpsellScreen}
          options={{ tabBarLabel: 'Upsell' }}
        />
      </Tab.Navigator>

      {/* Global Carb-O-Comm voice modal — overlays all tabs */}
      <CarbCommScreen />
    </NavigationContainer>
  );
}
