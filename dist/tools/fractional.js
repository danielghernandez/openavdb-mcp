/**
 * Fractional MCP Tools
 *
 * Exposes fractional ownership provider data to Claude via MCP tools.
 */
import { z } from 'zod';
import { fractional } from '../api-client.js';
export function registerFractionalTools(server) {
    // Search fractional providers
    server.tool('search_fractional_providers', 'Search for fractional aircraft ownership providers (e.g., NetJets, Flexjet).', {
        limit: z.number().optional().default(20).describe('Maximum results (max 100)'),
        offset: z.number().optional().default(0).describe('Pagination offset'),
    }, async (params) => {
        try {
            const response = await fractional.providers({
                limit: Math.min(params.limit ?? 20, 100),
                offset: params.offset ?? 0,
            });
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            providers: response.data,
                            total: response.meta?.total,
                            showing: response.data.length,
                        }, null, 2),
                    }],
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error searching fractional providers: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    }],
                isError: true,
            };
        }
    });
    // Get fractional provider details
    server.tool('get_fractional_provider', 'Get detailed information about a specific fractional ownership provider.', {
        id: z.string().describe('Provider ID'),
    }, async (params) => {
        try {
            const response = await fractional.getProvider(params.id);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(response.data, null, 2),
                    }],
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error getting fractional provider: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    }],
                isError: true,
            };
        }
    });
    // Search fractional aircraft
    server.tool('search_fractional_aircraft', 'Search for aircraft in fractional ownership fleets.', {
        provider: z.string().optional().describe('Filter by provider ID'),
        aircraft_type: z.string().optional().describe('Filter by aircraft type'),
        limit: z.number().optional().default(20).describe('Maximum results (max 100)'),
        offset: z.number().optional().default(0).describe('Pagination offset'),
    }, async (params) => {
        try {
            const response = await fractional.aircraft({
                provider: params.provider,
                aircraft_type: params.aircraft_type,
                limit: Math.min(params.limit ?? 20, 100),
                offset: params.offset ?? 0,
            });
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            aircraft: response.data,
                            total: response.meta?.total,
                            showing: response.data.length,
                        }, null, 2),
                    }],
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error searching fractional aircraft: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    }],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=fractional.js.map