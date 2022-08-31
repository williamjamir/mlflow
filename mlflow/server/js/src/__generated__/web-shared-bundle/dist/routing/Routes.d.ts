/// <reference types="react" />
import type { RouteMetadata } from './Route';
/**
 * Accepts a list of routes metadata and renders them according to the current location.
 *
 * Usually, this shouldn't be used directly and instead `Router` should be used. It is only
 * useful in the special case, where the router needs to be used together with existing
 * `react-router` instance.
 */
export declare function Routes({ routes }: {
    routes: RouteMetadata[];
}): import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>> | null;
//# sourceMappingURL=Routes.d.ts.map