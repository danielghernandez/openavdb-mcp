/**
 * Flight School MCP Tools
 *
 * Exposes flight school data to Claude via MCP tools.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { flightSchools } from '../api-client.js';

export function registerFlightSchoolTools(server: McpServer): void {
  // Search flight schools
  server.tool(
    'search_flight_schools',
    'Search for flight training schools by state or airport.',
    {
      state: z.string().optional().describe('Two-letter US state code'),
      airport: z.string().optional().describe('ICAO code of airport'),
      limit: z.number().optional().default(20).describe('Maximum results (max 100)'),
      offset: z.number().optional().default(0).describe('Pagination offset'),
    },
    async (params) => {
      try {
        const response = await flightSchools.list({
          state: params.state,
          airport: params.airport,
          limit: Math.min(params.limit ?? 20, 100),
          offset: params.offset ?? 0,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              flight_schools: response.data,
              total: response.meta?.total,
              showing: response.data.length,
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error searching flight schools: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Get flight school details
  server.tool(
    'get_flight_school',
    'Get detailed information about a specific flight school.',
    {
      id: z.string().describe('Flight school ID'),
    },
    async (params) => {
      try {
        const response = await flightSchools.get(params.id);

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
            text: `Error getting flight school: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );
}
