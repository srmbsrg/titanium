/**
 * WorkOrderScreen - Create or update a work order.
 * Linked to a Job. Techs can add notes, log parts, and set status.
 *
 * Persistence is wired to the Carbon jobs API (the job-centric track the app
 * actually uses), not the ERP /crm/sales-orders path:
 *   - description -> job diagnosis via PATCH /api/carbon/jobs/:id
 *   - status + tech notes + parts -> a job note via POST /api/carbon/jobs/:id/notes
 * Both endpoints are live on the Manifold backend. (The legacy
 * carbonClient.saveWorkOrder() targets /crm/sales-orders, whose POST schema
 * requires { customerId, items[] } - a different contract - so it is not used here.)
 */

import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { addCarbonJobNote, patchCarbonJob } from '../api/carbonClient';
import type { JobsStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<JobsStackParamList, 'WorkOrder'>;

export function WorkOrderScreen({ route, navigation }: Props) {
  const { workOrderId, jobId } = route.params;
  const isNew = !workOrderId;

  // TODO: if !isNew, prefill via carbonClient.getJob(jobId) (GET /api/carbon/jobs/:id)
  // once a dedicated work-order record exists; today a WO maps onto the job itself.
  const [description, setDescription] = useState(
    isNew ? '' : 'Replace 16x25x1 air filter, inspect coils, check refrigerant.',
  );
  const [techNotes, setTechNotes] = useState(
    isNew ? '' : 'Coils clean. Refrigerant at spec. Filter replaced.',
  );
  const [parts, setParts] = useState(isNew ? '' : '16x25x1 Merv-13 filter (qty 1)');
  const [status, setStatus] = useState<'open' | 'in_progress' | 'complete'>(
    isNew ? 'open' : 'in_progress',
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Persist the work-order detail onto the job record.
      if (description.trim()) {
        await patchCarbonJob(jobId, { diagnosis: description.trim() });
      }
      const noteLines = [
        `Work order status: ${status.replace('_', ' ')}`,
        techNotes.trim() ? `Notes: ${techNotes.trim()}` : '',
        parts.trim() ? `Parts: ${parts.trim()}` : '',
      ].filter(Boolean);
      if (noteLines.length) {
        await addCarbonJobNote(jobId, noteLines.join('\n'), 'tech');
      }
    },
    onSuccess: () => navigation.goBack(),
    onError: () =>
      Alert.alert('Error', 'Could not save work order. Check your connection and try again.'),
  });

  const handleSave = () => saveMutation.mutate();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Status toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusRow}>
            {(['open', 'in_progress', 'complete'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, status === s && styles.statusBtnActive]}
                onPress={() => setStatus(s)}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    status === s && styles.statusBtnTextActive,
                  ]}
                >
                  {s.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="What needs to be done?"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Tech Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tech Notes</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            placeholder="Observations, findings, work performed..."
            placeholderTextColor="#9CA3AF"
            value={techNotes}
            onChangeText={setTechNotes}
          />
        </View>

        {/* Parts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parts Used</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={2}
            placeholder="Part name, part number, quantity..."
            placeholderTextColor="#9CA3AF"
            value={parts}
            onChangeText={setParts}
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            status === 'complete' && styles.saveBtnComplete,
            saveMutation.isPending && { opacity: 0.6 },
          ]}
          onPress={handleSave}
          disabled={saveMutation.isPending}
        >
          <Text style={styles.saveBtnText}>
            {saveMutation.isPending
              ? 'Saving...'
              : status === 'complete'
              ? 'Mark Complete & Save'
              : 'Save Work Order'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.jobRef}>Job ID: {jobId}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, gap: 16, paddingBottom: 48 },
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
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusBtnActive: { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' },
  statusBtnText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  statusBtnTextActive: { color: '#FFFFFF' },
  input: {
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnComplete: { backgroundColor: '#059669' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  jobRef: { fontSize: 11, color: '#D1D5DB', textAlign: 'center' },
});