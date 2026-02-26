/**
 * Firebase Authentication for OpenAvDB MCP Server
 *
 * Handles OAuth flow and token management for API access.
 */
import { User } from 'firebase/auth';
declare const app: import("@firebase/app").FirebaseApp;
declare const auth: import("@firebase/auth").Auth;
/**
 * Get current user from Firebase Auth
 */
export declare function getCurrentUser(): Promise<User | null>;
/**
 * Get a valid ID token for API requests
 * Returns the token string or null if not authenticated
 */
export declare function getIdToken(): Promise<string | null>;
/**
 * Sign in with email and password
 */
export declare function signIn(email: string, password: string): Promise<User>;
/**
 * Sign in with a custom token (for headless environments)
 */
export declare function signInWithToken(customToken: string): Promise<User>;
/**
 * Check if user is authenticated
 */
export declare function isAuthenticated(): Promise<boolean>;
/**
 * Get the current user's email
 */
export declare function getCurrentEmail(): Promise<string | null>;
/**
 * Launch browser-based login flow
 * Opens the OpenAvDB login page and waits for authentication
 */
export declare function launchLoginFlow(): Promise<void>;
/**
 * Clear stored authentication
 */
export declare function signOut(): Promise<void>;
export { auth, app };
//# sourceMappingURL=auth.d.ts.map