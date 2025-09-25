// ============================================================================
// ENHANCED I18N CORE - Lightweight internationalization system
// ============================================================================

import {
  getFallbackLocale,
  i18nConfig,
  isSupportedLocale,
  translations,
  type TranslationKey,
} from '@/translations';
import { type LocaleValue } from '@/types/core';
import { getLanguage, saveLanguage } from './storage';

// Global state
let currentLocale: LocaleValue = i18nConfig.defaultLocale;
let isInitialized = false;

// Listeners for locale changes
type LocaleChangeListener = (locale: LocaleValue) => void;
const listeners = new Set<LocaleChangeListener>();

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Initialize i18n system - loads saved language preference
 */
export async function initializeI18n(): Promise<LocaleValue> {
  if (isInitialized) return currentLocale;

  try {
    const savedLocale = await getLanguage();
    if (savedLocale && isSupportedLocale(savedLocale)) {
      currentLocale = savedLocale;
    } else {
      currentLocale = i18nConfig.defaultLocale;
    }
  } catch (error) {
    console.warn('Failed to load saved language, using default:', error);
    currentLocale = i18nConfig.defaultLocale;
  }

  isInitialized = true;
  return currentLocale;
}

/**
 * Set current locale and persist to storage
 */
export async function setLocale(locale: LocaleValue): Promise<void> {
  if (!isSupportedLocale(locale)) {
    console.warn(
      `Unsupported locale: ${locale}, falling back to ${getFallbackLocale()}`
    );
    locale = getFallbackLocale();
  }

  if (currentLocale === locale) return;

  currentLocale = locale;

  // Persist to storage
  try {
    await saveLanguage(locale);
  } catch (error) {
    console.warn('Failed to save language preference:', error);
  }

  // Notify listeners
  listeners.forEach((listener) => listener(locale));
}

/**
 * Get current locale
 */
export function getCurrentLocale(): LocaleValue {
  return currentLocale;
}

/**
 * Subscribe to locale changes
 */
export function onLocaleChange(listener: LocaleChangeListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Translate a key to current locale with fallback
 */
export function t(key: TranslationKey): string {
  const translation = translations[currentLocale]?.[key];
  if (translation) return translation;

  // Fallback to default locale
  const fallback = translations[i18nConfig.fallbackLocale]?.[key];
  if (fallback) return fallback;

  // Return key if no translation found
  console.warn(`Missing translation for key: ${key}`);
  return key;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all supported locales
 */
export function getSupportedLocales(): readonly LocaleValue[] {
  return i18nConfig.supportedLocales;
}

/**
 * Check if i18n is initialized
 */
export function getIsInitialized(): boolean {
  return isInitialized;
}

/**
 * Reset i18n to default state (mainly for testing)
 */
export async function resetI18n(): Promise<void> {
  currentLocale = i18nConfig.defaultLocale;
  isInitialized = false;
  listeners.clear();
}
