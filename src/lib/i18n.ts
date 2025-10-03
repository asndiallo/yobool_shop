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
import * as Localization from 'expo-localization';

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
 * Get device language and extract just the language code (e.g., 'en' from 'en-US')
 */
function getDeviceLanguage(): LocaleValue {
  try {
    const deviceLocales = Localization.getLocales();
    if (deviceLocales && deviceLocales.length > 0) {
      // Extract language code from locale (e.g., 'en' from 'en-US')
      const languageCode = deviceLocales[0].languageCode;
      if (languageCode && isSupportedLocale(languageCode)) {
        return languageCode as LocaleValue;
      }
    }
  } catch (error) {
    console.warn('Failed to get device language:', error);
  }
  return getFallbackLocale();
}

/**
 * Initialize i18n system - loads saved language preference or uses device language
 */
export async function initializeI18n(): Promise<LocaleValue> {
  if (isInitialized) return currentLocale;

  try {
    // First, check if user has a saved preference
    const savedLocale = await getLanguage();
    if (savedLocale && isSupportedLocale(savedLocale)) {
      currentLocale = savedLocale;
    } else {
      // No saved preference, use device language with fallback to 'en'
      currentLocale = getDeviceLanguage();
      // Save the detected language as the user's preference
      await saveLanguage(currentLocale);
    }
  } catch (error) {
    console.warn(
      'Failed to load saved language, using device language:',
      error
    );
    currentLocale = getDeviceLanguage();
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
 * Translate a key to current locale with fallback and interpolation support
 * @param key - Translation key
 * @param params - Optional parameters for interpolation (e.g., { min: '8' })
 */
export function t(
  key: TranslationKey,
  params?: Record<string, string>
): string {
  const translation = translations[currentLocale]?.[key];
  let result: string =
    translation || translations[i18nConfig.fallbackLocale]?.[key] || key;

  if (!translation && !translations[i18nConfig.fallbackLocale]?.[key]) {
    console.warn(`Missing translation for key: ${key}`);
    return key;
  }

  // Interpolate parameters if provided
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), value);
    });
  }

  return result;
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
