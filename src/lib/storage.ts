import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import {
  AuthState,
  AuthToken,
  User,
  isAuthenticated,
  type LocaleValue,
} from '@/types';

// ============================================================================
// STORAGE TYPES - Includes receivedAt timestamp
// ============================================================================

interface StoredAuthData {
  user: User;
  token: AuthToken;
  tokenExpiration: number;
  receivedAt: number;
  isPro: boolean;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const AUTH_STATE_KEY = 'auth_state';
const LANGUAGE_KEY = 'user_language';

// ============================================================================
// CORE STORAGE OPERATIONS
// ============================================================================

/**
 * Save authenticated state to secure storage
 */
export async function saveAuthState(authState: AuthState): Promise<void> {
  try {
    if (isAuthenticated(authState)) {
      const storageData: StoredAuthData = {
        user: authState.user,
        token: authState.token,
        tokenExpiration: authState.tokenExpiration,
        receivedAt: authState.receivedAt,
        isPro: authState.isPro,
      };

      await SecureStore.setItemAsync(
        AUTH_STATE_KEY,
        JSON.stringify(storageData)
      );
    } else {
      // Clear storage for non-authenticated states
      await clearAuthState();
    }
  } catch (error) {
    console.error('Failed to save auth state:', error);
    // Don't throw - storage failures shouldn't break auth flow
  }
}

/**
 * Retrieve auth state from secure storage with migration support
 */
export async function getAuthState(): Promise<StoredAuthData | null> {
  try {
    // Try current format first
    const authString = await SecureStore.getItemAsync(AUTH_STATE_KEY);
    if (authString) {
      const storedData: StoredAuthData = JSON.parse(authString);

      if (isValidStoredAuth(storedData)) {
        return storedData;
      } else {
        console.warn('Invalid stored auth data, attempting migration');
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to retrieve auth state:', error);
    await clearAuthState(); // Clear corrupted data
    return null;
  }
}

/**
 * Clear all auth data from storage
 */
export async function clearAuthState(): Promise<void> {
  try {
    await Promise.allSettled([SecureStore.deleteItemAsync(AUTH_STATE_KEY)]);
  } catch (error) {
    console.warn('Failed to clear auth state:', error);
  }
}

/**
 * Check if auth data exists in storage
 */
export async function hasStoredAuth(): Promise<boolean> {
  try {
    const authString = await SecureStore.getItemAsync(AUTH_STATE_KEY);
    return authString !== null;
  } catch {
    return false;
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

function isValidStoredAuth(data: unknown): data is StoredAuthData {
  if (typeof data !== 'object' || data === null) return false;

  const auth = data as Record<string, unknown>;

  return (
    typeof auth.user === 'object' &&
    auth.user !== null &&
    typeof auth.token === 'string' &&
    typeof auth.tokenExpiration === 'number' &&
    typeof auth.receivedAt === 'number' &&
    typeof auth.isPro === 'boolean' &&
    auth.receivedAt > 0 &&
    auth.tokenExpiration > auth.receivedAt // Basic sanity check
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if stored token is likely stale based on age
 */
export function isTokenStale(data: StoredAuthData, maxAgeDays = 6): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  const tokenAge = currentTime - data.receivedAt;
  const maxAgeSeconds = maxAgeDays * 24 * 60 * 60;

  return tokenAge > maxAgeSeconds;
}

/**
 * Get token age in human readable format
 */
export function getTokenAge(data: StoredAuthData): string {
  const currentTime = Math.floor(Date.now() / 1000);
  const ageSeconds = currentTime - data.receivedAt;

  const days = Math.floor(ageSeconds / (24 * 60 * 60));
  const hours = Math.floor((ageSeconds % (24 * 60 * 60)) / 3600);

  if (days > 0) return `${days}d ${hours}h ago`;
  if (hours > 0) return `${hours}h ago`;

  const minutes = Math.floor(ageSeconds / 60);
  return `${minutes}m ago`;
}

// ============================================================================
// LANGUAGE STORAGE
// ============================================================================

/**
 * Save user's preferred language to AsyncStorage
 */
export async function saveLanguage(locale: LocaleValue): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, locale);
  } catch (error) {
    console.warn('Failed to save language preference:', error);
  }
}

/**
 * Get user's preferred language from AsyncStorage
 */
export async function getLanguage(): Promise<LocaleValue | null> {
  try {
    return (await AsyncStorage.getItem(LANGUAGE_KEY)) as LocaleValue | null;
  } catch (error) {
    console.warn('Failed to get language preference:', error);
    return null;
  }
}

/**
 * Clear language preference
 */
export async function clearLanguage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LANGUAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear language preference:', error);
  }
}
