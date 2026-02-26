/**
 * Fleet MCP Tools
 *
 * Exposes fleet composition data to Claude via MCP tools.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { fleet } from '../api-client.js';

export function registerFleetTools(server: McpServer): void {
  // Search fleet
  server.tool(
    'search_fleet',
    'Search for based aircraft at airports by type or owner category.',
    {
      airport: z.string().optional().describe('ICAO code of airport'),
      aircraft_type: z.string().optional().describe('Aircraft type category'),
      owner_type: z.string().optional().describe('Owner type (e.g., "Individual", "Corporate", "LLC")'),
      limit: z.number().optional().default(20).describe('Maximum results (max 100)'),
      offset: z.number().optional().default(0).describe('Pagination offset'),
    },
    async (params) => {
      try {
        const response = await fleet.list({
          airport: params.airport,
          aircraft_type: params.aircraft_type,
          owner_type: params.owner_type,
          limit: Math.min(params.limit ?? 20, 100),
          offset: params.offset ?? 0,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              fleet: response.data,
              total: response.meta?.total,
              showing: response.data.length,
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error searching fleet: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Get fleet statistics
  server.tool(
    'get_fleet_stats',
    'Get aggregated fleet statistics for an airport or aircraft type.',
    {
      airport: z.string().optional().describe('ICAO code to get stats for'),
      aircraft_type: z.string().optional().describe('Aircraft type to get stats for'),
    },
    async (params) => {
      try {
        const response = await fleet.stats({
          airport: params.airport,
          aircraft_type: params.aircraft_type,
        });

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
            text: `Error getting fleet stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );
}
