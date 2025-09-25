// ============================================================================
// TYPES INDEX - Single import point for all application types
// ============================================================================

// Re-export everything from all type files
// ============================================================================
// TYPE GUARDS - Organized by domain
// ============================================================================

import {
  hasAsyncData,
  isApiError,
  isAsyncError,
  isAsyncIdle,
  isAsyncLoading,
  isAsyncSuccess,
  isSuccessResponse,
} from './api';
import {
  hasAuthError,
  isAuthLoading,
  isAuthenticated,
  isUnauthenticated,
} from './auth';
import {
  isCityPickerProps,
  isDatePickerProps,
  isWeightPickerProps,
} from './components';

export * from './api';
export * from './auth';
export * from './components';
export * from './core';

// Grouped type guards for easy access
export const TypeGuards = {
  // Auth guards
  isAuthenticated,
  isUnauthenticated,
  isAuthLoading,
  hasAuthError,

  // Component guards
  isDatePickerProps,
  isCityPickerProps,
  isWeightPickerProps,

  // API guards
  isApiError,
  isSuccessResponse,
  isAsyncLoading,
  isAsyncSuccess,
  hasAsyncData,
  isAsyncError,
  isAsyncIdle,
} as const;

// ============================================================================
// TYPE USAGE EXAMPLES & DOCUMENTATION
// ============================================================================

/**
 * Common Usage Patterns:
 *
 * ```typescript
 * import {
 *   User,
 *   AuthState,
 *   ApiResult,
 *   ButtonProps,
 *   TypeGuards,
 *   UserRole
 * } from '@/types';
 *
 * // Using type guards
 * if (TypeGuards.isAuthenticated(authState)) {
 *   // authState.user is now properly typed
 *   console.log(authState.user.attributes.email);
 * }
 *
 * // API result handling
 * const result: ApiResult<User> = await fetchUser();
 * if (TypeGuards.isSuccessResponse(result)) {
 *   // result.data is properly typed as User
 *   handleUser(result.data);
 * }
 *
 * // Component props
 * const buttonProps: ButtonProps = {
 *   title: 'Click me',
 *   onPress: () => {},
 *   bgVariant: 'primary'
 * };
 * ```
 */

// ============================================================================
// BRAND HELPERS - For creating new branded types
// ============================================================================

export type Brand<T, B> = T & { readonly __brand: B };

// Helper to create branded types
export function createBrandedType<T, B extends string>(
  value: T,
  _brand: B
): Brand<T, B> {
  return value as Brand<T, B>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Type-level configuration for the app
export interface TypeConfig {
  readonly strictNullChecks: true;
  readonly exactOptionalPropertyTypes: true;
  readonly noUncheckedIndexedAccess: true;
}
