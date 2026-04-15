/**
 * CustomerListScreen — Searchable list of all customers
 * Root screen of the Customers tab.
 */

import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CustomersStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<CustomersStackParamList, 'CustomerList'>;

const MOCK_CUSTOMERS = [
  { id: 'cust-001', name: 'Smith Residence', address: '1402 Elm St, Austin TX', phone: '(512) 555-0192' },
  { id: 'cust-002', name: 'Barton Office Park', address: '3900 S Lamar Blvd, Austin TX', phone: '(512) 555-0344' },
  { id: 'cust-003', name: 'Mueller District Lofts', address: '1910 Aldrich St, Austin TX', phone: '(512) 555-0571' },
  { id: 'cust-004', name: 'Riverside HVAC Co.', address: '512 Congress Ave, Austin TX', phone: '(512) 555-0813' },
];

export function CustomerListScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');

  const filtered = MOCK_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.address.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search customers..."
        placeholderTextColor="#9CA3AF"
        value={query}
        onChangeText={setQuery}
        clearButtonMode="while-editing"
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('CustomerDetail', { customerId: item.id })
            }
            activeOpacity={0.75}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.address}>{item.address}</Text>
            <Text style={styles.phone}>{item.phone}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  search: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  name: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 3 },
  address: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
  phone: { fontSize: 12, color: '#9CA3AF' },
});
