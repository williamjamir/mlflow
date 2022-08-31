export declare const NAVIGATE_TO_PATH_MESSAGE_TYPE = "databricks:mferouter:navigate-to-path";
export interface NavigateToPathMessage {
    type: typeof NAVIGATE_TO_PATH_MESSAGE_TYPE;
    path: string;
}
/**
 * A shared hook that notifies all listeners when there's a new navigation request (e.g. from persona-nav or an MFE).
 *
 * @param handler a function that will be called when the navigation request is received
 */
export declare function useMFEHostRouterOnChangeRequested(handler: (path: string) => void): void;
/**
 * Requests navigation to the given path, which is potentially handled by a different MFE.
 */
export declare function dispatchMFEHostRouterNavigation(path: string): void;
//# sourceMappingURL=mfe-host-router.d.ts.map