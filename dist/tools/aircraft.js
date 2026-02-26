/**
 * Aircraft MCP Tools
 *
 * Exposes aircraft registry data to Claude via MCP tools.
 */
import { z } from 'zod';
import { aircraft } from '../api-client.js';
export function registerAircraftTools(server) {
    // Search aircraft
    server.tool('search_aircraft', 'Search the FAA aircraft registry by type, manufacturer, or home airport.', {
        type: z.string().optional().describe('Aircraft type (e.g., "Fixed Wing Single-Engine", "Rotorcraft")'),
        manufacturer: z.string().optional().describe('Aircraft manufacturer name'),
        based_airport: z.string().optional().describe('ICAO code of home airport'),
        limit: z.number().optional().default(20).describe('Maximum results (max 100)'),
        offset: z.number().optional().default(0).describe('Pagination offset'),
    }, async (params) => {
        try {
            const response = await aircraft.list({
                type: params.type,
                manufacturer: params.manufacturer,
                based_airport: params.based_airport,
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
                        text: `Error searching aircraft: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    }],
                isError: true,
            };
        }
    });
    // Get aircraft details
    server.tool('get_aircraft', 'Get detailed information about a specific aircraft by its N-number (registration).', {
        registration: z.string().describe('Aircraft N-number/registration (e.g., "N12345")'),
    }, async (params) => {
        try {
            const response = await aircraft.get(params.registration);
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
                        text: `Error getting aircraft: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    }],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=aircraft.js.map