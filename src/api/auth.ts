import {
  AppleSignInData,
  LoginApiResponse,
  ServerOauthFlowResponseData,
  ThirdPartyOauthParams,
  TokenRefreshResponseData,
  UserCredentials,
  UserRegistration,
} from '@/types';

import { APIEndpoints } from './endpoints';
import { apiRequest } from './client';
import { handleError } from './errors';

// ============================================================================
// AUTH API CALLS - Direct, no service layer
// ============================================================================

export async function refreshTokenAPI(
  oldToken: string
): Promise<TokenRefreshResponseData> {
  try {
    const { endpoint, method } = APIEndpoints.auth.refreshToken;
    const { responseData } = await apiRequest<TokenRefreshResponseData>({
      endpoint,
      method,
      token: oldToken,
    });
    return responseData;
  } catch (error) {
    return handleError(error, 'Token refresh failed');
  }
}

export async function loginAPI(
  credentials: UserCredentials
): Promise<LoginApiResponse> {
  try {
    const { endpoint, method } = APIEndpoints.auth.login;
    return await apiRequest<LoginApiResponse['responseData']>({
      endpoint,
      method,
      body: JSON.stringify({ user: credentials }),
    });
  } catch (error) {
    return handleError(error, 'Login failed');
  }
}

export async function registerAPI(
  registration: UserRegistration
): Promise<void> {
  try {
    const { endpoint, method } = APIEndpoints.auth.register;
    await apiRequest({
      endpoint,
      method,
      body: JSON.stringify({ user: registration }),
    });
  } catch (error) {
    handleError(error, 'Registration failed');
  }
}

export async function logoutAPI(token: string): Promise<void> {
  try {
    const { endpoint, method } = APIEndpoints.auth.logout;
    await apiRequest({
      endpoint,
      method,
      token,
    });
  } catch (error) {
    // Don't throw on logout - local logout should always succeed
    console.warn('Server logout failed:', error);
  }
}

export async function exchangeOAuthToken(params: {
  code: string;
}): Promise<ServerOauthFlowResponseData> {
  try {
    const { endpoint, method } = APIEndpoints.auth.exchange_token;
    const { responseData } = await apiRequest<ServerOauthFlowResponseData>({
      endpoint,
      method,
      params,
    });
    return responseData;
  } catch (error) {
    return handleError(error, 'OAuth token exchange failed');
  }
}

export async function getOAuthUrl(
  params: ThirdPartyOauthParams
): Promise<string> {
  try {
    const { endpoint, method } = APIEndpoints.auth.authorizationUrl;
    const { responseData } = await apiRequest<{ url: string }>({
      endpoint,
      method,
      params,
    });
    return responseData.url;
  } catch (error) {
    return handleError(error, 'Failed to get OAuth URL');
  }
}

export async function serverSignInWithApple(
  data: AppleSignInData
): Promise<ServerOauthFlowResponseData> {
  try {
    const { endpoint, method } = APIEndpoints.auth.appleNativeAuth;
    const { responseData } = await apiRequest<ServerOauthFlowResponseData>({
      endpoint,
      method,
      body: JSON.stringify(data),
    });
    return responseData;
  } catch (error) {
    return handleError(error, 'Apple authentication failed');
  }
}

export async function deleteAccount(token: string): Promise<void> {
  try {
    const { endpoint, method } = APIEndpoints.auth.deleteAccount;
    await apiRequest({
      endpoint,
      method,
      token,
    });
  } catch (error) {
    handleError(error, 'Account deletion failed');
  }
}
