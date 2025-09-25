// Constants
const API_BASE_URL = '/api/v1';

// Types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface Endpoint {
  readonly endpoint: string;
  readonly method: HttpMethod;
}

interface CrudEndpointsConfig {
  resource: string;
  profileScoped?: boolean;
}

interface CustomActionConfig<T extends string> {
  name: T;
  method: HttpMethod;
}

// Utility objects
const URLBuilder = {
  resource: (base: string, id?: string): string =>
    id ? `${base}/${id}` : base,

  action: (base: string, id: string, action: string): string =>
    `${base}/${id}/${action}`,

  profileScoped: (resource: string, profileId?: string): string =>
    profileId
      ? `${API_BASE_URL}/profiles/${profileId}/${resource}`
      : `${API_BASE_URL}/${resource}`,
} as const;

const EndpointFactory = {
  create: (endpoint: string, method: HttpMethod): Endpoint => ({
    endpoint,
    method,
  }),

  createCrudEndpoints: ({
    resource,
    profileScoped = false,
  }: CrudEndpointsConfig) => ({
    index: (profileId?: string): Endpoint =>
      EndpointFactory.create(
        profileScoped
          ? `${API_BASE_URL}/profiles/${profileId}/${resource}`
          : `${API_BASE_URL}/${resource}`,
        'GET'
      ),
    create: (profileId?: string): Endpoint =>
      EndpointFactory.create(
        profileScoped
          ? `${API_BASE_URL}/profiles/${profileId}/${resource}`
          : `${API_BASE_URL}/${resource}`,
        'POST'
      ),
    show: (id: string): Endpoint =>
      EndpointFactory.create(
        URLBuilder.resource(`${API_BASE_URL}/${resource}`, id),
        'GET'
      ),
    update: (id: string): Endpoint =>
      EndpointFactory.create(
        URLBuilder.resource(`${API_BASE_URL}/${resource}`, id),
        'PATCH'
      ),
    destroy: (id: string): Endpoint =>
      EndpointFactory.create(
        URLBuilder.resource(`${API_BASE_URL}/${resource}`, id),
        'DELETE'
      ),
  }),

  createCustomActions: <T extends string>(
    resource: string,
    actions: CustomActionConfig<T>[],
    isProfileScoped = false
  ): Record<T, (id: string) => Endpoint> => {
    const baseUrl = isProfileScoped
      ? `${API_BASE_URL}/profiles/{profileId}/${resource}`
      : `${API_BASE_URL}/${resource}`;

    return actions.reduce(
      (acc, { name, method }) => ({
        ...acc,
        [name]: (id: string): Endpoint =>
          EndpointFactory.create(URLBuilder.action(baseUrl, id, name), method),
      }),
      {} as Record<T, (id: string) => Endpoint>
    );
  },
} as const;

// API Endpoints definition
export const APIEndpoints = {
  auth: {
    appleNativeAuth: EndpointFactory.create(
      `${API_BASE_URL}/oauth/apple_native_auth`,
      'POST'
    ),
    authorizationUrl: EndpointFactory.create(
      `${API_BASE_URL}/oauth/authorization_url`,
      'GET'
    ),
    deleteAccount: EndpointFactory.create(`/users/registration`, 'DELETE'),
    exchange_token: EndpointFactory.create(
      `${API_BASE_URL}/oauth/exchange_token`,
      'GET'
    ),
    login: EndpointFactory.create(`/users/login`, 'POST'),
    logout: EndpointFactory.create(`/users/logout`, 'DELETE'),
    register: EndpointFactory.create(`/users/registration`, 'POST'),
    refreshToken: EndpointFactory.create(
      `${API_BASE_URL}/refresh_token`,
      'POST'
    ),
  },
  addresses: EndpointFactory.createCrudEndpoints({
    resource: 'addresses',
    profileScoped: true,
  }),
  bookmarks: {
    index: (type: string): Endpoint =>
      EndpointFactory.create(`${API_BASE_URL}/bookmarks/${type}`, 'GET'),
  },
  categories: {
    index: (): Endpoint =>
      EndpointFactory.create(`${API_BASE_URL}/categories`, 'GET'),
    show: (id: string): Endpoint =>
      EndpointFactory.create(
        URLBuilder.resource(`${API_BASE_URL}/categories`, id),
        'GET'
      ),
  },
  notifications: {
    ...EndpointFactory.createCrudEndpoints({ resource: 'notifications' }),
    destroyAll: EndpointFactory.create(
      `${API_BASE_URL}/notifications/destroy_all`,
      'DELETE'
    ),
    markAllAsRead: EndpointFactory.create(
      `${API_BASE_URL}/notifications/mark_all_as_read`,
      'PATCH'
    ),
    markAsRead: (id: string): Endpoint =>
      EndpointFactory.create(
        URLBuilder.action(`${API_BASE_URL}/notifications`, id, 'mark_as_read'),
        'PATCH'
      ),
    registerDevice: EndpointFactory.create(
      `${API_BASE_URL}/notifications/register_device`,
      'POST'
    ),
    unreadCount: EndpointFactory.create(
      `${API_BASE_URL}/notifications/unread_count`,
      'GET'
    ),
    unRegisterDevice: EndpointFactory.create(
      `${API_BASE_URL}/notifications/unregister_device`,
      'DELETE'
    ),
  },
  payments: {
    create: (bookingId: string): Endpoint =>
      EndpointFactory.create(
        `${API_BASE_URL}/bookings/${bookingId}/payments`,
        'POST'
      ),
  },
  profiles: {
    ...EndpointFactory.createCrudEndpoints({ resource: 'profiles' }),
    deleteAvatar: (id: string): Endpoint =>
      EndpointFactory.create(
        URLBuilder.action(`${API_BASE_URL}/profiles`, id, 'delete_avatar'),
        'DELETE'
      ),
    messageProfile: (id: string): Endpoint =>
      EndpointFactory.create(
        URLBuilder.action(`${API_BASE_URL}/profiles`, id, 'message_profile'),
        'GET'
      ),
    verify: (id: string): Endpoint =>
      EndpointFactory.create(
        URLBuilder.action(`${API_BASE_URL}/profiles`, id, 'verify'),
        'POST'
      ),
    toggleBookmark: (id: string): Endpoint =>
      EndpointFactory.create(
        URLBuilder.action(`${API_BASE_URL}/profiles`, id, 'toggle_bookmark'),
        'POST'
      ),
  },
  reviews: {
    ...EndpointFactory.createCrudEndpoints({
      resource: 'reviews',
      profileScoped: true,
    }),
    vote: (profileId: string, id: string): Endpoint =>
      EndpointFactory.create(
        URLBuilder.action(
          `${API_BASE_URL}/profiles/${profileId}/reviews`,
          id,
          'vote'
        ),
        'POST'
      ),
  },
  reports: {
    ...EndpointFactory.createCrudEndpoints({ resource: 'reports' }),
    close: (id: string): Endpoint =>
      EndpointFactory.create(
        URLBuilder.action(`${API_BASE_URL}/reports`, id, 'close'),
        'PATCH'
      ),
    resolve: (id: string): Endpoint =>
      EndpointFactory.create(
        URLBuilder.action(`${API_BASE_URL}/reports`, id, 'resolve'),
        'PATCH'
      ),
  },
  routes: {
    findOrCreate: EndpointFactory.create(
      `${API_BASE_URL}/routes/find_or_create`,
      'POST'
    ),
  },
  stripe: {
    loginLink: EndpointFactory.create(
      `${API_BASE_URL}/stripe/login_link`,
      'GET'
    ),
    onboarding: EndpointFactory.create(
      `${API_BASE_URL}/stripe/onboarding`,
      'POST'
    ),
  },
} as const;

export type APIEndpointsType = typeof APIEndpoints;
