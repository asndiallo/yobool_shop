import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  type ApiSingleResponse,
  type DeepPartial,
  type User,
  type UserAttributes,
  isAuthenticated,
} from '@/types';
import { deleteProfileAvatar, getProfile, updateProfile } from '@/api/profile';
import { useAuth } from '@/contexts/AuthContext';
import { APIError } from '@/api/errors';

// ============================================================================
// QUERY KEYS FACTORY - Centralized for consistency and type safety
// ============================================================================

export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
} as const;

// ============================================================================
// SHARED UTILITIES - DRY principle
// ============================================================================

/**
 * Extract authenticated user data from auth state
 */
const useAuthUser = () => {
  const { state: authState, actions } = useAuth();

  if (!isAuthenticated(authState)) {
    return {
      token: undefined,
      userId: undefined,
      user: undefined,
      updateUserAttributes: actions.updateUserAttributes,
    };
  }

  return {
    token: authState.token,
    userId: authState.user.id,
    user: authState.user,
    updateUserAttributes: actions.updateUserAttributes,
  };
};

// ============================================================================
// CORE HOOKS
// ============================================================================

/**
 * Fetch profile data by ID
 * @param id - User ID to fetch profile for
 * @param options - React Query options for customization
 */
export const useProfile = (
  id?: string,
  options?: Partial<UseQueryOptions<ApiSingleResponse<User>, APIError>>
) => {
  const { token } = useAuthUser();

  return useQuery({
    queryKey: profileKeys.detail(id || ''),
    queryFn: () => getProfile(id!, token),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: 2,
    ...options,
  });
};

/**
 * Update profile mutation variables
 */
interface UpdateProfileVars {
  id: string;
  data: DeepPartial<UserAttributes> | FormData;
}

/**
 * Update profile mutation
 * Automatically syncs with auth state when updating current user
 */
export const useUpdateProfile = (
  options?: Partial<
    UseMutationOptions<
      ApiSingleResponse<User>,
      APIError,
      UpdateProfileVars,
      { previousData: ApiSingleResponse<User> | undefined }
    >
  >
) => {
  const queryClient = useQueryClient();
  const { token, userId, updateUserAttributes } = useAuthUser();

  return useMutation({
    mutationFn: ({ id, data }) => updateProfile(id, data, token),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries to avoid race conditions
      await queryClient.cancelQueries({ queryKey: profileKeys.detail(id) });

      // Snapshot current data for rollback
      const previousData = queryClient.getQueryData<ApiSingleResponse<User>>(
        profileKeys.detail(id)
      );

      // Optimistic update (skip for FormData as we can't predict the result)
      if (previousData && !(data instanceof FormData)) {
        queryClient.setQueryData<ApiSingleResponse<User>>(
          profileKeys.detail(id),
          {
            ...previousData,
            data: {
              ...previousData.data,
              attributes: {
                ...previousData.data.attributes,
                ...data,
              },
            },
          }
        );
      }

      return { previousData };
    },
    onSuccess: (response, { id }) => {
      // Update cache with server response
      queryClient.setQueryData(profileKeys.detail(id), response);

      // Sync with auth state if current user
      if (userId === id && response.data?.attributes) {
        updateUserAttributes(response.data.attributes);
      }
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(profileKeys.detail(id), context.previousData);
      }
      console.error('Profile update failed:', error);
    },
    ...options,
  });
};

// ============================================================================
// SPECIALIZED MUTATIONS - Focused single-responsibility hooks
// ============================================================================

/**
 * Update user avatar
 */
export const useUpdateAvatar = () => {
  const { user } = useAuthUser();
  const updateProfileMutation = useUpdateProfile();

  return useMutation({
    mutationFn: (formData: FormData) => {
      if (!user) throw new Error('User must be authenticated');
      return updateProfileMutation.mutateAsync({ id: user.id, data: formData });
    },
  });
};

/**
 * Delete user avatar
 */
export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();
  const { token, userId, updateUserAttributes } = useAuthUser();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error('User must be authenticated');
      return deleteProfileAvatar(id, token);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(id) });

      if (userId === id) {
        updateUserAttributes({ avatar_url: null });
      }
    },
  });
};

/**
 * Generic attribute update factory
 * Reduces code duplication for simple attribute updates
 */
const createAttributeMutation = <T extends keyof UserAttributes>(
  attributeName: string
) => {
  return () => {
    const { user } = useAuthUser();
    const updateProfileMutation = useUpdateProfile();

    return useMutation({
      mutationFn: (value: UserAttributes[T]) => {
        if (!user) throw new Error('User must be authenticated');

        return updateProfileMutation.mutateAsync({
          id: user.id,
          data: { [attributeName]: value } as DeepPartial<UserAttributes>,
        });
      },
    });
  };
};

/**
 * Update user currency preference
 */
export const useUpdateCurrency =
  createAttributeMutation<'currency'>('currency');

/**
 * Update user locale preference
 */
export const useUpdateLocale = createAttributeMutation<'locale'>('locale');

/**
 * Update user country
 */
export const useUpdateCountry = createAttributeMutation<'country'>('country');

// ============================================================================
// BATCH UPDATE HOOK - For multiple attributes at once
// ============================================================================

/**
 * Update multiple user attributes efficiently
 */
export const useUpdateUserAttributes = () => {
  const { user } = useAuthUser();
  const updateProfileMutation = useUpdateProfile();

  return useMutation({
    mutationFn: (data: DeepPartial<UserAttributes>) => {
      if (!user) throw new Error('User must be authenticated');

      return updateProfileMutation.mutateAsync({
        id: user.id,
        data,
      });
    },
  });
};

// ============================================================================
// PREFETCH UTILITIES - For performance optimization
// ============================================================================

/**
 * Prefetch profile data (useful for lists/navigation)
 */
export const usePrefetchProfile = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthUser();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: profileKeys.detail(id),
      queryFn: () => getProfile(id, token),
      staleTime: 5 * 60 * 1000,
    });
  };
};
