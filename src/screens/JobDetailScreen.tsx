/**
 * JobDetailScreen — Full job record
 * Customer info, address, notes, work orders, and action buttons.
 * CarbComm voice button always accessible.
 */

import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { carbonClient } from '../api/carbonClient';
import { useTitaniumStore } from '../store';
import type { JobsStackParamList } from '../types/navigation';
import type { Job } from '../types/models';

type Props = NativeStackScreenProps<JobsStackParamList, 'JobDetail'>;

const STATUS_NEXT: Partial<Record<string, Job['status']>> = {
  scheduled: 'en_route',
  en_route: 'on_site',
  on_site: 'completed',
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Start En Route',
  en_route: 'Arrived On Site',
  on_site: 'Complete Job',
};

export function JobDetailScreen({ route, navigation }: Props) {
  const { jobId } = route.params;
  const { openCarbComm } = useTitaniumStore();
  const queryClient = useQueryClient();

  const { data: job, isLoading, error } = useQuery<Job>({
    queryKey: ['job', jobId],
    queryFn: () => carbonClient.getJob(jobId),
  });

  const statusMutation = useMutation({
    // Offline-aware: when disconnected, queue the status change and let the
    // offline flush replay it on reconnect instead of failing the tech's tap.
    mutationFn: async (next: Job['status']) => {
      const { isOnline, enqueue } = useTitaniumStore.getState();
      if (!isOnline) {
        enqueue({ type: 'updateJobStatus', payload: { jobId, status: next } });
        return null;
      }
      return carbonClient.updateJobStatus(jobId, next);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-jobs'] });
    },
  });

  const handleStatusAdvance = useCallback(() => {
    if (!job) return;
    const next = STATUS_NEXT[job.status];
    if (!next) return;
    statusMutation.mutate(next);
  }, [job, statusMutation]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not load job</Text>
      </View>
    );
  }

  const addressStr = typeof job.address === 'string'
    ? job.address
    : `${job.address.street}, ${job.address.city}, ${job.address.state} ${job.address.zip}`;

  const nextStatus = STATUS_NEXT[job.status];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* CarbComm voice button — always visible */}
      <TouchableOpacity
        style={styles.carbCommBtn}
        onPress={() => openCarbComm(jobId, job.customerId)}
        activeOpacity={0.85}
      >
        <Text style={styles.carbCommBtnText}>⚡ Ask Trade-Talk about this job</Text>
      </TouchableOpacity>

      {/* Status */}
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={[styles.statusValue, statusColor(job.status)]}>
          {job.status.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      {/* Customer */}
      <Section title="Customer">
        <Row label="Name" value={job.customer?.name} />
        <Row label="Phone" value={job.customer?.phone} />
        <Row label="Email" value={job.customer?.email} />
        {job.customer?.notes && <Row label="Notes" value={job.customer.notes} />}
      </Section>

      {/* Site */}
      <Section title="Site Address">
        <Text style={styles.bodyText}>{addressStr}</Text>
        {addressStr.trim().length > 0 && (
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => openMaps(addressStr)}
            activeOpacity={0.85}
          >
            <Text style={styles.navBtnText}>🧭  Navigate</Text>
          </TouchableOpacity>
        )}
      </Section>

      {/* Job description */}
      <Section title="Job Description">
        <Text style={styles.bodyText}>{job.description}</Text>
      </Section>

      {/* Field notes */}
      {job.notes ? (
        <Section title="Field Notes">
          <Text style={[styles.bodyText, styles.notes]}>{job.notes}</Text>
        </Section>
      ) : null}

      {/* Work Orders */}
      {job.workOrderIds.length > 0 && (
        <Section title="Work Orders">
          {job.workOrderIds.map((woId) => (
            <TouchableOpacity
              key={woId}
              style={styles.woButton}
              onPress={() => navigation.navigate('WorkOrder', { workOrderId: woId, jobId: job.id })}
            >
              <Text style={styles.woButtonText}>View Work Order {woId}</Text>
            </TouchableOpacity>
          ))}
        </Section>
      )}

      <TouchableOpacity
        style={styles.woButtonNew}
        onPress={() => navigation.navigate('WorkOrder', { jobId: job.id })}
      >
        <Text style={styles.woButtonNewText}>+ New Work Order</Text>
      </TouchableOpacity>

      {/* Status advance button */}
      {nextStatus && (
        <TouchableOpacity
          style={styles.advanceBtn}
          onPress={handleStatusAdvance}
          disabled={statusMutation.isPending}
          activeOpacity={0.85}
        >
          {statusMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.advanceBtnText}>{STATUS_LABEL[job.status]}</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Complete / Payment actions (once on-site) */}
      {job.status === 'on_site' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtnGreen}
            onPress={() => navigation.navigate('JobComplete', { jobId: job.id })}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>✓  Complete Job</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtnBlue}
            onPress={() => navigation.navigate('JobPayment', { jobId: job.id })}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>💳  Collect Payment</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// Deep-link the device's maps app for turn-by-turn navigation to `address`.
// No API key / react-native-maps needed: iOS -> Apple Maps (maps://), Android ->
// Google Maps navigation intent (google.navigation:), with a universal
// https://maps fallback if neither scheme is handled.
function openMaps(address: string) {
  const q = encodeURIComponent(address);
  const nativeUrl =
    Platform.OS === 'ios' ? `maps://?daddr=${q}` : `google.navigation:q=${q}`;
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  Linking.openURL(nativeUrl).catch(() => {
    Linking.openURL(webUrl).catch(() =>
      Alert.alert('Navigation unavailable', 'No maps app could be opened for this address.'),
    );
  });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
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

function statusColor(status: string) {
  const map: Record<string, object> = {
    scheduled: { color: '#6B7280' },
    en_route:  { color: '#F59E0B' },
    on_site:   { color: '#10B981' },
    completed: { color: '#3B82F6' },
    cancelled: { color: '#EF4444' },
  };
  return map[status] ?? {};
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, gap: 12, paddingBottom: 40 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#EF4444', fontSize: 16 },

  carbCommBtn: {
    backgroundColor: '#0C1222',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  carbCommBtnText: { color: '#FDBA74', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusLabel: { fontSize: 13, color: '#6B7280' },
  statusValue: { fontSize: 14, fontWeight: '800' },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sectionBody: { gap: 8 },

  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  rowLabel: { fontSize: 14, color: '#6B7280' },
  rowValue: { fontSize: 14, fontWeight: '500', color: '#111827', flex: 1, textAlign: 'right' },

  bodyText: { fontSize: 14, color: '#374151', lineHeight: 21 },
  notes: { backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#F59E0B' },

  navBtn: {
    marginTop: 10,
    backgroundColor: '#1D4ED8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  navBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  woButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 6,
  },
  woButtonText: { fontSize: 14, fontWeight: '600', color: '#2563EB' },

  woButtonNew: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  woButtonNewText: { fontSize: 14, fontWeight: '600', color: '#10B981' },

  advanceBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  advanceBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtnGreen: { flex: 1, backgroundColor: '#10B981', paddingVertical: 18, borderRadius: 14, alignItems: 'center' },
  actionBtnBlue:  { flex: 1, backgroundColor: '#1D4ED8', paddingVertical: 18, borderRadius: 14, alignItems: 'center' },
  actionBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});