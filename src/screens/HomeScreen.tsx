/**
 * HomeScreen — Tech's daily job queue
 * Today's assigned jobs, ordered by scheduled time.
 * CarbComm voice button always accessible from this screen.
 */

import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { carbonClient } from '../api/carbonClient';
import { useTitaniumStore } from '../store';
import type { JobsStackParamList } from '../types/navigation';
import type { Job } from '../types/models';

type Props = NativeStackScreenProps<JobsStackParamList, 'Home'>;

const STATUS_COLOR: Record<string, string> = {
  scheduled: '#6B7280',
  en_route: '#F59E0B',
  on_site: '#10B981',
  completed: '#3B82F6',
  cancelled: '#EF4444',
};

export function HomeScreen({ navigation }: Props) {
  const { techId, techName, openCarbComm } = useTitaniumStore();

  const today = new Date().toDateString();

  const {
    data: jobs = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Job[]>({
    queryKey: ['jobs-today', techId],
    queryFn: () => carbonClient.getJobs(techId ?? undefined),
    select: (all) =>
      all
        .filter(j => new Date(j.scheduledAt).toDateString() === today)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
  });

  const activeCount = jobs.filter(j => j.status === 'en_route' || j.status === 'on_site').length;
  const completedCount = jobs.filter(j => j.status === 'completed').length;

  return (
    <View style={styles.container}>
      {/* Carb-O-Comm voice bar */}
      <TouchableOpacity style={styles.carbCommBar} onPress={() => openCarbComm()} activeOpacity={0.85}>
        <Text style={styles.carbCommBarText}>⚡ CARB-O-COMM — Ask Tes anything</Text>
      </TouchableOpacity>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Stat label="Today's Jobs" value={jobs.length} />
        <View style={styles.statDivider} />
        <Stat label="Active" value={activeCount} valueColor="#F59E0B" />
        <View style={styles.statDivider} />
        <Stat label="Done" value={completedCount} valueColor="#10B981" />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.loadingText}>Loading jobs…</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1D4ED8" />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
              activeOpacity={0.75}
            >
              <View style={styles.cardRow}>
                <Text style={styles.time}>
                  {new Date(item.scheduledAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
                <View style={[styles.badge, { backgroundColor: `${STATUS_COLOR[item.status]}25` }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>
                    {item.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              <Text style={styles.customer}>{item.customer?.name || 'Unknown customer'}</Text>
              <Text style={styles.address}>
                {typeof item.address === 'string'
                  ? item.address
                  : `${item.address.street}, ${item.address.city}`}
              </Text>
              {item.description ? (
                <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
              ) : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>No jobs scheduled today</Text>
              <Text style={styles.emptyHint}>Check the Dispatch tab for available jobs</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function Stat({ label, value, valueColor = '#111827' }: { label: string; value: number; valueColor?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  carbCommBar: {
    backgroundColor: '#0C1222',
    paddingVertical: 16,
    alignItems: 'center',
  },
  carbCommBarText: { color: '#FDBA74', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  statDivider: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 4 },

  list: { padding: 16, gap: 10, paddingBottom: 32 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
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
    marginBottom: 8,
  },
  time: { fontSize: 13, fontWeight: '700', color: '#1D4ED8' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  customer: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  address: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  description: { fontSize: 13, color: '#9CA3AF' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  loadingText: { color: '#9CA3AF', marginTop: 12, fontSize: 14 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 6 },
  emptyHint: { fontSize: 14, color: '#9CA3AF' },
});
