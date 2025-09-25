import { t } from '@/lib/i18n';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  public statusCode?: number;
  public statusText?: string;
  public url?: string;
  public headers?: HeadersInit;
  public rawResponse?: object | string | Blob | null;

  /**
   * Creates a new APIError instance.
   * @param message - The error message.
   * @param statusCode - The HTTP status code.
   * @param statusText - The HTTP status text (if any).
   * @param url - The request URL that caused the error.
   * @param headers - The response headers.
   * @param rawResponse - The raw response data for additional debugging.
   */
  constructor(
    message: string,
    statusCode?: number,
    statusText?: string,
    url?: string,
    headers?: HeadersInit,
    rawResponse?: object | string | Blob | null
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.url = url;
    this.headers = headers;
    this.rawResponse = rawResponse;
  }
}

/**
 * Helper function to handle API errors.
 * @param error - The error to handle.
 * @param context - The context in which the error occurred.
 */
export const handleError = (error: unknown, context: string): never => {
  console.error(
    `${context}: ${error}\nStatus code: ${
      (error as APIError)?.statusCode ?? 'Unknown'
    }`
  );
  throw new Error(error instanceof Error ? error.message : t('error.unknown'));
};
