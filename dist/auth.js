/**
 * Firebase Authentication for OpenAvDB MCP Server
 *
 * Handles OAuth flow and token management for API access.
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import open from 'open';
import { config } from './config.js';
// Initialize Firebase
const app = initializeApp(config.firebase);
const auth = getAuth(app);
let cachedToken = null;
/**
 * Load token from disk
 */
async function loadStoredToken() {
    try {
        const data = await readFile(config.tokenPath, 'utf-8');
        return JSON.parse(data);
    }
    catch {
        return null;
    }
}
/**
 * Save token to disk
 */
async function saveToken(token) {
    await mkdir(dirname(config.tokenPath), { recursive: true });
    await writeFile(config.tokenPath, JSON.stringify(token, null, 2));
}
/**
 * Get current user from Firebase Auth
 */
export function getCurrentUser() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}
/**
 * Get a valid ID token for API requests
 * Returns the token string or null if not authenticated
 */
export async function getIdToken() {
    // Check for cached token first
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
        return cachedToken.idToken;
    }
    // Try to load from disk
    const stored = await loadStoredToken();
    if (stored && stored.expiresAt > Date.now() + 60000) {
        cachedToken = stored;
        return stored.idToken;
    }
    // Try to get from current auth state
    const user = await getCurrentUser();
    if (user) {
        const token = await user.getIdToken();
        const tokenResult = await user.getIdTokenResult();
        cachedToken = {
            idToken: token,
            refreshToken: user.refreshToken,
            expiresAt: new Date(tokenResult.expirationTime).getTime(),
            email: user.email || ''
        };
        await saveToken(cachedToken);
        return token;
    }
    return null;
}
/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    // Cache the token
    const token = await user.getIdToken();
    const tokenResult = await user.getIdTokenResult();
    cachedToken = {
        idToken: token,
        refreshToken: user.refreshToken,
        expiresAt: new Date(tokenResult.expirationTime).getTime(),
        email: user.email || ''
    };
    await saveToken(cachedToken);
    return user;
}
/**
 * Sign in with a custom token (for headless environments)
 */
export async function signInWithToken(customToken) {
    const credential = await signInWithCustomToken(auth, customToken);
    return credential.user;
}
/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
    const token = await getIdToken();
    return token !== null;
}
/**
 * Get the current user's email
 */
export async function getCurrentEmail() {
    if (cachedToken) {
        return cachedToken.email;
    }
    const stored = await loadStoredToken();
    if (stored) {
        return stored.email;
    }
    const user = await getCurrentUser();
    return user?.email || null;
}
/**
 * Launch browser-based login flow
 * Opens the OpenAvDB login page and waits for authentication
 */
export async function launchLoginFlow() {
    const loginUrl = `${config.apiBaseUrl}/auth/login?redirect=mcp`;
    console.error('Opening browser for authentication...');
    console.error(`If browser doesn't open, visit: ${loginUrl}`);
    await open(loginUrl);
}
/**
 * Clear stored authentication
 */
export async function signOut() {
    try {
        await auth.signOut();
    }
    catch {
        // Ignore sign out errors
    }
    cachedToken = null;
    try {
        const { unlink } = await import('fs/promises');
        await unlink(config.tokenPath);
    }
    catch {
        // Ignore if file doesn't exist
    }
}
export { auth, app };
//# sourceMappingURL=auth.js.map