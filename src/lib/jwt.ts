import { AuthToken, TokenPayload } from '@/types';

// ============================================================================
// TOKEN PROCESSING - No external dependencies
// ============================================================================

interface ProcessedToken {
  token: AuthToken;
  expiration: number;
  receivedAt: number;
}

/**
 * Process token from server response with explicit payload
 * Used for: refresh token responses, OAuth flows
 */
export function processTokenWithPayload(
  tokenString: string,
  payload: TokenPayload
): ProcessedToken | null {
  try {
    const cleanToken = tokenString.replace(/^Bearer\s+/i, '').trim();

    if (!cleanToken || !payload.exp || !payload.sub) {
      console.warn('Invalid token or payload');
      return null;
    }

    // Use server-provided expiration (most reliable)
    return {
      token: `Bearer ${cleanToken}` as AuthToken,
      expiration: payload.exp,
      receivedAt: Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    console.error('Failed to process token with payload:', error);
    return null;
  }
}

/**
 * Process token from HTTP response header (login, OAuth redirect)
 * Used for: credential login, initial OAuth
 */
export function processTokenFromHeader(response: Response): ProcessedToken {
  const authHeader =
    response.headers.get('authorization') ||
    response.headers.get('Authorization') ||
    response.headers.get('auth-token');

  if (!authHeader) {
    throw new Error('No authentication token in response headers');
  }

  const cleanToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!cleanToken) {
    throw new Error('Invalid token format');
  }

  const receivedAt = Math.floor(Date.now() / 1000);

  // For header-only tokens, estimate expiration based on server default (7 days)
  // Add small buffer to account for processing time
  const sevenDays = 7 * 24 * 60 * 60;
  const estimatedExpiration = receivedAt + sevenDays - 300; // 5 minute buffer

  return {
    token: `Bearer ${cleanToken}` as AuthToken,
    expiration: estimatedExpiration,
    receivedAt,
  };
}

/**
 * Check if token needs refresh based on age or expiration
 */
export function shouldRefreshToken(
  expiration: number,
  receivedAt: number,
  bufferMinutes = 60
): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  const bufferSeconds = bufferMinutes * 60;

  // Check server expiration first (if available and reliable)
  if (expiration > receivedAt) {
    // Sanity check: expiration should be after receivedAt
    return expiration <= currentTime + bufferSeconds;
  }

  // Fallback: Check age-based expiration (7 days minus buffer)
  const sevenDays = 7 * 24 * 60 * 60;
  const maxAge = sevenDays - bufferSeconds;
  const tokenAge = currentTime - receivedAt;

  return tokenAge >= maxAge;
}

/**
 * Calculate when to schedule next refresh
 */
export function calculateRefreshDelay(
  expiration: number,
  receivedAt: number
): number {
  const currentTime = Math.floor(Date.now() / 1000);

  // Use server expiration if reliable
  if (expiration > receivedAt) {
    const timeLeft = expiration - currentTime;
    // Refresh 1 day before expiration, but at least 1 hour from now
    return Math.max(3600, timeLeft - 24 * 60 * 60) * 1000; // Convert to ms
  }

  // Fallback: Age-based calculation
  const sevenDays = 7 * 24 * 60 * 60;
  const tokenAge = currentTime - receivedAt;
  const timeUntilRefresh = sevenDays - 24 * 60 * 60 - tokenAge; // 6 days from received

  return Math.max(3600, timeUntilRefresh) * 1000; // At least 1 hour, in ms
}

/**
 * Get remaining token lifetime for display purposes
 */
export function getTokenRemainingTime(
  expiration: number,
  receivedAt: number
): number {
  const currentTime = Math.floor(Date.now() / 1000);

  // Use server expiration if reliable
  if (expiration > receivedAt) {
    return Math.max(0, expiration - currentTime);
  }

  // Fallback: Age-based
  const sevenDays = 7 * 24 * 60 * 60;
  const tokenAge = currentTime - receivedAt;
  return Math.max(0, sevenDays - tokenAge);
}

/**
 * Format remaining time as human readable
 */
export function formatTokenExpiry(
  expiration: number,
  receivedAt: number
): string {
  const remainingSeconds = getTokenRemainingTime(expiration, receivedAt);

  if (remainingSeconds <= 0) return 'Expired';

  const days = Math.floor(remainingSeconds / (24 * 60 * 60));
  const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / 3600);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h remaining`;

  const minutes = Math.floor(remainingSeconds / 60);
  return `${minutes}m remaining`;
}

// ============================================================================
// OAUTH UTILITIES - No changes needed
// ============================================================================

export function getRedirectUrl(): string {
  if (__DEV__) {
    return 'yoboolshop://auth/callback';
  }
  return 'yoboolshop://auth/callback';
}

export function parseOAuthCallback(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  } catch (error) {
    console.error('Failed to parse OAuth callback URL:', error);
    return {};
  }
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

/**
 * @deprecated Use processTokenWithPayload or processTokenFromHeader
 */
export function extractTokenInfo(
  token: string,
  payload?: TokenPayload
): ProcessedToken | null {
  if (payload) {
    return processTokenWithPayload(token, payload);
  } else {
    console.warn('extractTokenInfo without payload is deprecated');
    return null;
  }
}
