/**
 * MCP Resources for OpenAvDB
 *
 * Exposes browsable resources that Claude can explore.
 */
import { airports, aircraft, charter, flightSchools } from './api-client.js';
export function registerResources(server) {
    // API Overview resource
    server.resource('api-overview', 'openavdb://api/overview', async (uri) => {
        const overview = {
            name: 'OpenAvDB API',
            version: '2.0.0',
            description: 'Aviation database API providing data on US airports, FBOs, aircraft, and more.',
            collections: {
                airports: {
                    description: 'US airports with runway, services, and ownership data',
                    count: '4,700+',
                    endpoint: '/v1/airports'
                },
                fbos: {
                    description: 'Fixed Base Operators with fuel prices and services',
                    count: '3,800+',
                    endpoint: '/v1/fbos'
                },
                aircraft: {
                    description: 'FAA aircraft registry with owner and type data',
                    count: '300,000+',
                    endpoint: '/v1/aircraft'
                },
                charter: {
                    description: 'Part 135 charter companies and brokers',
                    companies: '1,100+',
                    brokers: '800+',
                    endpoint: '/v1/charter/companies'
                },
                flightSchools: {
                    description: 'Flight training schools',
                    count: '2,900+',
                    endpoint: '/v1/flight-schools'
                },
                fleet: {
                    description: 'Based aircraft fleet analytics',
                    endpoint: '/v1/fleet'
                },
                activity: {
                    description: 'Flight activity data',
                    endpoint: '/v1/activity'
                }
            },
            documentation: 'https://openavdb-prod.web.app/api/docs'
        };
        return {
            contents: [{
                    uri: uri.href,
                    mimeType: 'application/json',
                    text: JSON.stringify(overview, null, 2)
                }]
        };
    });
    // Top airports by state resource
    server.resource('top-airports-texas', 'openavdb://airports/state/TX', async (uri) => {
        try {
            const response = await airports.list({ state: 'TX', limit: 20 });
            return {
                contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            title: 'Top 20 Texas Airports',
                            total_in_state: response.meta?.total,
                            airports: response.data
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                contents: [{
                        uri: uri.href,
                        mimeType: 'text/plain',
                        text: `Error fetching Texas airports: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }]
            };
        }
    });
    // Top airports by state - California
    server.resource('top-airports-california', 'openavdb://airports/state/CA', async (uri) => {
        try {
            const response = await airports.list({ state: 'CA', limit: 20 });
            return {
                contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            title: 'Top 20 California Airports',
                            total_in_state: response.meta?.total,
                            airports: response.data
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                contents: [{
                        uri: uri.href,
                        mimeType: 'text/plain',
                        text: `Error fetching California airports: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }]
            };
        }
    });
    // Top airports by state - Florida
    server.resource('top-airports-florida', 'openavdb://airports/state/FL', async (uri) => {
        try {
            const response = await airports.list({ state: 'FL', limit: 20 });
            return {
                contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            title: 'Top 20 Florida Airports',
                            total_in_state: response.meta?.total,
                            airports: response.data
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                contents: [{
                        uri: uri.href,
                        mimeType: 'text/plain',
                        text: `Error fetching Florida airports: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }]
            };
        }
    });
    // Major hub airports
    server.resource('major-hub-airports', 'openavdb://airports/hubs', async (uri) => {
        try {
            // Get major hubs by ICAO
            const response = await airports.list({
                icao: 'KJFK,KLAX,KORD,KDFW,KDEN,KATL,KSFO,KLAS,KMIA,KPHX',
            });
            return {
                contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            title: 'Major US Hub Airports',
                            airports: response.data
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                contents: [{
                        uri: uri.href,
                        mimeType: 'text/plain',
                        text: `Error fetching hub airports: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }]
            };
        }
    });
    // Aircraft manufacturers
    server.resource('aircraft-cessna', 'openavdb://aircraft/manufacturer/CESSNA', async (uri) => {
        try {
            const response = await aircraft.list({ manufacturer: 'CESSNA', limit: 20 });
            return {
                contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            title: 'Cessna Aircraft (Sample)',
                            total: response.meta?.total,
                            aircraft: response.data
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                contents: [{
                        uri: uri.href,
                        mimeType: 'text/plain',
                        text: `Error fetching Cessna aircraft: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }]
            };
        }
    });
    // Charter companies
    server.resource('charter-companies', 'openavdb://charter/companies', async (uri) => {
        try {
            const response = await charter.companies({ limit: 20 });
            return {
                contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            title: 'Charter Companies (Sample)',
                            total: response.meta?.total,
                            companies: response.data
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                contents: [{
                        uri: uri.href,
                        mimeType: 'text/plain',
                        text: `Error fetching charter companies: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }]
            };
        }
    });
    // Flight schools
    server.resource('flight-schools', 'openavdb://flight-schools', async (uri) => {
        try {
            const response = await flightSchools.list({ limit: 20 });
            return {
                contents: [{
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            title: 'Flight Schools (Sample)',
                            total: response.meta?.total,
                            schools: response.data
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                contents: [{
                        uri: uri.href,
                        mimeType: 'text/plain',
                        text: `Error fetching flight schools: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }]
            };
        }
    });
}
//# sourceMappingURL=resources.js.map