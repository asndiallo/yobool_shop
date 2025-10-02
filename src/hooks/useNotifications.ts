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
  type EntityId,
  type NotificationData,
  type NotificationDevice,
  type QueryParams,
  isAuthenticated,
} from '@/types';
import {
  deleteAllNotifications,
  deleteNotification,
  getNotification,
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  registerDevice,
  unregisterDevice,
} from '@/api/notifications';
import { useAuthHook } from './useAuthHook';
import { APIError } from '@/api/errors';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: QueryParams) =>
    [...notificationKeys.lists(), params] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: EntityId) => [...notificationKeys.details(), id] as const,
  unreadCount: () => [...notificationKeys.all, 'unread_count'] as const,
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

export const useNotifications = (
  params?: QueryParams,
  options?: Partial<
    UseQueryOptions<ApiArrayResponse<NotificationData>, APIError>
  >
) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => getNotifications(params, token),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options,
  });
};

export const useNotification = (
  id?: EntityId,
  options?: Partial<
    UseQueryOptions<ApiSingleResponse<NotificationData>, APIError>
  >
) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: notificationKeys.detail(id!),
    queryFn: () => getNotification(id!, token),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
    ...options,
  });
};

export const useUnreadCount = (
  options?: Partial<UseQueryOptions<{ unread_count: number }, APIError>>
) => {
  const token = useAuthToken();

  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => getUnreadCount(token),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options,
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (id: EntityId) => markNotificationAsRead(id, token),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: notificationKeys.detail(id),
      });

      const previousData = queryClient.getQueryData<
        ApiSingleResponse<NotificationData>
      >(notificationKeys.detail(id));

      // Optimistic update - mark as read
      if (previousData) {
        queryClient.setQueryData<ApiSingleResponse<NotificationData>>(
          notificationKeys.detail(id),
          {
            ...previousData,
            data: {
              ...previousData.data,
              attributes: {
                ...previousData.data.attributes,
                read_at: new Date().toISOString(),
              },
            },
          }
        );
      }

      // Optimistically update unread count
      queryClient.setQueryData<{ unread_count: number }>(
        notificationKeys.unreadCount(),
        (old) =>
          old
            ? { unread_count: Math.max(0, old.unread_count - 1) }
            : { unread_count: 0 }
      );

      return { previousData };
    },
    onSuccess: (response, id) => {
      queryClient.setQueryData(notificationKeys.detail(id), response);
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
    onError: (error, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          notificationKeys.detail(id),
          context.previousData
        );
      }
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(token),
    onMutate: async () => {
      // Optimistically set unread count to 0
      queryClient.setQueryData<{ unread_count: number }>(
        notificationKeys.unreadCount(),
        { unread_count: 0 }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: (id: EntityId) => deleteNotification(id, token),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: notificationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
};

export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();
  const token = useAuthToken();

  return useMutation({
    mutationFn: () => deleteAllNotifications(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

// ============================================================================
// DEVICE REGISTRATION HOOKS
// ============================================================================

export const useRegisterDevice = (
  options?: Partial<UseMutationOptions<void, APIError, NotificationDevice>>
) => {
  const token = useAuthToken();

  return useMutation({
    mutationFn: (device) => registerDevice(device, token),
    ...options,
  });
};

export const useUnregisterDevice = () => {
  const token = useAuthToken();

  return useMutation({
    mutationFn: (pushToken: string) => unregisterDevice(pushToken, token),
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export const useInvalidateNotifications = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
};

/**
 * Auto-mark notification as read when viewing
 */
export const useAutoMarkAsRead = (id?: EntityId) => {
  const markAsRead = useMarkAsRead();

  return () => {
    if (id) {
      markAsRead.mutate(id);
    }
  };
};
