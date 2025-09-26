/**
 * Money formatting utilities for YoBool
 * Handles proper currency display based on locale and region conventions
 */

import type { LocaleValue } from '@/types/core';

export interface MoneyFormatOptions {
  /** The amount in minor units (e.g., centimes for XOF) */
  amount: number;
  /** ISO currency code (e.g., 'XOF', 'EUR', 'USD') */
  currencyCode: string;
  /** User's locale preference */
  locale: LocaleValue;
  /** Whether to show currency symbol or code */
  showSymbol?: boolean;
  /** Whether to use compact notation for large numbers */
  compact?: boolean;
}

export interface FormattedMoney {
  /** The formatted string ready for display */
  formatted: string;
  /** The currency symbol or code used */
  currency: string;
  /** The numeric amount formatted without currency */
  amount: string;
}

/**
 * Currency mappings for display in different locales
 */
const CURRENCY_DISPLAY: Record<
  string,
  Record<string, { symbol: string; name: string }>
> = {
  XOF: {
    fr: { symbol: 'FCFA', name: 'Franc CFA' },
    en: { symbol: 'FCFA', name: 'CFA Franc' },
  },
  EUR: {
    fr: { symbol: '€', name: 'Euro' },
    en: { symbol: '€', name: 'Euro' },
  },
  USD: {
    fr: { symbol: 'US$', name: 'Dollar américain' },
    en: { symbol: '$', name: 'US Dollar' },
  },
  GBP: {
    fr: { symbol: '£', name: 'Livre sterling' },
    en: { symbol: '£', name: 'British Pound' },
  },
};

/**
 * Number formatting locales for React Native
 */
const LOCALE_MAPPINGS: Record<string, string> = {
  fr: 'fr-SN', // French (Senegal) for proper XOF formatting
  en: 'en-US', // English (US) as fallback
};

/**
 * Formats money according to locale and currency conventions
 */
function formatMoney(options: MoneyFormatOptions): FormattedMoney {
  const {
    amount,
    currencyCode,
    locale,
    showSymbol = true,
    compact = false,
  } = options;

  // Get locale-specific formatting
  const localeString = LOCALE_MAPPINGS[locale] || LOCALE_MAPPINGS['en'];

  // Get currency display info
  const currencyInfo = CURRENCY_DISPLAY[currencyCode]?.[locale] || {
    symbol: currencyCode,
    name: currencyCode,
  };

  // Format the number
  const numberFormatOptions: Intl.NumberFormatOptions = {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };

  if (compact && amount >= 1000000) {
    numberFormatOptions.notation = 'compact';
    numberFormatOptions.compactDisplay = 'short';
  }

  const formattedNumber = new Intl.NumberFormat(
    localeString,
    numberFormatOptions
  ).format(amount);

  // Build the formatted string based on currency and locale
  let formatted: string;
  const currency = showSymbol ? currencyInfo.symbol : currencyCode;

  if (currencyCode === 'XOF' || currencyCode === 'EUR') {
    // For XOF and EUR, amount comes before currency in both locales
    formatted = `${formattedNumber} ${currency}`;
  } else if (currencyCode === 'USD') {
    if (locale === 'fr') {
      // French: amount before currency
      formatted = `${formattedNumber} ${currency}`;
    } else {
      // English: currency before amount for USD
      formatted = `${currency}${formattedNumber}`;
    }
  } else {
    // Default: amount before currency
    formatted = `${formattedNumber} ${currency}`;
  }

  return {
    formatted,
    currency,
    amount: formattedNumber,
  };
}

/**
 * Quick format function for simple use cases
 */
export function formatPrice(
  amount: number,
  currencyCode: string,
  locale: LocaleValue
): string {
  return formatMoney({ amount, currencyCode, locale }).formatted;
}

/**
 * Format money with "From" prefix for price ranges
 */
export function formatPriceFrom(
  amount: number,
  currencyCode: string,
  locale: LocaleValue
): string {
  const { formatted } = formatMoney({ amount, currencyCode, locale });

  // Use locale-appropriate "from" text
  const fromText = locale === 'fr' ? 'À partir de' : 'From';

  return `${fromText} ${formatted}`;
}

/**
 * Compact format for large amounts (e.g., "1.2M FCFA")
 */
export function formatPriceCompact(
  amount: number,
  currencyCode: string,
  locale: LocaleValue
): string {
  return formatMoney({ amount, currencyCode, locale, compact: true }).formatted;
}
