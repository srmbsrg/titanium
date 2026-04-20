/**
 * DispatchScreen — Incoming jobs queue
 * Shows all scheduled/unassigned jobs the tech can pick up.
 * Large tap targets optimized for field use.
 */

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { carbonClient } from '../api/carbonClient';
import { useTitaniumStore } from '../store';
import type { DispatchStackParamList } from '../types/navigation';
import type { Job } from '../types/models';

type Props = NativeStackScreenProps<DispatchStackParamList, 'DispatchList'>;

const STATUS_COLOR: Record<string, string> = {
  scheduled: '#6B7280',
  en_route: '#F59E0B',
  on_site: '#10B981',
  completed: '#3B82F6',
  cancelled: '#EF4444',
};

const PRIORITY_COLOR: Record<string, string> = {
  low: '#6B7280',
  normal: '#3B82F6',
  high: '#F59E0B',
  urgent: '#EF4444',
};

export function DispatchScreen({ navigation }: Props) {
  const { techId, openCarbComm } = useTitaniumStore();
  const queryClient = useQueryClient();

  const {
    data: jobs = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Job[]>({
    queryKey: ['dispatch-jobs'],
    queryFn: () => carbonClient.getJobs(),
    refetchInterval: 60_000, // auto-refresh every minute
  });

  const acceptMutation = useMutation({
    mutationFn: (jobId: string) => carbonClient.updateJobStatus(jobId, 'en_route'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dispatch-jobs'] }),
  });

  const pending = jobs.filter(j => j.status === 'scheduled');
  const active = jobs.filter(j => j.status === 'en_route' || j.status === 'on_site');

  const renderJob = useCallback(({ item }: { item: Job }) => {
    const isActive = item.status === 'en_route' || item.status === 'on_site';
    return (
      <TouchableOpacity
        style={[styles.card, isActive && styles.cardActive]}
        onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
        activeOpacity={0.78}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            {item.priority && item.priority !== 'normal' && (
              <View style={[styles.priorityBadge, { backgroundColor: `${PRIORITY_COLOR[item.priority]}20` }]}>
                <Text style={[styles.priorityText, { color: PRIORITY_COLOR[item.priority] }]}>
                  {item.priority.toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.customerName}>{item.customer?.name || 'Unknown customer'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[item.status]}25` }]}>
            <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <Text style={styles.address}>
          {typeof item.address === 'string'
            ? item.address
            : `${item.address.street}, ${item.address.city}`}
        </Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.time}>
            {new Date(item.scheduledAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
          {item.estimatedDuration && (
            <Text style={styles.duration}>~{item.estimatedDuration}m</Text>
          )}
          {item.status === 'scheduled' && (
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => acceptMutation.mutate(item.id)}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.acceptBtnText}>Accept →</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [navigation, acceptMutation]);

  return (
    <View style={styles.container}>
      {/* Carb-O-Comm quick-access */}
      <TouchableOpacity style={styles.carbCommBar} onPress={() => openCarbComm()} activeOpacity={0.8}>
        <Text style={styles.carbCommBarText}>⚡ Tap to open Carb-O-Comm — Ask Tes anything</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.loadingText}>Loading dispatch queue…</Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...(active.length > 0 ? [{ _section: 'Active Jobs', _items: active }] : []),
            { _section: 'Pending Dispatch', _items: pending },
          ].flatMap(s => [{ _sectionHeader: (s as any)._section }, ...(s as any)._items])}
          keyExtractor={(item: any, i) => item._sectionHeader || item.id || String(i)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1D4ED8" />}
          renderItem={({ item }: any) => {
            if (item._sectionHeader) {
              return (
                <Text style={styles.sectionHeader}>{item._sectionHeader}</Text>
              );
            }
            return renderJob({ item });
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No jobs in the dispatch queue</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  carbCommBar: {
    backgroundColor: '#0C1222',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  carbCommBarText: { color: '#FDBA74', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },

  list: { padding: 16, gap: 12, paddingBottom: 32 },

  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  cardActive: { borderLeftColor: '#10B981' },

  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 8 },
  cardHeaderLeft: { flex: 1, gap: 4 },

  priorityBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  priorityText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  statusText: { fontSize: 12, fontWeight: '600' },

  customerName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  address: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  description: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 10 },

  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  time: { fontSize: 13, fontWeight: '700', color: '#1D4ED8' },
  duration: { fontSize: 12, color: '#9CA3AF' },

  acceptBtn: {
    marginLeft: 'auto',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  acceptBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  loadingText: { color: '#6B7280', marginTop: 12, fontSize: 14 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#6B7280' },
});
