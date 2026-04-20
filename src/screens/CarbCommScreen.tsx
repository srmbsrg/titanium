/**
 * CarbCommScreen — Carb-O-Comm voice interface
 *
 * Full-screen voice mode: speak to Tes AI, get spoken responses back.
 * Designed for gloved hands — large tap targets, high-contrast UI.
 *
 * STT: @react-native-voice/voice
 * TTS: ElevenLabs API (voice ID: XEQBC9sleaE3f5ff82UR) → react-native-sound
 *
 * Requires native setup:
 *   npx pod-install
 *   Add MICROPHONE permission to AndroidManifest.xml / Info.plist
 *   Set ELEVENLABS_API_KEY in your .env
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTitaniumStore } from '../store';
import { queryTes } from '../api/carbonClient';
import { Config } from '../config';

// ---------------------------------------------------------------------------
// Optional native module imports — gracefully degrade if not linked
// ---------------------------------------------------------------------------

let Voice: any = null;
let Sound: any = null;
let RNFS: any = null;

try { Voice = require('@react-native-voice/voice').default; } catch {}
try { Sound = require('react-native-sound'); Sound.setCategory('Playback'); } catch {}
try { RNFS = require('react-native-fs'); } catch {}

// ---------------------------------------------------------------------------
// ElevenLabs config
// ---------------------------------------------------------------------------

const ELEVENLABS_VOICE_ID = 'XEQBC9sleaE3f5ff82UR'; // Tes
const ELEVENLABS_API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;
const ELEVENLABS_API_KEY = Config.ELEVENLABS_API_KEY;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Turn {
  role: 'user' | 'tes';
  text: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CarbCommScreen() {
  const { carbCommVisible, carbCommJobId, carbCommCustomerId, closeCarbComm, techName } =
    useTitaniumStore();

  const [turns, setTurns] = useState<Turn[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [error, setError] = useState('');
  const [voiceAvailable] = useState(!!Voice);
  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const currentSound = useRef<any>(null);

  // Pulse animation while listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  // Scroll to bottom when turns update
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [turns, partialTranscript]);

  // Wire Voice events
  useEffect(() => {
    if (!Voice) return;
    Voice.onSpeechResults = (e: any) => {
      const text = e.value?.[0] || '';
      if (text) handleUserSpeech(text);
    };
    Voice.onSpeechPartialResults = (e: any) => {
      setPartialTranscript(e.value?.[0] || '');
    };
    Voice.onSpeechError = (e: any) => {
      setError(`Speech error: ${e.error?.message || 'Unknown'}`);
      setIsListening(false);
      setPartialTranscript('');
    };
    Voice.onSpeechEnd = () => {
      setIsListening(false);
      setPartialTranscript('');
    };
    return () => {
      Voice.destroy?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carbCommJobId, carbCommCustomerId]);

  const startListening = useCallback(async () => {
    if (!voiceAvailable) {
      setError('Voice recognition not available on this device / build.');
      return;
    }
    try {
      setError('');
      await Voice.start('en-US');
      setIsListening(true);
      setPartialTranscript('');
    } catch (e: any) {
      setError(`Could not start listening: ${e.message}`);
    }
  }, [voiceAvailable]);

  const stopListening = useCallback(async () => {
    if (!voiceAvailable) return;
    try {
      await Voice.stop();
    } catch {}
    setIsListening(false);
  }, [voiceAvailable]);

  const stopSpeaking = useCallback(() => {
    if (currentSound.current) {
      currentSound.current.stop();
      currentSound.current.release();
      currentSound.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const handleUserSpeech = useCallback(async (text: string) => {
    setTurns(prev => [...prev, { role: 'user', text }]);
    setIsThinking(true);

    try {
      const response = await queryTes(text, {
        jobId: carbCommJobId ?? undefined,
        customerId: carbCommCustomerId ?? undefined,
        techName: techName ?? undefined,
      });
      setTurns(prev => [...prev, { role: 'tes', text: response }]);
      if (!isMuted) await speakResponse(response);
    } catch (e: any) {
      const errMsg = 'Could not reach Tes — check your connection.';
      setError(errMsg);
      setTurns(prev => [...prev, { role: 'tes', text: errMsg }]);
    } finally {
      setIsThinking(false);
    }
  }, [carbCommJobId, carbCommCustomerId, techName, isMuted]);

  const speakResponse = useCallback(async (text: string) => {
    if (!ELEVENLABS_API_KEY) {
      console.warn('[CarbComm] ELEVENLABS_API_KEY not set — skipping TTS');
      return;
    }
    if (!Sound || !RNFS) {
      console.warn('[CarbComm] react-native-sound or react-native-fs not linked — skipping TTS');
      return;
    }

    setIsSpeaking(true);
    try {
      const response = await fetch(ELEVENLABS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.8 },
        }),
      });

      if (!response.ok) throw new Error(`ElevenLabs API error ${response.status}`);

      const audioBuffer = await response.arrayBuffer();
      const base64 = bufferToBase64(audioBuffer);
      const tmpPath = `${RNFS.TemporaryDirectoryPath}/tes_response_${Date.now()}.mp3`;
      await RNFS.writeFile(tmpPath, base64, 'base64');

      await new Promise<void>((resolve, reject) => {
        const sound = new Sound(tmpPath, '', (err: any) => {
          if (err) { reject(err); return; }
          currentSound.current = sound;
          sound.play((success: boolean) => {
            sound.release();
            currentSound.current = null;
            setIsSpeaking(false);
            resolve();
          });
        });
      });
    } catch (e: any) {
      console.error('[CarbComm] TTS error:', e.message);
      setIsSpeaking(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    stopSpeaking();
    if (isListening) stopListening();
    closeCarbComm();
    setTurns([]);
    setError('');
    setPartialTranscript('');
  }, [stopSpeaking, isListening, stopListening, closeCarbComm]);

  const toggleMic = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, stopListening, startListening]);

  return (
    <Modal
      visible={carbCommVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerLogo}>⚡ CARB-O-COMM</Text>
            <Text style={styles.headerSub}>Tes AI — Field Assistant</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
        </View>

        {/* Context badge */}
        {carbCommJobId && (
          <View style={styles.contextBadge}>
            <Text style={styles.contextText}>Job context: {carbCommJobId}</Text>
          </View>
        )}

        {/* Conversation */}
        <ScrollView
          ref={scrollRef}
          style={styles.conversation}
          contentContainerStyle={styles.conversationContent}
        >
          {turns.length === 0 && !partialTranscript && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎙</Text>
              <Text style={styles.emptyTitle}>Ask Tes anything</Text>
              <Text style={styles.emptyHint}>
                {"Gate code? Parts used last visit?\nCustomer preferences? Just ask."}
              </Text>
            </View>
          )}

          {turns.map((turn, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                turn.role === 'user' ? styles.bubbleUser : styles.bubbleTes,
              ]}
            >
              <Text style={styles.bubbleLabel}>
                {turn.role === 'user' ? 'You' : 'Tes'}
              </Text>
              <Text style={styles.bubbleText}>{turn.text}</Text>
            </View>
          ))}

          {partialTranscript !== '' && (
            <View style={[styles.bubble, styles.bubbleUser, styles.bubblePartial]}>
              <Text style={styles.bubbleLabel}>You (speaking…)</Text>
              <Text style={styles.bubbleText}>{partialTranscript}</Text>
            </View>
          )}

          {isThinking && (
            <View style={[styles.bubble, styles.bubbleTes]}>
              <Text style={styles.bubbleLabel}>Tes</Text>
              <ActivityIndicator color="#FDBA74" style={{ marginTop: 4 }} />
            </View>
          )}

          {error !== '' && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </ScrollView>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Speaking indicator + stop */}
          {isSpeaking && (
            <TouchableOpacity onPress={stopSpeaking} style={styles.stopBtn} activeOpacity={0.8}>
              <Text style={styles.stopBtnText}>⏹  Stop Speaking</Text>
            </TouchableOpacity>
          )}

          {/* Mute toggle */}
          <TouchableOpacity
            onPress={() => setIsMuted(m => !m)}
            style={[styles.muteBtn, isMuted && styles.muteBtnActive]}
            activeOpacity={0.8}
          >
            <Text style={styles.muteBtnText}>{isMuted ? '🔇 Muted' : '🔊 Audio On'}</Text>
          </TouchableOpacity>

          {/* Mic button — large, glove-friendly */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={toggleMic}
              style={[styles.micBtn, isListening && styles.micBtnActive]}
              activeOpacity={0.85}
              disabled={isThinking || isSpeaking}
            >
              <Text style={styles.micIcon}>{isListening ? '⏺' : '🎙'}</Text>
              <Text style={styles.micLabel}>
                {isListening ? 'Tap to stop' : 'Tap to speak'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {!voiceAvailable && (
            <Text style={styles.voiceUnavailable}>
              Voice recognition not available — native module not linked.
            </Text>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i + 1] ?? 0, b2 = bytes[i + 2] ?? 0;
    result += BASE64_CHARS[b0 >> 2];
    result += BASE64_CHARS[((b0 & 3) << 4) | (b1 >> 4)];
    result += i + 1 < bytes.length ? BASE64_CHARS[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    result += i + 2 < bytes.length ? BASE64_CHARS[b2 & 63] : '=';
  }
  return result;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BRAND_ORANGE = '#FDBA74';
const BRAND_DARK = '#0C1222';
const BRAND_CARD = '#131c2e';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND_DARK },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerLeft: { flex: 1 },
  headerLogo: { fontSize: 18, fontWeight: '800', color: BRAND_ORANGE, letterSpacing: 1 },
  headerSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  closeBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8 },
  closeBtnText: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },

  contextBadge: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(253,186,116,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(253,186,116,0.2)',
  },
  contextText: { color: BRAND_ORANGE, fontSize: 12 },

  conversation: { flex: 1 },
  conversationContent: { padding: 20, gap: 12, paddingBottom: 12 },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  emptyHint: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },

  bubble: {
    maxWidth: '88%',
    padding: 14,
    borderRadius: 16,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#1D4ED8',
    borderBottomRightRadius: 4,
  },
  bubbleTes: {
    alignSelf: 'flex-start',
    backgroundColor: BRAND_CARD,
    borderWidth: 1,
    borderColor: 'rgba(253,186,116,0.2)',
    borderBottomLeftRadius: 4,
  },
  bubblePartial: { opacity: 0.6 },
  bubbleLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  bubbleText: { fontSize: 16, color: '#FFFFFF', lineHeight: 22 },

  errorText: { fontSize: 13, color: '#EF4444', textAlign: 'center', marginTop: 8 },

  controls: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },

  stopBtn: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  stopBtnText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },

  muteBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  muteBtnActive: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' },
  muteBtnText: { color: '#D1D5DB', fontSize: 15, fontWeight: '600' },

  // Mic button: glove-friendly 120px target
  micBtn: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(29,78,216,0.2)',
    borderWidth: 3,
    borderColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  micBtnActive: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderColor: '#EF4444',
  },
  micIcon: { fontSize: 48 },
  micLabel: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },

  voiceUnavailable: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    maxWidth: 280,
  },
});
