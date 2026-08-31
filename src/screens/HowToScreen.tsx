/**
 * HowToScreen - Agentic Field Assist ("the app trains your bench")
 *
 * On any job, the tech pulls the matching company-approved how-to first -
 * hands-free reference so a first-year tech gets it right without calling
 * the senior tech. Approved library first; web results are a labeled fallback.
 *
 * This screen renders the approved library (Attica / Voltara / Aquaflow),
 * recipe-card style with a trade selector and system filter.
 */

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { VERTICALS, thumbUrl, watchUrl, type HowTo } from '../data/howto';

const NAVY = '#0F2436';
const INK = '#1A2530';
const SLATE = '#43586B';

export function HowToScreen() {
  const [vkey, setVkey] = useState(VERTICALS[0].key);
  const [sys, setSys] = useState('All');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const vertical = useMemo(
    () => VERTICALS.find((v) => v.key === vkey) ?? VERTICALS[0],
    [vkey],
  );
  const systems = useMemo(() => ['All', ...Object.keys(vertical.systems)], [vertical]);
  const items = useMemo(
    () => (sys === 'All' ? vertical.items : vertical.items.filter((h) => h.system === sys)),
    [vertical, sys],
  );

  const accent = vertical.accent;

  function selectVertical(k: string) {
    setVkey(k);
    setSys('All');
    setOpen({});
  }

  function renderCard(h: HowTo) {
    const color = vertical.systems[h.system] ?? NAVY;
    const isOpen = !!open[h.videoId];
    return (
      <View style={styles.card}>
        <View style={styles.thumbWrap}>
          <Image source={{ uri: thumbUrl(h.videoId) }} style={styles.thumb} resizeMode="cover" />
          <View style={styles.approved}>
            <Text style={styles.approvedTxt}>{'✓ Company-approved'}</Text>
          </View>
          <View style={[styles.systag, { backgroundColor: color }]}>
            <Text style={styles.systagTxt}>{h.system}</Text>
          </View>
          <TouchableOpacity
            style={styles.playHit}
            activeOpacity={0.8}
            onPress={() => Linking.openURL(watchUrl(h.videoId))}
          >
            <View style={[styles.playBtn, { backgroundColor: accent }]}>
              <Text style={styles.playTxt}>{'▶'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{h.title}</Text>
          <View style={styles.meta}>
            <Text style={styles.metaChip}>{h.difficulty}</Text>
            <Text style={styles.metaChip}>{'~' + h.estMinutes + ' min'}</Text>
          </View>
          <Text style={styles.equip}>{h.equipment}</Text>
          <Text style={styles.when}>
            <Text style={styles.whenB}>When: </Text>
            {h.whenToUse}
          </Text>

          <View style={styles.safety}>
            <Text style={styles.safetyH}>{'⚠ Safety first'}</Text>
            {h.safety.map((s, i) => (
              <Text key={i} style={styles.safetyItem}>
                {'• ' + s}
              </Text>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setOpen((o) => ({ ...o, [h.videoId]: !o[h.videoId] }))}
            activeOpacity={0.7}
          >
            <Text style={styles.stepsToggle}>
              {(isOpen ? '▴' : '▾') + ' Steps (' + h.steps.length + ')'}
            </Text>
          </TouchableOpacity>
          {isOpen &&
            h.steps.map((s, i) => (
              <Text key={i} style={styles.step}>
                {i + 1 + '. ' + s}
              </Text>
            ))}

          <TouchableOpacity
            style={styles.watch}
            activeOpacity={0.85}
            onPress={() => Linking.openURL(watchUrl(h.videoId))}
          >
            <Text style={styles.watchTxt}>{'▶  Watch the how-to'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: accent }]}>
          {vertical.label + ' · agentic field assist for ' + vertical.trade}
        </Text>
        <Text style={styles.h1}>Field How-To</Text>
        <Text style={styles.sub}>
          Pull the right procedure for the job - company-approved first, so you get it right
          without calling the senior tech.
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(h) => h.videoId}
        renderItem={({ item }) => renderCard(item)}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tradeRow}
            >
              {VERTICALS.map((v) => {
                const on = v.key === vkey;
                return (
                  <TouchableOpacity
                    key={v.key}
                    onPress={() => selectVertical(v.key)}
                    activeOpacity={0.8}
                    style={[
                      styles.trade,
                      on && { backgroundColor: v.accent, borderColor: v.accent },
                    ]}
                  >
                    <View style={[styles.tradeDot, { backgroundColor: on ? '#FFFFFF' : v.accent }]} />
                    <View>
                      <Text style={[styles.tradeLabel, on && { color: '#FFFFFF' }]}>{v.label}</Text>
                      <Text style={[styles.tradeTrade, on && { color: '#FFFFFF' }]}>{v.trade}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {systems.map((s) => {
                const on = s === sys;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSys(s)}
                    activeOpacity={0.8}
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { backgroundColor: NAVY, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 16 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  h1: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 4 },
  sub: { color: '#CFE0EE', fontSize: 13.5, marginTop: 4, lineHeight: 19 },

  list: { padding: 16, paddingBottom: 28 },
  tradeRow: { gap: 10, paddingBottom: 14 },
  trade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8EE',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  tradeDot: { width: 10, height: 10, borderRadius: 5 },
  tradeLabel: { fontSize: 14, fontWeight: '800', color: SLATE },
  tradeTrade: { fontSize: 10.5, fontWeight: '700', color: '#8798A6' },

  chipRow: { gap: 8, paddingBottom: 4 },
  chip: {
    borderWidth: 1,
    borderColor: '#E2E8EE',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipOn: { backgroundColor: NAVY, borderColor: NAVY },
  chipTxt: { fontSize: 13, fontWeight: '700', color: SLATE },
  chipTxtOn: { color: '#FFFFFF' },

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
  thumbWrap: { position: 'relative', width: '100%', aspectRatio: 16 / 9, backgroundColor: '#0B1622' },
  thumb: { width: '100%', height: '100%' },
  approved: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#16A34A',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  approvedTxt: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  systag: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  systagTxt: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  playHit: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  playTxt: { color: '#FFFFFF', fontSize: 20, marginLeft: 3 },

  body: { padding: 16, gap: 9 },
  title: { fontSize: 17, fontWeight: '800', color: NAVY, lineHeight: 22 },
  meta: { flexDirection: 'row', gap: 8 },
  metaChip: {
    backgroundColor: '#F4F6F8',
    borderWidth: 1,
    borderColor: '#E2E8EE',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
    fontSize: 11.5,
    fontWeight: '700',
    color: SLATE,
    overflow: 'hidden',
  },
  equip: { fontSize: 12.5, fontWeight: '600', color: '#8798A6' },
  when: { fontSize: 13.5, color: SLATE, lineHeight: 19 },
  whenB: { color: NAVY, fontWeight: '800' },

  safety: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 10,
    padding: 11,
  },
  safetyH: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, color: '#B45309', marginBottom: 4 },
  safetyItem: { fontSize: 12.5, color: '#7C4A12', lineHeight: 18 },

  stepsToggle: { fontSize: 14, fontWeight: '800', color: NAVY, paddingVertical: 2 },
  step: { fontSize: 13, color: INK, lineHeight: 19, paddingLeft: 2 },

  watch: {
    marginTop: 4,
    backgroundColor: NAVY,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  watchTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
