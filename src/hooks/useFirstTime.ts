import { useCallback, useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================

const STORAGE_KEY = '@app_onboarding_completed' as const;

interface FirstTimeState {
  isFirstTime: boolean | null;
  isLoading: boolean;
}

// ============================================================================
// OPTIMIZED FIRST TIME HOOK
// ============================================================================

/**
 * Hook to manage first-time user experience state
 * More efficient than the original with better error handling
 */
export function useFirstTime() {
  const [state, setState] = useState<FirstTimeState>({
    isFirstTime: null,
    isLoading: true,
  });

  // Initialize first-time status from storage
  const initialize = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const hasCompletedOnboarding = await AsyncStorage.getItem(STORAGE_KEY);
      const isFirstTime = hasCompletedOnboarding === null;

      setState({ isFirstTime, isLoading: false });
    } catch (error) {
      console.error('Failed to check first-time status:', error);
      // Default to not first time on error to avoid showing onboarding repeatedly
      setState({ isFirstTime: false, isLoading: false });
    }
  }, []);

  // Mark onboarding as completed
  const completeOnboarding = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'completed');
      setState((prev) => ({ ...prev, isFirstTime: false }));
    } catch (error) {
      console.error('Failed to mark onboarding as completed:', error);
      throw new Error('Failed to save onboarding status');
    }
  }, []);

  // Reset onboarding status (useful for development/testing)
  const resetOnboarding = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setState((prev) => ({ ...prev, isFirstTime: true }));
    } catch (error) {
      console.error('Failed to reset onboarding status:', error);
      throw new Error('Failed to reset onboarding status');
    }
  }, []);

  // Force refresh the first-time status
  const refresh = useCallback(async (): Promise<void> => {
    await initialize();
  }, [initialize]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    isFirstTime: state.isFirstTime,
    isLoading: state.isLoading,
    completeOnboarding,
    resetOnboarding,
    refresh,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check first-time status without hook (useful for services)
 */
export async function checkIsFirstTime(): Promise<boolean> {
  try {
    const hasCompletedOnboarding = await AsyncStorage.getItem(STORAGE_KEY);
    return hasCompletedOnboarding === null;
  } catch (error) {
    console.error('Failed to check first-time status:', error);
    return false; // Default to not first time on error
  }
}

/**
 * Mark onboarding complete without hook (useful for services)
 */
export async function markOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, 'completed');
  } catch (error) {
    console.error('Failed to mark onboarding complete:', error);
    throw error;
  }
}

/**
 * Clear onboarding status without hook (useful for development)
 */
export async function clearOnboardingStatus(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear onboarding status:', error);
    throw error;
  }
}
