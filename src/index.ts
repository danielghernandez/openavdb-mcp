#!/usr/bin/env node
/**
 * OpenAvDB MCP Server
 *
 * Exposes OpenAvDB aviation data as MCP tools for Claude.
 * Partners can use this to query airports, FBOs, aircraft, and more.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Import tool registrations
import { registerAirportTools } from './tools/airports.js';
import { registerFBOTools } from './tools/fbos.js';
import { registerAircraftTools } from './tools/aircraft.js';
import { registerCharterTools } from './tools/charter.js';
import { registerFlightSchoolTools } from './tools/flight-schools.js';
import { registerFractionalTools } from './tools/fractional.js';
import { registerHangarTools } from './tools/hangars.js';
import { registerFleetTools } from './tools/fleet.js';
import { registerActivityTools } from './tools/activity.js';
import { registerWatchlistTools } from './tools/watchlists.js';

// Import resource and prompt registrations
import { registerResources } from './resources.js';
import { registerPrompts } from './prompts.js';

// Create the MCP server
const server = new McpServer({
  name: 'openavdb',
  version: '1.0.0',
});

// Register all tools
registerAirportTools(server);
registerFBOTools(server);
registerAircraftTools(server);
registerCharterTools(server);
registerFlightSchoolTools(server);
registerFractionalTools(server);
registerHangarTools(server);
registerFleetTools(server);
registerActivityTools(server);
registerWatchlistTools(server);

// Register resources (browsable collections)
registerResources(server);

// Register prompts (pre-built templates)
registerPrompts(server);

// Start the server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('OpenAvDB MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
