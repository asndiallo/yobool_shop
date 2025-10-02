import {
  AppleSignInData,
  AuthState,
  DeepPartial,
  ServerOauthFlowResponseData,
  ThirdPartyOauthParams,
  UserAttributes,
  UserCredentials,
  UserRegistration,
  isAuthenticated,
} from '@/types';
import {
  deleteAccount,
  exchangeOAuthToken,
  getOAuthUrl,
  loginAPI,
  logoutAPI,
  refreshTokenAPI,
  registerAPI,
  serverSignInWithApple,
} from '@/api/auth';
import { getAuthState, saveAuthState } from '@/lib/storage';
import {
  getRedirectUrl,
  processTokenFromHeader,
  processTokenWithPayload,
} from '@/lib/jwt';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useFirstTime } from './use-first-time';

// ============================================================================
// HOOK STATE INTERFACE
// ============================================================================

interface AuthHookState {
  authState: AuthState;
  isInitialized: boolean;
  isLoadingGoogle: boolean;
}

// ============================================================================
// ENHANCED AUTH HOOK - Works with existing infrastructure
// ============================================================================

export function useAuthHook() {
  const [state, setState] = useState<AuthHookState>({
    authState: { status: 'unauthenticated' },
    isInitialized: false,
    isLoadingGoogle: false,
  });

  const refreshTimerRef = useRef<number | null>(null);
  const { resetOnboarding } = useFirstTime();

  // ============================================================================
  // STATE MANAGEMENT HELPERS
  // ============================================================================

  const updateAuthState = useCallback(async (newAuthState: AuthState) => {
    setState((prev) => ({ ...prev, authState: newAuthState }));
    await saveAuthState(newAuthState);
  }, []);

  const resetAuth = useCallback(async () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    await updateAuthState({ status: 'unauthenticated' });
  }, [updateAuthState]);

  // ============================================================================
  // TOKEN REFRESH LOGIC
  // ============================================================================

  const manageTokenRefresh = useCallback(
    (token: string, expiration: number) => {
      // Clear existing timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      const currentTime = Date.now() / 1000;
      const timeLeft = expiration - currentTime;

      // Token expired, logout
      if (timeLeft <= 0) {
        resetAuth();
        return;
      }

      // Calculate refresh time (1 day before expiry)
      const refreshBuffer = 24 * 60 * 60; // 1 day
      const timeUntilRefresh = Math.max(0, timeLeft - refreshBuffer);

      refreshTimerRef.current = setTimeout(async () => {
        try {
          const data = await refreshTokenAPI(token);
          const {
            token: [tokenString, tokenPayload],
          } = data;
          const tokenInfo = processTokenWithPayload(tokenString, tokenPayload);

          if (!tokenInfo) throw new Error('Invalid token');

          // Update state and schedule next refresh
          if (isAuthenticated(state.authState)) {
            const newAuthState = {
              ...state.authState,
              token: tokenInfo.token,
              tokenExpiration: tokenInfo.expiration,
            };

            await updateAuthState(newAuthState);
            manageTokenRefresh(tokenInfo.token, tokenInfo.expiration); // Recursive
          }
        } catch (error) {
          console.warn('Token refresh failed:', error);
          await resetAuth();
        }
      }, timeUntilRefresh * 1000);
    },
    [state.authState, updateAuthState, resetAuth]
  );

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  const initializeAuth = useCallback(async () => {
    try {
      const storedAuth = await getAuthState();

      if (
        !storedAuth ||
        !storedAuth.token ||
        !storedAuth.tokenExpiration ||
        !storedAuth.user
      ) {
        await updateAuthState({ status: 'unauthenticated' });
        return;
      }

      const currentTime = Date.now() / 1000;
      if (currentTime >= storedAuth.tokenExpiration) {
        await resetAuth();
        return;
      }

      const authState: AuthState = {
        status: 'authenticated',
        user: storedAuth.user,
        token: storedAuth.token,
        tokenExpiration: storedAuth.tokenExpiration,
        receivedAt: storedAuth.receivedAt,
        isPro: storedAuth.isPro,
      };

      await updateAuthState(authState);
      manageTokenRefresh(storedAuth.token, storedAuth.tokenExpiration);
    } catch (error) {
      console.error('Auth initialization failed:', error);
      await resetAuth();
    } finally {
      setState((prev) => ({ ...prev, isInitialized: true }));
    }
  }, [updateAuthState, resetAuth, manageTokenRefresh]);

  // ============================================================================
  // AUTH OPERATIONS
  // ============================================================================

  const login = useCallback(
    async (credentials: UserCredentials) => {
      await updateAuthState({ status: 'loading' });

      try {
        const result = await loginAPI(credentials);
        const tokenInfo = processTokenFromHeader(result.response);

        const authState: AuthState = {
          status: 'authenticated',
          user: result.responseData.data.data,
          token: tokenInfo.token,
          tokenExpiration: tokenInfo.expiration, // undefined for login
          receivedAt: tokenInfo.receivedAt,
          isPro: result.responseData.data.data.attributes.role === 'pro',
        };

        await updateAuthState(authState);
        manageTokenRefresh(tokenInfo.token, tokenInfo.expiration);
      } catch (error) {
        await updateAuthState({ status: 'error', error: String(error) });
        throw error; // Re-throw for component error handling
      }
    },
    [updateAuthState, manageTokenRefresh]
  );

  const register = useCallback(
    async (registration: UserRegistration) => {
      await updateAuthState({ status: 'loading' });

      try {
        await registerAPI(registration);
        await updateAuthState({ status: 'unauthenticated' });
      } catch (error) {
        await updateAuthState({ status: 'error', error: String(error) });
        throw error;
      }
    },
    [updateAuthState]
  );

  const logout = useCallback(async () => {
    const currentState = state.authState;
    await updateAuthState({ status: 'loading' });

    try {
      if (isAuthenticated(currentState)) {
        await Promise.all([logoutAPI(currentState.token!), resetOnboarding()]);
      }
    } catch (error) {
      console.warn('Server logout failed:', error);
    } finally {
      await resetAuth();
    }
  }, [state.authState, updateAuthState, resetAuth, resetOnboarding]);

  // ============================================================================
  // OAUTH OPERATIONS
  // ============================================================================

  const initiateGoogleAuth = useCallback(async (): Promise<string> => {
    setState((prev) => ({ ...prev, isLoadingGoogle: true }));

    try {
      const params: ThirdPartyOauthParams = {
        redirect_uri: getRedirectUrl(),
        provider: 'google_oauth2',
      };

      return await getOAuthUrl(params);
    } finally {
      setState((prev) => ({ ...prev, isLoadingGoogle: false }));
    }
  }, []);

  // Common OAuth response handler
  const handleOAuthResponse = useCallback(
    async (data: ServerOauthFlowResponseData) => {
      const {
        token: [tokenString, tokenPayload],
        user,
      } = data;
      const tokenInfo = processTokenWithPayload(tokenString, tokenPayload);

      if (!tokenInfo) {
        throw new Error('Failed to process OAuth token');
      }

      const authState: AuthState = {
        status: 'authenticated',
        user: user.data,
        token: tokenInfo.token,
        tokenExpiration: tokenInfo.expiration,
        receivedAt: tokenInfo.receivedAt,
        isPro: user.data.attributes.role === 'pro',
      };

      await updateAuthState(authState);
      manageTokenRefresh(tokenInfo.token, tokenInfo.expiration);
    },
    [updateAuthState, manageTokenRefresh]
  );

  const exchangeOauthToken = useCallback(
    async (code: string) => {
      setState((prev) => ({ ...prev, isLoadingGoogle: true }));

      try {
        const data = await exchangeOAuthToken({ code });
        await handleOAuthResponse(data);
      } finally {
        setState((prev) => ({ ...prev, isLoadingGoogle: false }));
      }
    },
    [handleOAuthResponse]
  );

  const signInWithApple = useCallback(
    async (signInData: AppleSignInData) => {
      await updateAuthState({ status: 'loading' });

      try {
        const response = await serverSignInWithApple(signInData);
        await handleOAuthResponse(response);
      } catch (error) {
        await updateAuthState({ status: 'error', error: String(error) });
        throw error;
      }
    },
    [handleOAuthResponse, updateAuthState]
  );

  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  const updateUserAttributes = useCallback(
    async (updates: DeepPartial<UserAttributes>) => {
      if (isAuthenticated(state.authState)) {
        const updatedUser = {
          ...state.authState.user,
          attributes: {
            ...state.authState.user.attributes,
            ...updates,
          },
        };

        await updateAuthState({
          ...state.authState,
          user: updatedUser,
          isPro: updatedUser.attributes.role === 'pro',
        });
      }
    },
    [state.authState, updateAuthState]
  );

  const deleteUserAccount = useCallback(async () => {
    const currentState = state.authState;
    await updateAuthState({ status: 'loading' });

    try {
      if (isAuthenticated(currentState)) {
        await deleteAccount(currentState.token!);
      }
    } catch (error) {
      console.warn('Account deletion error:', error);
      throw error;
    } finally {
      await resetAuth();
    }
  }, [state.authState, updateAuthState, resetAuth]);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    authState: state.authState,
    isInitialized: state.isInitialized,
    isLoadingGoogle: state.isLoadingGoogle,
    initializeAuth,
    login,
    register,
    logout,
    initiateGoogleAuth,
    exchangeOauthToken,
    signInWithApple,
    updateUserAttributes,
    deleteUserAccount,
  };
}
