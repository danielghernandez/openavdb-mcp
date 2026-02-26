/**
 * Charter MCP Tools
 *
 * Exposes charter company and broker data to Claude via MCP tools.
 */
import { z } from 'zod';
import { charter } from '../api-client.js';
export function registerCharterTools(server) {
    // Search charter companies
    server.tool('search_charter_companies', 'Search for Part 135 charter companies by certificate type or state.', {
        certificate_type: z.string().optional().describe('FAA certificate type'),
        state: z.string().optional().describe('Two-letter US state code'),
        limit: z.number().optional().default(20).describe('Maximum results (max 100)'),
        offset: z.number().optional().default(0).describe('Pagination offset'),
    }, async (params) => {
        try {
            const response = await charter.companies({
                certificate_type: params.certificate_type,
                state: params.state,
                limit: Math.min(params.limit ?? 20, 100),
                offset: params.offset ?? 0,
            });
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            companies: response.data,
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
                        text: `Error searching charter companies: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    }],
                isError: true,
            };
        }
    });
    // Get charter company details
    server.tool('get_charter_company', 'Get detailed information about a specific charter company.', {
        id: z.string().describe('Charter company ID'),
    }, async (params) => {
        try {
            const response = await charter.getCompany(params.id);
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
                        text: `Error getting charter company: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    }],
                isError: true,
            };
        }
    });
    // Search charter brokers
    server.tool('search_charter_brokers', 'Search for charter brokers who arrange private flights.', {
        limit: z.number().optional().default(20).describe('Maximum results (max 100)'),
        offset: z.number().optional().default(0).describe('Pagination offset'),
    }, async (params) => {
        try {
            const response = await charter.brokers({
                limit: Math.min(params.limit ?? 20, 100),
                offset: params.offset ?? 0,
            });
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            brokers: response.data,
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
                        text: `Error searching charter brokers: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    }],
                isError: true,
            };
        }
    });
    // Get charter broker details
    server.tool('get_charter_broker', 'Get detailed information about a specific charter broker.', {
        id: z.string().describe('Charter broker ID'),
    }, async (params) => {
        try {
            const response = await charter.getBroker(params.id);
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
                        text: `Error getting charter broker: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    }],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=charter.js.map