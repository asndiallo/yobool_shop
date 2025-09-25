// ============================================================================
// API TYPES - Request/response patterns and HTTP client types
// ============================================================================

import { EntityId, NotificationType, QueryParams, UserId } from './core';

// ============================================================================
// CORE API PATTERNS
// ============================================================================

// Result pattern for consistent error handling
export type ApiResult<T, E = ApiError> =
  | { success: true; data: T; response: Response }
  | { success: false; error: E; response?: Response };

// Structured error response
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, string[]>;
  readonly statusCode?: number;
}

// Enhanced request configuration
export interface ApiRequestInit extends RequestInit {
  readonly endpoint: string;
  readonly params?: QueryParams;
  readonly token?: string;
}

// Generic response wrapper with metadata
export interface ApiResponse<T = unknown> {
  readonly responseData: T;
  readonly response: Response;
}

// ============================================================================
// PAGINATION & METADATA
// ============================================================================

export interface ApiMeta {
  readonly current_page: number;
  readonly next_page: number | null;
  readonly prev_page: number | null;
  readonly total_pages: number;
  readonly page_count: number;
  readonly total_count: number;
}

export interface ApiSingleResponse<T> {
  readonly data: T;
  readonly included?: unknown[];
  readonly meta?: ApiMeta;
}

export interface ApiArrayResponse<T> {
  readonly data: T[];
  readonly included?: unknown[];
  readonly meta: ApiMeta;
}

// ============================================================================
// SEARCH & FILTERING
// ============================================================================

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'cont'
  | 'in'
  | 'notin'
  | 'gteq'
  | 'lteq'
  | 'gt'
  | 'lt';
export type SortDirection = 'asc' | 'desc';

export interface FilterConfig<T = unknown> {
  readonly field: keyof T;
  readonly operator: FilterOperator;
  readonly value: unknown;
  readonly label?: string;
}

export interface SortConfig<T = unknown> {
  readonly field: keyof T;
  readonly direction: SortDirection;
}

export interface SearchParams<T = unknown> {
  readonly filters?: FilterConfig<T>[];
  readonly sort?: SortConfig<T>[];
  readonly search?: string;
  readonly page?: number;
  readonly perPage?: number;
}

export interface FilterFormConfig {
  readonly type: 'select' | 'date' | 'number' | 'text' | 'boolean' | 'range';
  readonly field: string;
  readonly label: string;
  readonly multiple?: boolean;
  readonly options?: readonly {
    readonly label: string;
    readonly value: unknown;
  }[];
  readonly predicate?: FilterOperator;
  readonly validation?: {
    readonly min?: number;
    readonly max?: number;
    readonly required?: boolean;
  };
}

export interface FilterFormData {
  readonly status?: string[];
  readonly start_date?: string;
  readonly end_date?: string;
  readonly index_search?: string;
  readonly sort?: string;
  readonly [key: string]: unknown;
}

// ============================================================================
// ASYNC STATE PATTERNS
// ============================================================================

export type AsyncState<T, E = string> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

export type ResourceState<T, E = ApiError> = AsyncState<T, E> & {
  readonly optimisticData?: T;
  readonly lastFetch?: number;
  readonly refetchOnMount?: boolean;
};

// ============================================================================
// FILE UPLOAD TYPES
// ============================================================================

export interface FileUpload {
  readonly uri: string;
  readonly type: string;
  readonly name: string;
  readonly size?: number;
}

export interface ImageUpload extends FileUpload {
  readonly width?: number;
  readonly height?: number;
  readonly quality?: number;
}

export interface UploadProgress {
  readonly fileId: string;
  readonly progress: number; // 0-100
  readonly status: 'pending' | 'uploading' | 'complete' | 'error';
  readonly error?: string;
}

// ============================================================================
// NOTIFICATION API TYPES
// ============================================================================

export interface NotificationPayload {
  readonly user_id: UserId;
  readonly title: string;
  readonly body: string;
  readonly notification_type: NotificationType;
  readonly data?: Record<string, unknown>;
  readonly priority?: 'low' | 'normal' | 'high' | 'urgent';
  readonly scheduled_for?: string;
  readonly expires_at?: string;
}

export interface CreateNotificationParams {
  readonly notification: NotificationPayload;
}

// Real-time notification events
export type NotificationEvent =
  | { type: 'notification_received'; payload: NotificationPayload }
  | { type: 'notification_read'; id: EntityId }
  | { type: 'notification_deleted'; id: EntityId }
  | { type: 'notifications_cleared' };

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface PaymentIntent {
  readonly intent_id?: string;
  readonly client_secret?: string;
  readonly customer_id?: string;
  readonly ephemeral_key?: string;
  readonly publishable_key?: string;
}

export interface PaymentMethod {
  readonly id: string;
  readonly type: 'card' | 'apple_pay' | 'google_pay';
  readonly last4?: string;
  readonly brand?: string;
  readonly exp_month?: number;
  readonly exp_year?: number;
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

// TODO: ADD HERE LATER

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: Record<string, string[]>;
  readonly warnings?: Record<string, string[]>;
}

export interface FieldValidator<T> {
  readonly validate: (value: T) => Promise<ValidationResult>;
  readonly sanitize?: (value: T) => T;
}

export interface FormState<T> {
  readonly values: T;
  readonly errors: Record<keyof T, string[]>;
  readonly touched: Record<keyof T, boolean>;
  readonly isSubmitting: boolean;
  readonly isValid: boolean;
  readonly isDirty: boolean;
}

// ============================================================================
// LEGACY ERROR TYPE
// ============================================================================

/**
 * @deprecated Use ApiError instead
 */
export interface CustomError {
  readonly response?: {
    readonly data: unknown;
  };
  readonly message?: string;
  readonly error?: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

export function isSuccessResponse<T>(
  result: ApiResult<T>
): result is Extract<ApiResult<T>, { success: true }> {
  return result.success;
}

export function isAsyncLoading<T>(
  state: AsyncState<T>
): state is Extract<AsyncState<T>, { status: 'loading' }> {
  return state.status === 'loading';
}

export function isAsyncSuccess<T>(
  state: AsyncState<T>
): state is Extract<AsyncState<T>, { status: 'success' }> {
  return state.status === 'success';
}

export function hasAsyncData<T>(
  state: AsyncState<T>
): state is Extract<AsyncState<T>, { status: 'success'; data: T }> {
  return state.status === 'success';
}

export function isAsyncError<T>(
  state: AsyncState<T>
): state is Extract<AsyncState<T>, { status: 'error' }> {
  return state.status === 'error';
}

export function isAsyncIdle<T>(
  state: AsyncState<T>
): state is Extract<AsyncState<T>, { status: 'idle' }> {
  return state.status === 'idle';
}

// ============================================================================
// WEBHOOK & EVENT TYPES
// ============================================================================

export interface WebhookPayload<T = unknown> {
  readonly id: string;
  readonly type: string;
  readonly data: T;
  readonly timestamp: string;
  readonly version: string;
}

export interface DomainEvent<T = unknown> {
  readonly id: string;
  readonly type: string;
  readonly aggregateId: EntityId;
  readonly version: number;
  readonly data: T;
  readonly metadata: {
    readonly userId?: UserId;
    readonly timestamp: string;
    readonly correlationId?: string;
  };
}

// ============================================================================
// CACHING TYPES
// ============================================================================

export interface CacheConfig {
  readonly ttl: number; // Time to live in milliseconds
  readonly maxSize: number; // Maximum cache size
  readonly strategy: 'lru' | 'fifo' | 'ttl';
}

export interface CacheEntry<T> {
  readonly data: T;
  readonly timestamp: number;
  readonly ttl: number;
  readonly hits: number;
}

// ============================================================================
// PERFORMANCE & MONITORING
// ============================================================================

export interface PerformanceMetric {
  readonly name: string;
  readonly value: number;
  readonly timestamp: number;
  readonly tags?: Record<string, string>;
}

export interface ErrorReport {
  readonly id: string;
  readonly message: string;
  readonly stack?: string;
  readonly userId?: UserId;
  readonly timestamp: number;
  readonly context: Record<string, unknown>;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface FeatureFlag {
  readonly key: string;
  readonly enabled: boolean;
  readonly rolloutPercentage?: number;
  readonly conditions?: Record<string, unknown>;
}

export interface AppConfig {
  readonly apiUrl: string;
  readonly apiVersion: string;
  readonly environment: 'development' | 'staging' | 'production';
  readonly features: FeatureFlag[];
  readonly analytics: {
    readonly trackingId?: string;
    readonly enabled: boolean;
  };
  readonly payments: {
    readonly stripePublishableKey: string;
    readonly applePay: boolean;
    readonly googlePay: boolean;
  };
}
