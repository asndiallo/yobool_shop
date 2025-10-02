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
  type EntityId,
  type Quote,
  type QuoteAttributes,
  isAuthenticated,
} from '@/types';
import {
  acceptQuoteAction,
  deleteQuote,
  getQuote,
  getQuoteDetails,
  rejectQuote,
  updateQuote,
} from '@/api/quotes';
import { useAuthHook } from './useAuthHook';
import { APIError } from '@/api/errors';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const quoteKeys = {
  all: ['quotes'] as const,
  details: () => [...quoteKeys.all, 'detail'] as const,
  detail: (id: EntityId) => [...quoteKeys.details(), id] as const,
  detailsExpanded: (id: EntityId) =>
    [...quoteKeys.detail(id), 'details'] as const,
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
 * Get a single quote
 */
export const useQuote = (
  id?: EntityId,
  options?: Partial<UseQueryOptions<ApiSingleResponse<Quote>, APIError>>
) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: quoteKeys.detail(id!),
    queryFn: () => getQuote(id!, token),
    enabled: Boolean(id),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Get quote with full details
 */
export const useQuoteDetails = (
  id?: EntityId,
  options?: Partial<UseQueryOptions<ApiSingleResponse<Quote>, APIError>>
) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: quoteKeys.detailsExpanded(id!),
    queryFn: () => getQuoteDetails(id!, token),
    enabled: Boolean(id),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Update a quote
 */
export const useUpdateQuote = (
  options?: Partial<
    UseMutationOptions<
      ApiSingleResponse<Quote>,
      APIError,
      { id: EntityId; data: DeepPartial<QuoteAttributes> }
    >
  >
) => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: ({ id, data }) => updateQuote(id, data, token),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(quoteKeys.detail(id), response);
      // Also invalidate shopping order and trip queries that might include this quote
      queryClient.invalidateQueries({ queryKey: ['shopping_orders'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    ...options,
  });
};

/**
 * Delete a quote
 */
export const useDeleteQuote = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (id: EntityId) => deleteQuote(id, token),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: quoteKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['shopping_orders'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};

/**
 * Accept a quote
 */
export const useAcceptQuote = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (id: EntityId) => acceptQuoteAction(id, token),
    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: quoteKeys.detail(id) });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<ApiSingleResponse<Quote>>(
        quoteKeys.detail(id)
      );

      // Optimistically update status
      if (previousData) {
        queryClient.setQueryData<ApiSingleResponse<Quote>>(
          quoteKeys.detail(id),
          {
            ...previousData,
            data: {
              ...previousData.data,
              attributes: {
                ...previousData.data.attributes,
                status: 'accepted',
              },
            },
          }
        );
      }

      return { previousData };
    },
    onSuccess: (response, id) => {
      queryClient.setQueryData(quoteKeys.detail(id), response);
      queryClient.invalidateQueries({ queryKey: ['shopping_orders'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(quoteKeys.detail(id), context.previousData);
      }
    },
  });
};

/**
 * Reject a quote
 */
export const useRejectQuote = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (id: EntityId) => rejectQuote(id, token),
    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: quoteKeys.detail(id) });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<ApiSingleResponse<Quote>>(
        quoteKeys.detail(id)
      );

      // Optimistically update status
      if (previousData) {
        queryClient.setQueryData<ApiSingleResponse<Quote>>(
          quoteKeys.detail(id),
          {
            ...previousData,
            data: {
              ...previousData.data,
              attributes: {
                ...previousData.data.attributes,
                status: 'rejected',
              },
            },
          }
        );
      }

      return { previousData };
    },
    onSuccess: (response, id) => {
      queryClient.setQueryData(quoteKeys.detail(id), response);
      queryClient.invalidateQueries({ queryKey: ['shopping_orders'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: (_error, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(quoteKeys.detail(id), context.previousData);
      }
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Invalidate all quote-related queries
 */
export const useInvalidateQuotes = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: quoteKeys.all });
  };
};

/**
 * Prefetch a quote
 */
export const usePrefetchQuote = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return (id: EntityId) => {
    queryClient.prefetchQuery({
      queryKey: quoteKeys.detail(id),
      queryFn: () => getQuote(id, token),
      staleTime: 2 * 60 * 1000,
    });
  };
};
