/**
 * OpenAvDB API Client
 *
 * Handles authenticated requests to the OpenAvDB REST API.
 * Used by all MCP tools to fetch data.
 */

import { config } from './config.js';
import { getIdToken, isAuthenticated } from './auth.js';

export interface ApiResponse<T = unknown> {
  data: T;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
    response_time_ms?: number;
    [key: string]: unknown;
  };
  links?: {
    self?: string;
    next?: string | null;
    prev?: string | null;
  };
  _links?: Record<string, string>;
  _included?: Record<string, unknown>;
  _meta?: Record<string, unknown>;
}

export interface ApiError {
  error: string;
  code: string;
  status: number;
  suggestions?: {
    hint?: string;
    example?: string;
    docs?: string;
    did_you_mean?: string[];
    valid_values?: string[];
  };
}

export class ApiClientError extends Error {
  status: number;
  code: string;
  suggestions?: ApiError['suggestions'];

  constructor(error: ApiError) {
    super(error.error);
    this.name = 'ApiClientError';
    this.status = error.status;
    this.code = error.code;
    this.suggestions = error.suggestions;
  }
}

export class AuthenticationRequiredError extends Error {
  constructor() {
    super('Authentication required. Please sign in first.');
    this.name = 'AuthenticationRequiredError';
  }
}

/**
 * Make a request to the OpenAvDB API
 * Authentication is optional for most read endpoints (only watchlists require auth)
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit & { requireAuth?: boolean } = {}
): Promise<ApiResponse<T>> {
  const { requireAuth = false, ...fetchOptions } = options;

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Add auth header if authenticated or required
  const token = await getIdToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (requireAuth) {
    throw new AuthenticationRequiredError();
  }

  // Build URL
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${config.apiBaseUrl}/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Make request with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.requestTimeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        ...headers,
        ...fetchOptions.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiClientError(data as ApiError);
    }

    return data as ApiResponse<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get a single resource by ID
 */
export async function get<T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: { requireAuth?: boolean }
): Promise<ApiResponse<T>> {
  const url = buildUrl(endpoint, params);
  return apiRequest<T>(url, options);
}

/**
 * List resources with pagination
 */
export async function list<T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: { requireAuth?: boolean }
): Promise<ApiResponse<T[]>> {
  const url = buildUrl(endpoint, params);
  return apiRequest<T[]>(url, options);
}

/**
 * Post data to an endpoint (always requires auth)
 */
export async function post<T = unknown>(
  endpoint: string,
  body: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    requireAuth: true,
  });
}

/**
 * Build URL with query parameters
 */
function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return endpoint;

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

// Convenience methods for specific resource types

export const airports = {
  list: (params?: {
    limit?: number;
    offset?: number;
    state?: string;
    city?: string;
    min_runway?: number;
    towered?: boolean;
    fbo_count?: number;
    min_fbo_count?: number;
    max_fbo_count?: number;
    icao?: string;
    include?: string;
    describe_fields?: boolean;
  }) => list('/airports', params as Record<string, string | number | boolean | undefined>),

  get: (icao: string, params?: { include?: string; describe_fields?: boolean }) =>
    get(`/airports/${icao.toUpperCase()}`, params as Record<string, string | number | boolean | undefined>),

  fbos: (icao: string) => list(`/airports/${icao.toUpperCase()}/fbos`),
};

export const fbos = {
  list: (params?: {
    limit?: number;
    offset?: number;
    state?: string;
    airport?: string;
    brand?: string;
    towered?: boolean;
  }) => list('/fbos', params as Record<string, string | number | boolean | undefined>),

  get: (id: string) => get(`/fbos/${id}`),

  fuel: (params?: {
    limit?: number;
    offset?: number;
    min_price?: number;
    max_price?: number;
  }) => list('/fbos/fuel', params as Record<string, string | number | boolean | undefined>),
};

export const aircraft = {
  list: (params?: {
    limit?: number;
    offset?: number;
    type?: string;
    manufacturer?: string;
    based_airport?: string;
    registrant?: string;
  }) => list('/aircraft', params as Record<string, string | number | boolean | undefined>),

  get: (registration: string) => get(`/aircraft/${registration.toUpperCase()}`),
};

export const charter = {
  companies: (params?: {
    limit?: number;
    offset?: number;
    certificate_type?: string;
    state?: string;
  }) => list('/charter/companies', params as Record<string, string | number | boolean | undefined>),

  getCompany: (id: string) => get(`/charter/companies/${id}`),

  brokers: (params?: {
    limit?: number;
    offset?: number;
  }) => list('/charter/brokers', params as Record<string, string | number | boolean | undefined>),

  getBroker: (id: string) => get(`/charter/brokers/${id}`),
};

export const flightSchools = {
  list: (params?: {
    limit?: number;
    offset?: number;
    state?: string;
    airport?: string;
  }) => list('/flight-schools', params as Record<string, string | number | boolean | undefined>),

  get: (id: string) => get(`/flight-schools/${id}`),
};

export const fractional = {
  providers: (params?: {
    limit?: number;
    offset?: number;
  }) => list('/fractional', params as Record<string, string | number | boolean | undefined>),

  getProvider: (id: string) => get(`/fractional/${id}`),

  // Note: fractional aircraft endpoint not yet implemented in API
  // Aircraft are in the fleet collection but not filterable by fractional owner yet
};

export const hangars = {
  list: (params?: {
    limit?: number;
    offset?: number;
    airport?: string;
    min_sqft?: number;
    max_sqft?: number;
    available?: boolean;
  }) => list('/hangars', params as Record<string, string | number | boolean | undefined>),

  get: (id: string) => get(`/hangars/${id}`),
};

export const fleet = {
  list: (params?: {
    limit?: number;
    offset?: number;
    airport?: string;
    aircraft_type?: string;
    owner_type?: string;
  }) => list('/fleet', params as Record<string, string | number | boolean | undefined>),

  stats: (params?: { airport?: string; aircraft_type?: string }) =>
    get('/fleet/stats', params as Record<string, string | number | boolean | undefined>),
};

export const activity = {
  list: (params?: {
    limit?: number;
    offset?: number;
    airport?: string;
    operation_type?: string;
    start_date?: string;
    end_date?: string;
  }) => list('/activity', params as Record<string, string | number | boolean | undefined>),

  stats: (params?: { airport?: string; period?: string }) =>
    get('/activity/stats', params as Record<string, string | number | boolean | undefined>),
};

export const watchlists = {
  list: () => list('/watchlists', undefined, { requireAuth: true }),

  get: (id: string) => get(`/watchlists/${id}`, undefined, { requireAuth: true }),

  aircraft: (id: string) => list(`/watchlists/${id}/aircraft`, undefined, { requireAuth: true }),

  create: (data: { name: string; description?: string }) =>
    post('/watchlists', data),

  addAircraft: (watchlistId: string, registration: string) =>
    post(`/watchlists/${watchlistId}/aircraft`, { registration }),
};
