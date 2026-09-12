/**
 * EquipmentScreen — Equipment detail + service history
 * Shows unit specs and full service history for a given piece of equipment.
 * Reachable from CustomerScreen or the Equipment tab.
 */

import React from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { EquipmentStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<EquipmentStackParamList, 'EquipmentDetail'>;

const MOCK_EQUIPMENT = {
  id: 'eq-001',
  make: 'Carrier',
  model: '24ACC636A003',
  serialNumber: 'CR1234567',
  type: 'Central AC — 3 Ton',
  installedAt: '2019-05-14',
  lastServicedAt: '2025-11-03',
  notes: 'Refrigerant: R-410A. Warranty expires 2029-05-14.',
};

const MOCK_SERVICE_HISTORY = [
  {
    id: 'svc-003',
    date: '2025-11-03',
    tech: 'Diego R.',
    summary: 'Fall maintenance. Filter replaced. Coils cleaned.',
  },
  {
    id: 'svc-002',
    date: '2025-04-18',
    tech: 'Diego R.',
    summary: 'Spring startup. Checked refrigerant. All nominal.',
  },
  {
    id: 'svc-001',
    date: '2024-11-07',
    tech: 'Maria L.',
    summary: 'Annual inspection. Minor refrigerant top-off (0.5 lb).',
  },
];

export function EquipmentScreen({ route }: Props) {
  const { equipmentId } = route.params;
  // TODO: endpoint missing - both data sources for this screen 404 on the Manifold backend:
  //   carbonClient.getEquipment(equipmentId)      -> GET /api/erp/inventory/equipment/:id
  //   carbonClient.getServiceHistory(equipmentId) -> GET /api/erp/crm/customers/equipment/:id/history
  // Neither route exists yet (no installed-equipment / service-history model), so specs and
  // history stay mocked rather than fabricated.
  void equipmentId;

  const equipment = MOCK_EQUIPMENT;
  const history = MOCK_SERVICE_HISTORY;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Specs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Unit</Text>
        <View style={styles.specsGrid}>
          <SpecItem label="Make" value={equipment.make} />
          <SpecItem label="Model" value={equipment.model} />
          <SpecItem label="Type" value={equipment.type} />
          <SpecItem label="Serial" value={equipment.serialNumber} />
          <SpecItem label="Installed" value={equipment.installedAt} />
          <SpecItem label="Last Service" value={equipment.lastServicedAt} />
        </View>
        {equipment.notes ? (
          <Text style={styles.notesText}>{equipment.notes}</Text>
        ) : null}
      </View>

      {/* Service History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service History</Text>
        {history.length === 0 ? (
          <Text style={styles.empty}>No service records.</Text>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.historyCard}>
                <View style={styles.historyRow}>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <Text style={styles.historyTech}>{item.tech}</Text>
                </View>
                <Text style={styles.historySummary}>{item.summary}</Text>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        )}
      </View>
    </ScrollView>
  );
}

function SpecItem({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.specItem}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value ?? '—'}</Text>
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
    marginBottom: 12,
  },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  specItem: { width: '47%' },
  specLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  specValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  notesText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
    marginTop: 4,
  },
  empty: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 12 },
  historyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyDate: { fontSize: 12, fontWeight: '600', color: '#374151' },
  historyTech: { fontSize: 12, color: '#6B7280' },
  historySummary: { fontSize: 13, color: '#374151', lineHeight: 18 },
});
