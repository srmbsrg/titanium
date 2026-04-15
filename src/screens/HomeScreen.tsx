/**
 * HomeScreen — Tech's daily job queue
 * Shows all jobs assigned to the current technician for today,
 * ordered by scheduled time.
 */

import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JobsStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<JobsStackParamList, 'Home'>;

// Placeholder data — will be replaced by React Query + Carbon API
const MOCK_JOBS = [
  {
    id: 'job-001',
    customer: 'Riverside HVAC — Smith Residence',
    address: '1402 Elm St, Austin TX 78701',
    scheduledAt: '08:00 AM',
    status: 'scheduled',
  },
  {
    id: 'job-002',
    customer: 'Metro Plumbing — Barton Office Park',
    address: '3900 S Lamar Blvd, Austin TX 78704',
    scheduledAt: '10:30 AM',
    status: 'en_route',
  },
  {
    id: 'job-003',
    customer: 'Capital Electric — Mueller District',
    address: '1910 Aldrich St, Austin TX 78723',
    scheduledAt: '01:00 PM',
    status: 'scheduled',
  },
];

const STATUS_COLOR: Record<string, string> = {
  scheduled: '#6B7280',
  en_route: '#F59E0B',
  on_site: '#10B981',
  completed: '#3B82F6',
  cancelled: '#EF4444',
};

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Today's Jobs</Text>
      <FlatList
        data={MOCK_JOBS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
            activeOpacity={0.75}
          >
            <View style={styles.cardRow}>
              <Text style={styles.time}>{item.scheduledAt}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: STATUS_COLOR[item.status] ?? '#6B7280' },
                ]}
              >
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.customer}>{item.customer}</Text>
            <Text style={styles.address}>{item.address}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  list: { paddingHorizontal: 16, gap: 12, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  time: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#FFFFFF' },
  customer: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  address: { fontSize: 13, color: '#6B7280' },
});
