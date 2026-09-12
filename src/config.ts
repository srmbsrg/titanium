/**
 * Titanium (Carbon) runtime config
 *
 * Defaults point at the live Railway-hosted Silicon (Manifold) backend so the
 * app works out of the box. To override per-environment at build time, set the
 * matching env vars in CI and they are inlined into the bundle by
 * babel-plugin-transform-inline-environment-variables (wired in babel.config.js).
 *
 * IMPORTANT: the references below must be STATIC `process.env.<NAME>` member
 * accesses for the inline-env babel plugin to replace them at build time - a
 * dynamic `process.env[key]` lookup would NOT be inlined. The `declare const
 * process` below is type-only (stripped by the TypeScript transform before the
 * inline-env plugin runs) and exists solely so these reads type-check without
 * pulling in @types/node. When a var is unset (e.g. local dev, or the plugin
 * absent), the read is undefined and the Railway fallback is used.
 */

declare const process: { env: { [key: string]: string | undefined } };

const SILICON = 'https://manifold-web-production.up.railway.app';

function pick(value: string | undefined, fallback: string): string {
  return value && value.length > 0 ? value : fallback;
}

export const Config = {
  // Manifold ERP data API (CRM, jobs, work orders, payments)
  MANIFOLD_API_URL: pick(process.env.MANIFOLD_API_URL, `${SILICON}/api/erp`),
  // Carbon dedicated jobs API (Silicon-backed Job/JobNote/JobPhoto models)
  CARBON_API_URL: pick(process.env.CARBON_API_URL, `${SILICON}/api/carbon`),
  // Manifold mobile sign-in endpoint - returns { token, techId, techName }
  MANIFOLD_AUTH_URL: pick(process.env.MANIFOLD_AUTH_URL, `${SILICON}/api/mobile/login`),
  ELEVENLABS_API_KEY: pick(process.env.ELEVENLABS_API_KEY, ''),
  STRIPE_PUBLISHABLE_KEY: pick(process.env.STRIPE_PUBLISHABLE_KEY, ''),
};