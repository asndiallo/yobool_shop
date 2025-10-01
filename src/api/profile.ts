import { ApiSingleResponse, DeepPartial, User, UserAttributes } from '@/types';

import { APIEndpoints } from './endpoints';
import { apiRequest } from './client';
import { handleError } from './errors';

// ============================================================================
// PROFILE API CALLS - Direct API layer
// ============================================================================

export async function getProfile(
  id: string,
  token?: string
): Promise<ApiSingleResponse<User>> {
  try {
    const { endpoint, method } = APIEndpoints.profiles.show(id);
    const { responseData } = await apiRequest<ApiSingleResponse<User>>({
      endpoint,
      method,
      token,
    });

    return responseData;
  } catch (error) {
    return handleError(error, `Error fetching profile with id ${id}`);
  }
}

export async function updateProfile(
  id: string,
  data: DeepPartial<UserAttributes> | FormData,
  token?: string
): Promise<ApiSingleResponse<User>> {
  try {
    const { endpoint, method } = APIEndpoints.profiles.update(id);
    const { responseData } = await apiRequest<ApiSingleResponse<User>>({
      endpoint,
      method,
      token,
      body: data instanceof FormData ? data : JSON.stringify({ user: data }),
    });

    return responseData;
  } catch (error) {
    return handleError(error, `Error updating profile with id ${id}`);
  }
}

export async function deleteProfileAvatar(
  id: string,
  token?: string
): Promise<void> {
  try {
    const { endpoint, method } = APIEndpoints.profiles.deleteAvatar(id);
    await apiRequest({
      endpoint,
      method,
      token,
    });
  } catch (error) {
    handleError(error, `Error deleting avatar for profile ${id}`);
  }
}
