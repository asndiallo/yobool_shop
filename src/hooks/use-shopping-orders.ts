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
  type QueryParams,
  type ShoppingOrder,
  type ShoppingOrderAttributes,
  type ShoppingOrderInput,
  isAuthenticated,
} from '@/types';
import {
  acceptQuote,
  cancelShoppingOrder,
  createShoppingOrder,
  deleteShoppingOrder,
  deliverShoppingOrder,
  getEligibleTrips,
  getShoppingOrder,
  getShoppingOrderQuotes,
  getShoppingOrders,
  purchaseShoppingOrder,
  refundShoppingOrder,
  requestQuotes,
  shipShoppingOrder,
  updateShoppingOrder,
} from '@/api/shopping-orders';
import { useAuthHook } from './use-auth';
import { APIError } from '@/api/errors';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const shoppingOrderKeys = {
  all: ['shopping_orders'] as const,
  lists: () => [...shoppingOrderKeys.all, 'list'] as const,
  list: (params?: QueryParams) =>
    [...shoppingOrderKeys.lists(), params] as const,
  details: () => [...shoppingOrderKeys.all, 'detail'] as const,
  detail: (id: EntityId) => [...shoppingOrderKeys.details(), id] as const,
  quotes: (id: EntityId) =>
    [...shoppingOrderKeys.detail(id), 'quotes'] as const,
  eligibleTrips: (id: EntityId) =>
    [...shoppingOrderKeys.detail(id), 'eligible_trips'] as const,
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

export const useShoppingOrders = (
  params?: QueryParams,
  options?: Partial<UseQueryOptions<ApiArrayResponse<ShoppingOrder>, APIError>>
) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: shoppingOrderKeys.list(params),
    queryFn: () => getShoppingOrders(params, token),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

export const useShoppingOrder = (
  id?: EntityId,
  options?: Partial<UseQueryOptions<ApiSingleResponse<ShoppingOrder>, APIError>>
) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: shoppingOrderKeys.detail(id!),
    queryFn: () => getShoppingOrder(id!, token),
    enabled: Boolean(id),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useShoppingOrderQuotes = (id?: EntityId) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: shoppingOrderKeys.quotes(id!),
    queryFn: () => getShoppingOrderQuotes(id!, token),
    enabled: Boolean(id),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useEligibleTrips = (id?: EntityId) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: shoppingOrderKeys.eligibleTrips(id!),
    queryFn: () => getEligibleTrips(id!, token),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export const useCreateShoppingOrder = (
  options?: Partial<
    UseMutationOptions<
      ApiSingleResponse<ShoppingOrder>,
      APIError,
      ShoppingOrderInput
    >
  >
) => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (data) => createShoppingOrder(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shoppingOrderKeys.lists() });
    },
    ...options,
  });
};

export const useUpdateShoppingOrder = (
  options?: Partial<
    UseMutationOptions<
      ApiSingleResponse<ShoppingOrder>,
      APIError,
      { id: EntityId; data: DeepPartial<ShoppingOrderAttributes> }
    >
  >
) => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: ({ id, data }) => updateShoppingOrder(id, data, token),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(shoppingOrderKeys.detail(id), response);
      queryClient.invalidateQueries({ queryKey: shoppingOrderKeys.lists() });
    },
    ...options,
  });
};

export const useDeleteShoppingOrder = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (id: EntityId) => deleteShoppingOrder(id, token),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: shoppingOrderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: shoppingOrderKeys.lists() });
    },
  });
};

// ============================================================================
// STATE TRANSITION HOOKS
// ============================================================================

const createTransitionHook = (
  actionFn: (
    id: EntityId,
    token?: string
  ) => Promise<ApiSingleResponse<ShoppingOrder>>
) => {
  return () => {
    const queryClient = useQueryClient();
    const token = useAuthToken();

    return useMutation({
      mutationFn: (id: EntityId) => actionFn(id, token),
      onSuccess: (response, id) => {
        queryClient.setQueryData(shoppingOrderKeys.detail(id), response);
        queryClient.invalidateQueries({ queryKey: shoppingOrderKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: shoppingOrderKeys.quotes(id),
        });
      },
    });
  };
};

export const useRequestQuotes = createTransitionHook(requestQuotes);
export const useCancelShoppingOrder = createTransitionHook(cancelShoppingOrder);
export const usePurchaseShoppingOrder = createTransitionHook(
  purchaseShoppingOrder
);
export const useRefundShoppingOrder = createTransitionHook(refundShoppingOrder);

export const useAcceptQuote = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: ({
      orderId,
      quoteId,
    }: {
      orderId: EntityId;
      quoteId: EntityId;
    }) => acceptQuote(orderId, quoteId, token),
    onSuccess: (response, { orderId }) => {
      queryClient.setQueryData(shoppingOrderKeys.detail(orderId), response);
      queryClient.invalidateQueries({ queryKey: shoppingOrderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: shoppingOrderKeys.quotes(orderId),
      });
    },
  });
};

export const useShipShoppingOrder = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: ({
      id,
      trackingCode,
    }: {
      id: EntityId;
      trackingCode?: string;
    }) => shipShoppingOrder(id, trackingCode, token),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(shoppingOrderKeys.detail(id), response);
      queryClient.invalidateQueries({ queryKey: shoppingOrderKeys.lists() });
    },
  });
};

export const useDeliverShoppingOrder = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: ({
      id,
      confirmationCode,
    }: {
      id: EntityId;
      confirmationCode?: string;
    }) => deliverShoppingOrder(id, confirmationCode, token),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(shoppingOrderKeys.detail(id), response);
      queryClient.invalidateQueries({ queryKey: shoppingOrderKeys.lists() });
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export const useInvalidateShoppingOrders = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: shoppingOrderKeys.all });
};
