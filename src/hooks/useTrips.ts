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
  type RoundTripInput,
  type Trip,
  type TripAttributes,
  type TripInput,
  isAuthenticated,
} from '@/types';
import {
  activateTrip,
  cancelTrip,
  checkTripCanAccommodate,
  completeTrip,
  createRoundTrip,
  createTrip,
  deleteTrip,
  getAvailableTripsForShopping,
  getTrip,
  getTripQuotes,
  getTripShoppingOrders,
  getTrips,
  startTripTransit,
  updateTrip,
} from '@/api/trips';
import { useAuthHook } from './useAuthHook';
import { APIError } from '@/api/errors';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const tripKeys = {
  all: ['trips'] as const,
  lists: () => [...tripKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...tripKeys.lists(), params] as const,
  details: () => [...tripKeys.all, 'detail'] as const,
  detail: (id: EntityId) => [...tripKeys.details(), id] as const,
  shoppingOrders: (id: EntityId) => [...tripKeys.detail(id), 'shopping_orders'] as const,
  quotes: (id: EntityId) => [...tripKeys.detail(id), 'quotes'] as const,
  availableForShopping: (routeId: EntityId) =>
    [...tripKeys.all, 'available_for_shopping', routeId] as const,
  canAccommodate: (tripId: EntityId, orderId: EntityId) =>
    [...tripKeys.detail(tripId), 'can_accommodate', orderId] as const,
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

export const useTrips = (
  params?: QueryParams,
  options?: Partial<UseQueryOptions<ApiArrayResponse<Trip>, APIError>>
) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: tripKeys.list(params),
    queryFn: () => getTrips(params, token),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

export const useTrip = (
  id?: EntityId,
  options?: Partial<UseQueryOptions<ApiSingleResponse<Trip>, APIError>>
) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: tripKeys.detail(id!),
    queryFn: () => getTrip(id!, token),
    enabled: Boolean(id),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useAvailableTripsForShopping = (routeId?: EntityId) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: tripKeys.availableForShopping(routeId!),
    queryFn: () => getAvailableTripsForShopping(routeId!, token),
    enabled: Boolean(routeId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useTripShoppingOrders = (id?: EntityId) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: tripKeys.shoppingOrders(id!),
    queryFn: () => getTripShoppingOrders(id!, token),
    enabled: Boolean(id),
    staleTime: 1 * 60 * 1000,
  });
};

export const useTripQuotes = (id?: EntityId) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: tripKeys.quotes(id!),
    queryFn: () => getTripQuotes(id!, token),
    enabled: Boolean(id),
    staleTime: 1 * 60 * 1000,
  });
};

export const useCheckTripAccommodation = (tripId?: EntityId, orderId?: EntityId) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: tripKeys.canAccommodate(tripId!, orderId!),
    queryFn: () => checkTripCanAccommodate(tripId!, orderId!, token),
    enabled: Boolean(tripId && orderId),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export const useCreateTrip = (
  options?: Partial<UseMutationOptions<ApiSingleResponse<Trip>, APIError, TripInput>>
) => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (data) => createTrip(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
    },
    ...options,
  });
};

export const useCreateRoundTrip = (
  options?: Partial<UseMutationOptions<ApiArrayResponse<Trip>, APIError, RoundTripInput>>
) => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (data) => createRoundTrip(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
    },
    ...options,
  });
};

export const useUpdateTrip = (
  options?: Partial<
    UseMutationOptions<
      ApiSingleResponse<Trip>,
      APIError,
      { id: EntityId; data: DeepPartial<TripAttributes> }
    >
  >
) => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: ({ id, data }) => updateTrip(id, data, token),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(tripKeys.detail(id), response);
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
    },
    ...options,
  });
};

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (id: EntityId) => deleteTrip(id, token),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: tripKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
    },
  });
};

// ============================================================================
// STATE TRANSITION HOOKS
// ============================================================================

const createTransitionHook = (
  actionFn: (id: EntityId, token?: string) => Promise<ApiSingleResponse<Trip>>
) => {
  return () => {
    const queryClient = useQueryClient();
    const token = useAuthToken();

    return useMutation({
      mutationFn: (id: EntityId) => actionFn(id, token),
      onSuccess: (response, id) => {
        queryClient.setQueryData(tripKeys.detail(id), response);
        queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
        queryClient.invalidateQueries({ queryKey: tripKeys.shoppingOrders(id) });
      },
    });
  };
};

export const useActivateTrip = createTransitionHook(activateTrip);
export const useStartTripTransit = createTransitionHook(startTripTransit);
export const useCompleteTrip = createTransitionHook(completeTrip);
export const useCancelTrip = createTransitionHook(cancelTrip);

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export const useInvalidateTrips = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: tripKeys.all });
};

export const usePrefetchTrip = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return (id: EntityId) => {
    queryClient.prefetchQuery({
      queryKey: tripKeys.detail(id),
      queryFn: () => getTrip(id, token),
      staleTime: 2 * 60 * 1000,
    });
  };
};
