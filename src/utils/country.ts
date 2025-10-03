/**
 * Converts a 2-letter country code to its corresponding flag emoji
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "US", "FR")
 * @returns Flag emoji string
 */
export const countryCodeToFlag = (countryCode: string): string => {
  return countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join('');
};
