/**
 * Environment configuration for the app
 */
const envConfig: Record<string, string> = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  environment: process.env.NODE_ENV || 'development',
  googlePlacesKey: process.env.EXPO_PUBLIC_PLACES_API_KEY || '',
  pkStripe: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  terms: 'https://yobool.com/legal/terms',
  privacy: 'https://yobool.com/legal/privacy',
  faq: 'https://yobool.com/faq',
  about: 'https://yobool.com/about',
} as const;

export default envConfig;
