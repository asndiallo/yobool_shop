const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
};

/**
 * Formats a date string to a short localized format (e.g., "Jan 15")
 */
export const formatShortDate = (
  dateString: string,
  language: string = 'en'
): string => {
  try {
    const bcp47Locale = LOCALE_MAP[language] || 'en-US';
    return new Date(dateString).toLocaleDateString(bcp47Locale, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Gets the year from a date string
 */
export const getYear = (dateString: string): number => {
  return new Date(dateString).getFullYear();
};
