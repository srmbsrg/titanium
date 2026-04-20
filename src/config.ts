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
  MANIFOLD_API_URL: env('MANIFOLD_API_URL', 'https://app.carborundum.ai/api/erp'),
  ELEVENLABS_API_KEY: env('ELEVENLABS_API_KEY', ''),
  STRIPE_PUBLISHABLE_KEY: env('STRIPE_PUBLISHABLE_KEY', ''),
};
