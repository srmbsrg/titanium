// Exclude the voice ("Tes"/Carb-O-Comm) native module from the Android build.
// @react-native-voice/voice ships a legacy android/build.gradle (jcenter(), no
// compileSdk) that breaks modern Gradle. Voice is descoped for the demo, so we
// skip autolinking it on Android. The JS import still resolves; it's just inert
// natively until the module is updated/replaced.
module.exports = {
  dependencies: {
    '@react-native-voice/voice': {
      platforms: {
        android: null,
      },
    },
  },
};
