/**
 * JobDetailScreen — Full job record for an assigned job
 * Shows customer info, site address, job notes, and linked work orders.
 * Drill-down from HomeScreen.
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JobsStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<JobsStackParamList, 'JobDetail'>;

export function JobDetailScreen({ route, navigation }: Props) {
  const { jobId } = route.params;

  // TODO: replace with useQuery(() => carbonClient.getJob(jobId))
  const job = {
    id: jobId,
    customer: {
      name: 'Smith Residence',
      phone: '(512) 555-0192',
      email: 'j.smith@example.com',
    },
    address: '1402 Elm St, Austin TX 78701',
    scheduledAt: '2026-04-15T08:00:00Z',
    status: 'scheduled',
    description: 'Annual HVAC inspection + filter replacement',
    notes: 'Gate code: 4821. Dog in backyard — use front entrance.',
    workOrderIds: ['wo-001'],
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status */}
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={styles.statusValue}>{job.status.toUpperCase()}</Text>
      </View>

      {/* Customer */}
      <Section title="Customer">
        <Row label="Name" value={job.customer.name} />
        <Row label="Phone" value={job.customer.phone} />
        <Row label="Email" value={job.customer.email} />
      </Section>

      {/* Site */}
      <Section title="Site Address">
        <Text style={styles.bodyText}>{job.address}</Text>
      </Section>

      {/* Description */}
      <Section title="Job Description">
        <Text style={styles.bodyText}>{job.description}</Text>
      </Section>

      {/* Field Notes */}
      {job.notes ? (
        <Section title="Field Notes">
          <Text style={styles.bodyText}>{job.notes}</Text>
        </Section>
      ) : null}

      {/* Work Orders */}
      <Section title="Work Orders">
        {job.workOrderIds.map((woId) => (
          <TouchableOpacity
            key={woId}
            style={styles.woButton}
            onPress={() =>
              navigation.navigate('WorkOrder', { workOrderId: woId, jobId: job.id })
            }
          >
            <Text style={styles.woButtonText}>View Work Order {woId}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.woButton, styles.woButtonNew]}
          onPress={() =>
            navigation.navigate('WorkOrder', { jobId: job.id })
          }
        >
          <Text style={[styles.woButtonText, styles.woButtonNewText]}>
            + New Work Order
          </Text>
        </TouchableOpacity>
      </Section>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusLabel: { fontSize: 13, color: '#6B7280' },
  statusValue: { fontSize: 13, fontWeight: '700', color: '#10B981' },
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
  sectionBody: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: 14, color: '#6B7280' },
  rowValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  bodyText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  woButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  woButtonText: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
  woButtonNew: { backgroundColor: '#ECFDF5', marginTop: 8 },
  woButtonNewText: { color: '#059669' },
});
