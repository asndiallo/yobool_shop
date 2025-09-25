import { ApiRequestInit, ApiResponse, QueryParams, QueryValue } from '@/types';
import { getCurrentLocale, t } from '@/lib/i18n';

import { APIError } from '@/api/errors';
import envConfig from '@/configs/environment';

/**
 * Helper function to make an API request.
 * @template T - The type of the response data.
 */
export const apiRequest = async <T>({
  endpoint,
  method = 'GET',
  token,
  body,
  params = {},
  ...options
}: ApiRequestInit): Promise<ApiResponse<T>> => {
  const urlWithParams = addQueryParams(`${envConfig.apiBaseUrl}${endpoint}`, {
    locale: getCurrentLocale(),
    ...(params as QueryParams),
  });

  const { headers: optionsHeaders, ...remainingOptions } = options;

  const headers: HeadersInit = {
    ...optionsHeaders,
    // Only set Content-Type if there's a body and it's not a multipart form-data request (handled by the browser/environment)
    ...(body &&
      !(body instanceof FormData) && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: token }),
    ...{ 'X-Platform': 'mobile' },
  };

  const requestOptions: RequestInit = {
    method,
    headers,
    ...(body && { body }),
    ...remainingOptions,
  };

  return fetchAndHandleErrors<T>(urlWithParams, requestOptions);
};

/**
 * Utility function to add query parameters to a URL.
 */
const addQueryParams = (url: string, params: QueryParams): string => {
  const parsedUrl = new URL(url);

  /**
   * Recursive function to add nested query parameters.
   */
  const addNestedParams = (
    keyPrefix: string,
    value: QueryValue | Record<string, QueryValue>
  ): void => {
    if (value == null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((arrayValue) => {
        parsedUrl.searchParams.append(`${keyPrefix}[]`, String(arrayValue));
      });
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        addNestedParams(`${keyPrefix}[${nestedKey}]`, nestedValue);
      });
    } else {
      parsedUrl.searchParams.set(keyPrefix, String(value));
    }
  };

  Object.entries(params).forEach(([key, value]) => {
    addNestedParams(key, value);
  });

  return parsedUrl.toString();
};

/**
 * Helper function to handle common fetch logic.
 */
const fetchAndHandleErrors = async <T>(
  url: string,
  options: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(url, options);
    const responseData = await parseResponseData(response);

    if (!response.ok) {
      throw new APIError(
        getErrorMessage(responseData),
        response.status,
        response.statusText,
        response.url,
        response.headers,
        responseData
      );
    }

    return { responseData: responseData as T, response };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(t('error.network'), 0, '', url);
  }
};

/**
 * Helper function to parse the response data based on the Content-Type header.
 */
const parseResponseData = async (
  response: Response
): Promise<object | string | Blob | null> => {
  if (
    response.status === 204 ||
    response.status === 205 ||
    response.headers.get('Content-Length') === '0'
  ) {
    return null;
  }

  const contentType = response.headers.get('Content-Type') ?? '';

  try {
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (
      contentType?.includes('application/octet-stream') ||
      contentType?.includes('image/')
    ) {
      return await response.blob();
    } else if (
      contentType?.includes('text') ||
      contentType?.includes('*/*') ||
      contentType?.includes('charset=utf-8') ||
      !contentType
    ) {
      return await response.text();
    } else {
      throw new Error(`Unhandled Content-Type: ${contentType}`);
    }
  } catch (error) {
    throw new APIError(
      `Failed to parse response data ${(error as Error).message}`,
      response.status,
      response.statusText,
      response.url,
      response.headers,
      response
    );
  }
};

/**
 * Helper function to extract the error message from a response.
 */
const getErrorMessage = (responseData: unknown): string => {
  if (typeof responseData === 'object' && responseData !== null) {
    if ('error' in responseData)
      return (responseData as { error: string }).error;
    if ('errors' in responseData)
      return (responseData as { errors: string[] }).errors.join(', ');
  } else if (typeof responseData === 'string') {
    return responseData;
  }
  return 'Request failed';
};
