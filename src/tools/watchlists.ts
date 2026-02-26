/**
 * Watchlist MCP Tools
 *
 * Exposes aircraft watchlist functionality to Claude via MCP tools.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { watchlists } from '../api-client.js';

export function registerWatchlistTools(server: McpServer): void {
  // List watchlists
  server.tool(
    'list_watchlists',
    'List all aircraft watchlists for the authenticated user.',
    {},
    async () => {
      try {
        const response = await watchlists.list();

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              watchlists: response.data,
              total: response.meta?.total,
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error listing watchlists: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Get watchlist details
  server.tool(
    'get_watchlist',
    'Get detailed information about a specific watchlist.',
    {
      id: z.string().describe('Watchlist ID'),
    },
    async (params) => {
      try {
        const response = await watchlists.get(params.id);

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
            text: `Error getting watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Get watchlist aircraft
  server.tool(
    'get_watchlist_aircraft',
    'Get all aircraft in a specific watchlist with their current details.',
    {
      id: z.string().describe('Watchlist ID'),
    },
    async (params) => {
      try {
        const response = await watchlists.aircraft(params.id);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              watchlist_id: params.id,
              aircraft: response.data,
              total: response.meta?.total,
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error getting watchlist aircraft: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Create watchlist
  server.tool(
    'create_watchlist',
    'Create a new aircraft watchlist.',
    {
      name: z.string().describe('Name for the watchlist'),
      description: z.string().optional().describe('Optional description'),
    },
    async (params) => {
      try {
        const response = await watchlists.create({
          name: params.name,
          description: params.description,
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              message: 'Watchlist created successfully',
              watchlist: response.data,
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error creating watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Add aircraft to watchlist
  server.tool(
    'add_aircraft_to_watchlist',
    'Add an aircraft to a watchlist by its registration number.',
    {
      watchlist_id: z.string().describe('ID of the watchlist'),
      registration: z.string().describe('Aircraft N-number/registration'),
    },
    async (params) => {
      try {
        const response = await watchlists.addAircraft(params.watchlist_id, params.registration);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              message: 'Aircraft added to watchlist',
              result: response.data,
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error adding aircraft to watchlist: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );
}
