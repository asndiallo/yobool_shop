import {
  ApiArrayResponse,
  ApiSingleResponse,
  DeepPartial,
  EntityId,
  QueryParams,
  ShoppingOrder,
  ShoppingOrderAttributes,
  ShoppingOrderInput,
} from '@/types';

import { APIEndpoints } from './endpoints';
import { apiRequest } from './client';
import { handleError } from './errors';

// ============================================================================
// SHOPPING ORDERS API - Direct API layer
// ============================================================================

export async function getShoppingOrders(
  params?: QueryParams,
  token?: string
): Promise<ApiArrayResponse<ShoppingOrder>> {
  try {
    const { endpoint, method } = APIEndpoints.shoppingOrders.index();
    const { responseData } = await apiRequest<ApiArrayResponse<ShoppingOrder>>({
      endpoint,
      method,
      token,
      params,
    });
    return responseData;
  } catch (error) {
    return handleError(error, 'Error fetching shopping orders');
  }
}

export async function getShoppingOrder(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<ShoppingOrder>> {
  try {
    const { endpoint, method } = APIEndpoints.shoppingOrders.show(id);
    const { responseData } = await apiRequest<ApiSingleResponse<ShoppingOrder>>(
      {
        endpoint,
        method,
        token,
      }
    );
    return responseData;
  } catch (error) {
    return handleError(error, `Error fetching shopping order ${id}`);
  }
}

export async function createShoppingOrder(
  data: ShoppingOrderInput,
  token?: string
): Promise<ApiSingleResponse<ShoppingOrder>> {
  try {
    const { endpoint, method } = APIEndpoints.shoppingOrders.create();
    const { responseData } = await apiRequest<ApiSingleResponse<ShoppingOrder>>(
      {
        endpoint,
        method,
        token,
        body: JSON.stringify({ shopping_order: data }),
      }
    );
    return responseData;
  } catch (error) {
    return handleError(error, 'Error creating shopping order');
  }
}

export async function updateShoppingOrder(
  id: EntityId,
  data: DeepPartial<ShoppingOrderAttributes>,
  token?: string
): Promise<ApiSingleResponse<ShoppingOrder>> {
  try {
    const { endpoint, method } = APIEndpoints.shoppingOrders.update(id);
    const { responseData } = await apiRequest<ApiSingleResponse<ShoppingOrder>>(
      {
        endpoint,
        method,
        token,
        body: JSON.stringify({ shopping_order: data }),
      }
    );
    return responseData;
  } catch (error) {
    return handleError(error, `Error updating shopping order ${id}`);
  }
}

export async function deleteShoppingOrder(
  id: EntityId,
  token?: string
): Promise<void> {
  try {
    const { endpoint, method } = APIEndpoints.shoppingOrders.destroy(id);
    await apiRequest({
      endpoint,
      method,
      token,
    });
  } catch (error) {
    handleError(error, `Error deleting shopping order ${id}`);
  }
}

// ============================================================================
// STATE TRANSITIONS
// ============================================================================

export async function requestQuotes(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<ShoppingOrder>> {
  try {
    const { endpoint, method } = APIEndpoints.shoppingOrders.requestQuotes(id);
    const { responseData } = await apiRequest<ApiSingleResponse<ShoppingOrder>>(
      {
        endpoint,
        method,
        token,
      }
    );
    return responseData;
  } catch (error) {
    return handleError(error, `Error requesting quotes for order ${id}`);
  }
}

export async function acceptQuote(
  id: EntityId,
  quoteId: EntityId,
  token?: string
): Promise<ApiSingleResponse<ShoppingOrder>> {
  try {
    const { endpoint, method } = APIEndpoints.shoppingOrders.acceptQuote(id);
    const { responseData } = await apiRequest<ApiSingleResponse<ShoppingOrder>>(
      {
        endpoint,
        method,
        token,
        params: { quote_id: quoteId },
      }
    );
    return responseData;
  } catch (error) {
    return handleError(error, `Error accepting quote for order ${id}`);
  }
}

export async function cancelShoppingOrder(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<ShoppingOrder>> {
  try {
    const { endpoint, method } = APIEndpoints.shoppingOrders.cancel(id);
    const { responseData } = await apiRequest<ApiSingleResponse<ShoppingOrder>>(
      {
        endpoint,
        method,
        token,
      }
    );
    return responseData;
  } catch (error) {
    return handleError(error, `Error cancelling shopping order ${id}`);
  }
}

export async function purchaseShoppingOrder(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<ShoppingOrder>> {
  try {
    const { endpoint, method } = APIEndpoints.shoppingOrders.purchase(id);
    const { responseData } = await apiRequest<ApiSingleResponse<ShoppingOrder>>(
      {
        endpoint,
        method,
        token,
      }
    );
    return responseData;
  } catch (error) {
    return handleError(error, `Error purchasing shopping order ${id}`);
  }
}

export async function shipShoppingOrder(
  id: EntityId,
  trackingCode?: string,
  token?: string
): Promise<ApiSingleResponse<ShoppingOrder>> {
  try {
    const { endpoint, method } = APIEndpoints.shoppingOrders.ship(id);
    const { responseData } = await apiRequest<ApiSingleResponse<ShoppingOrder>>(
      {
        endpoint,
        method,
        token,
        params: trackingCode ? { tracking_code: trackingCode } : undefined,
      }
    );
    return responseData;
  } catch (error) {
    return handleError(error, `Error shipping shopping order ${id}`);
  }
}

export async function deliverShoppingOrder(
  id: EntityId,
  confirmationCode?: string,
  token?: string
): Promise<ApiSingleResponse<ShoppingOrder>> {
  try {
    const { endpoint, method } = APIEndpoints.shoppingOrders.deliver(id);
    const { responseData } = await apiRequest<ApiSingleResponse<ShoppingOrder>>(
      {
        endpoint,
        method,
        token,
        params: confirmationCode
          ? { confirmation_code: confirmationCode }
          : undefined,
      }
    );
    return responseData;
  } catch (error) {
    return handleError(error, `Error delivering shopping order ${id}`);
  }
}

export async function refundShoppingOrder(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<ShoppingOrder>> {
  try {
    const { endpoint, method } = APIEndpoints.shoppingOrders.refund(id);
    const { responseData } = await apiRequest<ApiSingleResponse<ShoppingOrder>>(
      {
        endpoint,
        method,
        token,
      }
    );
    return responseData;
  } catch (error) {
    return handleError(error, `Error refunding shopping order ${id}`);
  }
}

// ============================================================================
// RELATED RESOURCES
// ============================================================================

export async function getShoppingOrderQuotes(
  id: EntityId,
  token?: string
): Promise<ApiArrayResponse<any>> {
  try {
    const { endpoint, method } = APIEndpoints.shoppingOrders.quotes(id);
    const { responseData } = await apiRequest<ApiArrayResponse<any>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error fetching quotes for order ${id}`);
  }
}

export async function getEligibleTrips(
  id: EntityId,
  token?: string
): Promise<ApiArrayResponse<any>> {
  try {
    const { endpoint, method } = APIEndpoints.shoppingOrders.eligibleTrips(id);
    const { responseData } = await apiRequest<ApiArrayResponse<any>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error fetching eligible trips for order ${id}`);
  }
}
