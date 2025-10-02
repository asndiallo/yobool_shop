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
  type Product,
  type ProductAttributes,
  type ProductInput,
  type QueryParams,
  isAuthenticated,
} from '@/types';
import {
  archiveProduct,
  createProduct,
  deleteProduct,
  draftProduct,
  featureProduct,
  getProduct,
  getProducts,
  publishProduct,
  toggleProductBookmark,
  updateProduct,
} from '@/api/products';
import { useAuthHook } from './use-auth';
import { APIError } from '@/api/errors';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: EntityId) => [...productKeys.details(), id] as const,
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

export const useProducts = (
  params?: QueryParams,
  options?: Partial<UseQueryOptions<ApiArrayResponse<Product>, APIError>>
) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => getProducts(params, token),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useProduct = (
  id?: EntityId,
  options?: Partial<UseQueryOptions<ApiSingleResponse<Product>, APIError>>
) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: productKeys.detail(id!),
    queryFn: () => getProduct(id!, token),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export const useCreateProduct = (
  options?: Partial<
    UseMutationOptions<ApiSingleResponse<Product>, APIError, ProductInput>
  >
) => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (data) => createProduct(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    ...options,
  });
};

export const useUpdateProduct = (
  options?: Partial<
    UseMutationOptions<
      ApiSingleResponse<Product>,
      APIError,
      { id: EntityId; data: DeepPartial<ProductAttributes> }
    >
  >
) => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data, token),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(productKeys.detail(id), response);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    ...options,
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (id: EntityId) => deleteProduct(id, token),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

// ============================================================================
// STATE TRANSITION HOOKS
// ============================================================================

const createProductTransitionHook = (
  actionFn: (
    id: EntityId,
    token?: string
  ) => Promise<ApiSingleResponse<Product>>
) => {
  return () => {
    const queryClient = useQueryClient();
    const token = useAuthToken();

    return useMutation({
      mutationFn: (id: EntityId) => actionFn(id, token),
      onSuccess: (response, id) => {
        queryClient.setQueryData(productKeys.detail(id), response);
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      },
    });
  };
};

export const usePublishProduct = createProductTransitionHook(publishProduct);
export const useArchiveProduct = createProductTransitionHook(archiveProduct);
export const useFeatureProduct = createProductTransitionHook(featureProduct);
export const useDraftProduct = createProductTransitionHook(draftProduct);

// ============================================================================
// BOOKMARK HOOK
// ============================================================================

export const useToggleProductBookmark = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (id: EntityId) => toggleProductBookmark(id, token),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });

      const previousData = queryClient.getQueryData<ApiSingleResponse<Product>>(
        productKeys.detail(id)
      );

      // Optimistic update - toggle bookmark count
      if (previousData) {
        queryClient.setQueryData<ApiSingleResponse<Product>>(
          productKeys.detail(id),
          {
            ...previousData,
            data: {
              ...previousData.data,
              attributes: {
                ...previousData.data.attributes,
                bookmark_count: previousData.data.attributes.bookmark_count + 1,
              },
            },
          }
        );
      }

      return { previousData };
    },
    onSuccess: (response, id) => {
      queryClient.setQueryData(productKeys.detail(id), response);
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
    onError: (error, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(productKeys.detail(id), context.previousData);
      }
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export const useInvalidateProducts = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all });
};

export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return (id: EntityId) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(id),
      queryFn: () => getProduct(id, token),
      staleTime: 5 * 60 * 1000,
    });
  };
};
