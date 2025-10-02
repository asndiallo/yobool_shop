import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  type ApiSingleResponse,
  type Route,
  type RouteInput,
  isAuthenticated,
} from '@/types';
import { findOrCreateRoute } from '@/api/routes';
import { useAuthHook } from './use-auth';
import { APIError } from '@/api/errors';

// ============================================================================
// QUERY KEYS FACTORY - Centralized for consistency
// ============================================================================

export const routeKeys = {
  all: ['routes'] as const,
  detail: (departure: string, destination: string) =>
    [...routeKeys.all, departure, destination] as const,
} as const;

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Find or create a route between two locations
 * Implements intelligent caching to avoid duplicate requests
 *
 * @example
 * ```tsx
 * const findRoute = useFindOrCreateRoute();
 *
 * findRoute.mutate({
 *   departure_city: 'Paris',
 *   departure_state: 'Île-de-France',
 *   departure_country: 'FR',
 *   destination_city: 'London',
 *   destination_state: 'England',
 *   destination_country: 'GB'
 * });
 * ```
 */
export const useFindOrCreateRoute = (
  options?: Partial<
    UseMutationOptions<ApiSingleResponse<Route>, APIError, RouteInput>
  >
) => {
  const queryClient = useQueryClient();
  const { authState } = useAuthHook();
  const token = isAuthenticated(authState) ? authState.token : undefined;

  return useMutation({
    mutationFn: (routeData: RouteInput) => findOrCreateRoute(routeData, token),
    onSuccess: (response, variables) => {
      // Cache the route for future use
      const cacheKey = routeKeys.detail(
        `${variables.departure_city},${variables.departure_country}`,
        `${variables.destination_city},${variables.destination_country}`
      );

      queryClient.setQueryData(cacheKey, response);

      // Also cache reverse route if included
      if (response.included) {
        const reverseRoute = response.included.find(
          (item: any) => item.type === 'route'
        );

        if (reverseRoute) {
          const reverseCacheKey = routeKeys.detail(
            `${variables.destination_city},${variables.destination_country}`,
            `${variables.departure_city},${variables.departure_country}`
          );

          queryClient.setQueryData(reverseCacheKey, {
            data: reverseRoute,
          });
        }
      }
    },
    onError: (error) => {
      console.error('Route find/create failed:', error);
    },
    ...options,
  });
};

/**
 * Get cached route if available
 * Useful for checking if a route was previously fetched
 */
export const useCachedRoute = () => {
  const queryClient = useQueryClient();

  return (departure: string, destination: string) => {
    const cacheKey = routeKeys.detail(departure, destination);
    return queryClient.getQueryData<ApiSingleResponse<Route>>(cacheKey);
  };
};

/**
 * Invalidate all route cache
 * Useful when route data might be stale (e.g., after price updates)
 */
export const useInvalidateRoutes = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: routeKeys.all });
  };
};

/**
 * Clear specific route from cache
 */
export const useClearRoute = () => {
  const queryClient = useQueryClient();

  return (departure: string, destination: string) => {
    const cacheKey = routeKeys.detail(departure, destination);
    queryClient.removeQueries({ queryKey: cacheKey });
  };
};

// ============================================================================
// UTILITY HOOKS - Helper functions for route management
// ============================================================================

/**
 * Calculate route key from locations
 * Useful for consistent cache key generation
 */
export const useRouteKey = () => {
  return (
    departureCity: string,
    departureCountry: string,
    destinationCity: string,
    destinationCountry: string
  ) => {
    return routeKeys.detail(
      `${departureCity},${departureCountry}`,
      `${destinationCity},${destinationCountry}`
    );
  };
};

/**
 * Batch route finder
 * Efficiently finds/creates multiple routes
 */
export const useBatchFindRoutes = () => {
  const findRoute = useFindOrCreateRoute();

  return async (routes: RouteInput[]) => {
    const results = await Promise.allSettled(
      routes.map((route) => findRoute.mutateAsync(route))
    );

    return results
      .filter(
        (result): result is PromiseFulfilledResult<ApiSingleResponse<Route>> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value);
  };
};
