/**
 * Titanium — Root navigation
 *
 * Structure:
 *   RootTabNavigator (bottom tabs)
 *   ├── Jobs (stack)
 *   │   ├── HomeScreen         — daily job queue
 *   │   ├── JobDetailScreen    — job record
 *   │   └── WorkOrderScreen    — create/edit work order
 *   ├── Customers (stack)
 *   │   ├── CustomerListScreen — searchable customer list
 *   │   ├── CustomerScreen     — customer record + equipment
 *   │   └── EquipmentScreen    — equipment detail (via customer)
 *   └── Equipment (stack)
 *       ├── EquipmentListScreen — all equipment
 *       └── EquipmentScreen     — equipment detail (direct)
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { JobDetailScreen } from '../screens/JobDetailScreen';
import { WorkOrderScreen } from '../screens/WorkOrderScreen';
import { CustomerListScreen } from '../screens/CustomerListScreen';
import { CustomerScreen } from '../screens/CustomerScreen';
import { EquipmentListScreen } from '../screens/EquipmentListScreen';
import { EquipmentScreen } from '../screens/EquipmentScreen';

import type {
  JobsStackParamList,
  CustomersStackParamList,
  EquipmentStackParamList,
  RootTabParamList,
} from '../types/navigation';

const JobsStack = createNativeStackNavigator<JobsStackParamList>();
const CustomersStack = createNativeStackNavigator<CustomersStackParamList>();
const EquipmentStack = createNativeStackNavigator<EquipmentStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const BRAND = '#1D4ED8'; // Titanium blue

function JobsNavigator() {
  return (
    <JobsStack.Navigator
      screenOptions={{
        headerTintColor: BRAND,
        headerBackTitle: 'Back',
      }}
    >
      <JobsStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Today's Jobs" }}
      />
      <JobsStack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: 'Job Details' }}
      />
      <JobsStack.Screen
        name="WorkOrder"
        component={WorkOrderScreen}
        options={({ route }) => ({
          title: route.params.workOrderId ? 'Work Order' : 'New Work Order',
        })}
      />
    </JobsStack.Navigator>
  );
}

function CustomersNavigator() {
  return (
    <CustomersStack.Navigator
      screenOptions={{
        headerTintColor: BRAND,
        headerBackTitle: 'Back',
      }}
    >
      <CustomersStack.Screen
        name="CustomerList"
        component={CustomerListScreen}
        options={{ title: 'Customers' }}
      />
      <CustomersStack.Screen
        name="CustomerDetail"
        component={CustomerScreen}
        options={{ title: 'Customer' }}
      />
      <CustomersStack.Screen
        name="EquipmentDetail"
        component={EquipmentScreen}
        options={{ title: 'Equipment' }}
      />
    </CustomersStack.Navigator>
  );
}

function EquipmentNavigator() {
  return (
    <EquipmentStack.Navigator
      screenOptions={{
        headerTintColor: BRAND,
        headerBackTitle: 'Back',
      }}
    >
      <EquipmentStack.Screen
        name="EquipmentList"
        component={EquipmentListScreen}
        options={{ title: 'Equipment' }}
      />
      <EquipmentStack.Screen
        name="EquipmentDetail"
        component={EquipmentScreen}
        options={{ title: 'Equipment Details' }}
      />
    </EquipmentStack.Navigator>
  );
}

// Tab bar icon placeholder — swap for react-native-vector-icons or SF Symbols later
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Jobs: '📋',
    Customers: '👥',
    Equipment: '🔧',
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
          tabBarStyle: {
            borderTopColor: '#E5E7EB',
          },
          tabBarIcon: ({ focused }) => (
            <TabIcon label={route.name} focused={focused} />
          ),
        })}
      >
        <Tab.Screen name="Jobs" component={JobsNavigator} />
        <Tab.Screen name="Customers" component={CustomersNavigator} />
        <Tab.Screen name="Equipment" component={EquipmentNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
