/**
 * OpenAvDB API Client
 *
 * Handles authenticated requests to the OpenAvDB REST API.
 * Used by all MCP tools to fetch data.
 */
import { config } from './config.js';
import { getIdToken } from './auth.js';
export class ApiClientError extends Error {
    status;
    code;
    suggestions;
    constructor(error) {
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
export async function apiRequest(endpoint, options = {}) {
    const { requireAuth = false, ...fetchOptions } = options;
    // Build headers
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    // Add auth header if authenticated or required
    const token = await getIdToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    else if (requireAuth) {
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
            throw new ApiClientError(data);
        }
        return data;
    }
    finally {
        clearTimeout(timeoutId);
    }
}
/**
 * Get a single resource by ID
 */
export async function get(endpoint, params, options) {
    const url = buildUrl(endpoint, params);
    return apiRequest(url, options);
}
/**
 * List resources with pagination
 */
export async function list(endpoint, params, options) {
    const url = buildUrl(endpoint, params);
    return apiRequest(url, options);
}
/**
 * Post data to an endpoint (always requires auth)
 */
export async function post(endpoint, body) {
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        requireAuth: true,
    });
}
/**
 * Build URL with query parameters
 */
function buildUrl(endpoint, params) {
    if (!params)
        return endpoint;
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
    list: (params) => list('/airports', params),
    get: (icao, params) => get(`/airports/${icao.toUpperCase()}`, params),
    fbos: (icao) => list(`/airports/${icao.toUpperCase()}/fbos`),
};
export const fbos = {
    list: (params) => list('/fbos', params),
    get: (id) => get(`/fbos/${id}`),
    fuel: (params) => list('/fbos/fuel', params),
};
export const aircraft = {
    list: (params) => list('/aircraft', params),
    get: (registration) => get(`/aircraft/${registration.toUpperCase()}`),
};
export const charter = {
    companies: (params) => list('/charter/companies', params),
    getCompany: (id) => get(`/charter/companies/${id}`),
    brokers: (params) => list('/charter/brokers', params),
    getBroker: (id) => get(`/charter/brokers/${id}`),
};
export const flightSchools = {
    list: (params) => list('/flight-schools', params),
    get: (id) => get(`/flight-schools/${id}`),
};
export const fractional = {
    providers: (params) => list('/fractional', params),
    getProvider: (id) => get(`/fractional/${id}`),
    // Note: fractional aircraft endpoint not yet implemented in API
    // Aircraft are in the fleet collection but not filterable by fractional owner yet
};
export const hangars = {
    list: (params) => list('/hangars', params),
    get: (id) => get(`/hangars/${id}`),
};
export const fleet = {
    list: (params) => list('/fleet', params),
    stats: (params) => get('/fleet/stats', params),
};
export const activity = {
    list: (params) => list('/activity', params),
    stats: (params) => get('/activity/stats', params),
};
export const watchlists = {
    list: () => list('/watchlists', undefined, { requireAuth: true }),
    get: (id) => get(`/watchlists/${id}`, undefined, { requireAuth: true }),
    aircraft: (id) => list(`/watchlists/${id}/aircraft`, undefined, { requireAuth: true }),
    create: (data) => post('/watchlists', data),
    addAircraft: (watchlistId, registration) => post(`/watchlists/${watchlistId}/aircraft`, { registration }),
};
//# sourceMappingURL=api-client.js.map