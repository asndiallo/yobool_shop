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

export type TransportModeValue = `${TransportMode}`;

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
// ROUTE DOMAIN
// ============================================================================

export interface Route {
  readonly id: EntityId;
  readonly type: 'route';
  readonly attributes: RouteAttributes;
  readonly relationships?: {
    readonly reverse_route?: {
      readonly data: {
        readonly id: EntityId;
        readonly type: 'route';
      } | null;
    };
  };
}

export interface RouteAttributes {
  readonly departure_city: string;
  readonly departure_state: string;
  readonly departure_country: string;
  readonly departure_lat: number | null;
  readonly departure_lon: number | null;
  readonly destination_city: string;
  readonly destination_state: string;
  readonly destination_country: string;
  readonly destination_lat: number | null;
  readonly destination_lon: number | null;
  readonly duration_air: number | null;
  readonly duration_sea: number | null;
  readonly duration_road: number | null;
  readonly duration_rail: number | null;
  readonly distance_km: number | null;
  readonly transport_modes: TransportModeValue[];
  readonly base_price_per_kg: string | null;
  readonly base_price_per_cbm: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface RouteInput {
  readonly departure_city: string;
  readonly departure_state: string;
  readonly departure_country: string;
  readonly departure_lat?: number;
  readonly departure_lon?: number;
  readonly destination_city: string;
  readonly destination_state: string;
  readonly destination_country: string;
  readonly destination_lat?: number;
  readonly destination_lon?: number;
}

// ============================================================================
// USER DOMAIN
// ============================================================================

export interface User {
  readonly id: UserId;
  readonly type: 'user' | 'profile' | 'mini_profile';
  readonly attributes: UserAttributes;
  readonly relationships?: UserRelationships;
}

export interface UserAttributes {
  // Core identity
  readonly first_name: string;
  readonly last_name: string;
  readonly full_name: string;
  readonly avatar_url: string | null;
  readonly bio?: string;
  readonly role: UserRole;

  // Contact & Location
  readonly email?: string; // Only in ProfileSerializer
  readonly phone_number?: string; // Only in ProfileSerializer
  readonly country: string;

  // Trust & Verification
  readonly verified_at: string | null;
  readonly is_verified: boolean;
  readonly yobool_score: number;
  readonly successful_deliveries: number;
  readonly average_rating: number | null;
  readonly reviews_count: number;

  // Preferences (ProfileSerializer only)
  readonly currency: Currency;
  readonly locale?: Locale; // Only in ProfileSerializer
  readonly timezone?: string; // Only in ProfileSerializer
  readonly measurement_system?: 'metric' | 'imperial'; // Only in ProfileSerializer

  // Profile status
  readonly profile_complete: boolean;
  readonly member_since: string; // Date ISO string

  // Stripe integration
  readonly can_accept_bookings: boolean;
  readonly stripe_account_status?: string | null; // Only in ProfileSerializer
  readonly stripe_login_link?: string | null; // Only in ProfileSerializer

  // Referral system (ProfileSerializer only)
  readonly referral_code?: string;
  readonly referred_users_count?: number;

  // Notifications (ProfileSerializer only)
  readonly unread_notifications_count?: number;
  readonly push_token?: string | null;

  // Additional metadata
  readonly birthday?: string | null; // Only in ProfileSerializer
  readonly created_at?: string;
  readonly updated_at?: string;
}

export interface UserRelationships {
  readonly addresses?: {
    readonly data: { readonly id: EntityId; readonly type: 'address' }[];
  };
  readonly reviews?: {
    readonly data: { readonly id: EntityId; readonly type: 'review' }[];
  };
  readonly trips?: {
    readonly data: { readonly id: EntityId; readonly type: 'trip' }[];
  };
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
// SHOPPING ORDER DOMAIN
// ============================================================================

export type ShoppingOrderStatus =
  | 'draft'
  | 'quote_requested'
  | 'quotes_received'
  | 'quote_accepted'
  | 'purchased'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface ShoppingOrder {
  readonly id: EntityId;
  readonly type: 'shopping_order';
  readonly attributes: ShoppingOrderAttributes;
  readonly relationships?: {
    readonly user?: {
      readonly data: { readonly id: UserId; readonly type: 'profile' };
    };
    readonly route?: {
      readonly data: { readonly id: EntityId; readonly type: 'route' };
    };
    readonly product?: {
      readonly data: { readonly id: EntityId; readonly type: 'product' } | null;
    };
    readonly delivery_address?: {
      readonly data: { readonly id: EntityId; readonly type: 'address' };
    };
    readonly accepted_quote?: {
      readonly data: { readonly id: EntityId; readonly type: 'quote' } | null;
    };
    readonly quotes?: {
      readonly data: { readonly id: EntityId; readonly type: 'quote' }[];
    };
  };
}

export interface ShoppingOrderAttributes {
  readonly product_name: string | null;
  readonly product_url: string;
  readonly quantity: number;
  readonly special_instructions: string | null;
  readonly status: ShoppingOrderStatus;
  readonly confirmation_code: string | null;
  readonly tracking_code: string | null;
  readonly payment_method: string;
  readonly estimated_product_price: string;
  readonly estimated_traveler_fee: string;
  readonly estimated_platform_fee: string;
  readonly estimated_processing_fee: string;
  readonly estimated_total_price: string;
  readonly currency: Currency;
  readonly created_at: string;
  readonly updated_at: string;
  readonly status_flags?: {
    readonly is_draft: boolean;
    readonly is_quote_requested: boolean;
    readonly is_quotes_received: boolean;
    readonly is_quote_accepted: boolean;
    readonly is_purchased: boolean;
    readonly is_in_transit: boolean;
    readonly is_delivered: boolean;
    readonly is_cancelled: boolean;
    readonly is_refunded: boolean;
  };
  readonly quote_stats?: {
    readonly total_count: number;
    readonly has_quotes: boolean;
    readonly best_quote_total: number | null;
  };
}

export interface ShoppingOrderInput {
  readonly product_url: string;
  readonly product_name?: string;
  readonly estimated_product_price?: number;
  readonly quantity?: number;
  readonly currency?: Currency;
  readonly payment_method?: string;
  readonly special_instructions?: string;
  readonly product_id?: EntityId;
  readonly route_id: EntityId;
  readonly delivery_address_attributes?: AddressInput;
}

// ============================================================================
// TRIP DOMAIN
// ============================================================================

export type TripStatus =
  | 'planned'
  | 'active'
  | 'in_transit'
  | 'completed'
  | 'cancelled';

export interface Trip {
  readonly id: EntityId;
  readonly type: 'trip';
  readonly attributes: TripAttributes;
  readonly relationships?: {
    readonly user?: {
      readonly data: { readonly id: UserId; readonly type: 'profile' };
    };
    readonly route?: {
      readonly data: { readonly id: EntityId; readonly type: 'route' };
    };
    readonly shopping_orders?: {
      readonly data: {
        readonly id: EntityId;
        readonly type: 'shopping_order';
      }[];
    };
  };
}

export interface TripAttributes {
  readonly departure_at: string;
  readonly arrival_at: string;
  readonly notes: string | null;
  readonly status: TripStatus;
  readonly created_at: string;
  readonly updated_at: string;
  readonly route_info?: {
    readonly departure_city: string;
    readonly departure_country: string;
    readonly destination_city: string;
    readonly destination_country: string;
    readonly distance_km: number | null;
    readonly is_domestic: boolean;
  };
  readonly status_flags?: {
    readonly is_planned: boolean;
    readonly is_active: boolean;
    readonly is_in_transit: boolean;
    readonly is_completed: boolean;
    readonly is_cancelled: boolean;
  };
  readonly shopping_availability?: {
    readonly available_for_orders: boolean;
    readonly departure_soon: boolean;
    readonly has_departed: boolean;
    readonly can_take_orders: boolean;
  };
  readonly timing?: {
    readonly days_until_departure: number | null;
    readonly trip_duration_days: number | null;
    readonly is_past_departure: boolean;
    readonly is_past_arrival: boolean;
  };
}

export interface TripInput {
  readonly route_id: EntityId;
  readonly departure_at: string;
  readonly arrival_at: string;
  readonly notes?: string;
  readonly status?: TripStatus;
}

export interface RoundTripInput {
  readonly route_id: EntityId;
  readonly outbound_departure_at: string;
  readonly outbound_arrival_at: string;
  readonly return_departure_at: string;
  readonly return_arrival_at: string;
  readonly notes?: string;
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

// ============================================================================
// REVIEW DOMAIN
// ============================================================================

export interface Review {
  readonly id: EntityId;
  readonly type: 'review';
  readonly attributes: ReviewAttributes;
  readonly relationships?: {
    readonly reviewer?: {
      readonly data: { readonly id: UserId; readonly type: 'profile' };
    };
    readonly reviewable?: {
      readonly data: { readonly id: EntityId; readonly type: string };
    };
  };
}

export interface ReviewAttributes {
  readonly rating: number;
  readonly text: string | null;
  readonly votes_count: number;
  readonly vote_count: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ReviewInput {
  readonly rating: number;
  readonly comment?: string;
}

// ============================================================================
// QUOTE DOMAIN
// ============================================================================

export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface Quote {
  readonly id: EntityId;
  readonly type: 'quote';
  readonly attributes: QuoteAttributes;
  readonly relationships?: {
    readonly traveler?: {
      readonly data: { readonly id: UserId; readonly type: 'profile' };
    };
    readonly trip?: {
      readonly data: { readonly id: EntityId; readonly type: 'trip' };
    };
    readonly shopping_order?: {
      readonly data: { readonly id: EntityId; readonly type: 'shopping_order' };
    };
  };
}

export interface QuoteAttributes {
  readonly product_price: string;
  readonly traveler_fee: string;
  readonly platform_fee: string;
  readonly processing_fee: string;
  readonly total_price: string;
  readonly currency: Currency;
  readonly status: QuoteStatus;
  readonly notes: string | null;
  readonly expires_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface QuoteInput {
  readonly product_price: number;
  readonly traveler_fee: number;
  readonly notes?: string;
  readonly expires_at?: string;
}

// ============================================================================
// PRODUCT DOMAIN
// ============================================================================

export type ProductStatus = 'draft' | 'published' | 'archived' | 'featured';

export interface Product {
  readonly id: EntityId;
  readonly type: 'product';
  readonly attributes: ProductAttributes;
  readonly relationships?: {
    readonly store?: {
      readonly data: { readonly id: EntityId; readonly type: 'store' };
    };
    readonly category?: {
      readonly data: { readonly id: EntityId; readonly type: 'category' };
    };
  };
}

export interface ProductAttributes {
  readonly name: string;
  readonly description: string | null;
  readonly price: string;
  readonly currency: Currency;
  readonly status: ProductStatus;
  readonly image_url: string | null;
  readonly external_url: string | null;
  readonly is_featured: boolean;
  readonly view_count: number;
  readonly bookmark_count: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ProductInput {
  readonly name: string;
  readonly description?: string;
  readonly price: number;
  readonly currency?: Currency;
  readonly status?: ProductStatus;
  readonly external_url?: string;
  readonly category_id?: EntityId;
}

// ============================================================================
// NOTIFICATION DOMAIN (Enhanced)
// ============================================================================

export interface NotificationDevice {
  readonly push_token: string;
  readonly platform: 'ios' | 'android' | 'web';
  readonly device_id?: string;
}
