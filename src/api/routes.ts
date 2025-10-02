import { ApiSingleResponse, Route, RouteInput } from '@/types';

import { APIEndpoints } from './endpoints';
import { apiRequest } from './client';
import { handleError } from './errors';

// ============================================================================
// ROUTES API CALLS - Direct API layer
// ============================================================================

/**
 * Find or create a route based on departure and destination locations
 * Returns existing route if found, creates new one if not
 *
 * @param routeData - Route input with departure and destination details
 * @param token - Optional authentication token
 * @returns Route with optional reverse route included
 */
export async function findOrCreateRoute(
  routeData: RouteInput,
  token?: string
): Promise<ApiSingleResponse<Route>> {
  try {
    const { endpoint, method } = APIEndpoints.routes.findOrCreate;
    const { responseData } = await apiRequest<ApiSingleResponse<Route>>({
      endpoint,
      method,
      token,
      body: JSON.stringify({ route: routeData }),
    });

    return responseData;
  } catch (error) {
    return handleError(
      error,
      `Error finding/creating route from ${routeData.departure_city} to ${routeData.destination_city}`
    );
  }
}
