/**
 * UpsellScreen - In-Job Upsell ("every tech is a salesman")
 *
 * On a job, the agent turns the diagnosis into a Good/Better/Best/Premium
 * ladder from the company catalog - image, plain-English difference,
 * warranty, price. The tech taps one and it becomes a quote (which, in
 * production, drops into Manifold for the back office to fulfill).
 *
 * Requested by Lawrence Snow (founder, Roto-Rooter); feasible now with
 * agentic systems.
 */

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { TIERS, SAMPLE_JOB, TAX_RATE, money, type Tier } from '../data/upsell';

const NAVY = '#0F2436';
const ACCENT = '#0EA5E9';
const SLATE = '#43586B';
const INK = '#1A2530';

const ART_W = Dimensions.get('window').width - 32;
const ART_H = Math.round(ART_W / 1.6);

export function UpsellScreen() {
  const [selKey, setSelKey] = useState<string | null>(null);

  const selected = useMemo(() => TIERS.find((t) => t.key === selKey) ?? null, [selKey]);
  const totals = useMemo(() => {
    if (!selected) return null;
    const tax = selected.price * TAX_RATE;
    return { base: selected.price, tax, total: selected.price + tax };
  }, [selected]);

  function renderTier({ item }: { item: Tier }) {
    const on = item.key === selKey;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setSelKey(item.key)}
        style={[styles.card, on && { borderColor: ACCENT, borderWidth: 2 }]}
      >
        <View style={styles.pic}>
          <SvgXml xml={item.svg} width={ART_W} height={ART_H} />
          <View style={[styles.ribbon, { backgroundColor: item.accent }]}>
            <Text style={styles.ribbonTxt}>{item.ribbon}</Text>
          </View>
          {item.popular && (
            <View style={styles.pop}>
              <Text style={styles.popTxt}>Most chosen</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.desc}>{item.desc}</Text>

          <View style={styles.specs}>
            {item.specs.map(([k, v], i) => (
              <View key={i} style={styles.srow}>
                <Text style={styles.sk}>{k}</Text>
                <Text style={styles.sv}>{v}</Text>
              </View>
            ))}
          </View>

          <View style={styles.warr}>
            <Text style={styles.warrH}>Warranty</Text>
            <Text style={styles.warrV}>{item.warranty}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {money(item.price)}
              <Text style={styles.installed}> installed</Text>
            </Text>
            <View style={[styles.selBtn, on && { backgroundColor: ACCENT }]}>
              <Text style={styles.selTxt}>{on ? '✓ Selected' : 'Select'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Aquaflow · agentic field assist</Text>
        <Text style={styles.h1}>In-Job Upsell</Text>
        <Text style={styles.sub}>
          Turn the diagnosis into options the customer can choose - picture, plain difference,
          warranty, price. One tap becomes a quote.
        </Text>
      </View>

      <FlatList
        data={TIERS}
        keyExtractor={(t) => t.key}
        renderItem={renderTier}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.job}>
            <View style={styles.jobTag}>
              <Text style={styles.jobTagTxt}>On this job</Text>
            </View>
            <Text style={styles.jobTxt}>
              <Text style={styles.jobB}>{SAMPLE_JOB.site}</Text> · {SAMPLE_JOB.location}
              {'\n'}Diagnosis: <Text style={styles.jobB}>{SAMPLE_JOB.diagnosis}</Text>
              {'\n'}Agent matched 4 replacement options to this bathroom - comfort-height / ADA,
              water use, and budget.
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: totals ? 96 : 12 }} />}
      />

      {totals && selected && (
        <View style={styles.quoteBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.qLabel}>
              {selected.ribbon} · {selected.name}
            </Text>
            <Text style={styles.qTotal}>
              {money(totals.total)}
              <Text style={styles.qSmall}> incl. tax · install included</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.qBtn}
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert(
                'Quote ready',
                `${selected.name}\nTotal ${money(totals.total)} (incl. tax, install included)\n\nIn production this posts to Manifold as a quote for the customer to approve.`,
              )
            }
          >
            <Text style={styles.qBtnTxt}>Build quote</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { backgroundColor: NAVY, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 16 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: ACCENT },
  h1: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 4 },
  sub: { color: '#CFE0EE', fontSize: 13.5, marginTop: 4, lineHeight: 19 },

  list: { padding: 16 },
  job: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8EE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  jobTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  jobTagTxt: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, color: '#0369A1', textTransform: 'uppercase' },
  jobTxt: { fontSize: 13.5, color: SLATE, lineHeight: 20 },
  jobB: { color: NAVY, fontWeight: '800' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8EE',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pic: { position: 'relative', backgroundColor: '#EEF4F8' },
  ribbon: { position: 'absolute', top: 10, left: 10, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  ribbonTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  pop: { position: 'absolute', top: 10, right: 10, backgroundColor: '#111827', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
  popTxt: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },

  body: { padding: 15, gap: 9 },
  name: { fontSize: 16.5, fontWeight: '800', color: NAVY },
  desc: { fontSize: 13.5, color: SLATE, lineHeight: 19 },
  specs: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E2E8EE', paddingVertical: 8, gap: 3 },
  srow: { flexDirection: 'row', justifyContent: 'space-between' },
  sk: { fontSize: 12.5, color: '#8798A6' },
  sv: { fontSize: 12.5, color: INK, fontWeight: '700' },

  warr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  warrH: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, color: '#15803D', textTransform: 'uppercase' },
  warrV: { fontSize: 12.5, color: '#14532D', fontWeight: '700', flexShrink: 1, textAlign: 'right', marginLeft: 8 },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  price: { fontSize: 20, fontWeight: '800', color: NAVY },
  installed: { fontSize: 11, fontWeight: '700', color: '#8798A6' },
  selBtn: { backgroundColor: NAVY, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  selTxt: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '800' },

  quoteBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8EE',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  qLabel: { fontSize: 12.5, color: SLATE, fontWeight: '600' },
  qTotal: { fontSize: 18, fontWeight: '800', color: NAVY, marginTop: 2 },
  qSmall: { fontSize: 11, fontWeight: '600', color: '#8798A6' },
  qBtn: { backgroundColor: ACCENT, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 13 },
  qBtnTxt: { color: '#04222E', fontSize: 14, fontWeight: '800' },
});
