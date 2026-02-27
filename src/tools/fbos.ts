/**
 * FBO MCP Tools
 *
 * Exposes Fixed Base Operator data to Claude via MCP tools.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { fbos } from '../api-client.js';

export function registerFBOTools(server: McpServer): void {
  // Search FBOs
  server.tool(
    'search_fbos',
    'Search for Fixed Base Operators (FBOs) by state, airport, brand, or tower status. FBOs are service providers at airports.',
    {
      state: z.string().optional().describe('Two-letter US state code (e.g., "TX", "CA")'),
      airport: z.string().optional().describe('Filter by airport ICAO code'),
      brand: z.string().optional().describe('Filter by FBO brand/chain name'),
      towered: z.boolean().optional().describe('Filter by airport control tower status (true = towered, false = non-towered)'),
      limit: z.number().optional().default(20).describe('Maximum results (max 100)'),
      offset: z.number().optional().default(0).describe('Pagination offset'),
    },
    async (params) => {
      try {
        const response = await fbos.list({
          state: params.state,
          airport: params.airport,
          brand: params.brand,
          towered: params.towered,
          limit: Math.min(params.limit ?? 20, 100),
          offset: params.offset ?? 0,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              fbos: response.data,
              total: response.meta?.total,
              showing: response.data.length,
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error searching FBOs: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Get FBO details
  server.tool(
    'get_fbo',
    'Get detailed information about a specific FBO by its ID.',
    {
      id: z.string().describe('FBO ID'),
    },
    async (params) => {
      try {
        const response = await fbos.get(params.id);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(response.data, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error getting FBO: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Get fuel prices
  server.tool(
    'get_fuel_prices',
    'Search for aviation fuel prices across FBOs. Useful for finding the best fuel deals.',
    {
      min_price: z.number().optional().describe('Minimum fuel price per gallon'),
      max_price: z.number().optional().describe('Maximum fuel price per gallon'),
      limit: z.number().optional().default(20).describe('Maximum results (max 100)'),
      offset: z.number().optional().default(0).describe('Pagination offset'),
    },
    async (params) => {
      try {
        const response = await fbos.fuel({
          min_price: params.min_price,
          max_price: params.max_price,
          limit: Math.min(params.limit ?? 20, 100),
          offset: params.offset ?? 0,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              fuel_prices: response.data,
              total: response.meta?.total,
              showing: response.data.length,
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error getting fuel prices: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );
}
