import React from 'react';
export declare type RouteElement = React.ReactElement<any>;
export declare type LazyRouteElement = {
    /**
     * Suspense-compatible function to get the route element.
     */
    read(): RouteElement;
    /**
     * Returns the route element once it is resolved.
     */
    load(): Promise<RouteElement>;
};
export declare function lazyRoute<T extends React.ComponentType<any> | React.ReactElement<any>>(callback: () => Promise<{
    RouteComponent: T;
}>): LazyRouteElement;
//# sourceMappingURL=lazyRoute.d.ts.map