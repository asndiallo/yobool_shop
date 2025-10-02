import {
  ApiArrayResponse,
  ApiSingleResponse,
  DeepPartial,
  EntityId,
  QueryParams,
  RoundTripInput,
  Trip,
  TripAttributes,
  TripInput,
} from '@/types';

import { APIEndpoints } from './endpoints';
import { apiRequest } from './client';
import { handleError } from './errors';

// ============================================================================
// TRIPS API - Direct API layer
// ============================================================================

export async function getTrips(
  params?: QueryParams,
  token?: string
): Promise<ApiArrayResponse<Trip>> {
  try {
    const { endpoint, method } = APIEndpoints.trips.index();
    const { responseData } = await apiRequest<ApiArrayResponse<Trip>>({
      endpoint,
      method,
      token,
      params,
    });
    return responseData;
  } catch (error) {
    return handleError(error, 'Error fetching trips');
  }
}

export async function getTrip(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Trip>> {
  try {
    const { endpoint, method } = APIEndpoints.trips.show(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Trip>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error fetching trip ${id}`);
  }
}

export async function createTrip(
  data: TripInput,
  token?: string
): Promise<ApiSingleResponse<Trip>> {
  try {
    const { endpoint, method } = APIEndpoints.trips.create();
    const { responseData } = await apiRequest<ApiSingleResponse<Trip>>({
      endpoint,
      method,
      token,
      body: JSON.stringify({ trip: data }),
    });
    return responseData;
  } catch (error) {
    return handleError(error, 'Error creating trip');
  }
}

export async function createRoundTrip(
  data: RoundTripInput,
  token?: string
): Promise<ApiArrayResponse<Trip>> {
  try {
    const { endpoint, method } = APIEndpoints.trips.createRoundTrip;
    const { responseData } = await apiRequest<ApiArrayResponse<Trip>>({
      endpoint,
      method,
      token,
      body: JSON.stringify({ round_trip: data }),
    });
    return responseData;
  } catch (error) {
    return handleError(error, 'Error creating round trip');
  }
}

export async function updateTrip(
  id: EntityId,
  data: DeepPartial<TripAttributes>,
  token?: string
): Promise<ApiSingleResponse<Trip>> {
  try {
    const { endpoint, method } = APIEndpoints.trips.update(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Trip>>({
      endpoint,
      method,
      token,
      body: JSON.stringify({ trip: data }),
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error updating trip ${id}`);
  }
}

export async function deleteTrip(id: EntityId, token?: string): Promise<void> {
  try {
    const { endpoint, method } = APIEndpoints.trips.destroy(id);
    await apiRequest({
      endpoint,
      method,
      token,
    });
  } catch (error) {
    handleError(error, `Error deleting trip ${id}`);
  }
}

// ============================================================================
// STATE TRANSITIONS
// ============================================================================

export async function activateTrip(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Trip>> {
  try {
    const { endpoint, method } = APIEndpoints.trips.activate(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Trip>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error activating trip ${id}`);
  }
}

export async function startTripTransit(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Trip>> {
  try {
    const { endpoint, method } = APIEndpoints.trips.startTransit(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Trip>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error starting transit for trip ${id}`);
  }
}

export async function completeTrip(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Trip>> {
  try {
    const { endpoint, method } = APIEndpoints.trips.complete(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Trip>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error completing trip ${id}`);
  }
}

export async function cancelTrip(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Trip>> {
  try {
    const { endpoint, method } = APIEndpoints.trips.cancel(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Trip>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error cancelling trip ${id}`);
  }
}

// ============================================================================
// RELATED RESOURCES & QUERIES
// ============================================================================

export async function getAvailableTripsForShopping(
  routeId: EntityId,
  token?: string
): Promise<ApiArrayResponse<Trip>> {
  try {
    const { endpoint, method } = APIEndpoints.trips.availableForShopping;
    const { responseData } = await apiRequest<ApiArrayResponse<Trip>>({
      endpoint,
      method,
      token,
      params: { route_id: routeId },
    });
    return responseData;
  } catch (error) {
    return handleError(
      error,
      `Error fetching available trips for route ${routeId}`
    );
  }
}

export async function getTripShoppingOrders(
  id: EntityId,
  token?: string
): Promise<ApiArrayResponse<any>> {
  try {
    const { endpoint, method } = APIEndpoints.trips.shoppingOrders(id);
    const { responseData } = await apiRequest<ApiArrayResponse<any>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error fetching shopping orders for trip ${id}`);
  }
}

export async function getTripQuotes(
  id: EntityId,
  token?: string
): Promise<ApiArrayResponse<any>> {
  try {
    const { endpoint, method } = APIEndpoints.trips.quotes(id);
    const { responseData } = await apiRequest<ApiArrayResponse<any>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error fetching quotes for trip ${id}`);
  }
}

export async function checkTripCanAccommodate(
  tripId: EntityId,
  shoppingOrderId: EntityId,
  token?: string
): Promise<{ can_accommodate: boolean }> {
  try {
    const { endpoint, method } = APIEndpoints.trips.canAccommodate(tripId);
    const { responseData } = await apiRequest<{ can_accommodate: boolean }>({
      endpoint,
      method,
      token,
      params: { shopping_order_id: shoppingOrderId },
    });
    return responseData;
  } catch (error) {
    return handleError(
      error,
      `Error checking if trip ${tripId} can accommodate order ${shoppingOrderId}`
    );
  }
}
