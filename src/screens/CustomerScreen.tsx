/**
 * CustomerScreen — Customer record + equipment history
 * Shows contact info and a list of all equipment at the customer's site.
 */

import React from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CustomersStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<CustomersStackParamList, 'CustomerDetail'>;

const MOCK_CUSTOMER = {
  id: 'cust-001',
  name: 'Smith Residence',
  phone: '(512) 555-0192',
  email: 'j.smith@example.com',
  address: '1402 Elm St, Austin TX 78701',
  notes: 'Long-time customer. Prefers morning appointments.',
};

const MOCK_EQUIPMENT = [
  {
    id: 'eq-001',
    make: 'Carrier',
    model: '24ACC636A003',
    serialNumber: 'CR1234567',
    type: 'Central AC',
    lastServicedAt: '2025-11-03',
  },
  {
    id: 'eq-002',
    make: 'Rheem',
    model: 'PROG50-38N RH60',
    serialNumber: 'RH9876543',
    type: 'Water Heater',
    lastServicedAt: '2025-06-12',
  },
];

export function CustomerScreen({ route, navigation }: Props) {
  const { customerId } = route.params;
  void customerId; // TODO: fetch from carbonClient.getCustomer(customerId)

  const customer = MOCK_CUSTOMER;
  const equipment = MOCK_EQUIPMENT;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Contact */}
      <Section title="Contact">
        <Row label="Name" value={customer.name} />
        <Row label="Phone" value={customer.phone} />
        <Row label="Email" value={customer.email} />
        <Row label="Address" value={customer.address} />
      </Section>

      {/* Notes */}
      {customer.notes ? (
        <Section title="Notes">
          <Text style={styles.bodyText}>{customer.notes}</Text>
        </Section>
      ) : null}

      {/* Equipment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipment on Site</Text>
        {equipment.length === 0 ? (
          <Text style={styles.empty}>No equipment records.</Text>
        ) : (
          <FlatList
            data={equipment}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.eqCard}
                onPress={() =>
                  navigation.navigate('EquipmentDetail', {
                    equipmentId: item.id,
                    customerId: customer.id,
                  })
                }
                activeOpacity={0.75}
              >
                <View style={styles.eqRow}>
                  <Text style={styles.eqType}>{item.type}</Text>
                  <Text style={styles.eqService}>
                    Serviced {item.lastServicedAt}
                  </Text>
                </View>
                <Text style={styles.eqName}>
                  {item.make} {item.model}
                </Text>
                <Text style={styles.eqSerial}>S/N: {item.serialNumber}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        )}
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: 14, color: '#6B7280' },
  rowValue: { fontSize: 14, fontWeight: '500', color: '#111827', flexShrink: 1, textAlign: 'right' },
  bodyText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  empty: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 12 },
  eqCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  eqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eqType: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  eqService: { fontSize: 12, color: '#9CA3AF' },
  eqName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  eqSerial: { fontSize: 12, color: '#6B7280' },
});
