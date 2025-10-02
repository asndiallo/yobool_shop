// ============================================================================
// ENHANCED TRANSLATION HOOK - With persistence and proper state sync
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import {
  getCurrentLocale,
  setLocale,
  initializeI18n,
  onLocaleChange,
  getSupportedLocales,
  getIsInitialized,
  t as translate
} from '@/lib/i18n';
import { type LocaleValue } from '@/types/core';

interface UseTranslationReturn {
  t: typeof translate;
  i18n: {
    language: LocaleValue;
    changeLanguage: (locale: LocaleValue) => Promise<void>;
    supportedLocales: readonly LocaleValue[];
    isInitialized: boolean;
    isChanging: boolean;
  };
}

export function useTranslation(): UseTranslationReturn {
  const [locale, setCurrentLocale] = useState<LocaleValue>(getCurrentLocale());
  const [isInitialized, setIsInitialized] = useState(getIsInitialized());
  const [isChanging, setIsChanging] = useState(false);

  // Initialize i18n on first render
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const initialLocale = await initializeI18n();
        if (isMounted) {
          setCurrentLocale(initialLocale);
          setIsInitialized(true);
        }
      } catch (error) {
        console.warn('Failed to initialize i18n:', error);
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    if (!isInitialized) {
      initialize();
    }

    return () => {
      isMounted = false;
    };
  }, [isInitialized]);

  // Subscribe to locale changes
  useEffect(() => {
    const unsubscribe = onLocaleChange((newLocale) => {
      setCurrentLocale(newLocale);
      setIsChanging(false);
    });

    return unsubscribe;
  }, []);

  // Change language with loading state
  const changeLanguage = useCallback(async (newLocale: LocaleValue) => {
    if (newLocale === locale) return;

    setIsChanging(true);
    try {
      await setLocale(newLocale);
    } catch (error) {
      console.error('Failed to change language:', error);
      setIsChanging(false);
    }
  }, [locale]);

  return {
    t: translate,
    i18n: {
      language: locale,
      changeLanguage,
      supportedLocales: getSupportedLocales(),
      isInitialized,
      isChanging,
    },
  };
}
