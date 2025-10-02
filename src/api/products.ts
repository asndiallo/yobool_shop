import {
  ApiArrayResponse,
  ApiSingleResponse,
  DeepPartial,
  EntityId,
  Product,
  ProductAttributes,
  ProductInput,
  QueryParams,
} from '@/types';

import { APIEndpoints } from './endpoints';
import { apiRequest } from './client';
import { handleError } from './errors';

// ============================================================================
// PRODUCTS API - Direct API layer
// ============================================================================

export async function getProducts(
  params?: QueryParams,
  token?: string
): Promise<ApiArrayResponse<Product>> {
  try {
    const { endpoint, method } = APIEndpoints.products.index();
    const { responseData } = await apiRequest<ApiArrayResponse<Product>>({
      endpoint,
      method,
      token,
      params,
    });
    return responseData;
  } catch (error) {
    return handleError(error, 'Error fetching products');
  }
}

export async function getProduct(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Product>> {
  try {
    const { endpoint, method } = APIEndpoints.products.show(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Product>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error fetching product ${id}`);
  }
}

export async function createProduct(
  data: ProductInput,
  token?: string
): Promise<ApiSingleResponse<Product>> {
  try {
    const { endpoint, method } = APIEndpoints.products.create();
    const { responseData } = await apiRequest<ApiSingleResponse<Product>>({
      endpoint,
      method,
      token,
      body: JSON.stringify({ product: data }),
    });
    return responseData;
  } catch (error) {
    return handleError(error, 'Error creating product');
  }
}

export async function updateProduct(
  id: EntityId,
  data: DeepPartial<ProductAttributes>,
  token?: string
): Promise<ApiSingleResponse<Product>> {
  try {
    const { endpoint, method } = APIEndpoints.products.update(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Product>>({
      endpoint,
      method,
      token,
      body: JSON.stringify({ product: data }),
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error updating product ${id}`);
  }
}

export async function deleteProduct(
  id: EntityId,
  token?: string
): Promise<void> {
  try {
    const { endpoint, method } = APIEndpoints.products.destroy(id);
    await apiRequest({
      endpoint,
      method,
      token,
    });
  } catch (error) {
    handleError(error, `Error deleting product ${id}`);
  }
}

// ============================================================================
// STATE TRANSITIONS
// ============================================================================

export async function publishProduct(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Product>> {
  try {
    const { endpoint, method } = APIEndpoints.products.publish(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Product>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error publishing product ${id}`);
  }
}

export async function archiveProduct(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Product>> {
  try {
    const { endpoint, method } = APIEndpoints.products.archive(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Product>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error archiving product ${id}`);
  }
}

export async function featureProduct(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Product>> {
  try {
    const { endpoint, method } = APIEndpoints.products.feature(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Product>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error featuring product ${id}`);
  }
}

export async function draftProduct(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Product>> {
  try {
    const { endpoint, method } = APIEndpoints.products.draft(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Product>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error moving product ${id} to draft`);
  }
}

// ============================================================================
// BOOKMARKING
// ============================================================================

export async function toggleProductBookmark(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<Product>> {
  try {
    const { endpoint, method } = APIEndpoints.products.toggleBookmark(id);
    const { responseData } = await apiRequest<ApiSingleResponse<Product>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error toggling bookmark for product ${id}`);
  }
}
