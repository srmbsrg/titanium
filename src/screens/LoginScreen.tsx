import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import axios from 'axios';
import { Config } from '../config';
import { useTitaniumStore } from '../store';

const BRAND = '#1D4ED8';
const BUILD = 'v1.2';

/** Sign-in gate for the Titanium field app. Authenticates against Manifold
 *  and stores the Bearer token used by carbonClient for all ERP calls. */
export function LoginScreen() {
  const login = useTitaniumStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const backendHost = Config.MANIFOLD_AUTH_URL.replace(/^https?:\/\//, '').replace(/\/api.*$/, '');

  async function onSubmit() {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      const res = await axios.post(
        Config.MANIFOLD_AUTH_URL,
        { email: email.trim().toLowerCase(), password },
        { timeout: 15000, headers: { 'Content-Type': 'application/json' } },
      );
      const data = res.data ?? {};
      if (!data.token) { throw new Error('No token returned'); }
      login(data.techId ?? email.trim(), data.techName ?? email.trim(), data.token);
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        status === 401
          ? `Wrong email or password.\n\nServer: ${backendHost}`
          : `Could not sign in (${status ?? 'network'}).\nServer: ${backendHost}`;
      Alert.alert('Sign-in failed', msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.brand}>Titanium</Text>
        <Text style={styles.sub}>Carborundum field app</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="username"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          textContentType="password"
          keyboardType={Platform.OS === 'android' ? 'visible-password' : undefined}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          style={[styles.btn, busy && { opacity: 0.6 }]}
          onPress={onSubmit}
          disabled={busy}
        >
          {busy
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Sign in</Text>}
        </TouchableOpacity>
        <Text style={styles.env}>{backendHost} · {BUILD}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F2436', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  brand: { fontSize: 28, fontWeight: '800', color: BRAND, textAlign: 'center' },
  sub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 12, color: '#111827',
  },
  btn: {
    backgroundColor: BRAND, borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  env: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 14 },
});
