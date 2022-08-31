/**
 * Notify the CSRF token has expired and it has to be refreshed.
 *
 * Returns `false` if the event has been handled, `true` if the
 * fallback logic should be executed.
 */
export declare function notifyCsrfHasExpired(): boolean;
/**
 * Notify the session has expired and the user will need to login again.
 *
 * Returns `false` if the event has been handled, `true` if the
 * fallback logic should be executed.
 */
export declare function notifySessionHasExpired(): boolean;
/**
 * Notify the user has logged in.
 *
 * Returns `false` if the event has been handled, `true` if the
 * fallback logic should be executed.
 */
export declare function notifyUserHasLoggedIn(): boolean;
/**
 * Notify the user has logged out.
 *
 * Returns `false` if the event has been handled, `true` if the
 * fallback logic should be executed.
 */
export declare function notifyUserHasLoggedOut(redirectUrl: string): boolean;
/**
 * Defines how to respond to various session-related events like
 * the CSRF or session expiring, the user logging in or out, etc.
 *
 * The policy is free to take the necessary steps in response to any of the
 * events.
 */
export interface SessionPolicy {
    /**
     * Handles a CSRF expired event, most likely by refreshing the config from the server.
     */
    handleCsrfHasExpired(): void;
    /**
     * Handles a session expired event, most likely by redirecting to the login screen.
     */
    handleSessionHasExpired(): void;
    /**
     * Handles the user has logged in event. The event is triggered when the user has explicitly
     * logged in one of the tabs.
     *
     * @param obj.currentTab Indicates whether the event has occurred in the current tab or not.
     */
    handleUserHasLoggedIn(details: {
        currentTab: boolean;
    }): void;
    /**
     * Handles the user has logged out event. The event is triggered by an explicit user action
     * to logout and it can occur in any tab of the application.
     *
     * @param obj.currentTab Indicates whether the event has occurred in the current tab or not.
     */
    handleUserHasLoggedOut(details: {
        currentTab: false;
    }): void;
    handleUserHasLoggedOut(details: {
        currentTab: true;
        redirectUrl: string;
    }): void;
}
/**
 * Sets the session policy, which defines the behavior of the application for various
 * session-related events.
 *
 * Ideally, only a single session policy should be active at a time in order to make sure
 * they don't conflict between each other, but in order to allow for a smooth hand-over,
 * the implementation will allow multiple to co-exist temporary.
 */
export declare function useSessionPolicy(policy: SessionPolicy): void;
export declare function setupSessionPolicy(policy: SessionPolicy): () => void;
//# sourceMappingURL=SessionPolicy.d.ts.map