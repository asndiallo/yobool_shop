import {
  ApiArrayResponse,
  ApiSingleResponse,
  EntityId,
  NotificationData,
  NotificationDevice,
  QueryParams,
} from '@/types';

import { APIEndpoints } from './endpoints';
import { apiRequest } from './client';
import { handleError } from './errors';

// ============================================================================
// NOTIFICATIONS API - Direct API layer
// ============================================================================

export async function getNotifications(
  params?: QueryParams,
  token?: string
): Promise<ApiArrayResponse<NotificationData>> {
  try {
    const { endpoint, method } = APIEndpoints.notifications.index();
    const { responseData } = await apiRequest<
      ApiArrayResponse<NotificationData>
    >({
      endpoint,
      method,
      token,
      params,
    });
    return responseData;
  } catch (error) {
    return handleError(error, 'Error fetching notifications');
  }
}

export async function getNotification(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<NotificationData>> {
  try {
    const { endpoint, method } = APIEndpoints.notifications.show(id);
    const { responseData } = await apiRequest<
      ApiSingleResponse<NotificationData>
    >({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error fetching notification ${id}`);
  }
}

export async function deleteNotification(
  id: EntityId,
  token?: string
): Promise<void> {
  try {
    const { endpoint, method } = APIEndpoints.notifications.destroy(id);
    await apiRequest({
      endpoint,
      method,
      token,
    });
  } catch (error) {
    handleError(error, `Error deleting notification ${id}`);
  }
}

// ============================================================================
// NOTIFICATION ACTIONS
// ============================================================================

export async function markNotificationAsRead(
  id: EntityId,
  token?: string
): Promise<ApiSingleResponse<NotificationData>> {
  try {
    const { endpoint, method } = APIEndpoints.notifications.markAsRead(id);
    const { responseData } = await apiRequest<
      ApiSingleResponse<NotificationData>
    >({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error marking notification ${id} as read`);
  }
}

export async function markAllNotificationsAsRead(
  token?: string
): Promise<void> {
  try {
    const { endpoint, method } = APIEndpoints.notifications.markAllAsRead;
    await apiRequest({
      endpoint,
      method,
      token,
    });
  } catch (error) {
    handleError(error, 'Error marking all notifications as read');
  }
}

export async function deleteAllNotifications(token?: string): Promise<void> {
  try {
    const { endpoint, method } = APIEndpoints.notifications.destroyAll;
    await apiRequest({
      endpoint,
      method,
      token,
    });
  } catch (error) {
    handleError(error, 'Error deleting all notifications');
  }
}

export async function getUnreadCount(
  token?: string
): Promise<{ unread_count: number }> {
  try {
    const { endpoint, method } = APIEndpoints.notifications.unreadCount;
    const { responseData } = await apiRequest<{ unread_count: number }>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, 'Error fetching unread notification count');
  }
}

// ============================================================================
// DEVICE REGISTRATION
// ============================================================================

export async function registerDevice(
  device: NotificationDevice,
  token?: string
): Promise<void> {
  try {
    const { endpoint, method } = APIEndpoints.notifications.registerDevice;
    await apiRequest({
      endpoint,
      method,
      token,
      body: JSON.stringify({ device }),
    });
  } catch (error) {
    handleError(error, 'Error registering device for notifications');
  }
}

export async function unregisterDevice(
  pushToken: string,
  token?: string
): Promise<void> {
  try {
    const { endpoint, method } = APIEndpoints.notifications.unRegisterDevice;
    await apiRequest({
      endpoint,
      method,
      token,
      params: { push_token: pushToken },
    });
  } catch (error) {
    handleError(error, 'Error unregistering device');
  }
}
