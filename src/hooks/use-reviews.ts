import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  type ApiArrayResponse,
  type ApiSingleResponse,
  type DeepPartial,
  type EntityId,
  type Review,
  type ReviewAttributes,
  type ReviewInput,
  type UserId,
  isAuthenticated,
} from '@/types';
import {
  createReview,
  deleteReview,
  getProfileReviews,
  getReview,
  updateReview,
  voteOnReview,
} from '@/api/reviews';
import { useAuthHook } from './use-auth';
import { APIError } from '@/api/errors';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  listByProfile: (profileId: UserId) =>
    [...reviewKeys.lists(), profileId] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (profileId: UserId, reviewId: EntityId) =>
    [...reviewKeys.details(), profileId, reviewId] as const,
} as const;

// ============================================================================
// SHARED UTILITIES
// ============================================================================

const useAuthToken = () => {
  const { authState } = useAuthHook();
  return isAuthenticated(authState) ? authState.token : undefined;
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get all reviews for a profile
 */
export const useProfileReviews = (
  profileId?: UserId,
  options?: Partial<UseQueryOptions<ApiArrayResponse<Review>, APIError>>
) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: reviewKeys.listByProfile(profileId!),
    queryFn: () => getProfileReviews(profileId!, token),
    enabled: Boolean(profileId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Get a single review
 */
export const useReview = (
  profileId?: UserId,
  reviewId?: EntityId,
  options?: Partial<UseQueryOptions<ApiSingleResponse<Review>, APIError>>
) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: reviewKeys.detail(profileId!, reviewId!),
    queryFn: () => getReview(profileId!, reviewId!, token),
    enabled: Boolean(profileId && reviewId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create a review for a profile
 */
export const useCreateReview = (
  profileId: UserId,
  options?: Partial<
    UseMutationOptions<ApiSingleResponse<Review>, APIError, ReviewInput>
  >
) => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (data) => createReview(profileId, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.listByProfile(profileId),
      });
    },
    ...options,
  });
};

/**
 * Update a review
 */
export const useUpdateReview = (
  profileId: UserId,
  options?: Partial<
    UseMutationOptions<
      ApiSingleResponse<Review>,
      APIError,
      { reviewId: EntityId; data: DeepPartial<ReviewAttributes> }
    >
  >
) => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: ({ reviewId, data }) =>
      updateReview(profileId, reviewId, data, token),
    onSuccess: (response, { reviewId }) => {
      queryClient.setQueryData(
        reviewKeys.detail(profileId, reviewId),
        response
      );
      queryClient.invalidateQueries({
        queryKey: reviewKeys.listByProfile(profileId),
      });
    },
    ...options,
  });
};

/**
 * Delete a review
 */
export const useDeleteReview = (profileId: UserId) => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (reviewId: EntityId) =>
      deleteReview(profileId, reviewId, token),
    onSuccess: (_, reviewId) => {
      queryClient.removeQueries({
        queryKey: reviewKeys.detail(profileId, reviewId),
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.listByProfile(profileId),
      });
    },
  });
};

/**
 * Vote on a review (mark as helpful)
 */
export const useVoteOnReview = (profileId: UserId) => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (reviewId: EntityId) =>
      voteOnReview(profileId, reviewId, token),
    onMutate: async (reviewId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: reviewKeys.detail(profileId, reviewId),
      });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<ApiSingleResponse<Review>>(
        reviewKeys.detail(profileId, reviewId)
      );

      // Optimistically update vote count
      if (previousData) {
        queryClient.setQueryData<ApiSingleResponse<Review>>(
          reviewKeys.detail(profileId, reviewId),
          {
            ...previousData,
            data: {
              ...previousData.data,
              attributes: {
                ...previousData.data.attributes,
                vote_count: previousData.data.attributes.vote_count + 1,
              },
            },
          }
        );
      }

      return { previousData };
    },
    onSuccess: (response, reviewId) => {
      // Update with server response
      queryClient.setQueryData(
        reviewKeys.detail(profileId, reviewId),
        response
      );
      queryClient.invalidateQueries({
        queryKey: reviewKeys.listByProfile(profileId),
      });
    },
    onError: (error, reviewId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          reviewKeys.detail(profileId, reviewId),
          context.previousData
        );
      }
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Invalidate all reviews for a profile
 */
export const useInvalidateProfileReviews = () => {
  const queryClient = useQueryClient();

  return (profileId: UserId) => {
    queryClient.invalidateQueries({
      queryKey: reviewKeys.listByProfile(profileId),
    });
  };
};

/**
 * Prefetch reviews for a profile
 */
export const usePrefetchProfileReviews = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return (profileId: UserId) => {
    queryClient.prefetchQuery({
      queryKey: reviewKeys.listByProfile(profileId),
      queryFn: () => getProfileReviews(profileId, token),
      staleTime: 5 * 60 * 1000,
    });
  };
};
