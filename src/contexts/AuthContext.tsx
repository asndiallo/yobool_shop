import { AuthContextValue, isAuthenticated } from '@/types';
import React, { createContext, useContext, useEffect, useMemo } from 'react';

import { useAuthHook } from '@/hooks/use-auth';

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth Provider - Manages authentication state for the entire app
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    authState,
    isInitialized,
    isLoadingGoogle,
    initializeAuth,
    login,
    register,
    logout,
    initiateGoogleAuth,
    exchangeOauthToken,
    signInWithApple,
    updateUserAttributes,
    deleteUserAccount,
  } = useAuthHook();

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: AuthContextValue = useMemo(
    () => ({
      state: authState,
      isInitialized,
      isLoadingGoogle,
      actions: {
        login,
        register,
        logout,
        signInWithApple,
        deleteAccount: deleteUserAccount,
        exchangeOauthToken,
        initiateGoogleAuth,
        updateUserAttributes,
      },
    }),
    [
      authState,
      isInitialized,
      isLoadingGoogle,
      login,
      register,
      logout,
      signInWithApple,
      deleteUserAccount,
      exchangeOauthToken,
      initiateGoogleAuth,
      updateUserAttributes,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

/**
 * Hook to access the complete auth context
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook to access only auth state and computed values
 * Convenient for components that only need to read auth data
 */
export const useAuthState = () => {
  const { state, isInitialized } = useAuth();

  return useMemo(
    () => ({
      state,
      isInitialized,
      isAuthenticated: isAuthenticated(state),
      isLoading: state.status === 'loading',
      hasError: state.status === 'error',
      // Computed values that are safe to access
      user: isAuthenticated(state) ? state.user : null,
      token: isAuthenticated(state) ? state.token : null,
      userId: isAuthenticated(state) ? state.user.id : null,
      isPro: isAuthenticated(state) ? state.isPro : false,
      error: state.status === 'error' ? state.error : null,
    }),
    [state, isInitialized]
  );
};

/**
 * Hook to access auth actions only
 * Useful for components that only need to trigger auth operations
 */
export const useAuthActions = () => {
  const { actions } = useAuth();
  return actions;
};

/**
 * Higher-order component that renders children only when authenticated
 * @param fallback - Component to render when not authenticated
 */
export const RequireAuth: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const { isAuthenticated } = useAuthState();

  return <>{isAuthenticated ? children : fallback}</>;
};

/**
 * Higher-order component that renders children only when NOT authenticated
 * @example
 *
 * ```tsx
 * <RequireAuth fallback={<LoginScreen />}>
 *   <DashboardScreen />
 * </RequireAuth>
 * ```
 */
export const RequireGuest: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const { isAuthenticated } = useAuthState();

  return <>{!isAuthenticated ? children : fallback}</>;
};

/**
 * Higher-order component for Pro users only
 * @example
 *
 * ```tsx
 * <RequirePro fallback={<UpgradePrompt />}>
 *   <ProFeatures />
 * </RequirePro>
 * ```
 */
export const RequirePro: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const { isPro, isAuthenticated } = useAuthState();

  return <>{isAuthenticated && isPro ? children : fallback}</>;
};

// Legacy exports for backward compatibility
// @deprecated - Use useAuthState instead
export const useAuthData = () => {
  const {
    user,
    token,
    userId,
    isPro,
    isAuthenticated: isSignedIn,
  } = useAuthState();

  return {
    token: token || '',
    userId: userId || '',
    isSignedIn,
    isPro,
    user,
  };
};
