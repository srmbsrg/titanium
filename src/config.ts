/**
 * Titanium runtime config
 * Defaults point at the live Railway-hosted Silicon (Manifold) backend so the
 * app works out of the box. Override via env at build time if needed (requires
 * babel-plugin-transform-inline-environment-variables, not currently wired).
 */

// @ts-ignore — process.env injected by Metro at build time (when the inline-env plugin is present)
const env = (key: string, fallback = ''): string => {
  try {
    // @ts-ignore
    return (process.env[key] as string) ?? fallback;
  } catch {
    return fallback;
  }
};

const SILICON = 'https://manifold-web-production.up.railway.app';

export const Config = {
  // Manifold ERP data API (CRM, jobs, work orders, payments)
  MANIFOLD_API_URL: env('MANIFOLD_API_URL', `${SILICON}/api/erp`),
  // Carbon dedicated jobs API (Silicon-backed Job/JobNote/JobPhoto models)
  CARBON_API_URL: env('CARBON_API_URL', `${SILICON}/api/carbon`),
  // Manifold mobile sign-in endpoint — returns { token, techId, techName }
  MANIFOLD_AUTH_URL: env('MANIFOLD_AUTH_URL', `${SILICON}/api/mobile/login`),
  ELEVENLABS_API_KEY: env('ELEVENLABS_API_KEY', ''),
  STRIPE_PUBLISHABLE_KEY: env('STRIPE_PUBLISHABLE_KEY', ''),
};
