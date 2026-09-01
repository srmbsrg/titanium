/**
 * Titanium runtime config
 * Set these values via .env and babel-plugin-transform-inline-environment-variables.
 * For development, override directly here.
 */

// @ts-ignore — process.env injected by Metro at build time
const env = (key: string, fallback = ''): string => {
  try {
    // @ts-ignore
    return process.env[key] ?? fallback;
  } catch {
    return fallback;
  }
};

export const Config = {
  // Manifold ERP data API (CRM, jobs, work orders, payments)
  MANIFOLD_API_URL: env('MANIFOLD_API_URL', 'https://app.carborundum.ai/api/erp'),
  // Carbon dedicated jobs API (Silicon-backed Job/JobNote/JobPhoto models)
  CARBON_API_URL: env('CARBON_API_URL', 'https://app.carborundum.ai/api/carbon'),
  // Manifold mobile sign-in endpoint — returns { token, techId, techName }
  MANIFOLD_AUTH_URL: env('MANIFOLD_AUTH_URL', 'https://app.carborundum.ai/api/mobile/login'),
  ELEVENLABS_API_KEY: env('ELEVENLABS_API_KEY', ''),
  STRIPE_PUBLISHABLE_KEY: env('STRIPE_PUBLISHABLE_KEY', ''),
};
