// ============================================================================
// AUTH TYPES - Authentication and authorization types
// ============================================================================

import {
  AuthToken,
  DeepPartial,
  Locale,
  QueryValue,
  User,
  UserAttributes,
  UserId,
} from './core';

import { ReactNode } from 'react';

// ============================================================================
// AUTH STATE - Discriminated union for type safety
// ============================================================================

export type AuthState =
  | { status: 'unauthenticated' }
  | { status: 'loading' }
  | {
      status: 'authenticated';
      user: User;
      token: AuthToken;
      tokenExpiration: number;
      receivedAt: number;
      isPro: boolean;
    }
  | { status: 'error'; error: string };

// ============================================================================
// TOKEN TYPES
// ============================================================================

export interface TokenPayload {
  readonly jti: string;
  readonly sub: UserId;
  readonly scp: string;
  readonly aud: string | null;
  readonly iat: number;
  readonly exp: number;
}

export interface TokenData {
  readonly raw: AuthToken;
  readonly payload: TokenPayload;
  readonly receivedAt: number;
}

// ============================================================================
// CREDENTIAL TYPES
// ============================================================================

export interface UserCredentials {
  readonly email: string;
  readonly password: string;
}

export interface UserRegistration extends UserCredentials {
  readonly first_name: string;
  readonly last_name: string;
  readonly password_confirmation: string;
  readonly phone_number?: string;
  readonly birthday?: string;
  readonly timezone?: string;
  readonly locale?: Locale;
}

export interface ProfileInformation {
  readonly first_name: string;
  readonly last_name: string;
  readonly bio: string;
  readonly phone_number: string;
  readonly birthday: string;
  readonly timezone: string;
  readonly locale: string;
  readonly currency: string;
  readonly country: string;
  readonly push_token: string;
  readonly measurement_system: string;
  readonly avatar: string | File | null;
}

// ============================================================================
// OAUTH TYPES
// ============================================================================

export interface AppleSignInData {
  readonly id_token: string;
  readonly authorization_code: string;
  readonly user_info: {
    readonly id: string;
    readonly email?: string;
    readonly first_name?: string;
    readonly last_name?: string;
  };
}

export interface ThirdPartyOauthParams {
  readonly redirect_uri?: string;
  readonly state?: string;
  readonly provider: 'google_oauth2';
  readonly [key: string]: QueryValue | Record<string, QueryValue> | undefined;
}

export interface AppleNativeAuthParams {
  readonly code: string;
  readonly state: string;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface AuthContextValue {
  readonly state: AuthState;
  readonly isInitialized: boolean;
  readonly isLoadingGoogle: boolean;

  readonly actions: {
    readonly login: (credentials: UserCredentials) => Promise<void>;
    readonly register: (data: UserRegistration) => Promise<void>;
    readonly logout: () => Promise<void>;
    readonly signInWithApple: (data: AppleSignInData) => Promise<void>;
    readonly deleteAccount: () => Promise<void>;
    readonly exchangeOauthToken: (code: string) => Promise<void>;
    readonly initiateGoogleAuth: () => Promise<string>;
    readonly updateUserAttributes: (
      updates: DeepPartial<UserAttributes>
    ) => void;
  };
}

export interface AuthProviderProps {
  readonly children: ReactNode;
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface LoginData {
  readonly user: UserCredentials;
}

export interface RegisterData {
  readonly user: UserRegistration;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface LoginResponse {
  readonly message: string;
  readonly data: {
    readonly data: User;
  };
}

export interface LoginApiResponse {
  readonly responseData: LoginResponse;
  readonly response: Response;
}

export interface TokenRefreshResponseData {
  readonly token: [string, TokenPayload];
}

export interface ServerOauthFlowResponseData extends TokenRefreshResponseData {
  readonly user: {
    readonly data: User;
  };
}

export interface OAuthResponse {
  readonly user: {
    readonly data: User;
  };
  readonly token: AuthToken;
}

// ============================================================================
// LEGACY SUPPORT - For backward compatibility
// ============================================================================

/**
 * @deprecated Use AuthState with status: 'authenticated' instead
 */
export type AuthDataContextType = Extract<
  AuthState,
  { status: 'authenticated' }
>;

/**
 * @deprecated Use AuthState with status: 'authenticated' instead
 */
export type AuthData = Extract<AuthState, { status: 'authenticated' }>;

/**
 * @deprecated Use DeepPartial<UserAttributes> instead
 */
export type UpdatableAuthData = DeepPartial<UserAttributes>;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isAuthenticated(
  state: AuthState
): state is Extract<AuthState, { status: 'authenticated' }> {
  return state.status === 'authenticated';
}

export function isUnauthenticated(
  state: AuthState
): state is Extract<AuthState, { status: 'unauthenticated' }> {
  return state.status === 'unauthenticated';
}

export function isAuthLoading(
  state: AuthState
): state is Extract<AuthState, { status: 'loading' }> {
  return state.status === 'loading';
}

export function isTokenFresh(state: AuthState): boolean {
  if (!isAuthenticated(state)) return false;

  // Token is fresh if received less than 6 days ago
  const tokenAge = Date.now() - state.receivedAt;
  const sixDays = 6 * 24 * 60 * 60 * 1000;
  return tokenAge < sixDays;
}

export function shouldRefreshAuth(state: AuthState): boolean {
  if (!isAuthenticated(state)) return false;
  return !isTokenFresh(state);
}

export function hasAuthError(
  state: AuthState
): state is Extract<AuthState, { status: 'error' }> {
  return state.status === 'error';
}

// ============================================================================
// HOOKS RETURN TYPES
// ============================================================================

export interface UseAuthReturn {
  readonly state: AuthState;
  readonly isInitialized: boolean;
  readonly isLoadingGoogle: boolean;
  readonly login: (credentials: UserCredentials) => Promise<void>;
  readonly register: (data: UserRegistration) => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly signInWithApple: (data: AppleSignInData) => Promise<void>;
  readonly deleteAccount: () => Promise<void>;
  readonly updateUserAttributes: (updates: DeepPartial<UserAttributes>) => void;
}
