/**
 * JobCompleteScreen — Job completion flow
 * Tech submits work summary, parts used, captures photos, and signs (stub).
 */

import React, { useState } from 'react';
import {
  Alert,
  Image,
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
import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import type { ImagePickerResponse } from 'react-native-image-picker';
import { addCarbonJobPhoto, carbonClient } from '../api/carbonClient';
import { useTitaniumStore } from '../store';
import type { JobsStackParamList } from '../types/navigation';
import type { PartUsed } from '../types/models';

type Props = NativeStackScreenProps<JobsStackParamList, 'JobComplete'>;

export function JobCompleteScreen({ route, navigation }: Props) {
  const { jobId } = route.params;
  const { openCarbComm } = useTitaniumStore();

  const [workSummary, setWorkSummary] = useState('');
  const [laborHours, setLaborHours] = useState('1');
  const [parts, setParts] = useState<PartUsed[]>([]);
  const [newPartSku, setNewPartSku] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState('1');
  const [newPartCost, setNewPartCost] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [sigCaptured, setSigCaptured] = useState(false);

  const completeMutation = useMutation({
    // Offline-aware: queue the completion report and replay it on reconnect
    // instead of failing the submit when the tech is disconnected.
    mutationFn: async () => {
      const report = {
        jobId,
        workSummary,
        partsUsed: parts,
        laborHours: parseFloat(laborHours) || 1,
        photoUris: photos,
        completedAt: new Date().toISOString(),
      };
      const { isOnline, enqueue } = useTitaniumStore.getState();
      if (!isOnline) {
        enqueue({ type: 'completeJob', payload: report });
        return;
      }
      await carbonClient.completeJob(report);
    },
    onSuccess: () => {
      Alert.alert('Job Completed', 'Work order submitted successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    },
    onError: () => {
      Alert.alert('Error', 'Could not submit completion. Check your connection.');
    },
  });
  const addPart = () => {
    if (!newPartSku || !newPartName) return;
    setParts(prev => [
      ...prev,
      {
        sku: newPartSku,
        name: newPartName,
        quantity: parseInt(newPartQty) || 1,
        unitCost: parseFloat(newPartCost) || 0,
      },
    ]);
    setNewPartSku('');
    setNewPartName('');
    setNewPartQty('1');
    setNewPartCost('');
  };

  const removePart = (i: number) => setParts(prev => prev.filter((_, idx) => idx !== i));

  // Attach a captured photo to the job. Posts to the Carbon jobs API when
  // online; queues for the offline flush otherwise. Also tracked locally so it
  // rides along in the completion report's photoUris.
  const attachCapturedPhoto = (uri: string) => {
    setPhotos(prev => [...prev, uri]);
    const caption = workSummary.trim() || undefined;
    const { isOnline, enqueue } = useTitaniumStore.getState();
    if (isOnline) {
      addCarbonJobPhoto(jobId, uri, caption).catch(() => {
        // Network hiccup after capture -> queue it for the next flush.
        enqueue({ type: 'addJobPhoto', payload: { jobId, url: uri, caption } });
      });
    } else {
      enqueue({ type: 'addJobPhoto', payload: { jobId, url: uri, caption } });
    }
  };

  const handlePickerResponse = (res: ImagePickerResponse) => {
    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Photo error', res.errorMessage ?? res.errorCode);
      return;
    }
    const uri = res.assets?.[0]?.uri;
    if (uri) attachCapturedPhoto(uri);
  };

  const addPhoto = () => {
    Alert.alert('Add photo', 'Attach a photo of the completed work', [
      {
        text: 'Take photo',
        onPress: () =>
          launchCamera({ mediaType: 'photo', quality: 0.7, saveToPhotos: true })
            .then(handlePickerResponse)
            .catch(() => Alert.alert('Camera error', 'Could not open the camera.')),
      },
      {
        text: 'Choose from library',
        onPress: () =>
          launchImageLibrary({ mediaType: 'photo', quality: 0.7, selectionLimit: 1 })
            .then(handlePickerResponse)
            .catch(() => Alert.alert('Error', 'Could not open the photo library.')),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removePhoto = (i: number) => setPhotos(prev => prev.filter((_, idx) => idx !== i));

  const totalPartsValue = parts.reduce((s, p) => s + p.quantity * p.unitCost, 0);
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Carb-O-Comm quick access */}
        <TouchableOpacity style={styles.carbCommTrigger} onPress={() => openCarbComm(jobId)} activeOpacity={0.8}>
          <Text style={styles.carbCommTriggerText}>⚡ Ask Trade-Talk about this job</Text>
        </TouchableOpacity>

        {/* Work Summary */}
        <Section title="Work Summary *">
          <TextInput
            style={styles.textarea}
            multiline
            numberOfLines={5}
            placeholder="Describe work performed, findings, recommendations..."
            placeholderTextColor="#9CA3AF"
            value={workSummary}
            onChangeText={setWorkSummary}
            textAlignVertical="top"
          />
        </Section>

        {/* Labor */}
        <Section title="Labor Hours">
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={laborHours}
            onChangeText={setLaborHours}
            placeholder="1.0"
            placeholderTextColor="#9CA3AF"
          />
        </Section>

        {/* Parts Used */}
        <Section title="Parts Used">
          {parts.map((p, i) => (
            <View key={i} style={styles.partRow}>
              <View style={styles.partInfo}>
                <Text style={styles.partName}>{p.name}</Text>
                <Text style={styles.partMeta}>
                  {p.sku} · qty {p.quantity} · ${(p.quantity * p.unitCost).toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removePart(i)} style={styles.removeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.addPartForm}>
            <TextInput style={[styles.input, styles.partInput]} placeholder="SKU" placeholderTextColor="#9CA3AF"
              value={newPartSku} onChangeText={setNewPartSku} />
            <TextInput style={[styles.input, styles.partInput, { flex: 2 }]} placeholder="Part name" placeholderTextColor="#9CA3AF"
              value={newPartName} onChangeText={setNewPartName} />
            <TextInput style={[styles.input, styles.partInput, { width: 52 }]} placeholder="Qty" placeholderTextColor="#9CA3AF"
              keyboardType="number-pad" value={newPartQty} onChangeText={setNewPartQty} />
            <TextInput style={[styles.input, styles.partInput, { width: 72 }]} placeholder="$Cost" placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad" value={newPartCost} onChangeText={setNewPartCost} />
            <TouchableOpacity style={styles.addBtn} onPress={addPart}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {parts.length > 0 && (
            <Text style={styles.partsTotal}>Parts total: ${totalPartsValue.toFixed(2)}</Text>
          )}
        </Section>

        {/* Photos */}
        <Section title="Photos (optional)">
          {photos.length > 0 && (
            <View style={styles.photoGrid}>
              {photos.map((uri, i) => (
                <View key={`${uri}-${i}`} style={styles.thumbWrap}>
                  <Image source={{ uri }} style={styles.thumb} />
                  <TouchableOpacity
                    style={styles.thumbRemove}
                    onPress={() => removePhoto(i)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={styles.thumbRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.photoAdd} activeOpacity={0.8} onPress={addPhoto}>
            <Text style={styles.photoAddIcon}>📷</Text>
            <Text style={styles.photoAddText}>
              {photos.length > 0 ? 'Add another photo' : 'Take or choose a photo'}
            </Text>
          </TouchableOpacity>
        </Section>

        {/* Signature — stub */}
        <Section title="Customer Signature">
          <TouchableOpacity
            style={[styles.signatureBox, sigCaptured && styles.signatureBoxSigned]}
            onPress={() => setSigCaptured(true)}
            activeOpacity={0.8}
          >
            {sigCaptured ? (
              <Text style={styles.signedText}>✓ Signature captured</Text>
            ) : (
              <>
                <Text style={styles.signaturePrompt}>Tap here for customer to sign</Text>
                <Text style={styles.signatureSub}>Signature pad — coming soon</Text>
              </>
            )}
          </TouchableOpacity>
        </Section>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (!workSummary.trim() || completeMutation.isPending) && styles.submitBtnDisabled]}
          onPress={() => completeMutation.mutate()}
          disabled={!workSummary.trim() || completeMutation.isPending}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>
            {completeMutation.isPending ? 'Submitting…' : '✓  Mark Job Complete'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, gap: 16 },

  carbCommTrigger: {
    backgroundColor: '#0C1222',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  carbCommTriggerText: { color: '#FDBA74', fontSize: 14, fontWeight: '700' },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  textarea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    minHeight: 100,
  },

  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  partInfo: { flex: 1 },
  partName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  partMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  removeBtn: { padding: 4 },
  removeBtnText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },

  addPartForm: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  partInput: { flex: 1, minWidth: 0 },
  addBtn: { backgroundColor: '#1D4ED8', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  partsTotal: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'right' },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumbWrap: { position: 'relative' },
  thumb: { width: 84, height: 84, borderRadius: 10, backgroundColor: '#E5E7EB' },
  thumbRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbRemoveText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },

  photoAdd: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  photoAddIcon: { fontSize: 32 },
  photoAddText: { fontSize: 14, fontWeight: '600', color: '#374151' },

  signatureBox: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
  },
  signatureBoxSigned: { borderColor: '#10B981', backgroundColor: '#ECFDF5', borderStyle: 'solid' },
  signaturePrompt: { fontSize: 15, fontWeight: '600', color: '#374151' },
  signatureSub: { fontSize: 12, color: '#9CA3AF' },
  signedText: { fontSize: 16, fontWeight: '700', color: '#10B981' },

  submitBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitBtnDisabled: { backgroundColor: '#D1D5DB', shadowOpacity: 0 },
  submitBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});