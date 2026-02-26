/**
 * MCP Prompts for OpenAvDB
 *
 * Pre-built prompt templates for common aviation analysis tasks.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerPrompts(server: McpServer): void {
  // Analyze airport prompt
  server.prompt(
    'analyze-airport',
    'Comprehensive analysis of an airport including facilities, services, and based aircraft.',
    {
      icao: z.string().describe('ICAO code of the airport (e.g., KAUS, KJFK)'),
    },
    ({ icao }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Please provide a comprehensive analysis of airport ${icao.toUpperCase()}. Include:

1. **Basic Information**: Location, elevation, runway details, control tower status
2. **FBO Analysis**: List all FBOs, compare fuel prices, note services offered
3. **Based Aircraft**: Fleet composition, notable aircraft types
4. **Flight Activity**: Recent activity trends if available
5. **Key Insights**: What makes this airport notable? Any recommendations?

Use the OpenAvDB tools to gather this information:
- get_airport with include=['fbos', 'fleet', 'activity']
- Any additional relevant searches

Format the response with clear sections and actionable insights.`
        }
      }]
    })
  );

  // Compare FBOs prompt
  server.prompt(
    'compare-fbos',
    'Compare FBOs at an airport or across multiple airports.',
    {
      airports: z.string().describe('Comma-separated ICAO codes (e.g., KAUS,KSAT,KDFW)'),
    },
    ({ airports }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Compare FBOs at these airports: ${airports.toUpperCase()}

Please analyze and compare:
1. **Fuel Prices**: Jet-A and 100LL prices at each FBO
2. **Services**: Hangars, maintenance, ground handling, amenities
3. **Brands**: Which FBO chains are represented?
4. **Best Value**: Which FBO offers the best combination of price and services?

Use get_airports_batch to fetch airport data, then search_fbos or get_airport_fbos for FBO details.

Provide a comparison table and recommendation for each airport.`
        }
      }]
    })
  );

  // Find aircraft prompt
  server.prompt(
    'find-aircraft',
    'Search for specific aircraft by type, manufacturer, or location.',
    {
      query: z.string().describe('Search criteria (e.g., "Citation X in California", "Gulfstream based at KTEB")'),
    },
    ({ query }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Find aircraft matching: "${query}"

Use the search_aircraft tool with appropriate filters:
- manufacturer: Aircraft make (e.g., CESSNA, GULFSTREAM, BOMBARDIER)
- type: Aircraft category (e.g., "Fixed Wing Single-Engine", "Rotorcraft")
- based_airport: ICAO code if looking for aircraft at a specific airport

Provide:
1. List of matching aircraft with N-numbers
2. Owner information (if available)
3. Based airport locations
4. Summary statistics (total count, breakdown by model)`
        }
      }]
    })
  );

  // Charter research prompt
  server.prompt(
    'research-charter',
    'Research charter companies in a specific region.',
    {
      state: z.string().describe('Two-letter US state code (e.g., TX, CA, FL)'),
    },
    ({ state }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Research charter aviation companies in ${state.toUpperCase()}.

Use search_charter_companies with state filter to find:
1. **Active Companies**: List of Part 135 operators
2. **Fleet Information**: If available, aircraft counts
3. **Contact Details**: Locations and contact information
4. **Market Overview**: How many operators? Major players?

Also check search_charter_brokers for charter brokers in the area.

Provide a market summary suitable for someone looking to charter flights in this region.`
        }
      }]
    })
  );

  // Flight school finder prompt
  server.prompt(
    'find-flight-schools',
    'Find flight training schools near an airport or in a state.',
    {
      location: z.string().describe('Airport ICAO code or state abbreviation'),
    },
    ({ location }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Find flight schools near or in: ${location.toUpperCase()}

Use search_flight_schools with:
- airport: if location is an ICAO code (4 letters starting with K)
- state: if location is a state abbreviation (2 letters)

For each school, note:
1. Name and location
2. Contact information
3. Programs offered (if available)

Provide recommendations for someone looking to start flight training.`
        }
      }]
    })
  );

  // Market analysis prompt
  server.prompt(
    'market-analysis',
    'Aviation market analysis for a specific airport or region.',
    {
      target: z.string().describe('Airport ICAO, city name, or state code'),
    },
    ({ target }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Perform an aviation market analysis for: ${target.toUpperCase()}

Gather data on:
1. **Airports**: Main airports serving this market
2. **FBO Competition**: Number of FBOs, major brands present
3. **Based Aircraft**: Fleet composition, high-value aircraft
4. **Charter Market**: Number of Part 135 operators
5. **Training**: Flight school presence
6. **Activity Levels**: Flight activity trends

Use multiple OpenAvDB tools to build a comprehensive picture:
- search_airports for airport data
- search_fbos for FBO landscape
- search_aircraft for fleet data
- search_charter_companies for operators
- search_flight_schools for training options

Conclude with key market insights and opportunities.`
        }
      }]
    })
  );

  // Watchlist management prompt
  server.prompt(
    'create-fleet-watchlist',
    'Create a watchlist to track specific aircraft.',
    {
      name: z.string().describe('Name for the watchlist'),
      aircraft: z.string().describe('Comma-separated N-numbers to track'),
    },
    ({ name, aircraft }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Create a new aircraft watchlist called "${name}" and add these aircraft: ${aircraft.toUpperCase()}

Steps:
1. Use create_watchlist with name "${name}"
2. For each N-number in ${aircraft}, use add_aircraft_to_watchlist
3. Verify the watchlist was created with list_watchlists
4. Show the current aircraft in the watchlist with get_watchlist_aircraft

Note: This requires authentication. If not authenticated, guide the user through the login process first.`
        }
      }]
    })
  );
}
