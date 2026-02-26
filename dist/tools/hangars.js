/**
 * Hangar MCP Tools
 *
 * Exposes hangar inventory data to Claude via MCP tools.
 */
import { z } from 'zod';
import { hangars } from '../api-client.js';
export function registerHangarTools(server) {
    // Search hangars
    server.tool('search_hangars', 'Search for aircraft hangars by airport, size, or availability.', {
        airport: z.string().optional().describe('ICAO code of airport'),
        min_sqft: z.number().optional().describe('Minimum hangar size in square feet'),
        max_sqft: z.number().optional().describe('Maximum hangar size in square feet'),
        available: z.boolean().optional().describe('Filter by availability status'),
        limit: z.number().optional().default(20).describe('Maximum results (max 100)'),
        offset: z.number().optional().default(0).describe('Pagination offset'),
    }, async (params) => {
        try {
            const response = await hangars.list({
                airport: params.airport,
                min_sqft: params.min_sqft,
                max_sqft: params.max_sqft,
                available: params.available,
                limit: Math.min(params.limit ?? 20, 100),
                offset: params.offset ?? 0,
            });
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            hangars: response.data,
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
                        text: `Error searching hangars: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    }],
                isError: true,
            };
        }
    });
    // Get hangar details
    server.tool('get_hangar', 'Get detailed information about a specific hangar.', {
        id: z.string().describe('Hangar ID'),
    }, async (params) => {
        try {
            const response = await hangars.get(params.id);
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
                        text: `Error getting hangar: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    }],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=hangars.js.map