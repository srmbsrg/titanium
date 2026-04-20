/**
 * JobPaymentScreen — Payment collection
 * Collects payment for a completed job.
 * Card input UI is a stub pending Stripe SDK integration.
 * Set STRIPE_PUBLISHABLE_KEY in .env when ready.
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
import { carbonClient } from '../api/carbonClient';
import { useTitaniumStore } from '../store';
import type { JobsStackParamList } from '../types/navigation';
import type { PaymentMethod } from '../types/models';

type Props = NativeStackScreenProps<JobsStackParamList, 'JobPayment'>;

const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { key: 'cash', label: 'Cash', icon: '💵' },
  { key: 'check', label: 'Check', icon: '🧾' },
  { key: 'invoice', label: 'Invoice Later', icon: '📧' },
];

export function JobPaymentScreen({ route, navigation }: Props) {
  const { jobId, amount: initialAmount } = route.params;
  const { openCarbComm } = useTitaniumStore();

  const [method, setMethod] = useState<PaymentMethod>('card');
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : '');
  const [checkNumber, setCheckNumber] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [stripeReady] = useState(!!process.env.STRIPE_PUBLISHABLE_KEY);

  const paymentMutation = useMutation({
    mutationFn: () =>
      carbonClient.recordPayment({
        jobId,
        amount: parseFloat(amount) || 0,
        method,
        reference: method === 'check' ? checkNumber : method === 'card' ? `****${cardLast4}` : undefined,
        collectedAt: new Date().toISOString(),
      }),
    onSuccess: () => {
      Alert.alert(
        'Payment Recorded',
        `$${parseFloat(amount).toFixed(2)} collected via ${method}.`,
        [{ text: 'Done', onPress: () => navigation.navigate('Home') }],
      );
    },
    onError: () => {
      Alert.alert('Error', 'Could not record payment. Check your connection.');
    },
  });

  const canSubmit = !!amount && parseFloat(amount) > 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Carb-O-Comm quick access */}
        <TouchableOpacity style={styles.carbCommTrigger} onPress={() => openCarbComm(jobId)} activeOpacity={0.8}>
          <Text style={styles.carbCommTriggerText}>⚡ Ask Tes about this job</Text>
        </TouchableOpacity>

        {/* Amount */}
        <Section title="Amount Due">
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </Section>

        {/* Payment Method */}
        <Section title="Payment Method">
          <View style={styles.methodGrid}>
            {PAYMENT_METHODS.map(pm => (
              <TouchableOpacity
                key={pm.key}
                style={[styles.methodBtn, method === pm.key && styles.methodBtnActive]}
                onPress={() => setMethod(pm.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.methodIcon}>{pm.icon}</Text>
                <Text style={[styles.methodLabel, method === pm.key && styles.methodLabelActive]}>
                  {pm.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Method-specific fields */}
        {method === 'card' && (
          <Section title="Card Details">
            {stripeReady ? (
              <View style={styles.stripeStub}>
                <Text style={styles.stripeStubText}>Stripe card element goes here</Text>
                <Text style={styles.stripeStubSub}>Wire @stripe/stripe-react-native when STRIPE_PUBLISHABLE_KEY is set</Text>
              </View>
            ) : (
              <>
                <Text style={styles.stripeWarning}>
                  ⚠ STRIPE_PUBLISHABLE_KEY not set — recording manual card reference only.
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Last 4 digits (reference)"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={4}
                  value={cardLast4}
                  onChangeText={setCardLast4}
                />
              </>
            )}
          </Section>
        )}

        {method === 'check' && (
          <Section title="Check Details">
            <TextInput
              style={styles.input}
              placeholder="Check number"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={checkNumber}
              onChangeText={setCheckNumber}
            />
          </Section>
        )}

        {method === 'invoice' && (
          <Section title="Invoice Note">
            <View style={styles.invoiceNote}>
              <Text style={styles.invoiceNoteIcon}>📧</Text>
              <Text style={styles.invoiceNoteText}>
                An invoice will be sent to the customer via Manifold ERP. No immediate payment collected.
              </Text>
            </View>
          </Section>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (!canSubmit || paymentMutation.isPending) && styles.submitBtnDisabled]}
          onPress={() => paymentMutation.mutate()}
          disabled={!canSubmit || paymentMutation.isPending}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>
            {paymentMutation.isPending
              ? 'Processing…'
              : method === 'invoice'
                ? '📧  Send Invoice'
                : `✓  Collect $${parseFloat(amount || '0').toFixed(2)}`}
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

  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  currencySymbol: { fontSize: 32, fontWeight: '300', color: '#374151' },
  amountInput: {
    flex: 1,
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
    paddingVertical: 4,
  },

  methodGrid: { gap: 8 },
  methodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  methodBtnActive: { borderColor: '#1D4ED8', backgroundColor: '#EFF6FF' },
  methodIcon: { fontSize: 24 },
  methodLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
  methodLabelActive: { color: '#1D4ED8' },

  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },

  stripeStub: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  stripeStubText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  stripeStubSub: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },

  stripeWarning: { fontSize: 13, color: '#D97706', backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8 },

  invoiceNote: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  invoiceNoteIcon: { fontSize: 24 },
  invoiceNoteText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },

  submitBtn: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 20,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitBtnDisabled: { backgroundColor: '#D1D5DB', shadowOpacity: 0 },
  submitBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
