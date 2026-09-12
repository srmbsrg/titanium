/**
 * Babel config.
 *
 * babel-plugin-transform-inline-environment-variables inlines the listed
 * build-time env vars (set in CI) into the bundle as string literals, so
 * src/config.ts picks up per-environment API URLs / keys. It is loaded
 * conditionally: if the plugin is not installed (e.g. a fresh checkout before
 * `npm install`), Metro still builds and src/config.ts falls back to its
 * hardcoded Railway defaults. Only the whitelisted keys are inlined so no
 * other environment values leak into the app bundle.
 */
const plugins = [];

try {
  require.resolve('babel-plugin-transform-inline-environment-variables');
  plugins.push([
    'transform-inline-environment-variables',
    {
      include: [
        'MANIFOLD_API_URL',
        'CARBON_API_URL',
        'MANIFOLD_AUTH_URL',
        'ELEVENLABS_API_KEY',
        'STRIPE_PUBLISHABLE_KEY',
      ],
    },
  ]);
} catch (e) {
  // Plugin not installed - config.ts Railway fallbacks remain in effect.
}

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins,
};