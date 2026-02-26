/**
 * Configuration for OpenAvDB MCP Server
 */
export const config = {
    // API base URL - can be overridden via environment variable
    apiBaseUrl: process.env.OPENAVDB_API_URL || 'https://openavdb-prod.web.app/api',
    // Firebase configuration for authentication
    firebase: {
        apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        authDomain: 'openavdb-prod.firebaseapp.com',
        projectId: 'openavdb-prod',
    },
    // Token storage path
    tokenPath: process.env.OPENAVDB_TOKEN_PATH || `${process.env.HOME}/.openavdb/token.json`,
    // Request timeout in milliseconds
    requestTimeout: 30000,
};
//# sourceMappingURL=config.js.map