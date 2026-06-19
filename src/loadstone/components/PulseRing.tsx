/**
 * PulseRing — looping concentric "magnetic field" pulse used on the Protocol
 * screen. Pure Animated (no native deps). Two staggered rings expand and fade
 * outward while a solid core gently breathes.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

interface Props {
  size: number;
  /** When false, animation is held static (paused state). */
  active: boolean;
  children?: React.ReactNode;
}

export function PulseRing({ size, active, children }: Props) {
  const pulseA = useRef(new Animated.Value(0)).current;
  const pulseB = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makePulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 2400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    if (active) {
      const a = makePulse(pulseA, 0);
      const b = makePulse(pulseB, 1200);
      a.start();
      b.start();
      breatheLoop.start();
      return () => {
        a.stop();
        b.stop();
        breatheLoop.stop();
        pulseA.setValue(0);
        pulseB.setValue(0);
        breathe.setValue(0);
      };
    }
    return undefined;
  }, [active, pulseA, pulseB, breathe]);

  const ringStyle = (value: Animated.Value) => ({
    transform: [
      {
        scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.25] }),
      },
    ],
    opacity: value.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.5, 0] }),
  });

  const coreScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }, ringStyle(pulseA)]}
      />
      <Animated.View
        style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }, ringStyle(pulseB)]}
      />
      <Animated.View
        style={[
          styles.core,
          {
            width: size * 0.62,
            height: size * 0.62,
            borderRadius: (size * 0.62) / 2,
            transform: [{ scale: active ? coreScale : 1 }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  core: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    borderWidth: 1.5,
    borderColor: colors.accentDim,
  },
});
