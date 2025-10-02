import {
  ApiSingleResponse,
  DeepPartial,
  EntityId,
  Quote,
  QuoteAttributes,
} from '@/types';

import { APIEndpoints } from './endpoints';
import { apiRequest } from './client';
import { handleError } from './errors';

// ============================================================================
// QUOTES API - Direct API layer
// ============================================================================

/**
 * Get a single quote
 */
export async function getQuote(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Quote>> {
  try {
    const { endpoint, method } = APIEndpoints.quotes.show(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Quote>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error fetching quote ${id}`);
  }
}

/**
 * Update a quote
 */
export async function updateQuote(
  id: EntityId,
  data: DeepPartial<QuoteAttributes>,
  token?: string
): Promise<ApiSingleResponse<Quote>> {
  try {
    const { endpoint, method } = APIEndpoints.quotes.update(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Quote>>({
      endpoint,
      method,
      token,
      body: JSON.stringify({ quote: data }),
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error updating quote ${id}`);
  }
}

/**
 * Delete a quote
 */
export async function deleteQuote(id: EntityId, token?: string): Promise<void> {
  try {
    const { endpoint, method } = APIEndpoints.quotes.destroy(id);
    await apiRequest({
      endpoint,
      method,
      token,
    });
  } catch (error) {
    handleError(error, `Error deleting quote ${id}`);
  }
}

/**
 * Accept a quote
 */
export async function acceptQuoteAction(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Quote>> {
  try {
    const { endpoint, method } = APIEndpoints.quotes.accept(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Quote>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error accepting quote ${id}`);
  }
}

/**
 * Reject a quote
 */
export async function rejectQuote(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Quote>> {
  try {
    const { endpoint, method } = APIEndpoints.quotes.reject(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Quote>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error rejecting quote ${id}`);
  }
}

/**
 * Get quote details (for nested quotes under shopping orders)
 */
export async function getQuoteDetails(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Quote>> {
  try {
    const { endpoint, method } = APIEndpoints.quotes.details(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Quote>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error fetching quote details ${id}`);
  }
}
