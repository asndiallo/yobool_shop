// ============================================================================
// CORE DOMAIN TYPES - Foundation types used across the app
// ============================================================================

// Brand types for compile-time safety
export type UserId = string & { readonly __brand: 'UserId' };
export type EntityId = string & { readonly __brand: 'EntityId' };
export type AuthToken = string & { readonly __brand: 'AuthToken' };

// ============================================================================
// ENUMS - Application constants
// ============================================================================

export enum UserRole {
  STANDARD = 'standard',
  PRO = 'pro',
  ADMIN = 'admin',
}

export enum Currency {
  EUR = 'EUR',
  USD = 'USD',
  XOF = 'XOF',
}

export enum Unit {
  KG = 'kg',
  LB = 'lb',
  CBM = 'cbm',
  CFT = 'cft',
}

export enum Locale {
  EN = 'en',
  FR = 'fr',
}

// ============================================================================
// I18N TYPES
// ============================================================================

export type LocaleKey = keyof typeof Locale;
export type LocaleValue = `${Locale}`;

export interface I18nConfig {
  readonly defaultLocale: LocaleValue;
  readonly fallbackLocale: LocaleValue;
  readonly supportedLocales: readonly LocaleValue[];
}

export enum TransportMode {
  ROAD = 'road',
  AIR = 'air',
  SEA = 'sea',
  RAIL = 'rail',
}

export enum NotificationType {
  SYSTEM = 'system',
  PAYMENT_RECEIVED = 'payment_received',
  MESSAGE = 'message',
  DISPUTE_UPDATE = 'dispute_update',
  DISPUTE_RESOLUTION = 'dispute_resolution',
  REVIEW_RECEIVED = 'review_received',
}

export enum DisputeStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

// ============================================================================
// VALUE OBJECTS - Immutable data structures
// ============================================================================

export interface Money {
  readonly value: number;
  readonly currency: Currency;
}

export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface Address {
  readonly id: EntityId;
  readonly type: 'address';
  readonly attributes: {
    readonly full_address: string;
    readonly shortened_address: string;
    readonly address_types: string[];
    readonly created_at: string;
    readonly updated_at: string;
  };
}

export interface AddressInput {
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly postal_code?: string;
  readonly state?: string;
  readonly country: string;
  readonly address_types?: ('handover_address' | 'delivery_address')[];
}

export interface FormattedPlace {
  readonly city: string;
  readonly region: string;
  readonly countryName: string;
  readonly line1?: string;
  readonly postal_code?: string;
  readonly state?: string;
  readonly country?: string;
  readonly latitude?: number;
  readonly longitude?: number;
}

// ============================================================================
// USER DOMAIN
// ============================================================================

export interface User {
  readonly id: UserId;
  readonly type: 'profile' | 'mini_profile';
  readonly attributes: UserAttributes;
}

export interface UserAttributes {
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
  readonly bio?: string;
  readonly phone_number?: string;
  readonly avatar_url: string | null;
  readonly currency: Currency;
  readonly locale: Locale;
  readonly country: string;
  readonly role: UserRole;
  readonly verified_at: string | null;
  readonly profile_complete: boolean;
  readonly push_token: string | null;
  readonly yobool_score?: number;
  readonly successful_deliveries?: number;
  readonly average_rating?: number;
  readonly reviews_count?: number;
  readonly stripe_account_status?: string | null;
  readonly stripe_login_link?: string | null;
  readonly wave_account_verified_at?: string | null;
  readonly wave_phone_number?: string | null;
  readonly birthday: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

// ============================================================================
// NOTIFICATION DOMAIN
// ============================================================================

export interface NotificationData {
  readonly id: EntityId;
  readonly type: 'notification';
  readonly attributes: {
    readonly title: string;
    readonly body: string;
    readonly notification_type: NotificationType;
    readonly notifiable_type: string;
    readonly notifiable_id: string;
    readonly read_at: string | null;
    readonly created_at: string;
    readonly updated_at: string;
  };
  readonly relationships: {
    readonly user: {
      readonly data: {
        readonly id: UserId;
        readonly type: 'profile';
      };
    };
  };
}

export interface ReminderNotification {
  readonly id: string;
  readonly type: NotificationType;
  readonly referenceId: string;
  readonly scheduledFor: string;
  readonly deadline: string;
  readonly notificationIds: string[];
  readonly isShipper: boolean;
  readonly sentAt?: string | null;
  readonly handledAt?: string | null;
  readonly title?: string;
  readonly body?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type QueryValue =
  | string
  | number
  | boolean
  | Date
  | (string | number | boolean)[]
  | undefined;
export type QueryParams = Record<
  string,
  QueryValue | Record<string, QueryValue>
>;

// Deep partial for nested updates
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Make specific fields required
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Make specific fields optional
export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// Recursive partial for complex forms
export type PartialRecursive<T> = {
  [K in keyof T]?: T[K] extends object ? PartialRecursive<T[K]> : T[K];
};
