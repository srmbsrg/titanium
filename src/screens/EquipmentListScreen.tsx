/**
 * EquipmentListScreen — All equipment across all sites
 * Root screen of the Equipment tab. Filter by type, sort by last service date.
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
import type { EquipmentStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<EquipmentStackParamList, 'EquipmentList'>;

// TODO: endpoint missing - no installed-equipment list endpoint on the Manifold backend.
// carbonClient.getAllEquipment() hits GET /api/erp/inventory?type=stock, which returns
// WAREHOUSE stock items (InventoryItem), NOT installed customer equipment (make/model/
// serial/service-history). Wiring it here would misrepresent warehouse parts as field
// equipment, so this screen stays mocked until a real installed-equipment endpoint exists.
const MOCK_EQUIPMENT = [
  {
    id: 'eq-001',
    make: 'Carrier',
    model: '24ACC636A003',
    type: 'Central AC',
    customerName: 'Smith Residence',
    customerId: 'cust-001',
    lastServicedAt: '2025-11-03',
  },
  {
    id: 'eq-002',
    make: 'Rheem',
    model: 'PROG50-38N RH60',
    type: 'Water Heater',
    customerName: 'Smith Residence',
    customerId: 'cust-001',
    lastServicedAt: '2025-06-12',
  },
  {
    id: 'eq-003',
    make: 'Lennox',
    model: 'XC21-036',
    type: 'Central AC',
    customerName: 'Barton Office Park',
    customerId: 'cust-002',
    lastServicedAt: '2025-09-22',
  },
  {
    id: 'eq-004',
    make: 'Generac',
    model: '7043',
    type: 'Generator',
    customerName: 'Mueller District Lofts',
    customerId: 'cust-003',
    lastServicedAt: '2024-12-01',
  },
];

export function EquipmentListScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');

  const filtered = MOCK_EQUIPMENT.filter(
    (e) =>
      e.make.toLowerCase().includes(query.toLowerCase()) ||
      e.model.toLowerCase().includes(query.toLowerCase()) ||
      e.type.toLowerCase().includes(query.toLowerCase()) ||
      e.customerName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search equipment..."
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
              navigation.navigate('EquipmentDetail', {
                equipmentId: item.id,
                customerId: item.customerId,
              })
            }
            activeOpacity={0.75}
          >
            <View style={styles.cardRow}>
              <Text style={styles.type}>{item.type}</Text>
              <Text style={styles.service}>Serviced {item.lastServicedAt}</Text>
            </View>
            <Text style={styles.name}>
              {item.make} {item.model}
            </Text>
            <Text style={styles.customer}>{item.customerName}</Text>
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
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  type: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  service: { fontSize: 12, color: '#9CA3AF' },
  name: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  customer: { fontSize: 13, color: '#6B7280' },
});
