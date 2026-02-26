# OpenAvDB MCP Server

An MCP (Model Context Protocol) server that exposes OpenAvDB aviation data to Claude. Partners can use this to give Claude access to real-time aviation data including airports, FBOs, aircraft, charter operators, and more.

## Installation

### Prerequisites

- Node.js 18 or later
- An OpenAvDB account (sign up at https://openavdb.com)

### Install from GitHub

```bash
npx github:danielghernandez/openavdb-mcp
```

### Or clone and build

```bash
git clone https://github.com/danielghernandez/openavdb-mcp.git
cd openavdb-mcp
npm install
npm run build
```

## Configuration

### Claude Desktop

Add the server to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "openavdb": {
      "command": "npx",
      "args": ["-y", "github:danielghernandez/openavdb-mcp"]
    }
  }
}
```

### Claude Code CLI

```bash
claude mcp add openavdb -- npx -y github:danielghernandez/openavdb-mcp
```

## Authentication

The first time you use an OpenAvDB tool, you'll be prompted to sign in. The server stores your authentication token securely at `~/.openavdb/token.json`.

## Available Tools

### Airport Tools

| Tool | Description |
|------|-------------|
| `search_airports` | Search airports by state, city, runway length, or tower status |
| `get_airport` | Get detailed airport info with optional FBO/fleet/activity data |
| `get_airport_fbos` | List all FBOs at an airport |
| `get_airports_batch` | Get multiple airports by ICAO codes |

### FBO Tools

| Tool | Description |
|------|-------------|
| `search_fbos` | Search FBOs by airport or brand |
| `get_fbo` | Get detailed FBO information |
| `get_fuel_prices` | Search fuel prices with min/max filters |

### Aircraft Tools

| Tool | Description |
|------|-------------|
| `search_aircraft` | Search FAA registry by type, manufacturer, or base airport |
| `get_aircraft` | Get aircraft details by N-number |

### Charter Tools

| Tool | Description |
|------|-------------|
| `search_charter_operators` | Search Part 135 operators by certificate type or state |
| `get_charter_operator` | Get charter operator details |
| `search_charter_aircraft` | Search charter fleet by operator or aircraft type |

### Flight School Tools

| Tool | Description |
|------|-------------|
| `search_flight_schools` | Search schools by state or airport |
| `get_flight_school` | Get flight school details |

### Fractional Tools

| Tool | Description |
|------|-------------|
| `search_fractional_providers` | List fractional ownership providers (NetJets, Flexjet, etc.) |
| `get_fractional_provider` | Get provider details including fleet count |

### Analytics Tools

| Tool | Description |
|------|-------------|
| `search_hangars` | Search hangars by airport, size, availability |
| `get_hangar` | Get hangar details |
| `search_fleet` | Search based aircraft by airport, type, owner |
| `get_fleet_stats` | Get aggregated fleet statistics |
| `search_flight_activity` | Search activity by airport, type, date range |
| `get_activity_stats` | Get activity statistics |

### Watchlist Tools

| Tool | Description |
|------|-------------|
| `list_watchlists` | List your aircraft watchlists |
| `get_watchlist` | Get watchlist details |
| `get_watchlist_aircraft` | Get all aircraft in a watchlist |
| `create_watchlist` | Create a new watchlist |
| `add_aircraft_to_watchlist` | Add aircraft to a watchlist |

## Available Resources

The server exposes browsable resources that Claude can explore:

| Resource | URI | Description |
|----------|-----|-------------|
| API Overview | `openavdb://api/overview` | API capabilities and collection counts |
| Texas Airports | `openavdb://airports/state/TX` | Top 20 Texas airports |
| California Airports | `openavdb://airports/state/CA` | Top 20 California airports |
| Florida Airports | `openavdb://airports/state/FL` | Top 20 Florida airports |
| Major Hubs | `openavdb://airports/hubs` | Major US hub airports |
| Cessna Aircraft | `openavdb://aircraft/manufacturer/CESSNA` | Sample Cessna aircraft |
| Charter Companies | `openavdb://charter/companies` | Sample charter companies |
| Flight Schools | `openavdb://flight-schools` | Sample flight schools |

## Available Prompts

Pre-built prompt templates for common analysis tasks:

| Prompt | Description |
|--------|-------------|
| `analyze-airport` | Comprehensive airport analysis (facilities, FBOs, fleet) |
| `compare-fbos` | Compare FBOs across airports |
| `find-aircraft` | Search for specific aircraft by criteria |
| `research-charter` | Research charter companies in a state |
| `find-flight-schools` | Find flight training schools |
| `market-analysis` | Aviation market analysis for a region |
| `create-fleet-watchlist` | Create and populate an aircraft watchlist |

## Example Usage

Once configured, you can ask Claude things like:

- "Show me all airports in Texas with runways over 8000 feet"
- "What FBOs are at KAUS and what are their fuel prices?"
- "Find all Citation X aircraft based at airports in California"
- "Search for charter operators in Florida"
- "Create a watchlist for jets I'm tracking"

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAVDB_API_URL` | `https://api.openavdb.com` | API base URL |
| `OPENAVDB_TOKEN_PATH` | `~/.openavdb/token.json` | Token storage location |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev
```

## Support

- Documentation: https://docs.openavdb.com
- Issues: https://github.com/h9partners/openavdb-mcp/issues
- Email: support@openavdb.com

## License

Proprietary - H9 Partners
