// ============================================================================
// TRANSLATIONS INDEX
// ============================================================================

import { Locale, type I18nConfig, type LocaleValue } from '@/types';
import { en, type TranslationKey } from './en';
import { fr } from './fr';

export const translations = {
  [Locale.EN]: en,
  [Locale.FR]: fr,
} as const;

export const i18nConfig: I18nConfig = {
  defaultLocale: Locale.FR,
  fallbackLocale: Locale.EN,
  supportedLocales: [Locale.EN, Locale.FR] as const,
};

export type { TranslationKey };

// Helper to check if a locale is supported
export function isSupportedLocale(locale: string): locale is LocaleValue {
  return i18nConfig.supportedLocales.includes(locale as LocaleValue);
}

// Get fallback locale
export function getFallbackLocale(): LocaleValue {
  return i18nConfig.fallbackLocale;
}
