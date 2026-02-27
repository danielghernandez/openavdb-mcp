/**
 * OpenAvDB API Client
 *
 * Handles authenticated requests to the OpenAvDB REST API.
 * Used by all MCP tools to fetch data.
 */
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
export declare class ApiClientError extends Error {
    status: number;
    code: string;
    suggestions?: ApiError['suggestions'];
    constructor(error: ApiError);
}
export declare class AuthenticationRequiredError extends Error {
    constructor();
}
/**
 * Make a request to the OpenAvDB API
 * Authentication is optional for most read endpoints (only watchlists require auth)
 */
export declare function apiRequest<T = unknown>(endpoint: string, options?: RequestInit & {
    requireAuth?: boolean;
}): Promise<ApiResponse<T>>;
/**
 * Get a single resource by ID
 */
export declare function get<T = unknown>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, options?: {
    requireAuth?: boolean;
}): Promise<ApiResponse<T>>;
/**
 * List resources with pagination
 */
export declare function list<T = unknown>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, options?: {
    requireAuth?: boolean;
}): Promise<ApiResponse<T[]>>;
/**
 * Post data to an endpoint (always requires auth)
 */
export declare function post<T = unknown>(endpoint: string, body: unknown): Promise<ApiResponse<T>>;
export declare const airports: {
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
    }) => Promise<ApiResponse<unknown[]>>;
    get: (icao: string, params?: {
        include?: string;
        describe_fields?: boolean;
    }) => Promise<ApiResponse<unknown>>;
    fbos: (icao: string) => Promise<ApiResponse<unknown[]>>;
};
export declare const fbos: {
    list: (params?: {
        limit?: number;
        offset?: number;
        airport?: string;
        brand?: string;
    }) => Promise<ApiResponse<unknown[]>>;
    get: (id: string) => Promise<ApiResponse<unknown>>;
    fuel: (params?: {
        limit?: number;
        offset?: number;
        min_price?: number;
        max_price?: number;
    }) => Promise<ApiResponse<unknown[]>>;
};
export declare const aircraft: {
    list: (params?: {
        limit?: number;
        offset?: number;
        type?: string;
        manufacturer?: string;
        based_airport?: string;
    }) => Promise<ApiResponse<unknown[]>>;
    get: (registration: string) => Promise<ApiResponse<unknown>>;
};
export declare const charter: {
    companies: (params?: {
        limit?: number;
        offset?: number;
        certificate_type?: string;
        state?: string;
    }) => Promise<ApiResponse<unknown[]>>;
    getCompany: (id: string) => Promise<ApiResponse<unknown>>;
    brokers: (params?: {
        limit?: number;
        offset?: number;
    }) => Promise<ApiResponse<unknown[]>>;
    getBroker: (id: string) => Promise<ApiResponse<unknown>>;
};
export declare const flightSchools: {
    list: (params?: {
        limit?: number;
        offset?: number;
        state?: string;
        airport?: string;
    }) => Promise<ApiResponse<unknown[]>>;
    get: (id: string) => Promise<ApiResponse<unknown>>;
};
export declare const fractional: {
    providers: (params?: {
        limit?: number;
        offset?: number;
    }) => Promise<ApiResponse<unknown[]>>;
    getProvider: (id: string) => Promise<ApiResponse<unknown>>;
};
export declare const hangars: {
    list: (params?: {
        limit?: number;
        offset?: number;
        airport?: string;
        min_sqft?: number;
        max_sqft?: number;
        available?: boolean;
    }) => Promise<ApiResponse<unknown[]>>;
    get: (id: string) => Promise<ApiResponse<unknown>>;
};
export declare const fleet: {
    list: (params?: {
        limit?: number;
        offset?: number;
        airport?: string;
        aircraft_type?: string;
        owner_type?: string;
    }) => Promise<ApiResponse<unknown[]>>;
    stats: (params?: {
        airport?: string;
        aircraft_type?: string;
    }) => Promise<ApiResponse<unknown>>;
};
export declare const activity: {
    list: (params?: {
        limit?: number;
        offset?: number;
        airport?: string;
        operation_type?: string;
        start_date?: string;
        end_date?: string;
    }) => Promise<ApiResponse<unknown[]>>;
    stats: (params?: {
        airport?: string;
        period?: string;
    }) => Promise<ApiResponse<unknown>>;
};
export declare const watchlists: {
    list: () => Promise<ApiResponse<unknown[]>>;
    get: (id: string) => Promise<ApiResponse<unknown>>;
    aircraft: (id: string) => Promise<ApiResponse<unknown[]>>;
    create: (data: {
        name: string;
        description?: string;
    }) => Promise<ApiResponse<unknown>>;
    addAircraft: (watchlistId: string, registration: string) => Promise<ApiResponse<unknown>>;
};
//# sourceMappingURL=api-client.d.ts.map