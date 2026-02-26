/**
 * Activity MCP Tools
 *
 * Exposes flight activity data to Claude via MCP tools.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { activity } from '../api-client.js';

export function registerActivityTools(server: McpServer): void {
  // Search flight activity
  server.tool(
    'search_flight_activity',
    'Search for flight activity records by airport, operation type, or date range.',
    {
      airport: z.string().optional().describe('ICAO code of airport'),
      operation_type: z.string().optional().describe('Type of operation (e.g., "IFR", "VFR")'),
      start_date: z.string().optional().describe('Start date (YYYY-MM-DD format)'),
      end_date: z.string().optional().describe('End date (YYYY-MM-DD format)'),
      limit: z.number().optional().default(20).describe('Maximum results (max 100)'),
      offset: z.number().optional().default(0).describe('Pagination offset'),
    },
    async (params) => {
      try {
        const response = await activity.list({
          airport: params.airport,
          operation_type: params.operation_type,
          start_date: params.start_date,
          end_date: params.end_date,
          limit: Math.min(params.limit ?? 20, 100),
          offset: params.offset ?? 0,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              activity: response.data,
              total: response.meta?.total,
              showing: response.data.length,
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error searching flight activity: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Get activity statistics
  server.tool(
    'get_activity_stats',
    'Get aggregated flight activity statistics for an airport.',
    {
      airport: z.string().optional().describe('ICAO code to get stats for'),
      period: z.string().optional().describe('Time period (e.g., "day", "week", "month", "year")'),
    },
    async (params) => {
      try {
        const response = await activity.stats({
          airport: params.airport,
          period: params.period,
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
            text: `Error getting activity stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );
}
