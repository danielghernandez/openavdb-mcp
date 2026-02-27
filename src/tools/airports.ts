/**
 * Airport MCP Tools
 *
 * Exposes airport data to Claude via MCP tools.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { airports } from '../api-client.js';

export function registerAirportTools(server: McpServer): void {
  // Search airports
  server.tool(
    'search_airports',
    'Search for US airports by state, city, runway length, FBO count, or control tower status. Returns a list of airports matching the criteria.',
    {
      state: z.string().optional().describe('Two-letter US state code (e.g., "TX", "CA")'),
      city: z.string().optional().describe('City name to filter by'),
      min_runway: z.number().optional().describe('Minimum runway length in feet'),
      towered: z.boolean().optional().describe('Filter by control tower status'),
      fbo_count: z.number().optional().describe('Exact number of FBOs at the airport'),
      min_fbo_count: z.number().optional().describe('Minimum number of FBOs'),
      max_fbo_count: z.number().optional().describe('Maximum number of FBOs'),
      limit: z.number().optional().default(20).describe('Maximum results to return (max 100)'),
      offset: z.number().optional().default(0).describe('Pagination offset'),
    },
    async (params) => {
      try {
        const response = await airports.list({
          state: params.state,
          city: params.city,
          min_runway: params.min_runway,
          towered: params.towered,
          fbo_count: params.fbo_count,
          min_fbo_count: params.min_fbo_count,
          max_fbo_count: params.max_fbo_count,
          limit: Math.min(params.limit ?? 20, 100),
          offset: params.offset ?? 0,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              airports: response.data,
              total: response.meta?.total,
              showing: response.data.length,
              offset: params.offset ?? 0,
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error searching airports: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Get airport details
  server.tool(
    'get_airport',
    'Get detailed information about a specific airport by ICAO code. Can optionally include FBOs, fleet, and activity data.',
    {
      icao: z.string().describe('ICAO code of the airport (e.g., "KAUS", "KJFK")'),
      include: z.array(z.enum(['fbos', 'fleet', 'activity'])).optional()
        .describe('Additional data to include: fbos (Fixed Base Operators), fleet (based aircraft), activity (flight activity)'),
    },
    async (params) => {
      try {
        const includeStr = params.include?.join(',');
        const response = await airports.get(params.icao, {
          include: includeStr,
          describe_fields: true,
        });

        const result: Record<string, unknown> = {
          airport: response.data,
        };

        if (response._included) {
          result.included = response._included;
        }

        if (response._meta?.field_descriptions) {
          result.field_descriptions = response._meta.field_descriptions;
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error getting airport: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Get FBOs at an airport
  server.tool(
    'get_airport_fbos',
    'Get all Fixed Base Operators (FBOs) at a specific airport. FBOs provide services like fuel, hangars, and ground handling.',
    {
      icao: z.string().describe('ICAO code of the airport (e.g., "KAUS")'),
    },
    async (params) => {
      try {
        const response = await airports.fbos(params.icao);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              airport: params.icao.toUpperCase(),
              fbos: response.data,
              total: response.meta?.total,
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error getting FBOs: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Batch get airports
  server.tool(
    'get_airports_batch',
    'Get multiple airports by their ICAO codes in a single request. Efficient for comparing airports.',
    {
      icaos: z.array(z.string()).describe('Array of ICAO codes (max 20)'),
    },
    async (params) => {
      try {
        if (params.icaos.length > 20) {
          return {
            content: [{
              type: 'text',
              text: 'Error: Maximum 20 ICAO codes per request',
            }],
            isError: true,
          };
        }

        const response = await airports.list({
          icao: params.icaos.join(','),
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              airports: response.data,
              found: response.meta?.found,
              requested: response.meta?.requested,
              not_found: response.meta?.not_found,
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error getting airports: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );
}
