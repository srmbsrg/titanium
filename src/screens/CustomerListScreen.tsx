/**
 * CustomerListScreen - Searchable list of all customers.
 * Root screen of the Customers tab.
 *
 * Wired to the live Manifold ERP: carbonClient.getCustomers() -> GET /api/erp/crm/customers.
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { carbonClient } from '../api/carbonClient';
import type { Address, Customer } from '../types/models';
import type { CustomersStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<CustomersStackParamList, 'CustomerList'>;

function formatAddress(a?: Address): string {
  if (!a) return '';
  return [a.street, a.city, a.state].filter(Boolean).join(', ');
}

export function CustomerListScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');

  const {
    data: customers = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['customers'],
    queryFn: () => carbonClient.getCustomers(),
  });

  const q = query.toLowerCase();
  const filtered = customers.filter((c: Customer) => {
    const addr = formatAddress(c.address).toLowerCase();
    return (c.name ?? '').toLowerCase().includes(q) || addr.includes(q);
  });

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

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1D4ED8" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Could not load customers.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {query ? 'No customers match your search.' : 'No customers yet.'}
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('CustomerDetail', { customerId: item.id })
              }
              activeOpacity={0.75}
            >
              <Text style={styles.name}>{item.name}</Text>
              {formatAddress(item.address) ? (
                <Text style={styles.address}>{formatAddress(item.address)}</Text>
              ) : null}
              {item.phone ? <Text style={styles.phone}>{item.phone}</Text> : null}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 15, color: '#B91C1C', marginBottom: 12 },
  retryBtn: { backgroundColor: '#1D4ED8', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryBtnText: { color: '#FFFFFF', fontWeight: '700' },
  empty: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 32 },
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
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, flexGrow: 1 },
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